import logging
from datetime import date
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver

logger = logging.getLogger(__name__)


@receiver(pre_save, sender='core.Cooperadora')
def _track_cooperadora_status(sender, instance, **kwargs):
    """Guarda el status anterior para que post_save pueda detectar la transición."""
    if not instance.pk:
        instance._prev_status = None
        return
    try:
        prev = sender.objects.get(pk=instance.pk)
        instance._prev_status = prev.subscription_status
    except sender.DoesNotExist:
        instance._prev_status = None


@receiver(post_save, sender='core.Cooperadora')
def provisionar_dao_clone(sender, instance, created, **kwargs):
    """
    Al activar una cooperadora (PENDING → TRIAL/ACTIVE) deploya un DAO clone via Factory
    y guarda el dao_address resultante. Solo actúa si dao_address todavía está vacío.
    """
    STATUS_CON_ACCESO = ('TRIAL', 'ACTIVE')
    prev = getattr(instance, '_prev_status', None)

    activando = (
        instance.subscription_status in STATUS_CON_ACCESO
        and prev not in STATUS_CON_ACCESO
        and not instance.dao_address
    )
    if not activando:
        return

    try:
        from core.web3_client import deploy_dao_clone
        ciclo_actual = date.today().year
        dao_address = deploy_dao_clone(instance.nombre, ciclo_actual)
        sender.objects.filter(pk=instance.pk).update(dao_address=dao_address)
        logger.info(
            "DAO clone deployado para cooperadora id=%s: %s",
            instance.pk, dao_address,
        )
    except Exception:
        logger.exception(
            "deploy_dao_clone falló para cooperadora id=%s — dao_address queda vacío",
            instance.pk,
        )


@receiver(post_save, sender='core.Usuario')
def generar_wallet_padre(sender, instance, created, **kwargs):
    if not created or instance.rol != 'PAD':
        return
    if instance.wallet_address:
        return
    if not instance.cooperadora or not instance.cooperadora.dao_address:
        logger.warning("No se puede registrar wallet: cooperadora sin dao_address para usuario id=%s", instance.pk)
        return
    try:
        from core.web3_client import generar_wallet, registrar_padre_en_dao
        address, encrypted_key = generar_wallet()
        sender.objects.filter(pk=instance.pk).update(
            wallet_address=address,
            wallet_private_key_encrypted=encrypted_key,
        )
        registrar_padre_en_dao(address, instance.cooperadora.dao_address)
    except Exception:
        logger.exception("generar_wallet/registrar_padre falló para usuario id=%s", instance.pk)


@receiver(post_save, sender='core.Pago')
def mint_token_on_pago(sender, instance, created, **kwargs):
    if not created or instance.token_minteado:
        return
    if instance.tipo == 'donacion':
        return
    try:
        from core.web3_client import mint_token_padre
        tx_hashes = mint_token_padre(instance)
        sender.objects.filter(pk=instance.pk).update(
            token_minteado=True,
            token_mint_tx=tx_hashes[0],  # guardamos el primer hash; los demás quedan en logs
        )
        if len(tx_hashes) > 1:
            logger.info("Pago anual id=%s: %d tokens minteados. Hashes: %s", instance.pk, len(tx_hashes), tx_hashes)
    except Exception:
        logger.exception("mint_token_padre falló para pago id=%s", instance.pk)
