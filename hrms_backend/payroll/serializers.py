from employees.models import Employee
from rest_framework import serializers
from .models import Payslip, SalaryStructure


class SalaryStructureSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.user.get_full_name', read_only=True)
    employee_code = serializers.CharField(source='employee.employee_id', read_only=True)
    gross = serializers.ReadOnlyField()

    class Meta:
        model = SalaryStructure
        fields = ('id', 'employee', 'employee_name', 'employee_code', 'basic', 'hra', 'allowances', 'gross', 'updated_at')


class PayslipSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.user.get_full_name', read_only=True)
    employee_code = serializers.CharField(source='employee.employee_id', read_only=True)
    department_name = serializers.CharField(source='employee.department.name', read_only=True, default=None)
    gross_salary = serializers.ReadOnlyField()
    net_salary = serializers.ReadOnlyField()

    class Meta:
        model = Payslip
        fields = (
            'id', 'employee', 'employee_name', 'employee_code', 'department_name',
            'month', 'year', 'basic', 'hra', 'allowances', 'bonus', 'deductions',
            'gross_salary', 'net_salary', 'status', 'generated_at', 'paid_at',
        )
        read_only_fields = ('status', 'generated_at', 'paid_at')


class GeneratePayslipSerializer(serializers.Serializer):
    """Input only: which employee, which month, plus optional bonus/deductions for that month."""
    employee = serializers.PrimaryKeyRelatedField(queryset=Employee.objects.filter(is_active=True))
    month = serializers.IntegerField(min_value=1, max_value=12)
    year = serializers.IntegerField(min_value=2020, max_value=2100)
    bonus = serializers.DecimalField(max_digits=10, decimal_places=2, default=0)
    deductions = serializers.DecimalField(max_digits=10, decimal_places=2, default=0)