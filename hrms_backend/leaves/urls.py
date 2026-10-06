from django.urls import path
from .views import (
    ApplyLeaveView, ApproveLeaveView, LeaveBalanceView, LeaveTypeListView,
    MyLeavesView, RejectLeaveView, ReviewListView,LeaveReportView
)

urlpatterns = [
    path('types/', LeaveTypeListView.as_view(), name='leave-types'),
    path('balance/', LeaveBalanceView.as_view(), name='leave-balance'),
    path('apply/', ApplyLeaveView.as_view(), name='leave-apply'),
    path('my/', MyLeavesView.as_view(), name='my-leaves'),
    path('', ReviewListView.as_view(), name='leave-review-list'),
    path('<int:pk>/approve/', ApproveLeaveView.as_view(), name='leave-approve'),
    path('<int:pk>/reject/', RejectLeaveView.as_view(), name='leave-reject'),
    path('report/', LeaveReportView.as_view(), name='leave-report'),
]