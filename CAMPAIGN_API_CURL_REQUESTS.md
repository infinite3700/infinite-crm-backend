# Campaign API - cURL Requests

Base URL: `http://localhost:3000/api/settings/campaigns`

**Note:** All requests require Bearer token authentication in the Authorization header.

---

## 1. Create Campaign

**Endpoint:** `POST /api/settings/campaigns`

**Note:** The `createdBy` field is automatically set to the currently logged-in user from the authentication token.

```bash
curl -X POST http://localhost:3000/api/settings/campaigns \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "campaignName": "Summer Sale 2025",
    "campaignDescription": "Annual summer sale campaign with 50% off on selected items",
    "campaignStartDate": "2025-06-01",
    "campaignEndDate": "2025-08-31",
    "status": "active"
  }'
```

**Response:** 201 Created
```json
{
  "_id": "campaign_id",
  "campaignName": "Summer Sale 2025",
  "campaignDescription": "Annual summer sale campaign with 50% off on selected items",
  "campaignStartDate": "2025-06-01T00:00:00.000Z",
  "campaignEndDate": "2025-08-31T00:00:00.000Z",
  "status": "active",
  "createdBy": {
    "_id": "user_id",
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com"
  },
  "createdAt": "2025-11-04T10:30:00.000Z",
  "updatedAt": "2025-11-04T10:30:00.000Z"
}
```

---

## 2. Get All Campaigns

**Endpoint:** `GET /api/settings/campaigns`

### Basic Request (Get all campaigns)

```bash
curl -X GET http://localhost:3000/api/settings/campaigns \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### With Filters

#### Filter by Campaign Name (partial match, case-insensitive)
```bash
curl -X GET "http://localhost:3000/api/settings/campaigns?campaignName=summer" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Filter by Status
```bash
curl -X GET "http://localhost:3000/api/settings/campaigns?status=active" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Filter by Created By (User ID)
```bash
curl -X GET "http://localhost:3000/api/settings/campaigns?createdBy=USER_ID_HERE" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Filter by Exact Campaign Start Date
```bash
curl -X GET "http://localhost:3000/api/settings/campaigns?campaignStartDate=2025-06-01" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Filter by Campaign Start Date Range
```bash
curl -X GET "http://localhost:3000/api/settings/campaigns?startDateFrom=2025-01-01&startDateTo=2025-12-31" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Filter by Campaign End Date Range
```bash
curl -X GET "http://localhost:3000/api/settings/campaigns?endDateFrom=2025-06-01&endDateTo=2025-12-31" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Multiple Filters Combined
```bash
curl -X GET "http://localhost:3000/api/settings/campaigns?status=active&campaignName=sale&startDateFrom=2025-01-01" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response:** 200 OK
```json
[
  {
    "_id": "campaign_id",
    "campaignName": "Summer Sale 2025",
    "campaignDescription": "Annual summer sale campaign",
    "campaignStartDate": "2025-06-01T00:00:00.000Z",
    "campaignEndDate": "2025-08-31T00:00:00.000Z",
    "status": "active",
    "createdBy": {
      "_id": "user_id",
      "name": "John Doe",
      "username": "johndoe",
      "email": "john@example.com"
    },
    "createdAt": "2025-11-04T10:30:00.000Z",
    "updatedAt": "2025-11-04T10:30:00.000Z"
  }
]
```

---

## 3. Get Campaign by ID

**Endpoint:** `GET /api/settings/campaigns/:id`

```bash
curl -X GET http://localhost:3000/api/settings/campaigns/CAMPAIGN_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response:** 200 OK
```json
{
  "_id": "campaign_id",
  "campaignName": "Summer Sale 2025",
  "campaignDescription": "Annual summer sale campaign",
  "campaignStartDate": "2025-06-01T00:00:00.000Z",
  "campaignEndDate": "2025-08-31T00:00:00.000Z",
  "status": "active",
  "createdBy": {
    "_id": "user_id",
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com"
  },
  "createdAt": "2025-11-04T10:30:00.000Z",
  "updatedAt": "2025-11-04T10:30:00.000Z"
}
```

---

## 4. Update Campaign

**Endpoint:** `PUT /api/settings/campaigns/:id`

```bash
curl -X PUT http://localhost:3000/api/settings/campaigns/CAMPAIGN_ID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "campaignName": "Updated Summer Sale 2025",
    "campaignDescription": "Extended summer sale campaign with 60% off",
    "campaignStartDate": "2025-06-01",
    "campaignEndDate": "2025-09-15",
    "status": "active"
  }'
