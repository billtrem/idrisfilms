from django.shortcuts import render

def index(request):
    return render(request, "idrisfilms_site/index.html")
