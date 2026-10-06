from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics

from accounts.permissions import IsAdminHROrManager
from .models import PerformanceReview
from .serializers import PerformanceReviewSerializer


def scoped_queryset(user, qs):
    if user.role in ('admin', 'hr'):
        return qs
    if user.role == 'manager':
        profile = getattr(user, 'employee_profile', None)
        return qs.filter(employee__manager=profile) if profile else qs.none()
    profile = getattr(user, 'employee_profile', None)
    return qs.filter(employee=profile) if profile else qs.none()


class PerformanceReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = PerformanceReviewSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['employee', 'period']

    def get_queryset(self):
        qs = PerformanceReview.objects.select_related('employee', 'employee__user', 'reviewer')
        return scoped_queryset(self.request.user, qs)

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminHROrManager()]
        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save(reviewer=self.request.user)


class MyPerformanceView(generics.ListAPIView):
    serializer_class = PerformanceReviewSerializer

    def get_queryset(self):
        profile = getattr(self.request.user, 'employee_profile', None)
        if not profile:
            return PerformanceReview.objects.none()
        return PerformanceReview.objects.select_related('employee', 'reviewer').filter(employee=profile)