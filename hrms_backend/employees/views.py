from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics
from accounts.permissions import IsAdminOrHR
from .models import Employee
from .serializers import EmployeeCreateSerializer, EmployeeDetailSerializer, EmployeeListSerializer
from django.db.models import Count
from rest_framework.views import APIView
from rest_framework.response import Response
from departments.models import Department
from rest_framework.exceptions import NotFound
from datetime import date
from attendance.models import Attendance
from leaves.models import LeaveRequest
from leaves.utils import leave_balances
from performance.models import PerformanceReview
from payroll.models import Payslip
from django.shortcuts import get_object_or_404
from leaves.models import LeaveRequest
from django.utils import timezone





def scoped_employee_queryset(user):
    qs = Employee.objects.select_related('user', 'department', 'designation')
    if user.role == 'manager':
        profile = getattr(user, 'employee_profile', None)
        return qs.filter(manager=profile) if profile else qs.none()
    if user.role == 'employee':
        profile = getattr(user, 'employee_profile', None)
        return qs.filter(id=profile.id) if profile else qs.none()
    return qs

class MyProfileView(generics.RetrieveAPIView):
    serializer_class = EmployeeDetailSerializer

    def get_object(self):
        profile = getattr(self.request.user, 'employee_profile', None)
        if not profile:
            raise NotFound('No employee profile linked to this account.')
        return profile

class DashboardStatsView(APIView):
    def get(self,request):
        total_employees=Employee.objects.count()
        active_employees=Employee.objects.filter(is_active=True).count()
        total_departments=Department.objects.filter(is_active=True).count()
        
        
        
        on_leave_today = LeaveRequest.objects.filter(
            status=LeaveRequest.Status.APPROVED,
            start_date__lte=timezone.localdate(),
            end_date__gte=timezone.localdate(),
        ).values('employee').distinct().count()

        
        
        by_department=(
            Employee.objects.filter(is_active=True,department__isnull=False)
            .values('department__name')
            .annotate(count=Count('id'))
            .order_by('-count')
        )
        
        
        
        return Response({
            'total_employees':total_employees,
            'active_employees':active_employees,
            'inactive_employees':total_employees-active_employees,
            'total_departments':total_departments,
            'department_distribution':[
                {'department':d['department__name'],'count':d['count']} for d in by_department
            ],
        })

class EmployeeListCreateView(generics.ListCreateAPIView):
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['department', 'is_active']
    search_fields = ['employee_id', 'user__first_name', 'user__last_name', 'user__email']

    def get_queryset(self):
        qs = Employee.objects.select_related('user', 'department', 'designation')
        user = self.request.user
        if user.role == 'manager':
            profile = getattr(user, 'employee_profile', None)
            return qs.filter(manager=profile) if profile else qs.none()
        if user.role == 'employee':
            profile = getattr(user, 'employee_profile', None)
            return qs.filter(id=profile.id) if profile else qs.none()
        return qs

    def get_serializer_class(self):
        return EmployeeCreateSerializer if self.request.method == 'POST' else EmployeeListSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminOrHR()]
        return super().get_permissions()

class EmployeeDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = EmployeeDetailSerializer

    def get_queryset(self):
        qs = Employee.objects.select_related('user', 'department', 'designation')
        user = self.request.user
        if user.role == 'manager':
            profile = getattr(user, 'employee_profile', None)
            return qs.filter(manager=profile) if profile else qs.none()
        if user.role == 'employee':
            profile = getattr(user, 'employee_profile', None)
            return qs.filter(id=profile.id) if profile else qs.none()
        return qs

    def get_permissions(self):
        if self.request.method in ('PUT', 'PATCH', 'DELETE'):
            return [IsAdminOrHR()]
        return super().get_permissions()
    
    
class EmployeeProfileSummaryView(APIView):
    """Quick stats for the profile header cards: present days, latest rating, latest net salary, leave usage."""
    def get(self, request, pk=None):
        if pk:
            employee = get_object_or_404(scoped_employee_queryset(request.user), pk=pk)
        else:
            employee = getattr(request.user, 'employee_profile', None)
            if not employee:
                return Response({'detail': 'No employee profile linked to this account.'}, status=400)

        today = date.today()
        present_days = Attendance.objects.filter(
            employee=employee, date__year=today.year, date__month=today.month,
            status__in=['present', 'late', 'half_day'],
        ).count()

        latest_review = PerformanceReview.objects.filter(employee=employee).order_by('-created_at').first()
        latest_payslip = Payslip.objects.filter(employee=employee).order_by('-year', '-month').first()
        balances = leave_balances(employee)
        total_used = sum(b['used'] for b in balances)

        return Response({
            'present_days_this_month': present_days,
            'overall_rating': latest_review.overall_rating if latest_review else None,
            'net_salary_last_month': latest_payslip.net_salary if latest_payslip else None,
            'total_leave_days_used': total_used,
        })
        
        
class DeactivateEmployeeView(APIView):
    permission_classes = [IsAdminOrHR]

    def post(self, request, pk):
        employee = get_object_or_404(Employee, pk=pk)
        employee.is_active = not employee.is_active
        employee.save()
        return Response({'id': employee.id, 'is_active': employee.is_active})