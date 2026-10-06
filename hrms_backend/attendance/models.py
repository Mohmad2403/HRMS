from django.db import models
from datetime import time

from employees.models import Employee
# Create your models here.


class Attendance(models.Model):
    class Status(models.TextChoices):
        PRESENT='present','Present'
        LATE='late','Late'
        HALF_DAY='half_day','Half Day'
        ABSENT='absent','Absent'
        LEAVE='leave','Leave'
        
        
    LATE_AFTER=time(9,30)
    HALF_DAY_AFTER=time(13,0)
    
    
    employee=models.ForeignKey(Employee,on_delete=models.CASCADE,related_name='attendance_records')
    date=models.DateField()
    check_in=models.TimeField(null=True,blank=True)
    check_out=models.TimeField(null=True,blank=True)
    status=models.CharField(max_length=20,choices=Status.choices, default=Status.ABSENT)
    
    
    class Meta:
        unique_together=('employee','date')
        ordering=['-date']
        
    def compute_status(self):
        if not self.check_in:
            return self.Status.ABSENT
        
        if self.check_in >self.HALF_DAY_AFTER:
            return self.Status.HALF_DAY
        
        if self.check_in >self.LATE_AFTER:
            return self.Status.LATE
        
        return self.Status.PRESENT
    
    
    def save(self,*args,**kwargs):
        self.status=self.compute_status()
        super().save(*args,**kwargs)
        
        
    @property
    
    def working_hours(self):
        if self.check_in and self.check_out:
            from datetime import date, datetime
            start = datetime.combine(date.today(), self.check_in)
            end = datetime.combine(date.today(), self.check_out)
            return round((end - start).total_seconds() / 3600, 2)
        return None
    
    def __str__(self):
        return f"{self.employee.employee_id}-{self.date}({self.status})"
    
    