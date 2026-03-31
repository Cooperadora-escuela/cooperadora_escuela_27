from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Router para los ViewSets
router = DefaultRouter()
router.register(r'grados', views.GradoViewSet, basename='grado')
router.register(r'inscripciones', views.InscripcionViewSet, basename='inscripcion')
router.register(r'pagos', views.PagoViewSet, basename='pago')

# Tus rutas existentes
urlpatterns = [
    path('registro/', views.RegistroView.as_view(), name='registro'),
    path('login/', views.UsuarioLoginView.as_view(), name='login'),
    path('usuarios/', views.UsuarioListView.as_view(), name='usuario-list'),
    path('usuarios/<uuid:uuid>/', views.UsuarioDetailView.as_view(), name='usuario-detail'),
    path('mis-hijos/', views.MisHijosView.as_view(), name='mis-hijos'),
]

# Agregamos las rutas del router
urlpatterns += router.urls