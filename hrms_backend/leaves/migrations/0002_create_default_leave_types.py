from django.db import migrations


def create_default_leave_types(apps, schema_editor):
    LeaveType = apps.get_model('leaves', 'LeaveType')
    default_types = [
        {'name': 'Casual Leave', 'days_per_year': 12},
        {'name': 'Sick Leave', 'days_per_year': 10},
        {'name': 'Earned Leave', 'days_per_year': 15},
    ]
    for item in default_types:
        LeaveType.objects.get_or_create(
            name=item['name'],
            defaults={'days_per_year': item['days_per_year'], 'is_active': True}
        )


def remove_default_leave_types(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('leaves', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_default_leave_types, reverse_code=remove_default_leave_types),
    ]
