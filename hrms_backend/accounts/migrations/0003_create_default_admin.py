from django.db import migrations
from django.contrib.auth.hashers import make_password


def create_admin(apps, schema_editor):
    User = apps.get_model('accounts', 'User')
    if not User.objects.filter(username='admin').exists():
        User.objects.create(
            username='admin',
            email='admin@hrms.com',
            password=make_password('Admin@1234'),
            is_staff=True,
            is_superuser=True,
            is_active=True,
            role='admin',
        )
    else:
        user = User.objects.get(username='admin')
        user.password = make_password('Admin@1234')
        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        user.role = 'admin'
        user.save()


def remove_admin(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0002_alter_user_id'),
    ]

    operations = [
        migrations.RunPython(create_admin, reverse_code=remove_admin),
    ]
