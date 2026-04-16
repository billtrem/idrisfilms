from django.shortcuts import render, get_object_or_404
from .models import Page


def home(request):
    commissions_page = Page.objects.filter(slug="commissions", is_published=True).first()
    commission_tiles = (
        Page.objects.filter(parent=commissions_page, is_published=True)
        .order_by("sort_order", "title")[:3]
        if commissions_page
        else Page.objects.none()
    )

    films_page = Page.objects.filter(slug="films", is_published=True).first()

    return render(
        request,
        "idrisfilms_site/home.html",
        {
            "active_page": "home",
            "commission_tiles": commission_tiles,
            "films_page": films_page,
        },
    )


def films(request):
    films_page = Page.objects.filter(slug="films", is_published=True).first()

    slides = (
        films_page.slides.filter(is_active=True).order_by("sort_order", "id")
        if films_page
        else Page.objects.none()
    )

    blocks = (
        films_page.blocks.filter(is_active=True).order_by("sort_order", "id")
        if films_page
        else Page.objects.none()
    )

    return render(
        request,
        "idrisfilms_site/films.html",
        {
            "active_page": "films",
            "page": films_page,
            "slides": slides,
            "blocks": blocks,
        },
    )


def info(request):
    page = Page.objects.filter(slug="about", is_published=True).first()

    slides = (
        page.slides.filter(is_active=True).order_by("sort_order", "id")
        if page
        else Page.objects.none()
    )

    return render(
        request,
        "idrisfilms_site/info.html",
        {
            "active_page": "info",
            "page": page,
            "slides": slides,
        },
    )


def distribution(request):
    page = Page.objects.filter(slug="distribution", is_published=True).first()

    slides = (
        page.slides.filter(is_active=True).order_by("sort_order", "id")
        if page
        else Page.objects.none()
    )

    blocks = (
        page.blocks.filter(is_active=True).order_by("sort_order", "id")
        if page
        else Page.objects.none()
    )

    return render(
        request,
        "idrisfilms_site/distribution.html",
        {
            "active_page": "distribution",
            "page": page,
            "slides": slides,
            "blocks": blocks,
        },
    )


def about(request):
    page = Page.objects.filter(slug="about", is_published=True).first()

    slides = (
        page.slides.filter(is_active=True).order_by("sort_order", "id")
        if page
        else Page.objects.none()
    )

    return render(
        request,
        "idrisfilms_site/about.html",
        {
            "active_page": "about",
            "page": page,
            "slides": slides,
        },
    )


def news(request):
    return render(
        request,
        "idrisfilms_site/news.html",
        {
            "active_page": "news",
        },
    )


def contact(request):
    return render(
        request,
        "idrisfilms_site/contact.html",
        {
            "active_page": "contact",
        },
    )


def commissions(request):
    commissions_page = Page.objects.filter(slug="commissions", is_published=True).first()

    service_pages = (
        Page.objects.filter(parent=commissions_page, is_published=True)
        .order_by("sort_order", "title")
        if commissions_page
        else Page.objects.none()
    )

    showreel_url = commissions_page.showreel_embed_url if commissions_page else ""
    showreel_caption = commissions_page.showreel_caption if commissions_page else ""

    return render(
        request,
        "idrisfilms_site/commissions.html",
        {
            "active_page": "commissions",
            "page": commissions_page,
            "service_pages": service_pages,
            "showreel_url": showreel_url,
            "showreel_caption": showreel_caption,
        },
    )


def commission_detail(request, slug):
    commissions_root = get_object_or_404(Page, slug="commissions", is_published=True)

    page = get_object_or_404(
        Page,
        slug=slug,
        parent=commissions_root,
        is_published=True,
    )

    blocks = page.blocks.filter(is_active=True).order_by("sort_order", "id")
    slides = page.slides.filter(is_active=True).order_by("sort_order", "id")

    return render(
        request,
        "idrisfilms_site/commission_detail.html",
        {
            "active_page": "commissions",
            "page": page,
            "blocks": blocks,
            "slides": slides,
            "commissions_root": commissions_root,
        },
    )