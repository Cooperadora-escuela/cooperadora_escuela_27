import logging
from django.db.models.signals import post_save
from django.dispatch import receiver

logger = logging.getLogger(__name__)


@receiver(post_save, sender='core.Usuario')
def generar_wallet_padre(sender, instance, created, **kwargs):
    if not created or instance.rol != 'PAD':
        return
    if instance.wallet_address:
        return
    try:
        from core.web3_client import generar_wallet, registrar_padre_en_dao
        address, encrypted_key = generar_wallet()
        sender.objects.filter(pk=instance.pk).update(
            wallet_address=address,
            wallet_private_key_encrypted=encrypted_key,
        )
        registrar_padre_en_dao(address)
    except Exception:
        logger.exception("generar_wallet/registrar_padre falló para usuario id=%s", instance.pk)


@receiver(post_save, sender='core.Pago')
def mint_token_on_pago(sender, instance, created, **kwargs):
    if not created or instance.token_minteado:
        return
    try:
        from core.web3_client import mint_token_padre
        tx_hash = mint_token_padre(instance)
        sender.objects.filter(pk=instance.pk).update(
            token_minteado=True,
            token_mint_tx=tx_hash,
        )
    except Exception:
        logger.exception("mint_token_padre falló para pago id=%s", instance.pk)
