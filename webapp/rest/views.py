from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from . import models
from . import serializers

class Camera_typeViewSet(viewsets.ModelViewSet):
    queryset = models.Camera_type.objects.all()
    serializer_class = serializers.Camera_typeSerializer

class CameraViewSet(viewsets.ModelViewSet):
    queryset = models.Camera.objects.all()
    serializer_class = serializers.CameraSerializer

class Alert_historyViewSet(viewsets.ModelViewSet):
    queryset = models.Alert_history.objects.all().order_by('-created_at')
    serializer_class = serializers.Alert_historySerializer

class InfrastructureViewSet(viewsets.ModelViewSet):
    queryset = models.Infrastructure.objects.all()
    serializer_class = serializers.InfrastructureSerializer

class ZoneViewSet(viewsets.ModelViewSet):
    queryset = models.Zone.objects.all()
    serializer_class = serializers.ZoneSerializer

class ZoneListView(APIView):
    serializer_class = serializers.ZoneSerializer

    def post(self, request):
        serializer = serializers.ZoneSerializer(data=request.data, many=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = models.Employee.objects.all()
    serializer_class = serializers.EmployeeSerializer
