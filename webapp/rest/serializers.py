from rest_framework import serializers
from rest.models import Camera
from rest.models import Camera_type
from rest.models import Alert_history
from rest.models import Infrastructure
from rest.models import ZonePolygon
from rest.models import Zone
from rest.models import Employee

from django.db.models import F

class CF(F):
    ADD = '||'

class Camera_typeSerializer(serializers.ModelSerializer):

        class Meta:
            model = Camera_type
            fields = '__all__'

class Alert_historySerializer(serializers.ModelSerializer):

        class Meta:
            model = Alert_history
            fields = '__all__'


class InfrastructureSerializer(serializers.ModelSerializer):

    class Meta:
        model = Infrastructure
        fields = (
            'id',
            'value'
        )

class PolygonSerializer(serializers.ModelSerializer):

    class Meta:
        model = ZonePolygon
        fields = ('x', 'y')

class ZoneListSerializer(serializers.ListSerializer):
    def run_validation(self, data):
        print(data)
        return data

    def create(self, validated_data):
        cameras = [id['camera'] for id in validated_data]
        zones_del = Zone.objects.filter(origin_camera_id__in=cameras)
        update_data = []
        create_data = []
        polygons = []
        for attrs in validated_data:
            if 'id' in attrs and Zone.objects.filter(id=attrs['id']):
                zones_del = zones_del.exclude(id=attrs['id'])
                update_data.append(attrs)
            else:
                create_data.append(attrs)
        zones_del.delete()

        Zone.objects.all().filter(origin_camera_id__in=cameras).update(name='old__' + CF('name'))
        for data in update_data:
            Zone.objects.filter(id=data['id']).update(name=data['name'], origin_camera_id=data['camera'])
            zone = Zone.objects.get(id=data['id'])
            zone.polygons.all().delete()
            polygons += [ZonePolygon(zone=zone, x=pol['x'], y=pol['y']) for pol in data['polygons']]

        for data in create_data:
            zone = Zone.objects.create(name=data['name'], origin_camera_id=data['camera'])
            polygons += [ZonePolygon(zone=zone, x=pol['x'], y=pol['y']) for pol in data['polygons']]

        ZonePolygon.objects.bulk_create(polygons)
        return Zone.objects.all()

class ZoneSerializer(serializers.ModelSerializer):
    polygons = PolygonSerializer(many=True, read_only=False)
    camera = serializers.PrimaryKeyRelatedField(source='origin_camera', many=False, queryset=Camera.objects.all())

    class Meta:
        list_serializer_class = ZoneListSerializer
        model = Zone
        fields = ('id', 'name', 'camera', 'polygons')

    def create(self, validated_data):
        polygons_pop = validated_data.pop('polygons')
        print(validated_data)
        instance = Zone.objects.create(**validated_data)

        polygons = [ZonePolygon(zone=instance, x=pol['x'], y=pol['y']) for pol in polygons_pop]
        instance.polygons.bulk_create(polygons)

        return instance

    def update(self, instance, validated_data):
        setattr(instance, 'name', validated_data['name'])
        setattr(instance, 'origin_camera', validated_data['origin_camera'])
        instance.save()

        polygons_pop = validated_data.pop('polygons')
        polygons = [ZonePolygon(zone=instance, x=pol['x'], y=pol['y']) for pol in polygons_pop]
        instance.polygons.all().delete()
        instance.polygons.bulk_create(polygons)

        return instance


class CameraTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = Camera_type
        fields = ('id', 'camera_model')

class CameraSerializer(serializers.ModelSerializer):
    camera_zones = ZoneSerializer(many=True, read_only=True)
    camera_type = CameraTypeSerializer(many=False, read_only=False)
    formatted_url = serializers.SerializerMethodField()

    class Meta:
        model = Camera
        fields = ('id', 'name', 'ip', 'login', 'password',
                  'camera_type', 'camera_zones', 'formatted_url')

    def get_formatted_url(self, obj):
        if obj.login is not None and obj.password is not None:
            return obj.camera_type.custom_camera_url.format(admin=obj.login, password=obj.password, ip=obj.ip)
        else:
            data = obj.camera_type.custom_camera_url.replace("{admin}:{password}@", "")
            return data.format(ip=obj.ip)

    def create(self, validated_data):

        camera_type_data = validated_data.pop('camera_type', None)
        if camera_type_data:
            camera_type = Camera_type.objects.get_or_create(**camera_type_data)[0]
            validated_data['camera_type'] = camera_type
        return Camera.objects.create(**validated_data)

    def update(self, instance, validated_data):

        camera_type_data = validated_data.pop('camera_type', None)
        if camera_type_data:
            camera_type = Camera_type.objects.get_or_create(**camera_type_data)[0]
            validated_data['camera_type'] = camera_type

        setattr(instance, 'camera_type', camera_type)
        instance.save()

        return instance


class EmployeeSerializer(serializers.ModelSerializer):

        class Meta:
            model = Employee
            fields = '__all__'
