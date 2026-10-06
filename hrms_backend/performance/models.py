from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from employees.models import Employee


class PerformanceReview(models.Model):
    RATING_VALIDATORS = [MinValueValidator(1), MaxValueValidator(5)]

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='performance_reviews')
    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='reviews_given'
    )
    period = models.CharField(max_length=20, help_text='e.g. 2026 Q3')

    technical_skills = models.PositiveSmallIntegerField(validators=RATING_VALIDATORS)
    communication = models.PositiveSmallIntegerField(validators=RATING_VALIDATORS)
    teamwork = models.PositiveSmallIntegerField(validators=RATING_VALIDATORS)
    problem_solving = models.PositiveSmallIntegerField(validators=RATING_VALIDATORS)

    comments = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('employee', 'period')
        ordering = ['-created_at']

    @property
    def overall_rating(self):
        scores = [self.technical_skills, self.communication, self.teamwork, self.problem_solving]
        return round(sum(scores) / len(scores), 1)

    def __str__(self):
        return f"{self.employee.employee_id} - {self.period}"