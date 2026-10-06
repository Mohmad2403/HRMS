from django.urls import path
from .views import MyPerformanceView, PerformanceReviewListCreateView

urlpatterns = [
    path('my/', MyPerformanceView.as_view(), name='my-performance'),
    path('', PerformanceReviewListCreateView.as_view(), name='performance-list-create'),
]