from django.contrib import admin

# Register your models here.
from .models import Department ,Designation

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display=('name','manager','is_active','created_at')
    list_filter=('is_active',)
    search_fields=('name',)
    
    
@admin.register(Designation)
class DesignationAdmin(admin.ModelAdmin):
    list_display=('title','department','is_active')
    list_filter=('department','is_active')