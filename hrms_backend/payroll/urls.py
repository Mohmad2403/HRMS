from django.urls import path
from .views import (
    GeneratePayslipView, MarkPaidView, MySalaryView, PayslipDetailView,
    PayslipListView, SalaryStructureDetailView, SalaryStructureListView,
    MyPayslipsView, PayrollReportView,
)

urlpatterns = [
    path('salary-structures/', SalaryStructureListView.as_view(), name='salary-structure-list'),
    path('salary-structures/<int:pk>/', SalaryStructureDetailView.as_view(), name='salary-structure-detail'),
    path('my-salary/', MySalaryView.as_view(), name='my-salary'),
    path('my-payslips/', MyPayslipsView.as_view(), name='my-payslips'),
    path('report/', PayrollReportView.as_view(), name='payroll-report'),
    path('generate/', GeneratePayslipView.as_view(), name='payslip-generate'),
    path('<int:pk>/mark-paid/', MarkPaidView.as_view(), name='payslip-mark-paid'),
    path('<int:pk>/', PayslipDetailView.as_view(), name='payslip-detail'),
    path('', PayslipListView.as_view(), name='payslip-list'),
]