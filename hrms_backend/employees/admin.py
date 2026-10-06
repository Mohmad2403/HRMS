from django.contrib import admin

# Register your models here.
from .models import Employee


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display=('employee_id','user','department','designation','is_active')
    list_filter=('department','is_active','employment_type')
    search_fields=('employee_id','user__username','user__firstname','user__last_name')