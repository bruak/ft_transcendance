
---

# Auth Service API Documentation

- [Sign Up](#sign-up)
- [Sign In](#sign-in)
- [Two-Factor Authentication](#two-factor-authentication)
- [Sign Out](#sign-out)
- [Get All Users](#get-all-users)
- [Get Specific User](#get-specific-user)
- [Send Friend Request](#send-friend-request)
- [Get Friend Requests](#get-friend-requests)
- [Get Friends](#get-friends)
- [Accept Friend Request](#accept-friend-request)
- [Reject Friend Request](#reject-friend-request)

---

## <a name="sign-up"></a> 1. **Sign Up** - `POST /api/auth/signup/`

**Request Body**:  
FormData type, includes a file upload.

**Headers**:
- `Content-Type`: `multipart/form-data`
- `Accept`: `application/json`
- `Accept-Language`: `tr`

**Form Data Fields**:
- `first_name` (Text)
- `last_name` (Text)
- `username` (Text)
- `email` (Text)
- `password` (Text)
- `avatar` (File)

---

## <a name="sign-in"></a> 2. **Sign In** - `POST /api/auth/signin/`

**Request Body**:  
JSON format.

**Headers**:
- `Content-Type`: `application/json`
- `Accept`: `application/json`
- `Accept-Language`: `tr`

**Body Fields**:
- `sign` (Text)
- `password` (Text)

---

## <a name="two-factor-authentication"></a> 3. **Two-Factor Authentication** - `POST /api/auth/twofactor/`

**Request Body**:  
JSON format.

**Headers**:
- `Content-Type`: `application/json`
- `Accept`: `application/json`
- `Accept-Language`: `tr`

**Body Fields**:
- `username` (Text)
- `code` (Text)

---

## <a name="sign-out"></a> 4. **Sign Out** - `GET /api/auth/signout/`

**Headers**:
- `Content-Type`: `application/json`
- `Accept`: `application/json`
- `Accept-Language`: `tr`
- `Authorization`: `Bearer <token>`

---

## <a name="get-all-users"></a> 5. **Get All Users** - `GET /api/user/get/`

**Headers**:
- `Content-Type`: `application/json`
- `Accept`: `application/json`
- `Accept-Language`: `tr`
- `Authorization`: `Bearer <token>`

**Response**:  
Returns a list of all registered users.

---

## <a name="get-specific-user"></a> 6. **Get Specific User** - `GET /api/user/getuser/<username>/`

**Headers**:
- `Content-Type`: `application/json`
- `Accept`: `application/json`
- `Accept-Language`: `tr`
- `Authorization`: `Bearer <token>`

---

## <a name="send-friend-request"></a> 7. **Send Friend Request** - `POST /api/friend/send_friend_request/`

**Request Body**:  
JSON format.

**Headers**:
- `Content-Type`: `application/json`
- `Accept`: `application/json`
- `Accept-Language`: `tr`
- `Authorization`: `Bearer <token>`

**Body Fields**:
- `username` (Text)
- `friend` (Text)

---

## <a name="get-friend-requests"></a> 8. **Get Friend Requests** - `GET /api/friend/list_friend_requests/<username>/`

**Headers**:
- `Content-Type`: `application/json`
- `Accept`: `application/json`
- `Accept-Language`: `tr`
- `Authorization`: `Bearer <token>`

**Response**:  
Returns all friend requests sent to the user.

---

## <a name="get-friends"></a> 9. **Get Friends** - `GET /api/friend/friends/<username>/`

**Headers**:
- `Content-Type`: `application/json`
- `Accept`: `application/json`
- `Accept-Language`: `tr`
- `Authorization`: `Bearer <token>`

**Response**:  
Returns a list of the user's friends.

---

## <a name="accept-friend-request"></a> 10. **Accept Friend Request** - `POST /api/friend/accept_friend_request/`

**Request Body**:  
JSON format.

**Headers**:
- `Content-Type`: `application/json`
- `Accept`: `application/json`
- `Accept-Language`: `tr`
- `Authorization`: `Bearer <token>`

**Body Fields**:
- `username` (Text)
- `friendname` (Text)

---

## <a name="reject-friend-request"></a> 11. **Reject Friend Request** - `POST /api/friend/reject_friend_request/`

**Request Body**:  
JSON format.

**Headers**:
- `Content-Type`: `application/json`
- `Accept`: `application/json`
- `Accept-Language`: `tr`
- `Authorization`: `Bearer <token>`

**Body Fields**:
- `username` (Text)
- `friendname` (Text)

---
