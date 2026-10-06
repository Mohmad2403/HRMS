from django.contrib import admin
from .models import LeaveRequest,LeaveType
# Register your models here.

@admin.register(LeaveType)
class LeavTypeAdmin(admin.ModelAdmin):
    list_display=('name','days_per_year','is_active')
    
    
    
@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
    list_display=('employee','leave_type','start_date','end_date','status')
    list_filter=('status','leave_type')
