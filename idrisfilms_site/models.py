from django.db import models
from urllib.parse import urlparse, parse_qs
from cloudinary.models import CloudinaryField


class Page(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)

    parent = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        related_name="children",
        on_delete=models.CASCADE,
        help_text="Optional: set a parent to group pages (e.g. commissions as a directory).",
    )

    # Used for category cards on /commissions/
    summary = models.TextField(
        blank=True,
        help_text="Optional: short summary for link cards / intro copy.",
    )

    # ✅ NEW: uploadable card image (Cloudinary)
    card_image = CloudinaryField(
        "card_image",
        blank=True,
        null=True,
        help_text="Upload an image for the category card on /commissions/.",
    )

    # keep URL field for backwards compatibility (optional)
    card_image_url = models.URLField(
        blank=True,
        help_text="Optional: legacy/manual image URL (not needed if you upload card_image).",
    )

    sort_order = models.PositiveIntegerField(
        default=0,
        help_text="Ordering for category cards (lower numbers appear first).",
    )

    # Used ONLY for the Commissions parent page showreel
    showreel_embed_url = models.URLField(
        blank=True,
        help_text="Commissions landing showreel embed URL (e.g. https://www.youtube-nocookie.com/embed/VIDEO_ID).",
    )
    showreel_caption = models.CharField(
        max_length=200,
        blank=True,
        help_text="Optional caption under the commissions landing showreel.",
    )

    is_published = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["sort_order", "title"]

    def __str__(self):
        return self.title


class ContentBlock(models.Model):
    class BlockType(models.TextChoices):
        RICH_TEXT = "rich_text", "Rich text"
        IMAGE = "image", "Image"
        CTA = "cta", "Call to action"
        EMBED = "embed", "Embed (YouTube/Vimeo iframe)"

    page = models.ForeignKey(Page, related_name="blocks", on_delete=models.CASCADE)

    block_type = models.CharField(
        max_length=20,
        choices=BlockType.choices,
        default=BlockType.RICH_TEXT,
    )

    heading = models.CharField(max_length=200, blank=True)

    body = models.TextField(
        blank=True,
        help_text="Text or HTML depending on block type.",
    )

    # ✅ NEW: uploadable image for IMAGE blocks (Cloudinary)
    image = CloudinaryField(
        "block_image",
        blank=True,
        null=True,
        help_text="Upload an image for IMAGE blocks.",
    )

    # keep URL field for backwards compatibility (optional)
    image_url = models.URLField(
        blank=True,
        help_text="Optional legacy/manual URL (not needed if you upload image).",
    )

    button_text = models.CharField(max_length=80, blank=True)
    button_url = models.URLField(blank=True)

    sort_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["sort_order", "id"]

    def __str__(self):
        return f"{self.page.slug} • {self.block_type} • {self.heading or 'Untitled'}"


def _to_embed_url(url: str) -> str:
    if not url:
        return url

    try:
        parsed = urlparse(url)
        host = (parsed.netloc or "").lower()
        path = parsed.path or ""

        # YouTube
        if "youtube.com" in host or "youtube-nocookie.com" in host:
            if path.startswith("/embed/"):
                return url
            if path == "/watch":
                qs = parse_qs(parsed.query)
                vid = (qs.get("v") or [None])[0]
                if vid:
                    return f"https://www.youtube.com/embed/{vid}"
            if path.startswith("/shorts/"):
                vid = path.split("/shorts/")[-1].strip("/")
                if vid:
                    return f"https://www.youtube.com/embed/{vid}"

        if "youtu.be" in host:
            vid = path.strip("/")
            if vid:
                return f"https://www.youtube.com/embed/{vid}"

        # Vimeo
        if "vimeo.com" in host:
            if host.startswith("player.vimeo.com") and path.startswith("/video/"):
                return url
            vid = path.strip("/").split("/")[0]
            if vid.isdigit():
                return f"https://player.vimeo.com/video/{vid}"

    except Exception:
        return url

    return url


class CarouselSlide(models.Model):
    """
    Used for commissions DETAIL pages only (/commissions/<slug>/).

    Slides can be either:
    - a video embed (embed_url / embed_html), OR
    - an image (upload)
    """
    page = models.ForeignKey(Page, related_name="slides", on_delete=models.CASCADE)

    title = models.CharField(max_length=200)
    caption = models.TextField(blank=True)

    # Optional image slide
    image = CloudinaryField("image", blank=True, null=True)
    image_alt = models.CharField(
        max_length=200,
        blank=True,
        help_text="Alt text for the image (optional, but recommended).",
    )

    # Optional video slide
    embed_url = models.URLField(
        blank=True,
        help_text="Paste a normal YouTube/Vimeo link OR an embed URL. We'll convert YouTube/Vimeo links automatically.",
    )
    embed_html = models.TextField(
        blank=True,
        help_text="Optional: paste full iframe HTML instead of embed_url.",
    )

    sort_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["sort_order", "id"]

    def save(self, *args, **kwargs):
        # If using a video URL (and not raw HTML), normalize it to an embed URL
        if self.embed_url and not self.embed_html:
            self.embed_url = _to_embed_url(self.embed_url.strip())
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.page.slug} • {self.title}"