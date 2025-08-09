# Admin Architecture & Security Model

## 🏗️ **Architecture Overview**

This project uses a **single monolithic Next.js application** with enhanced security and role-based access control for admin functionality. This approach provides the best balance of security, maintainability, and cost-effectiveness.

## 🔐 **Security Model**

### **Multi-Layer Protection**

1. **Middleware Protection** (`middleware.ts`)
   - Edge-level route protection
   - Prevents unauthorized access to admin routes
   - Automatic redirects for unauthenticated users

2. **Layout-Level Authentication** (`app/admin/layout.tsx`)
   - Server-side authentication checks
   - Role-based access control
   - Admin user validation

3. **API Route Protection** (`lib/admin-auth.ts`)
   - Permission-based access control
   - Granular permissions system
   - Admin user management

### **Role-Based Access Control**

```typescript
interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'moderator' | 'viewer';
  permissions: string[];
}
```

**Roles:**
- **Admin**: Full access to all features
- **Moderator**: Can moderate reviews, limited access
- **Viewer**: Read-only access (future implementation)

**Permissions:**
- `read`: View admin data
- `write`: Create/update content
- `delete`: Remove content
- `moderate`: Approve/reject reviews

## 📁 **File Structure**

```
app/
├── admin/                    # Admin routes
│   ├── layout.tsx           # Admin layout with auth
│   ├── page.tsx             # Admin dashboard
│   └── reviews/             # Review moderation
│       └── page.tsx
├── account/                 # Customer account routes
│   ├── layout.tsx           # Customer layout
│   ├── page.tsx             # Customer dashboard
│   └── ...                  # Other customer pages
└── api/                     # API routes
    ├── reviews/             # Review management APIs
    └── account/             # Account management APIs

lib/
├── admin-auth.ts            # Admin authentication system
├── auth.ts                  # Customer authentication
└── security.ts              # Security utilities

middleware.ts                # Route protection
```

## 🚀 **Key Features**

### **1. Unified Authentication**
- Single sign-on for both customer and admin
- Shared session management
- Consistent user experience

### **2. Role-Based Access**
- Admin users have elevated permissions
- Moderators can manage reviews
- Granular permission system

### **3. Secure Admin Routes**
- All admin routes protected by middleware
- Server-side authentication checks
- Automatic redirects for unauthorized access

### **4. Shared Components**
- Reusable UI components
- Consistent design system
- Reduced code duplication

## 🔧 **Configuration**

### **Admin Users Setup**

Edit `lib/admin-auth.ts` to add admin users:

```typescript
const adminEmails = [
  'admin@yourstore.com',
  'jschibelli@gmail.com', // Your email
  // Add more admin emails
];
```

### **Environment Variables**

```bash
# Required for admin functionality
SHOPIFY_ADMIN_ACCESS_TOKEN=your_admin_token
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
```

## 🛡️ **Security Best Practices**

### **1. Route Protection**
- Middleware protects all admin routes
- Server-side authentication checks
- Automatic session validation

### **2. Permission System**
- Granular permissions for different actions
- Role-based access control
- Permission validation on API routes

### **3. Session Management**
- Secure cookie-based sessions
- Automatic session cleanup
- Cross-device session tracking

### **4. API Security**
- All admin APIs require authentication
- Permission checks on sensitive operations
- Input validation and sanitization

## 📊 **Admin Features**

### **Current Implementation**
- ✅ Review moderation dashboard
- ✅ Admin authentication system
- ✅ Role-based access control
- ✅ Secure admin layout
- ✅ Middleware protection

### **Planned Features**
- 🔄 Product management
- 🔄 Customer management
- 🔄 Analytics dashboard
- 🔄 Order management
- 🔄 Content management

## 🚀 **Deployment Strategy**

### **Single Application Benefits**
- ✅ **Simpler deployment** - One codebase, one deployment
- ✅ **Cost-effective** - Single hosting, single domain
- ✅ **Shared resources** - Components, utilities, types
- ✅ **Unified authentication** - Single auth system
- ✅ **Easier maintenance** - One codebase to manage

### **Security Considerations**
- ✅ **Route-level protection** - Middleware prevents unauthorized access
- ✅ **Component-level security** - Admin components only load for authorized users
- ✅ **API-level protection** - All admin APIs require proper authentication
- ✅ **Session management** - Secure session handling

## 🔄 **Migration Path**

If you later decide to separate the admin into its own application:

1. **Extract Admin Components**
   - Move admin components to separate project
   - Create shared component library
   - Maintain API compatibility

2. **Shared Authentication**
   - Use JWT tokens for cross-app authentication
   - Implement shared session management
   - Maintain role-based access control

3. **API Gateway**
   - Create API gateway for shared endpoints
   - Implement proper CORS handling
   - Maintain security standards

## 📈 **Scaling Considerations**

### **Current Architecture Scales Well**
- ✅ **Code splitting** - Admin components only load when needed
- ✅ **Lazy loading** - Admin routes load on demand
- ✅ **Shared resources** - Efficient resource utilization
- ✅ **Single deployment** - Simplified CI/CD pipeline

### **When to Consider Separation**
- **High admin traffic** - Separate admin from customer traffic
- **Different tech stacks** - Admin needs different framework
- **Team separation** - Different teams manage admin vs customer
- **Security requirements** - Need complete isolation

## 🎯 **Recommendation**

**Stick with the current single-project approach** because:

1. **Your current setup is excellent** - Well-organized, secure, and maintainable
2. **Cost-effective** - Single deployment and hosting
3. **Simpler development** - One codebase to manage
4. **Shared resources** - Components and utilities can be reused
5. **Security is adequate** - Multi-layer protection with middleware and role-based access

The current architecture provides enterprise-level security while maintaining simplicity and cost-effectiveness. 