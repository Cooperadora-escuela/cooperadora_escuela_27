from django.urls import path
from . import views

urlpatterns = [
    path('registro/', views.RegistroView.as_view(), name='registro'),
    path('login/', views.UsuarioLoginView.as_view(), name='login'),
    path('usuarios/', views.UsuarioListView.as_view(), name='usuario-list'),
    path('usuarios/<uuid:uuid>/', views.UsuarioDetailView.as_view(), name='usuario-detail'),
]