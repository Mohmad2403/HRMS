from django.contrib import admin
from .models import Payslip, SalaryStructure


@admin.register(SalaryStructure)
class SalaryStructureAdmin(admin.ModelAdmin):
    list_display = ('employee', 'basic', 'hra', 'allowances')


@admin.register(Payslip)
class PayslipAdmin(admin.ModelAdmin):
    list_display = ('employee', 'month', 'year', 'status')
    list_filter = ('status', 'year', 'month')