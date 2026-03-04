from django.urls import path
from . import views

app_name = "idrisfilms_site"

urlpatterns = [
    path("", views.home, name="home"),
    path("films/", views.films, name="films"),

    path("commissions/", views.commissions, name="commissions"),
    path("commissions/<slug:slug>/", views.commission_detail, name="commission_detail"),

    path("distribution/", views.distribution, name="distribution"),
    path("about/", views.about, name="about"),
    path("news/", views.news, name="news"),
    path("contact/", views.contact, name="contact"),
]