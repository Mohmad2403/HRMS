from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdminHROrManager
from .models import Attendance
from .serializers import AttendanceSerializer
from django.db.models import Count,Q

class CheckInView(APIView):
    def post(self, request):
        employee = getattr(request.user, 'employee_profile', None)
        if not employee:
            return Response({'detail': 'No employee profile linked to this account.'}, status=400)

        record, _ = Attendance.objects.get_or_create(employee=employee, date=timezone.localdate())

        if record.check_in:
            return Response({'detail': 'Already checked in today.'}, status=400)

        record.check_in = timezone.localtime().time().replace(microsecond=0)
        record.save()
        return Response(AttendanceSerializer(record).data)


class CheckOutView(APIView):
    def post(self, request):
        employee = getattr(request.user, 'employee_profile', None)
        if not employee:
            return Response({'detail': 'No employee profile linked to this account.'}, status=400)

        try:
            record = Attendance.objects.get(employee=employee, date=timezone.localdate())
        except Attendance.DoesNotExist:
            return Response({'detail': 'You have not checked in today.'}, status=400)

        if record.check_out:
            return Response({'detail': 'Already checked out today.'}, status=400)

        record.check_out = timezone.localtime().time().replace(microsecond=0)
        record.save()
        return Response(AttendanceSerializer(record).data)


class TodayAttendanceView(APIView):
    """Today's record for the logged-in user, or null if not checked in yet."""
    def get(self, request):
        employee = getattr(request.user, 'employee_profile', None)
        if not employee:
            return Response({'detail': 'No employee profile linked to this account.'}, status=400)
        record = Attendance.objects.filter(employee=employee, date=timezone.localdate()).first()
        return Response(AttendanceSerializer(record).data if record else None)


class MyAttendanceView(generics.ListAPIView):
    """An employee viewing their own attendance history."""
    serializer_class = AttendanceSerializer

    def get_queryset(self):
        employee = getattr(self.request.user, 'employee_profile', None)
        if not employee:
            return Attendance.objects.none()
        return Attendance.objects.filter(employee=employee)


class AllAttendanceView(generics.ListAPIView):
    """Admin/HR see everyone; a manager sees only their direct reports."""
    permission_classes = [IsAdminHROrManager]
    serializer_class = AttendanceSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['date', 'employee', 'employee__department', 'status']

    def get_queryset(self):
        qs = Attendance.objects.select_related('employee', 'employee__user', 'employee__department')
        if self.request.user.role == 'manager':
            profile = getattr(self.request.user, 'employee_profile', None)
            return qs.filter(employee__manager=profile) if profile else qs.none()
        return qs
    
    
class AttendanceReportView(APIView):
    permission_classes = [IsAdminHROrManager]

    def get(self, request):
        qs = Attendance.objects.select_related('employee', 'employee__user', 'employee__department')

        if request.user.role == 'manager':
            profile = getattr(request.user, 'employee_profile', None)
            qs = qs.filter(employee__manager=profile) if profile else qs.none()

        date_from = request.query_params.get('from')
        date_to = request.query_params.get('to')
        department = request.query_params.get('department')

        if date_from:
            qs = qs.filter(date__gte=date_from)
        if date_to:
            qs = qs.filter(date__lte=date_to)
        if department:
            qs = qs.filter(employee__department_id=department)

        by_status = qs.values('status').annotate(count=Count('id')).order_by('status')
        by_employee = (
            qs.values('employee__employee_id', 'employee__user__first_name', 'employee__user__username')
            .annotate(
                present=Count('id', filter=Q(status='present')),
                late=Count('id', filter=Q(status='late')),
                absent=Count('id', filter=Q(status='absent')),
                leave=Count('id', filter=Q(status='leave')),
                half_day=Count('id', filter=Q(status='half_day')),
            )
            .order_by('employee__employee_id')
        )

        return Response({
            'by_status': list(by_status),
            'by_employee': list(by_employee),
        })