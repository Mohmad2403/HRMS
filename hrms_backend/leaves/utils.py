from django.utils import timezone

from .models import LeaveRequest, LeaveType


def used_days(employee, leave_type, year):
    approved = LeaveRequest.objects.filter(
        employee=employee,
        leave_type=leave_type,
        status=LeaveRequest.Status.APPROVED,
        start_date__year=year,
    )
    return sum(r.total_days for r in approved)


def leave_balances(employee, year=None):
    year = year or timezone.localdate().year
    result = []
    for lt in LeaveType.objects.filter(is_active=True):
        used = used_days(employee, lt, year)
        result.append({
            'leave_type': lt.id,
            'name': lt.name,
            'total': lt.days_per_year,
            'used': used,
            'remaining': lt.days_per_year - used,
        })
    return result