# Service Spot

**A Localized Service Discovery and Booking Platform**

Full-stack web application connecting customers with local service providers for seamless service booking and management.

---

## 📋 Overview

Service Spot is a comprehensive platform that enables customers to discover, book, and review local services while providing service providers with tools to manage their offerings, availability, and bookings.

---

## ✨ Features

### For Customers
- Browse and search local services by category and location
- View detailed service information with pricing and provider profiles
- Book services with real-time availability checking
- Manage bookings and view booking history
- Leave reviews and ratings for completed services
- Secure payment processing

### For Service Providers
- Create and manage service listings
- Set availability schedules and pricing
- Manage incoming booking requests (accept/reject)
- View and respond to customer reviews
- Dashboard with analytics and insights
- Profile management

### For Administrators
- User management (customers and providers)
- Service category management
- Platform oversight and moderation
- Analytics and reporting
- System configuration

---

## 🛠️ Technology Stack

### Backend
- **Framework**: Spring Boot 4.0
- **Language**: Java 21
- **Database**: MySQL 8
- **Security**: Spring Security + JWT Authentication
- **ORM**: Spring Data JPA (Hibernate)
- **Build Tool**: Maven

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 3
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Routing**: React Router 6
- **UI Components**: Custom components with Lucide icons

---

## 📁 Project Structure

```
service-spotV4/
├── src/                          # Backend source code
│   ├── main/
│   │   ├── java/
│   │   │   └── Team/C/Service/Spot/
│   │   │       ├── config/       # Security, CORS configs
│   │   │       ├── controller/   # REST API endpoints
│   │   │       ├── dto/          # Data Transfer Objects
│   │   │       ├── model/        # JPA entities
│   │   │       ├── repository/   # Data access layer
│   │   │       ├── security/     # JWT, authentication
│   │   │       └── service/      # Business logic
│   │   └── resources/
│   │       ├── application.properties
│   │       └── data.sql          # Initial data
│   └── test/
│
├── frontend/
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   ├── pages/                # Page components
│   │   ├── context/              # React contexts
│   │   ├── services/             # API services
│   │   └── utils/                # Utilities
│   ├── dist/                     # Production build
│   └── public/
│
└── target/                       # Compiled backend artifacts
```

---

## 🔐 Security Features

- JWT-based authentication and authorization
- Role-based access control (Customer, Provider, Admin)
- Password encryption using BCrypt
- CORS protection
- SQL injection prevention
- XSS protection headers
- Secure session management

---

## 🗄️ Database Schema

### Core Entities
- **Users**: Customer and provider accounts with roles
- **Service Categories**: Categorization of services
- **Service Listings**: Services offered by providers
- **Bookings**: Service booking records with status tracking
- **Reviews**: Customer feedback and ratings
- **Availability**: Provider availability schedules

---

## 🎨 User Interface

- Modern, responsive design
- Mobile-friendly layouts
- Intuitive navigation
- Real-time updates
- Professional glassmorphic UI
- Accessible components
- Fast loading times

---

## 📊 Key Metrics

- **Total Lines of Code**: 27,000+
- **Backend Classes**: 84 Java files
- **Frontend Components**: 50+ React components
- **API Endpoints**: 40+ REST endpoints
- **Database Tables**: 8 main entities
- **User Roles**: 3 (Customer, Provider, Admin)

---

## 🚀 Performance

- Optimized frontend bundle (298 KB → 98.55 KB gzipped)
- Efficient database queries with JPA
- Lazy loading for images and components
- Caching strategies
- Production-ready builds

---

## 📝 API Documentation

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh

### Services
- `GET /api/services` - List all services
- `GET /api/services/{id}` - Get service details
- `POST /api/services` - Create service (Provider)
- `PUT /api/services/{id}` - Update service (Provider)
- `DELETE /api/services/{id}` - Delete service (Provider)

### Bookings
- `GET /api/bookings` - List user bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/{id}` - Update booking status
- `GET /api/bookings/{id}` - Get booking details

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/providers` - List providers

### Admin
- `GET /api/admin/users` - Manage users
- `GET /api/admin/categories` - Manage categories
- `GET /api/admin/statistics` - View analytics

---

## 🧪 Testing

- Unit tests for service layer
- Integration tests for API endpoints
- Component tests for React components
- End-to-end testing support

---

## 📦 Build Artifacts

### Backend
- **JAR File**: `target/Service-Spot-0.0.1-SNAPSHOT.jar` (60.66 MB)
- Includes all dependencies
- Ready for deployment

### Frontend
- **Production Build**: `frontend/dist/`
- Optimized and minified
- Static files ready for CDN

---

## 🌟 Highlights

- Complete full-stack implementation
- Production-ready code
- Secure authentication system
- Real-time availability management
- Comprehensive booking workflow
- Review and rating system
- Admin dashboard
- Mobile responsive
- Clean architecture
- Best practices followed

---

## 📄 License

This project is developed as part of an academic/portfolio project.

---

## 👥 Team

Developed by Team C

---

## 📞 Support

For deployment instructions, see separate documentation files:
- `DEPLOY_NOW.md` - Quick deployment guide
- `DEPLOYMENT_GUIDE_FREE.md` - Detailed deployment instructions

---

**Version**: 4.0  
**Status**: Production Ready  
**Last Updated**: November 30, 2025

