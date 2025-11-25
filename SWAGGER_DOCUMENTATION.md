# Swagger API Documentation

## Access Swagger UI

Once your server is running, you can access the Swagger API documentation at:

### **Local Development:**
```
http://localhost:3000/api-docs
```

### **Production:**
```
https://your-production-domain.com/api-docs
```

## Features

- 📖 **Interactive API Documentation**: Test all endpoints directly from the browser
- 🔐 **Authentication Support**: Add your Bearer token and test authenticated endpoints
- 📝 **Request/Response Examples**: See example payloads and responses
- 🏷️ **Organized by Tags**: Endpoints grouped by functionality (Auth, Users, Tasks, Campaigns, etc.)
- ✅ **Schema Validation**: View all data models and their properties

## How to Use

1. **Start your server:**
   ```bash
   npm run dev
   ```

2. **Open Swagger UI in your browser:**
   ```
   http://localhost:3000/api-docs
   ```

3. **Authenticate (for protected endpoints):**
   - First, use the `/auth/login` endpoint to get your JWT token
   - Click the "Authorize" button (🔓) at the top right
   - Enter: `Bearer YOUR_TOKEN_HERE`
   - Click "Authorize"
   - Now you can test all authenticated endpoints

4. **Test Endpoints:**
   - Click on any endpoint to expand it
   - Click "Try it out"
   - Fill in the required parameters
   - Click "Execute"
   - View the response

## Available API Sections

- **Authentication** - Register and login
- **Users** - User management
- **Tasks** - Task CRUD operations
- **Campaigns** - Campaign management
- **Products** - Product and category management
- **Permissions** - Permission management
- **Roles** - Role management
- **States** - State/district/city management
- **Lead Stages** - Lead stage management

## Swagger File Location

The OpenAPI specification file is located at:
```
./swagger.yaml
```

You can also:
- Import this file into Postman
- Use it to generate API clients
- Share it with frontend developers
- Use it with other API tools

## Notes

- The Swagger UI is available in both development and production environments
- All endpoints require proper authentication (except auth endpoints)
- Make sure your server is running before accessing the documentation
