from django.db import models

# Create your models here.
from django.conf import settings
from departments.models import Department,Designation


class Employee(models.Model):
    class EmploymentType(models.TextChoices):
        FULL_TIME='full_time','Full Time'
        PART_TIME='part_time','Part Time'
        CONTRACT='contract','Contract'
        INTERN='intern','Intern'
        
    class Gender(models.TextChoices):
        MALE='male','Male'
        FEMALE='female','Female'
        OTHER='other','Other'
        
    user=models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='employee_profile',
    )
    
    employee_id=models.CharField(max_length=20,unique=True)
    
    department=models.ForeignKey(
        Department,on_delete=models.SET_NULL,null=True,blank=True,related_name='employees'
    )
    designation=models.ForeignKey(
        Designation,on_delete=models.SET_NULL,null=True, blank=True,related_name='employees'
    )
    manager=models.ForeignKey(
        'self',on_delete=models.SET_NULL,null=True,blank=True,related_name='team_members'
    )
    
    phone=models.CharField(max_length=12,blank=True)
    address=models.TextField(blank=True)
    date_of_birth=models.DateField(null=True,blank=True)
    gender=models.CharField(max_length=10,choices=Gender.choices,blank=True)
    emergency_contact=models.CharField(max_length=100,blank=True)
    
    date_of_joining=models.DateField()
    employment_type=models.CharField(max_length=20,choices=EmploymentType.choices,default=EmploymentType.FULL_TIME)
    is_active=models.BooleanField(default=True)
    
    profile_picture=models.ImageField(upload_to='profile_pictures/',null=True,blank=True)
    
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)
    
    
    def __str__(self):
        return f"{self.employee_id} - {self.user.get_full_name() or self.user.username}"