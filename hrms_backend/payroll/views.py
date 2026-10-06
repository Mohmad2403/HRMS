from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdminOrHR
from .models import Payslip, SalaryStructure
from .serializers import GeneratePayslipSerializer, PayslipSerializer, SalaryStructureSerializer
from django.db.models import Count,Sum,Q


def scoped_queryset(user, qs):
    """Employees (including managers) see only their own payroll data. Admin/HR see all."""
    if user.role in ('admin', 'hr'):
        return qs
    profile = getattr(user, 'employee_profile', None)
    return qs.filter(employee=profile) if profile else qs.none()

class MyPayslipsView(generics.ListAPIView):
    serializer_class = PayslipSerializer

    def get_queryset(self):
        profile = getattr(self.request.user, 'employee_profile', None)
        if not profile:
            return Payslip.objects.none()
        return Payslip.objects.select_related('employee', 'employee__user').filter(employee=profile)
    
    
class SalaryStructureListView(generics.ListCreateAPIView):
    serializer_class = SalaryStructureSerializer
    permission_classes = [IsAdminOrHR]
    queryset = SalaryStructure.objects.select_related('employee', 'employee__user')


class SalaryStructureDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = SalaryStructureSerializer
    permission_classes = [IsAdminOrHR]
    queryset = SalaryStructure.objects.select_related('employee', 'employee__user')


class MySalaryView(APIView):
    def get(self, request):
        profile = getattr(request.user, 'employee_profile', None)
        if not profile:
            return Response({'detail': 'No employee profile linked to this account.'}, status=400)
        try:
            structure = profile.salary_structure
        except SalaryStructure.DoesNotExist:
            return Response({'detail': 'No salary structure set up yet.'}, status=404)
        return Response(SalaryStructureSerializer(structure).data)


class GeneratePayslipView(APIView):
    permission_classes = [IsAdminOrHR]

    def post(self, request):
        serializer = GeneratePayslipSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        employee = data['employee']

        try:
            structure = employee.salary_structure
        except SalaryStructure.DoesNotExist:
            return Response({'detail': 'This employee has no salary structure set up.'}, status=400)

        if Payslip.objects.filter(employee=employee, month=data['month'], year=data['year']).exists():
            return Response({'detail': 'A payslip for this employee and month already exists.'}, status=400)

        payslip = Payslip.objects.create(
            employee=employee,
            month=data['month'],
            year=data['year'],
            basic=structure.basic,
            hra=structure.hra,
            allowances=structure.allowances,
            bonus=data['bonus'],
            deductions=data['deductions'],
        )
        return Response(PayslipSerializer(payslip).data, status=status.HTTP_201_CREATED)


class MarkPaidView(APIView):
    permission_classes = [IsAdminOrHR]

    def post(self, request, pk):
        try:
            payslip = Payslip.objects.get(pk=pk)
        except Payslip.DoesNotExist:
            return Response({'detail': 'Payslip not found.'}, status=404)

        if payslip.status == Payslip.Status.PAID:
            return Response({'detail': 'Already marked paid.'}, status=400)

        payslip.status = Payslip.Status.PAID
        payslip.paid_at = timezone.now()
        payslip.save()
        return Response(PayslipSerializer(payslip).data)


class PayslipListView(generics.ListAPIView):
    serializer_class = PayslipSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['employee', 'month', 'year', 'status']

    def get_queryset(self):
        qs = Payslip.objects.select_related('employee', 'employee__user', 'employee__department')
        return scoped_queryset(self.request.user, qs)


class PayslipDetailView(generics.RetrieveAPIView):
    serializer_class = PayslipSerializer

    def get_queryset(self):
        qs = Payslip.objects.select_related('employee', 'employee__user', 'employee__department')
        return scoped_queryset(self.request.user, qs)
    
    
    
class PayrollReportView(APIView):
    permission_classes = [IsAdminOrHR]

    def get(self, request):
        qs = Payslip.objects.select_related('employee', 'employee__user', 'employee__department')

        month = request.query_params.get('month')
        year = request.query_params.get('year')
        department = request.query_params.get('department')

        if month:
            qs = qs.filter(month=month)
        if year:
            qs = qs.filter(year=year)
        if department:
            qs = qs.filter(employee__department_id=department)

        totals = qs.aggregate(
            total_gross=Sum('basic') + Sum('hra') + Sum('allowances') + Sum('bonus'),
            total_deductions=Sum('deductions'),
            paid_count=Count('id', filter=Q(status='paid')),
            pending_count=Count('id', filter=Q(status='pending')),
        )

        by_employee = []
        for p in qs.order_by('employee__employee_id', '-year', '-month'):
            by_employee.append({
                'employee_code': p.employee.employee_id,
                'employee_name': p.employee.user.get_full_name() or p.employee.user.username,
                'month': p.month,
                'year': p.year,
                'gross_salary': p.gross_salary,
                'deductions': p.deductions,
                'net_salary': p.net_salary,
                'status': p.status,
            })

        return Response({'totals': totals, 'payslips': by_employee})