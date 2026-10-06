from django.shortcuts import render
from django.utils import timezone
from rest_framework import serializers
from .models import Attendance

# Create your views here.


class AttendanceSerializer(serializers.ModelSerializer):
    employee_name=serializers.CharField(source='employee.user.get_full_name',read_only=True)
    employee_code=serializers.CharField(source='employee.employee_id',read_only=True)
    working_hours=serializers.ReadOnlyField()
    
    class Meta:
        model=Attendance
        fields=(
            'id','employee','employee_name','employee_code','date','check_in','check_out','status','working_hours',
        )
        
        read_only_fields=('status',)