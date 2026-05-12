import logging
from django.core.management.base import BaseCommand

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Reintenta el mint de tokens para pagos con token_minteado=False"

    def handle(self, *args, **options):
        from core.models import Pago
        from core.web3_client import mint_token_padre

        pendientes = Pago.objects.filter(token_minteado=False)
        total = pendientes.count()
        self.stdout.write(f"Pagos pendientes de mint: {total}")

        exitosos = 0
        for pago in pendientes:
            try:
                tx_hash = mint_token_padre(pago)
                Pago.objects.filter(pk=pago.pk).update(
                    token_minteado=True,
                    token_mint_tx=tx_hash,
                )
                exitosos += 1
                self.stdout.write(f"  OK pago {pago.pk} → {tx_hash}")
            except Exception as e:
                logger.exception("mint falló para pago id=%s", pago.pk)
                self.stdout.write(f"  FAIL pago {pago.pk}: {e}")

        self.stdout.write(f"Completado: {exitosos}/{total} minteados")
