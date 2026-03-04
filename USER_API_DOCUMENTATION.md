# User API Documentation

## Base URL
```
Production: https://infinite-crm-backend.vercel.app/api
Development: http://localhost:5000/api
```

## Authentication
All endpoints require Bearer token authentication.
```
Authorization: Bearer <your_jwt_token>
```

---

## 1. Get Users by Filter

Filter and retrieve users based on `optionalUserType`, `role`, and search criteria.

### Endpoint
```
GET /users/filter
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `optionalUserType` | string | No | Filter by user type: `manager`, `franchise`, or `null` (for users with no type) |
| `role` | string | No | Filter by role ID (MongoDB ObjectId) |
| `search` | string | No | Search across name, username, email, mobile |
| `page` | number | No | Page number (default: 1) |
| `limit` | number | No | Items per page (default: 100) |

### Example Requests

**Get all managers:**
```bash
curl -X GET "https://infinite-crm-backend.vercel.app/api/users/filter?optionalUserType=manager" \
  -H "Authorization: Bearer <token>"
```

**Get franchises with specific role:**
```bash
curl -X GET "https://infinite-crm-backend.vercel.app/api/users/filter?optionalUserType=franchise&role=507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer <token>"
```

**Get users with no optional type:**
```bash
curl -X GET "https://infinite-crm-backend.vercel.app/api/users/filter?optionalUserType=null" \
  -H "Authorization: Bearer <token>"
```

**Search with pagination:**
```bash
curl -X GET "https://infinite-crm-backend.vercel.app/api/users/filter?search=john&page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

### Success Response (200 OK)

```json
{
  "users": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "username": "johndoe",
      "email": "john@example.com",
      "mobile": "+1234567890",
      "joinDate": "2025-01-15T10:30:00.000Z",
      "optionalUserType": "manager",
      "assignedUser": [
        {
          "_id": "507f1f77bcf86cd799439012",
          "name": "Jane Smith",
          "username": "janesmith",
          "email": "jane@example.com",
          "mobile": "+1234567891"
        }
      ],
      "role": {
        "_id": "507f1f77bcf86cd799439013",
        "name": "Admin",
        "description": "Administrator role"
      },
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-20T14:45:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalUsers": 50,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| 401 | Unauthorized - Invalid or missing token |

---

## 2. Assign Users to a User

Assign multiple users to a user's `assignedUser` list. This replaces the existing assigned users.

### Endpoint
```
POST /users/:id/assign
```

### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | User ID to assign users to (MongoDB ObjectId) |

### Request Body

```json
{
  "userIds": ["userId1", "userId2", "userId3"]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userIds` | array | Yes | Array of user IDs (MongoDB ObjectIds) to assign |

### Example Request

```bash
curl -X POST "https://infinite-crm-backend.vercel.app/api/users/507f1f77bcf86cd799439011/assign" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userIds": ["507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013"]
  }'
```

### Success Response (200 OK)

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "mobile": "+1234567890",
  "joinDate": "2025-01-15T10:30:00.000Z",
  "optionalUserType": "manager",
  "assignedUser": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Jane Smith",
      "username": "janesmith",
      "email": "jane@example.com",
      "mobile": "+1234567891"
    },
    {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Bob Wilson",
      "username": "bobwilson",
      "email": "bob@example.com",
      "mobile": "+1234567892"
    }
  ],
  "role": {
    "_id": "507f1f77bcf86cd799439014",
    "name": "Admin",
    "description": "Administrator role"
  },
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-20T14:45:00.000Z"
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| 400 | Bad Request - `userIds` must be an array or one or more user IDs are invalid |
| 401 | Unauthorized - Invalid or missing token |
| 404 | Not Found - User not found |

---

## Frontend Integration Examples

### JavaScript/Axios

```javascript
import axios from 'axios';

const API_BASE = 'https://infinite-crm-backend.vercel.app/api';

// Get filtered users
const getFilteredUsers = async (token, filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.optionalUserType) params.append('optionalUserType', filters.optionalUserType);
  if (filters.role) params.append('role', filters.role);
  if (filters.search) params.append('search', filters.search);
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);

  const response = await axios.get(`${API_BASE}/users/filter?${params}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  return response.data;
};

// Assign users to a user
const assignUsersToUser = async (token, userId, userIds) => {
  const response = await axios.post(
    `${API_BASE}/users/${userId}/assign`,
    { userIds },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  
  return response.data;
};

// Usage examples
async function example() {
  const token = 'your_jwt_token';
  
  // Get all managers
  const managers = await getFilteredUsers(token, { optionalUserType: 'manager' });
  
  // Get franchises with pagination
  const franchises = await getFilteredUsers(token, { 
    optionalUserType: 'franchise',
    page: 1,
    limit: 10
  });
  
  // Assign users
  const result = await assignUsersToUser(token, 'userId123', ['user1', 'user2']);
}
```

### React Hook Example

```javascript
import { useState, useCallback } from 'react';
import axios from 'axios';

const API_BASE = 'https://infinite-crm-backend.vercel.app/api';

export const useUserFilter = (token) => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams(filters);
      const response = await axios.get(`${API_BASE}/users/filter?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [token]);

  return { users, pagination, loading, error, fetchUsers };
};

export const useAssignUsers = (token) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const assignUsers = useCallback(async (userId, userIds) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(
        `${API_BASE}/users/${userId}/assign`,
        { userIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to assign users');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  return { assignUsers, loading, error };
};
```

---

## Notes

1. **optionalUserType Values:**
   - `manager` - User is a manager
   - `franchise` - User is a franchise
   - `null` - User has no optional type (default for new users)

2. **assignedUser:** This is an array of users assigned to a particular user. When assigning, the entire array is replaced with the new list.

3. **Pagination:** Default limit is 100 users per page. Adjust `page` and `limit` as needed.

4. **Search:** Case-insensitive search across name, username, email, and mobile fields.
