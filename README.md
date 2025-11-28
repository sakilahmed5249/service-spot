# 🛠️ Service-Spot v3.0

> A Localized Service Discovery and Booking Platform connecting customers with trusted service providers.

---

## 📖 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Data Storage](#data-storage)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## 🎯 About

**Service-Spot** is a full-stack web application that enables:
- **Customers**: Browse, search, and book local services
- **Service Providers**: List services, manage bookings, and build their reputation
- **Categories**: Education, Plumbing, Electrical, Cleaning, Beauty, IT Support, and more

---

## ✨ Features

### For Customers
- 🔍 Search services by location and category
- 📅 Real-time availability checking
- 💳 Secure booking system
- ⭐ Review and rate providers
- 📱 Responsive mobile-friendly UI

### For Service Providers
- 📝 Create and manage service listings
- 📊 Dashboard with booking overview
- 💼 Profile management
- 📍 Location-based service radius
- 🔔 Booking notifications

### System Features
- 🔐 JWT-based authentication
- 👥 Role-based access (Customer/Provider)
- 🎨 Modern glassmorphic UI
- 📍 Pincode-based location services
- 🌐 RESTful API architecture

---

## 🚀 Tech Stack

### Backend
- **Framework**: Spring Boot 3.x
- **Language**: Java 21
- **Database**: MySQL 8.x
- **ORM**: Spring Data JPA (Hibernate)
- **Security**: Spring Security (JWT)
- **Build Tool**: Maven

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Routing**: React Router v6

---

## ⚡ Quick Start

### Prerequisites

- Java 21 JDK
- Node.js 18+ and npm
- MySQL 8.0+
- Git

### 1️⃣ Clone Repository

```bash
git clone <your-repo-url>
cd service-spotV3
```

### 2️⃣ Setup Database

1. Start MySQL Server
2. Create database:
   ```sql
   CREATE DATABASE service_spot;
   ```

### 3️⃣ Configure Backend

Update `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/service_spot
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
```

### 4️⃣ Start Backend

**Option A: Using provided script**
```bash
./start-backend.bat
```

**Option B: Manual**
```bash
mvn clean install
mvn spring-boot:run
```

Backend runs at: `http://localhost:8080`

### 5️⃣ Start Frontend

**Option A: Using provided script**
```bash
./start-frontend.bat
```

**Option B: Manual**
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:3000`

### 6️⃣ Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api
- **API Docs**: http://localhost:8080/swagger-ui.html (if enabled)

---

## 📁 Project Structure

```
service-spotV3/
├── frontend/                   # React frontend application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── context/          # React Context (Auth)
│   │   ├── services/         # API service layer
│   │   └── utils/            # Utility functions
│   └── package.json
│
├── src/main/java/Team/C/Service/Spot/
│   ├── config/               # Spring configurations
│   ├── controller/           # REST API controllers
│   ├── dto/                  # Data Transfer Objects
│   │   ├── request/         # API request DTOs
│   │   └── response/        # API response DTOs
│   ├── mapper/              # Entity-DTO mappers
│   ├── model/               # JPA entities
│   ├── repository/          # Data access layer
│   └── service/             # Business logic layer
│
├── src/main/resources/
│   ├── application.properties  # App configuration
│   └── data.sql               # Initial data (categories)
│
├── start-backend.bat          # Backend startup script
├── start-frontend.bat         # Frontend startup script
├── DEPLOYMENT_GUIDE.md        # Detailed deployment guide
└── pom.xml                    # Maven dependencies
```

---

## 💾 Data Storage

### Understanding Data Persistence

```
┌──────────────────┐
│ MySQL Workbench  │  ← GUI Tool (just for viewing)
└────────┬─────────┘
         │ connects to
