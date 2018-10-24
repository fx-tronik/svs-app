from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator, RegexValidator

from enum import Enum

# Create your models here.

class Alert_history(models.Model):

    id = models.AutoField(primary_key=True, null=False, unique=True)
    message = models.CharField(max_length=255, blank=False)
    SUPPORTED_ALERT_TYPES = (
      ('0', 'success'),
      ('1', 'info'),
      ('2', 'warning'),
      ('3', 'error')
    )
    type = models.CharField(max_length=1, choices=SUPPORTED_ALERT_TYPES, null=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.message

class Camera(models.Model):

    id = models.AutoField(primary_key=True, null=False, unique=True)

    name = models.SlugField(max_length=12)
    ip = models.GenericIPAddressField(protocol='IPv4', default='0.0.0.0')
    login = models.CharField(max_length=50, blank=False)
    password = models.CharField(max_length=50, blank=False)
    camera_type = models.ForeignKey('Camera_type', related_name='camera_types', on_delete=models.CASCADE)

    def __str__(self):
        return self.name

class Camera_type(models.Model):

    camera_model = models.CharField(max_length=100)
    custom_camera_url = models.CharField(max_length=50, blank=False, null=False,help_text="Use {admin} and {password} for creditentials, and {ip} for adress of the webcam")

    def __str__(self):
        return self.camera_model

class Infrastructure(models.Model):

    id = models.CharField(max_length=4, primary_key=True, null=False, unique=True, blank=False)
    value = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(1.0)], null=True, blank=True)
    max = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    min = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)

    def __str__(self):
            return self.id

    class Meta:
        db_constraints = {
            'value_range': 'check (value >=0.0 AND value <=1.0 )',
        }

class Zone(models.Model):

    id = models.AutoField(primary_key=True, null=False, unique=True)
    name = models.SlugField(max_length=35)
    origin_camera = models.ForeignKey('Camera', related_name='camera_zones', on_delete=models.CASCADE)

    def __str__(self):
        return str(self.origin_camera) + ' - ' + self.name

    class Meta:
        unique_together = (("name", "origin_camera"))


class ZonePolygon(models.Model):

    point_no = models.AutoField(primary_key=True, null=False, unique=True)

    zone = models.ForeignKey('Zone', related_name='polygons', on_delete=models.CASCADE)
    x = models.IntegerField()
    y = models.IntegerField()

    class Meta:
        unique_together = (('x', 'y', 'zone'))

    def __str__(self):
        return str(self.zone) + ' | ' + str(self.point_no)


class Employee(models.Model):
    id = models.AutoField(primary_key=True, null=False, unique=True)
    forename = models.CharField(max_length=40, null=True, blank=True)
    surname = models.CharField(max_length=40, null=True, blank=True)
    position = models.CharField(max_length=50, null=True, blank=True)
    phone_regex = RegexValidator(regex=r'^\+?1?\d{9,12}$', message="Numer telefonu musi być wprowadzony w następującym formacie: '+999999999'. Dozwolone jest od 9 do 12 cyfr.")
    phone_number = models.CharField(validators=[phone_regex], max_length=13, blank=True)
    email = models.EmailField(null=True, blank=True)
    car_plate = models.CharField(max_length=10, null=True, blank=True)
