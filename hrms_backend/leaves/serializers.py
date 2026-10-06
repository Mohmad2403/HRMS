from django.utils import timezone
from rest_framework import serializers

from .models import LeaveRequest, LeaveType
from .utils import used_days


class LeaveTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveType
        fields = ('id', 'name', 'days_per_year', 'is_active')


class LeaveRequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    employee_code = serializers.CharField(source='employee.employee_id', read_only=True)
    leave_type_name = serializers.CharField(source='leave_type.name', read_only=True)
    reviewed_by_name = serializers.CharField(source='reviewed_by.username', read_only=True, default=None)
    total_days = serializers.ReadOnlyField()

    class Meta:
        model = LeaveRequest
        fields = (
            'id', 'employee', 'employee_name', 'employee_code',
            'leave_type', 'leave_type_name', 'start_date', 'end_date',
            'total_days', 'reason', 'status',
            'reviewed_by_name', 'reviewed_at', 'created_at',
        )
        read_only_fields = ('employee', 'status', 'reviewed_at', 'created_at')

    def get_employee_name(self, obj):
        return obj.employee.user.get_full_name() or obj.employee.user.username

    def validate_leave_type(self, value):
        if not value.is_active:
            raise serializers.ValidationError('This leave type is not available.')
        return value

    def validate(self, data):
        start, end = data['start_date'], data['end_date']
        if end < start:
            raise serializers.ValidationError('End date cannot be before start date.')

        employee = getattr(self.context['request'].user, 'employee_profile', None)
        if not employee:
            raise serializers.ValidationError('No employee profile linked to this account.')

        overlap = LeaveRequest.objects.filter(
            employee=employee,
            status__in=[LeaveRequest.Status.PENDING, LeaveRequest.Status.APPROVED],
            start_date__lte=end,
            end_date__gte=start,
        ).exists()
        if overlap:
            raise serializers.ValidationError('You already have a leave request on these dates.')

        days = (end - start).days + 1
        leave_type = data['leave_type']
        remaining = leave_type.days_per_year - used_days(employee, leave_type, start.year)
        if days > remaining:
            raise serializers.ValidationError(
                f'Only {remaining} day(s) of {leave_type.name} left for {start.year}.'
            )
        return data