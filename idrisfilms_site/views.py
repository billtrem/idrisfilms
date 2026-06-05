from django.shortcuts import render
from .models import Page


def landing(request):
    page = Page.objects.filter(slug="landing", is_published=True).first()

    return render(
        request,
        "idrisfilms_site/landing.html",
        {
            "active_page": "landing",
            "page": page,
        },
    )


def home(request):
    return render(
        request,
        "idrisfilms_site/base.html",
        {
            "active_page": "home",
        },
    )