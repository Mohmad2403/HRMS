from django.contrib import admin
from .models import PerformanceReview


@admin.register(PerformanceReview)
class PerformanceReviewAdmin(admin.ModelAdmin):
    list_display = ('employee', 'period', 'overall_rating', 'reviewer')
    list_filter = ('period',)