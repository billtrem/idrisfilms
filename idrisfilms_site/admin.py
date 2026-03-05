from django.contrib import admin
from .models import Page, ContentBlock, CarouselSlide


class ContentBlockInline(admin.TabularInline):
    model = ContentBlock
    extra = 1
    fields = (
        "sort_order",
        "is_active",
        "block_type",
        "heading",
        "body",
        "image",       # ✅ upload
        "image_url",   # optional legacy
        "button_text",
        "button_url",
    )
    ordering = ("sort_order",)


class CarouselSlideInline(admin.TabularInline):
    model = CarouselSlide
    extra = 1
    fields = (
        "sort_order",
        "is_active",
        "title",
        "caption",
        "image",       # ✅ new
        "image_alt",   # ✅ new
        "embed_url",
        "embed_html",
    )
    ordering = ("sort_order",)


@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    list_display = ("sort_order", "title", "slug", "parent", "is_published", "updated_at")
    list_filter = ("is_published", "parent")
    search_fields = ("title", "slug", "summary")
    prepopulated_fields = {"slug": ("title",)}
    fieldsets = (
        (None, {"fields": ("title", "slug", "parent", "is_published")}),
        ("Cards / Listing", {"fields": ("sort_order", "summary", "card_image", "card_image_url")}),
        ("Commissions Landing Showreel", {"fields": ("showreel_embed_url", "showreel_caption")}),
    )
    inlines = [ContentBlockInline, CarouselSlideInline]