from django.conf.urls import url, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'camera-type', views.Camera_typeViewSet)
router.register(r'camera', views.CameraViewSet)
router.register(r'alert-history', views.Alert_historyViewSet)
router.register(r'infrastructure', views.InfrastructureViewSet)
router.register(r'zone', views.ZoneViewSet)
router.register(r'employee', views.EmployeeViewSet)
router.register(r'arm-task', views.ArmTaskViewSet)
router.register(r'arm-output', views.ArmOutputViewSet)
router.register(r'action', views.ActionViewSet)
router.register(r'alert', views.AlertViewSet)
router.register(r'aggregator', views.AggregatorViewSet)
router.register(r'data', views.DataViewSet)
router.register(r'parking-config', views.ParkingConfigViewSet)
router.register(r'parking-history', views.ParkingHistoryViewSet)

urlpatterns = [
    url(r'^api/', include(router.urls)),
    url(r'^api/zone-list', views.ZoneListView.as_view())
]
