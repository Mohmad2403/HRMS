from django.shortcuts import render
from rest_framework import generics
from accounts.permissions import IsAdminOrHR
from django_filters.rest_framework import DjangoFilterBackend
from .models import Designation,Department
from .serializers import DepartmentSerializer,DesignationSerializer
# Create your views here.

class DepartmentListCreateView(generics.ListCreateAPIView):
    queryset=Department.objects.filter(is_active=True)
    serializer_class=DepartmentSerializer
    
    def get_permissions(self):
        if self.request.method =='POST':
            return [IsAdminOrHR()]
        return super().get_permissions()
    
    
    
class DesignationListView(generics.ListAPIView):
    queryset=Designation.objects.filter(is_active=True)
    serializer_class=DesignationSerializer
    filter_backends=[DjangoFilterBackend]
    filterset_fields=['department']
