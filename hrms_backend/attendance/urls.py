from django.urls import path
from .views import AllAttendanceView, CheckInView, CheckOutView, MyAttendanceView,TodayAttendanceView ,AttendanceReportView

urlpatterns = [
    path('check-in/', CheckInView.as_view(), name='check-in'),
    path('check-out/', CheckOutView.as_view(), name='check-out'),
    path('today/',TodayAttendanceView.as_view(),name='today-attendance'),
    path('my/', MyAttendanceView.as_view(), name='my-attendance'),
    path('', AllAttendanceView.as_view(), name='all-attendance'),
    path('report/', AttendanceReportView.as_view(), name='attendance-report'),
]