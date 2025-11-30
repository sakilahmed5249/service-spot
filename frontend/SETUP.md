# 🚀 Quick Setup Guide for Service-Spot Frontend

## Step 1: Navigate to Frontend Directory
```powershell
cd frontend
```

## Step 2: Install Dependencies
```powershell
npm install
```

## Step 3: Start Development Server
```powershell
npm run dev
```

The application will be available at: **http://localhost:3000**

## 🎯 What's Included

### ✅ Pages Created
1. **Landing Page** - Homepage with search and featured services
2. **Login Page** - User authentication for customers and providers
3. **Signup Page** - Registration for both user types
4. **Service List Page** - Browse providers with filters
5. **Service Detail Page** - View provider details and services
6. **Booking Page** - Create new bookings
7. **My Bookings Page** - Customer booking management
8. **Customer Profile** - Edit customer information
9. **Provider Dashboard** - Complete provider management interface

### ✅ Features Implemented
- 🔐 JWT-based authentication
- 👥 Role-based access (Customer/Provider)
- 🎨 Responsive design with Tailwind CSS
- 🔍 Search and filter functionality
- 📅 Booking management
- ⭐ Review system UI
- 📊 Provider statistics dashboard
- 🛡️ Protected routes

### ✅ Components
- Navbar with authentication state
- Loading spinners
- Modal dialogs
- Star ratings
- Status badges
- Empty states
- Protected route wrapper

## 📝 Testing the Application

### As a Customer:
1. Go to `/signup` and create a customer account
2. Login at `/login`
3. Browse services at `/services`
4. View provider details
5. Create a booking
6. View bookings at `/my-bookings`

### As a Provider:
1. Go to `/signup?type=provider` and create a provider account
2. Login at `/login` (select Provider tab)
3. Access dashboard at `/provider/dashboard`
4. View booking requests
5. Accept/reject bookings
6. Mark bookings as complete

## 🔌 Backend Connection

Make sure your Spring Boot backend is running on **http://localhost:8080**

The frontend is configured to proxy API requests:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080`
- API calls: `http://localhost:3000/api/*` → `http://localhost:8080/api/*`

## 🎨 Key Technologies

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first CSS
- **Axios** - HTTP client
- **Lucide React** - Icon library
- **Context API** - State management

## 🛠️ Available Scripts

```powershell
npm run dev      # Start development server
npm run build    # Create production build
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 📱 Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1023px
- Desktop: ≥ 1024px

## 🎯 Next Steps

1. **Start backend server** (Spring Boot on port 8080)
2. **Install frontend dependencies**: `npm install`
3. **Start frontend**: `npm run dev`
4. **Open browser**: http://localhost:3000
5. **Create test accounts** and explore the features!

## ⚠️ Important Notes

- Some features use mock data until backend APIs are implemented
- The CSS warnings for Tailwind directives are normal (processed by PostCSS)
- Ensure both frontend and backend servers are running simultaneously

## 🐛 Troubleshooting

### Port already in use?
```powershell
# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Dependencies not installing?
```powershell
# Clear npm cache and reinstall
npm cache clean --force
rm -r node_modules
rm package-lock.json
npm install
```

### Backend not connecting?
- Verify backend is running on http://localhost:8080
- Check CORS configuration in Spring Boot
- Verify API endpoints match the frontend calls

---

**🎉 Your frontend is ready to go! Happy coding!**
