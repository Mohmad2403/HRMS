from django.urls import path

from .views import EmployeeDetailView,MyProfileView,EmployeeListCreateView,DashboardStatsView,EmployeeProfileSummaryView,DeactivateEmployeeView

urlpatterns = [
    path('stats/', DashboardStatsView.as_view(), name='employee-stats'),
    path('me/', MyProfileView.as_view(), name='my-profile'),
    path('me/summary/', EmployeeProfileSummaryView.as_view(), name='my-profile-summary'),
    path('<int:pk>/summary/', EmployeeProfileSummaryView.as_view(), name='employee-profile-summary'),
    path('<int:pk>/', EmployeeDetailView.as_view(), name='employee-detail'),
    path('', EmployeeListCreateView.as_view(), name='employee-list-create'),
    path('<int:pk>/deactivate/', DeactivateEmployeeView.as_view(), name='employee-deactivate'),
]