from django.urls import path
from .views import DepartmentListCreateView, DesignationListView

urlpatterns = [
    path('', DepartmentListCreateView.as_view(), name='department-list-create'),
    path('designations/', DesignationListView.as_view(), name='designation-list'),
]