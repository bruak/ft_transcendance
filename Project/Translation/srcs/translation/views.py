from django.shortcuts import render
from django.utils.translation import activate, gettext as _
from django.http import JsonResponse

def translation_auth(request):
    user_language = request.headers.get("Accept-Language", "tr") # Default language is Turkish, bu amcik calismadi buraya gelmeden once handle ettim
    activate(user_language)
    try:
        messages = {
            "User Password Error": _("User Password Error"),
            "Mail Could Not Be Sent": _("Mail Could Not Be Sent"),
            "Successful": _("Successful"),
            "Not Found User": _("Not Found User"),
            "Only POST requests are allowed.": _("Only POST requests are allowed."),
        }
        return JsonResponse(messages, status=200)
    except Exception as e:
        return JsonResponse({"error": "Internal Server Error"}, status=500)