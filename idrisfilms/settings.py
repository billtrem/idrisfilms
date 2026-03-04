"""
Django settings for idrisfilms project.
"""

import os
from pathlib import Path
import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent


# ------------------------------------------------------------
# Core
# ------------------------------------------------------------

SECRET_KEY = os.environ.get(
    "SECRET_KEY",
    "django-insecure-7ye77e1@c+d#y!ab@n1*_nk5*1^ic(1evc2&+3ktt%8*&u94^(",
)

DEBUG = os.environ.get("DEBUG", "True").lower() == "true"


# ------------------------------------------------------------
# Hosts / CSRF
# ------------------------------------------------------------

ALLOWED_HOSTS = [
    h.strip()
    for h in os.environ.get("ALLOWED_HOSTS", "localhost,127.0.0.1,testserver").split(",")
    if h.strip()
]

CSRF_TRUSTED_ORIGINS = [
    "https://idrisfilms.com",
    "https://www.idrisfilms.com",
    "https://idrisfilms-production.up.railway.app",
]


# ------------------------------------------------------------
# Applications
# ------------------------------------------------------------

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third-party apps
    "cloudinary",
    "cloudinary_storage",

    # Your apps
    "idrisfilms_site",
]


# ------------------------------------------------------------
# Middleware
# ------------------------------------------------------------

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",

    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


# ------------------------------------------------------------
# URLs / Templates
# ------------------------------------------------------------

ROOT_URLCONF = "idrisfilms.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],  # optional global templates folder
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "idrisfilms.wsgi.application"


# ------------------------------------------------------------
# Database
# ------------------------------------------------------------

DATABASES = {
    "default": dj_database_url.config(
        default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}",
        conn_max_age=600,
        ssl_require=False,
    )
}


# ------------------------------------------------------------
# Password validation
# ------------------------------------------------------------

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]


# ------------------------------------------------------------
# Internationalization
# ------------------------------------------------------------

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True


# ------------------------------------------------------------
# Static files (Django 5.2 correct way)
# ------------------------------------------------------------

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

# Django 5+ uses STORAGES instead of STATICFILES_STORAGE / DEFAULT_FILE_STORAGE
STORAGES = {
    "default": {
        "BACKEND": "cloudinary_storage.storage.MediaCloudinaryStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

# Optional: if you ever add a global /static folder at project root:
# STATICFILES_DIRS = [BASE_DIR / "static"]


# ------------------------------------------------------------
# Cloudinary (Media)
# ------------------------------------------------------------

CLOUDINARY_STORAGE = {
    "CLOUD_NAME": os.environ.get("CLOUDINARY_CLOUD_NAME", "dqmh99cik"),
    "API_KEY": os.environ.get("CLOUDINARY_API_KEY", "372448796231226"),
    "API_SECRET": os.environ.get("CLOUDINARY_API_SECRET", "Kd6IJGwqAEjSNTSEP6e3HFgl4yo"),
}

# ------------------------------------------------------------
# Cloudinary SDK config (required for CloudinaryField uploads)
# ------------------------------------------------------------
import cloudinary

cloudinary.config(
    cloud_name=CLOUDINARY_STORAGE["CLOUD_NAME"],
    api_key=CLOUDINARY_STORAGE["API_KEY"],
    api_secret=CLOUDINARY_STORAGE["API_SECRET"],
    secure=True,
)


# ------------------------------------------------------------
# Default primary key
# ------------------------------------------------------------

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"