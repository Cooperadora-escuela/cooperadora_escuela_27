# back/core/facturacion.py
"""
Integración con AFIP - WSAA (autenticación) + WSFE (facturación electrónica).

Requiere en .env:
    AFIP_CERT_PATH   → ruta al .crt emitido por AFIP
    AFIP_KEY_PATH    → ruta al .key generado localmente
    AFIP_MODO        → "homologacion" | "produccion"

Los certificados NO van en la base de datos ni en el repo.
"""

import os
import datetime
import base64
from pathlib import Path

from cryptography import x509
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.serialization import pkcs7
from cryptography.hazmat.primitives.asymmetric.rsa import RSAPrivateKey
from cryptography.hazmat.backends import default_backend
from lxml import etree
from zeep import Client

# ── Endpoints ────────────────────────────────────────────────────────────────

URLS = {
    "homologacion": {
        "wsaa": "https://wsaahomo.afip.gov.ar/ws/services/LoginCms?wsdl",
        "wsfe": "https://wswhomo.afip.gov.ar/wsfev1/service.asmx?wsdl",
    },
    "produccion": {
        "wsaa": "https://wsaa.afip.gov.ar/ws/services/LoginCms?wsdl",
        "wsfe": "https://servicios1.afip.gov.ar/wsfev1/service.asmx?wsdl",
    },
}

MODO = os.environ.get("AFIP_MODO", "homologacion")


# ── WSAA — autenticación ──────────────────────────────────────────────────────

def _leer_certificado():
    cert_path = os.environ.get("AFIP_CERT_PATH", "")
    key_path  = os.environ.get("AFIP_KEY_PATH", "")
    if not cert_path or not key_path:
        raise EnvironmentError(
            "Faltan AFIP_CERT_PATH y/o AFIP_KEY_PATH en las variables de entorno."
        )
    cert = x509.load_pem_x509_certificate(Path(cert_path).read_bytes(), default_backend())
    key  = serialization.load_pem_private_key(
        Path(key_path).read_bytes(), password=None, backend=default_backend()
    )
    assert isinstance(key, RSAPrivateKey), "Solo se soportan claves RSA"
    return cert, key


def _armar_tra(servicio: str = "wsfe") -> bytes:
    """Genera el TRA (Ticket de Requerimiento de Acceso) en XML."""
    ahora      = datetime.datetime.now(datetime.timezone.utc)
    generation = (ahora - datetime.timedelta(minutes=10)).strftime("%Y-%m-%dT%H:%M:%S+00:00")
    expiration = (ahora + datetime.timedelta(hours=12)).strftime("%Y-%m-%dT%H:%M:%S+00:00")

    tra = etree.Element("loginTicketRequest", version="1.0")
    header = etree.SubElement(tra, "header")
    etree.SubElement(header, "uniqueId").text    = str(int(ahora.timestamp()))
    etree.SubElement(header, "generationTime").text = generation
    etree.SubElement(header, "expirationTime").text  = expiration
    etree.SubElement(tra, "service").text = servicio
    return etree.tostring(tra, xml_declaration=True, encoding="UTF-8")


def _firmar_tra(tra_bytes: bytes) -> str:
    """Firma el TRA con la clave privada y devuelve el CMS en base64."""
    cert, key = _leer_certificado()
    signed = (
        pkcs7.PKCS7SignatureBuilder()
        .set_data(tra_bytes)
        .add_signer(cert, key, hashes.SHA256())
        .sign(serialization.Encoding.DER, [pkcs7.PKCS7Options.DetachedSignature])
    )
    return base64.b64encode(signed).decode()


def obtener_ticket_acceso() -> dict:
    """
    Llama a WSAA y devuelve {'token': ..., 'sign': ..., 'cuit': ...}.
    El ticket es válido 12 hs — en producción convendría cachearlo.
    """
    tra_bytes = _armar_tra("wsfe")
    cms       = _firmar_tra(tra_bytes)

    client    = Client(URLS[MODO]["wsaa"])
    respuesta = client.service.loginCms(cms)
    raiz      = etree.fromstring(respuesta.encode())

    return {
        "token": raiz.findtext(".//token"),
        "sign":  raiz.findtext(".//sign"),
        "cuit":  raiz.findtext(".//cuit"),
    }


# ── WSFE — emisión de comprobante ────────────────────────────────────────────

TIPO_COMPROBANTE_C = 11   # Factura C
IVA_EXENTO        = 3    # Las cooperadoras escolares generalmente son exentas

def emitir_factura(
    cuit_emisor: str,
    punto_venta: int,
    cuil_receptor: str,
    monto: float,
) -> dict:
    """
    Emite una Factura C en AFIP y devuelve {'numero', 'cae', 'vencimiento_cae'}.

    Parámetros:
        cuit_emisor    → CUIT de la cooperadora (sin guiones)
        punto_venta    → número de punto de venta habilitado en AFIP
        cuil_receptor  → CUIL del padre/tutor (sin guiones)
        monto          → importe total del pago
        concepto       → descripción que aparece en la factura
    """
    cuit_num = cuit_emisor.replace("-", "")

    ticket = obtener_ticket_acceso()

    client = Client(URLS[MODO]["wsfe"])
    auth   = {
        "Token": ticket["token"],
        "Sign":  ticket["sign"],
        "Cuit":  cuit_num,
    }

    # Obtener el último número de comprobante para calcular el próximo
    ultimo = client.service.FECompUltimoAutorizado(
        Auth=auth,
        PtoVta=punto_venta,
        CbteTipo=TIPO_COMPROBANTE_C,
    )
    proximo_numero = int(ultimo.CbteNro) + 1

    hoy = datetime.date.today().strftime("%Y%m%d")

    solicitud = {
        "FeCabReq": {
            "CantReg":  1,
            "PtoVta":   punto_venta,
            "CbteTipo": TIPO_COMPROBANTE_C,
        },
        "FeDetReq": {
            "FECAEDetRequest": [{
                "Concepto":    2,           # 1=Productos, 2=Servicios, 3=Ambos
                "DocTipo":     96,          # 96=DNI, 80=CUIT
                "DocNro":      cuil_receptor.replace("-", ""),
                "CbteDesde":   proximo_numero,
                "CbteHasta":   proximo_numero,
                "CbteFch":     hoy,
                "ImpTotal":    round(monto, 2),
                "ImpTotConc":  0,
                "ImpNeto":     0,
                "ImpOpEx":     round(monto, 2),  # exento de IVA
                "ImpIVA":      0,
                "ImpTrib":     0,
                "MonId":       "PES",
                "MonCotiz":    1,
            }]
        },
    }

    respuesta = client.service.FECAESolicitar(Auth=auth, FeCAEReq=solicitud)
    detalle   = respuesta.FeDetResp.FECAEDetResponse[0]

    if detalle.Resultado != "A":
        errores = [
            f"{e.Code}: {e.Msg}"
            for e in (detalle.Observaciones.Obs if detalle.Observaciones else [])
        ]
        raise ValueError(f"AFIP rechazó la factura: {'; '.join(errores)}")

    vencimiento = datetime.datetime.strptime(detalle.CAEFchVto, "%Y%m%d").date()

    return {
        "numero":          proximo_numero,
        "cae":             detalle.CAE,
        "vencimiento_cae": vencimiento,
    }
