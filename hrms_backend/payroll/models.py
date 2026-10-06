from django.core.validators import MinValueValidator
from django.db import models
from employees.models import Employee


class SalaryStructure(models.Model):
    """An employee's current pay components. One row per employee, edited when their pay changes."""
    employee = models.OneToOneField(Employee, on_delete=models.CASCADE, related_name='salary_structure')
    basic = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    hra = models.DecimalField(max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    allowances = models.DecimalField(max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def gross(self):
        return self.basic + self.hra + self.allowances

    def __str__(self):
        return f"{self.employee.employee_id} salary structure"


class Payslip(models.Model):
    """One month's actual pay run for one employee."""
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        PAID = 'paid', 'Paid'

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='payslips')
    month = models.PositiveSmallIntegerField()
    year = models.PositiveIntegerField()

    basic = models.DecimalField(max_digits=10, decimal_places=2)
    hra = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    allowances = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    bonus = models.DecimalField(max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    deductions = models.DecimalField(max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(0)])

    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    generated_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('employee', 'month', 'year')
        ordering = ['-year', '-month']

    @property
    def gross_salary(self):
        return self.basic + self.hra + self.allowances + self.bonus

    @property
    def net_salary(self):
        return self.gross_salary - self.deductions

    def __str__(self):
        return f"{self.employee.employee_id} - {self.month}/{self.year}"