from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator, RegexValidator
from django.contrib.postgres.fields import JSONField
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

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
    phone_regex = RegexValidator(regex=r'^\+?1?\d{9,12}$', message="Phone number must follow the pattern: '+[0-9]{9-12}'.")
    phone_number = models.CharField(validators=[phone_regex], max_length=13, blank=True)
    email = models.EmailField(null=True, blank=True)
    car_plate = models.CharField(max_length=10, null=True, blank=True)


class ARMTask(models.Model):

    id = models.AutoField(primary_key=True, null=False, unique=True)
    description = models.CharField(max_length=20, null=True)
    arm_task = models.CharField(max_length=20)

    def __str__(self):
        if self.description: return self.description
        else : return str(self.arm_task)


class ARMOutput(models.Model):

    id = models.AutoField(primary_key=True, null=False, unique=True)
    description = models.CharField(max_length=20, null=True)
    arm_id = models.CharField(unique=True, max_length=20)

    def __str__(self):
        if self.description: return self.description
        else : return str(self.arm_id)


class Action(models.Model):

    id = models.AutoField(primary_key=True, null=False, unique=True)

    name = models.CharField(max_length=20)
    arm_output = models.ForeignKey('ARMOutput', related_name='output', on_delete=models.PROTECT, null=True)
    arm_task = models.ForeignKey('ARMTask', related_name='task', on_delete=models.PROTECT, null=True)
    period = models.IntegerField(null=True, blank=True)
    unit = models.CharField(max_length=20, null=True, blank=True, default='ms')
    reverseID = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE)
    message = models.CharField(max_length=50, null=True, blank=True, default='Empty message')

    def __str__(self):
        return self.name


class Alert(models.Model):

    id = models.AutoField(primary_key=True, null=False, unique=True)
    name = models.CharField(max_length=20)
    action = models.ManyToManyField('Action')
    trigger = models.PositiveSmallIntegerField(validators=[MinValueValidator(0), MaxValueValidator(7)])

    class Meta:
        db_constraints = {
            'trigger_range': 'check (trigger >=0 AND trigger <=7 )',
        }

    def __str__(self):
        return self.name

class CVAggregator(models.Model):

    id = models.AutoField(primary_key=True, null=False, unique=True)

    parent_zone = models.ManyToManyField('Zone', related_name='zone_aggregators')
    SUPPORTED_AGGREGATORS = (
      ('0', 'Silhouette'),
      ('1', 'Body parts'),
      ('2', 'Car plates'),
      ('3', 'Helmet'),
      ('4', 'Vest'),
      ('5', 'Forklifts'),
      ('6', 'Face'),
      ('7', 'Gesture')
    )
    aggregator = models.CharField(max_length=1, choices=SUPPORTED_AGGREGATORS, null=False)

    def __str__(self):
        return self.aggregator


class CVData(models.Model):

    id = models.AutoField(primary_key=True, null=False, unique=True)

    zone = models.ForeignKey('Zone', on_delete=models.CASCADE)
    aggregator = models.ForeignKey('CVAggregator', related_name='CVAggregator', on_delete=models.CASCADE)
    value = JSONField()

    def __str__(self):
        return 'data no. ' + str(self.id)

    class Meta:
        unique_together = (("zone", "aggregator"))

@receiver(post_save, sender=CVData)
def CVData_added(sender, instance, created, **kwargs):
    if instance.aggregator.aggregator == '2':
        try:
            parking_in = ParkingConfig.objects.filter(arrival_zone=instance.zone)
            parking_out = ParkingConfig.objects.filter(departure_zone=instance.zone)
            if not (parking_in or parking_out):
                logger.critical("Zone identified by id: %s is not assigned to any parking" % instance.zone.id)
                return
        except ValueError:
            logger.critical("Improper format of CVData_added")
            return

        plates = instance.value
        try:
            for plate in plates:
                if len(plate) > 3 and len(plate) <= 10:
                    for pin in parking_in:
                        Parking.objects.update_or_create(plate=plate, parking_id=pin)
                else:
                    logger.debug("Improper format of car plate")
        except Exception as e:
            logger.critical("Unknown error: %s" % e)
        try:
            Parking.objects.filter(plate__in=plates, parking__in=parking_out).delete()
        except Exception as e:
            logger.critical("Unknown error: %s" % e)

class ParkingConfig(models.Model):

    id = models.AutoField(primary_key=True, null=False, unique=True)
    name = models.CharField(max_length=50, null=True, blank=True)
    arrival_zone = models.ForeignKey('Zone', related_name='arrival_zone', on_delete=models.CASCADE, null=True)
    departure_zone = models.ForeignKey('Zone', related_name='departure_zone', on_delete=models.CASCADE, null=True)

    def __str__(self):
        return self.name


class ParkingHistory(models.Model):
    id = models.AutoField(primary_key=True, null=False, unique=True)
    plate = models.CharField(max_length=10, null=True, blank=True)
    arrival_time = models.DateTimeField(auto_now_add=True)
    departure_time = models.DateTimeField(null=True)
    parking_id = models.ForeignKey('ParkingConfig', on_delete=models.CASCADE, null=False)

    def __str__(self):
        return self.plate
