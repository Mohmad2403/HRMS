from django.shortcuts import get_object_or_404
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdminHROrManager
from .models import LeaveRequest, LeaveType
from .serializers import LeaveRequestSerializer, LeaveTypeSerializer
from .utils import leave_balances
from django.db.models import Count,Q


def review_queryset(user):
    """Admin/HR review everyone; a manager reviews only direct reports."""
    qs = LeaveRequest.objects.select_related(
        'employee', 'employee__user', 'leave_type', 'reviewed_by'
    )
    if user.role == 'manager':
        profile = getattr(user, 'employee_profile', None)
        return qs.filter(employee__manager=profile) if profile else qs.none()
    return qs


class LeaveTypeListView(generics.ListAPIView):
    queryset = LeaveType.objects.filter(is_active=True)
    serializer_class = LeaveTypeSerializer
    pagination_class = None


class LeaveBalanceView(APIView):
    def get(self, request):
        employee = getattr(request.user, 'employee_profile', None)
        if not employee:
            return Response({'detail': 'No employee profile linked to this account.'}, status=400)
        return Response(leave_balances(employee))


class ApplyLeaveView(generics.CreateAPIView):
    serializer_class = LeaveRequestSerializer

    def create(self, request, *args, **kwargs):
        if not getattr(request.user, 'employee_profile', None):
            return Response({'detail': 'No employee profile linked to this account.'}, status=400)
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(employee=self.request.user.employee_profile)


class MyLeavesView(generics.ListAPIView):
    serializer_class = LeaveRequestSerializer

    def get_queryset(self):
        employee = getattr(self.request.user, 'employee_profile', None)
        if not employee:
            return LeaveRequest.objects.none()
        return LeaveRequest.objects.select_related(
            'employee', 'employee__user', 'leave_type', 'reviewed_by'
        ).filter(employee=employee)


class ReviewListView(generics.ListAPIView):
    permission_classes = [IsAdminHROrManager]
    serializer_class = LeaveRequestSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'employee', 'leave_type']

    def get_queryset(self):
        return review_queryset(self.request.user)


class ReviewLeaveView(APIView):
    permission_classes = [IsAdminHROrManager]
    new_status = None

    def post(self, request, pk):
        leave = get_object_or_404(review_queryset(request.user), pk=pk)

        if leave.employee.user_id == request.user.id:
            return Response({'detail': 'You cannot review your own leave request.'}, status=403)
        if leave.status != LeaveRequest.Status.PENDING:
            return Response({'detail': f'This request is already {leave.status}.'}, status=400)

        leave.status = self.new_status
        leave.reviewed_by = request.user
        leave.reviewed_at = timezone.now()
        leave.save()
        return Response(LeaveRequestSerializer(leave).data)


class ApproveLeaveView(ReviewLeaveView):
    new_status = LeaveRequest.Status.APPROVED


class RejectLeaveView(ReviewLeaveView):
    new_status = LeaveRequest.Status.REJECTED
    
    
class LeaveReportView(APIView):
    permission_classes = [IsAdminHROrManager]

    def get(self, request):
        qs = LeaveRequest.objects.select_related('employee', 'employee__user', 'leave_type')

        if request.user.role == 'manager':
            profile = getattr(request.user, 'employee_profile', None)
            qs = qs.filter(employee__manager=profile) if profile else qs.none()

        year = request.query_params.get('year')
        department = request.query_params.get('department')

        if year:
            qs = qs.filter(start_date__year=year)
        if department:
            qs = qs.filter(employee__department_id=department)

        by_status = qs.values('status').annotate(count=Count('id')).order_by('status')
        by_type = qs.values('leave_type__name').annotate(count=Count('id')).order_by('leave_type__name')

        by_employee = (
            qs.values('employee__employee_id', 'employee__user__first_name', 'employee__user__username')
            .annotate(
                pending=Count('id', filter=Q(status='pending')),
                approved=Count('id', filter=Q(status='approved')),
                rejected=Count('id', filter=Q(status='rejected')),
                total_requests=Count('id'),
            )
            .order_by('employee__employee_id')
        )

        return Response({
            'by_status': list(by_status),
            'by_type': list(by_type),
            'by_employee': list(by_employee),
        })