```

**Note:** You can update individual fields. All fields are optional in the update request.

### Update Only Status
```bash
curl -X PUT http://localhost:3000/api/settings/campaigns/CAMPAIGN_ID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "status": "inactive"
  }'
```

**Response:** 200 OK
```json
{
  "_id": "campaign_id",
  "campaignName": "Updated Summer Sale 2025",
  "campaignDescription": "Extended summer sale campaign with 60% off",
  "campaignStartDate": "2025-06-01T00:00:00.000Z",
  "campaignEndDate": "2025-09-15T00:00:00.000Z",
  "status": "active",
  "createdBy": {
    "_id": "user_id",
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com"
  },
  "createdAt": "2025-11-04T10:30:00.000Z",
  "updatedAt": "2025-11-04T11:45:00.000Z"
}
```

---

## 5. Soft Delete Campaign

**Endpoint:** `DELETE /api/settings/campaigns/:id`

This sets the campaign status to 'deleted' but keeps it in the database.

```bash
curl -X DELETE http://localhost:3000/api/settings/campaigns/CAMPAIGN_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response:** 200 OK
```json
{
  "message": "Campaign deleted successfully",
  "campaign": {
    "_id": "campaign_id",
    "campaignName": "Summer Sale 2025",
    "campaignDescription": "Annual summer sale campaign",
    "campaignStartDate": "2025-06-01T00:00:00.000Z",
    "campaignEndDate": "2025-08-31T00:00:00.000Z",
    "status": "deleted",
    "createdBy": "user_id",
    "createdAt": "2025-11-04T10:30:00.000Z",
    "updatedAt": "2025-11-04T12:00:00.000Z"
  }
}
```

---

## 6. Hard Delete Campaign

**Endpoint:** `DELETE /api/settings/campaigns/:id/hard`

This permanently removes the campaign from the database.

```bash
curl -X DELETE http://localhost:3000/api/settings/campaigns/CAMPAIGN_ID_HERE/hard \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response:** 200 OK
```json
{
  "message": "Campaign permanently deleted",
  "campaign": {
    "_id": "campaign_id",
    "campaignName": "Summer Sale 2025",
    "campaignDescription": "Annual summer sale campaign",
    "campaignStartDate": "2025-06-01T00:00:00.000Z",
    "campaignEndDate": "2025-08-31T00:00:00.000Z",
    "status": "active",
    "createdBy": "user_id",
    "createdAt": "2025-11-04T10:30:00.000Z",
    "updatedAt": "2025-11-04T10:30:00.000Z"
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Campaign name, description, start date, end date, and createdBy are required"
}
```

```json
{
  "error": "Campaign end date must be after start date"
}
```

### 401 Unauthorized
```json
{
  "error": "Not authorized, no token"
}
```

```json
{
  "error": "Not authorized, token failed"
}
```

### 404 Not Found
```json
{
  "error": "Campaign not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Error message details"
}
```

---

## How to Get Bearer Token

First, you need to login to get the token:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'
```

The response will include a token that you can use in the Authorization header:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

Use this token in all campaign API requests as: `Authorization: Bearer YOUR_TOKEN_HERE`

---

## Postman Collection Variables

For easier testing in Postman, you can set these variables:

- `baseUrl`: `http://localhost:3000`
- `token`: `YOUR_JWT_TOKEN`
- `userId`: `YOUR_USER_ID`
- `campaignId`: `CAMPAIGN_ID_FROM_CREATE_RESPONSE`

Then use them in requests like:
- URL: `{{baseUrl}}/api/settings/campaigns`
- Header: `Authorization: Bearer {{token}}`
- Body: `"createdBy": "{{userId}}"`
