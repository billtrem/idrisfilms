from django.urls import path
from . import views

app_name = "idrisfilms_site"

urlpatterns = [
    path("", views.home, name="home"),

    path("commissions/", views.commissions, name="commissions"),
    path("commissions/<slug:slug>/", views.commission_detail, name="commission_detail"),

    path("info/", views.info, name="info"),

    # kept live but no longer in main nav
    path("films/", views.films, name="films"),
    path("distribution/", views.distribution, name="distribution"),
    path("about/", views.about, name="about"),
    path("news/", views.news, name="news"),
    path("contact/", views.contact, name="contact"),
]