┌────────▼─────────┐
│  MySQL Server    │  ← Actual database engine
│  localhost:3306  │     (stores your data)
└──────────────────┘
```

**Important**: MySQL Workbench is just a viewer. Your data is stored in the MySQL Server.

### Initial Data

When you start the backend:

1. **Schema Creation**: Hibernate creates tables from `@Entity` classes
2. **Data Initialization**: `data.sql` inserts default categories
3. **User Data**: Accumulated through API endpoints

### Production Data

When deployed:
- Use cloud MySQL (Railway, AWS RDS, PlanetScale, etc.)
- Same data structure, different location
- See `DEPLOYMENT_GUIDE.md` for details

---

## 🌐 Deployment

### Quick Deploy with Railway (Recommended)

1. Push code to GitHub
2. Sign up at https://railway.app
3. New Project → Deploy from GitHub
4. Add MySQL from marketplace
5. Deploy! (Railway auto-configures)

### Other Options

- **Heroku** - Backend + JawsDB MySQL
- **AWS** - Elastic Beanstalk + RDS
- **DigitalOcean** - App Platform + Managed Database
- **Vercel/Netlify** - Frontend only

📖 **Full deployment guide**: See `DEPLOYMENT_GUIDE.md`

---

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register/customer` - Register customer
- `POST /api/auth/register/provider` - Register provider
- `POST /api/auth/login` - Login

### Services
- `GET /api/services` - List all services
- `GET /api/services/{id}` - Get service details
- `POST /api/services` - Create service (provider)
- `PUT /api/services/{id}` - Update service (provider)
- `GET /api/services/search` - Search services

### Categories
- `GET /api/categories` - List all categories
- `GET /api/categories/{id}` - Get category details

### Bookings
- `POST /api/bookings` - Create booking (customer)
- `GET /api/bookings/user/{userId}` - Get user bookings
- `PATCH /api/bookings/{id}/status` - Update booking status

### Providers
- `GET /api/providers` - List providers
- `GET /api/providers/{id}` - Get provider details
- `PUT /api/providers/{id}` - Update provider profile

---

## 🐛 Troubleshooting

### Backend Won't Start

**Issue**: `Field 'created_at' doesn't have a default value`  
**Solution**: Fixed in latest `data.sql`. Run:
```bash
git pull
mvn clean install
```

**Issue**: `Cannot connect to database`  
**Solution**: 
1. Check MySQL is running
2. Verify credentials in `application.properties`
3. Ensure database `service_spot` exists

### Frontend Issues

**Issue**: `Network Error` when calling API  
**Solution**: 
1. Ensure backend is running on port 8080
2. Check CORS configuration
3. Verify API base URL in frontend

**Issue**: Categories dropdown empty  
**Solution**: 
1. Check backend logs for SQL errors
2. Manually run `data.sql` in MySQL Workbench
3. Verify `/api/categories` endpoint returns data

### Validation Errors

**Issue**: `Description must be between 20 and 2000 characters`  
**Solution**: Fixed! Now accepts 1+ characters

**Issue**: `Category not found with ID: X`  
**Solution**: Categories now support dynamic creation

---

## 📚 Documentation

- `BACKEND_ARCHITECTURE.md` - Backend structure guide
- `SERVICE_LAYER_GUIDE.md` - Service layer patterns
- `DEPLOYMENT_GUIDE.md` - Complete deployment instructions
- `QUICK_START_GUIDE.md` - Getting started guide
- `ROADMAP.md` - Future features

---

## 🧪 Testing

### Run Backend Tests
```bash
mvn test
```

### Run Frontend Tests
```bash
cd frontend
npm test
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👥 Team

**Team C** - Software Engineering Project  
Version 3.0 - November 2025

---

## 🎉 Acknowledgments

- Spring Boot Documentation
- React Documentation
- Tailwind CSS
- MySQL Community

---

## 📞 Support

If you encounter issues:

1. Check `TROUBLESHOOTING.md`
2. Review backend logs
3. Check browser console for frontend errors
4. Verify database connection
5. Ensure all dependencies are installed

---

**Built with ❤️ by Team C**

🚀 Happy Coding!

