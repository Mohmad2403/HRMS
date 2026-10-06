from rest_framework import serializers
from .models import Department,Designation

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model=Department
        fields=('id','name','description','manager','is_active')
        
        
class DesignationSerializer(serializers.ModelSerializer):
    class Meta:
        model=Designation
        fields=('id','title','department','is_active')
        
        
        