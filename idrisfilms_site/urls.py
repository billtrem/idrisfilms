from django.urls import path
from . import views

app_name = "idrisfilms_site"

urlpatterns = [
    path("", views.landing, name="landing"),
    path("home/", views.home, name="home"),
]