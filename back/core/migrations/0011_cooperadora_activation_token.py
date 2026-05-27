from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0010_add_contacto_to_cooperadora'),
    ]

    operations = [
        migrations.AddField(
            model_name='cooperadora',
            name='activation_token',
            field=models.UUIDField(blank=True, null=True),
        ),
    ]
