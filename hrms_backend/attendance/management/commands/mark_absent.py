from datetime import date

from django.core.management.base import BaseCommand
from django.utils import timezone

from attendance.models import Attendance
from employees.models import Employee
from leaves.models import LeaveRequest


class Command(BaseCommand):
    help = 'Create Absent records for active employees with no attendance on a date, skipping approved leave.'

    def add_arguments(self, parser):
        parser.add_argument('--date', help='YYYY-MM-DD (default: today)')

    def handle(self, *args, **options):
        day = date.fromisoformat(options['date']) if options['date'] else timezone.localdate()

        if day.weekday() >= 5:
            self.stdout.write(f'{day} is a weekend, skipped.')
            return

        already_has_record = Attendance.objects.filter(date=day).values_list('employee_id', flat=True)

        on_approved_leave = LeaveRequest.objects.filter(
            status=LeaveRequest.Status.APPROVED,
            start_date__lte=day,
            end_date__gte=day,
        ).values_list('employee_id', flat=True)

        candidates = Employee.objects.filter(
            is_active=True, date_of_joining__lte=day
        ).exclude(id__in=already_has_record)

        leave_ids = set(on_approved_leave)
        to_mark_leave = [e for e in candidates if e.id in leave_ids]
        to_mark_absent = [e for e in candidates if e.id not in leave_ids]

        Attendance.objects.bulk_create(
            [Attendance(employee=e, date=day, status=Attendance.Status.LEAVE) for e in to_mark_leave]
            + [Attendance(employee=e, date=day, status=Attendance.Status.ABSENT) for e in to_mark_absent]
        )

        self.stdout.write(self.style.SUCCESS(
            f'{day}: marked {len(to_mark_absent)} absent, {len(to_mark_leave)} on leave.'
        ))