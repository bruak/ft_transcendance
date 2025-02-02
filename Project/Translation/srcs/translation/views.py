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
            "There is a problem in user service": _("There is a problem in user service"),
            "User signup Error": _("User signup Error"),
            "User authentication not done": _("User authentication not done"),
            "Invalid code": _("Invalid code"),
            "Two factor authentication code not found": _("Two factor authentication code not found"),
            "Mail token has expired check your mail for new authentication token link": _("Mail token has expired check your mail for new authentication token link"),
            "authontication successful": _("authontication successful"),
            "Token not found": _("Token not found"),
            "You cannot send a request to your own account.": _("You cannot send a request to your own account."),
            "User successfully signout.": _("User successfully signout."),
            "There was a problem logging the user sigoout.": _("There was a problem logging the user sigoout."),
            "invalid validate token": _("invalid validate token"),
            "Invalid Token Error when trying to signout": _("Invalid Token Error when trying to signout"),
            "Invalid Token Error when trying to validate token": _("Invalid Token Error when trying to validate token"),
            "User not found": _("User not found"),
            "Token has expired. New token has been sent to your email.": _("Token has expired. New token has been sent to your email."),
            "invalid verification token": _("invalid verification token"),
            "Authorization code not found in intra callback": _("Authorization code not found in intra callback"),
            "Unable to fetch access token": _("Unable to fetch access token"),
            "Intra access token not faund": _("Intra access token not faund"),
            "Unable to fetch user data": _("Unable to fetch user data"),
            "this username already exist": _("this username already exist"),
            "this email already exist": _("this email already exist"),
        }
        return JsonResponse(messages, status=200)
    except Exception as e:
        return JsonResponse({"error": "Internal Server Error"}, status=500)
    
def translation_friend(request):
    user_language = request.headers.get("Accept-Language", "tr") # Default language is Turkish, bu amcik calismadi buraya gelmeden once handle ettim
    activate(user_language)
    try:
        messages = {
            "Friend request already exists or you are already friends.": _("Friend request already exists or you are already friends."),
            "Friend request sent successfully.": _("Friend request sent successfully."),
            "No pending friend requests found.": _("No pending friend requests found."),
            "Friend request not found.": _("Friend request not found."),
            "Friend request accepted.": _("Friend request accepted."),
            "No friends found.": _("No friends found."),
        }
        return JsonResponse(messages, status=200)
    except Exception as e:
        return JsonResponse({"error": "Internal Server Error"}, status=500)