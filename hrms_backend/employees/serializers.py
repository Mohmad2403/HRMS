from rest_framework import serializers
from accounts.serializers import UserSerializer
from accounts.models import User
from departments.models import Department, Designation
from .models import Employee
from departments.serializers import DepartmentSerializer,DesignationSerializer


class EmployeeListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for the employee table/list view."""
    full_name = serializers.SerializerMethodField()
    email = serializers.EmailField(source='user.email', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True, default=None)
    designation_title = serializers.CharField(source='designation.title', read_only=True, default=None)

    class Meta:
        model = Employee
        fields = (
            'id', 'employee_id', 'full_name', 'email',
            'department_name', 'designation_title', 'is_active',
            'profile_picture',
        )
        
    def get_full_name(self, obj):
        return obj.user.get_full_name() or obj.user.username


class EmployeeDetailSerializer(serializers.ModelSerializer):
    """Full serializer for viewing/editing one employee's profile."""
    user = UserSerializer(read_only=True)
    department_detail=DepartmentSerializer(source='department',read_only=True)
    designation_detail=DesignationSerializer(source='desgnation',read_only=True)
    manager_detail=EmployeeListSerializer(source='manager',read_only=True)

    class Meta:
        model = Employee
        fields = '__all__'


class EmployeeCreateSerializer(serializers.ModelSerializer):
    """Used only when creating a new employee (creates User + Employee together)."""
    username = serializers.CharField(write_only=True)
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(write_only=True)
    last_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=User.Role.choices, write_only=True)

    class Meta:
        model = Employee
        exclude = ('user',)

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data.pop('username'),
            email=validated_data.pop('email'),
            password=validated_data.pop('password'),
            first_name=validated_data.pop('first_name'),
            last_name=validated_data.pop('last_name', ''),
            role=validated_data.pop('role'),
        )
        employee = Employee.objects.create(user=user, **validated_data)
        return employee
    