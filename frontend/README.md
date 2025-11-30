# Service-Spot Frontend

React-based frontend application for Service-Spot - A Localized Service Discovery and Booking Platform.

## 🚀 Features

### Customer Features
- Browse and search service providers by location and category
- View provider profiles and reviews
- Book services with preferred date/time
- Manage bookings (view, track, cancel)
- Leave reviews after service completion
- User profile management

### Provider Features
- Comprehensive dashboard with booking statistics
- Manage incoming booking requests (accept/reject)
- Track confirmed and completed bookings
- Service management
- Profile management

## 🛠️ Tech Stack

- **Framework:** React 18 with Vite
- **Routing:** React Router v6
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **Icons:** Lucide React
- **State Management:** React Context API

## 📋 Prerequisites

- Node.js 18+ and npm
- Backend API running on `http://localhost:8080`

## 🔧 Installation

1. **Navigate to the frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure API endpoint (if needed):**
Edit `src/services/api.js` to update the `API_BASE_URL` if your backend runs on a different port.

## 🏃 Running the Application

### Development Mode
```bash
npm run dev
```
The application will start on `http://localhost:3000`

### Production Build
```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Navbar.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── Modal.jsx
│   │   ├── StarRating.jsx
│   │   ├── StatusBadge.jsx
│   │   └── EmptyState.jsx
│   ├── context/             # React Context providers
│   │   └── AuthContext.jsx
│   ├── pages/               # Page components
│   │   ├── LandingPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── SignupPage.jsx
│   │   ├── ServiceListPage.jsx
│   │   ├── ServiceDetailPage.jsx
│   │   ├── BookingPage.jsx
│   │   ├── MyBookingsPage.jsx
│   │   ├── CustomerProfile.jsx
│   │   └── ProviderDashboard.jsx
│   ├── services/            # API services
│   │   └── api.js
│   ├── utils/               # Utility functions and constants
│   │   └── constants.js
│   ├── App.jsx              # Main app component with routes
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── public/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## 🔐 Authentication Flow

1. Users can sign up as either **Customer** or **Provider**
2. Login redirects to appropriate dashboard based on user role
3. Protected routes ensure proper access control
4. JWT tokens are stored in localStorage

## 🎨 Key Pages

### Landing Page (`/`)
- Hero section with search functionality
- Featured services and categories
- Provider registration CTA
- Platform statistics

### Service List (`/services`)
- Browse all service providers
- Filter by city, category, and search term
- View provider cards with ratings

### Service Detail (`/providers/:id`)
- Detailed provider information
- List of services offered
- Customer reviews and ratings
- Book service button

### Booking Page (`/bookings/new`)
- Service summary
- Date and time selection
- Additional notes
- Booking confirmation

### My Bookings (`/my-bookings`)
- View all bookings (filterable by status)
- Cancel bookings
- Write reviews for completed services
- Track booking status

### Provider Dashboard (`/provider/dashboard`)
- Statistics overview (bookings, revenue)
- Manage booking requests
- Accept/reject/complete bookings
- Service management
- Profile information

## 🎯 API Integration

The frontend communicates with the backend REST API through the `src/services/api.js` module.

### Available API Modules:
- `customerAPI` - Customer operations
- `providerAPI` - Provider operations
- `serviceAPI` - Service management
- `bookingAPI` - Booking operations
- `reviewAPI` - Review operations
- `availabilityAPI` - Availability management

### Example API Call:
```javascript
import { providerAPI } from '../services/api';

const fetchProviders = async () => {
  try {
    const response = await providerAPI.getAll();
    setProviders(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## 🎨 Styling

The application uses Tailwind CSS with custom utility classes defined in `src/index.css`:

- `.btn-primary` - Primary action buttons
- `.btn-secondary` - Secondary action buttons
- `.btn-danger` - Danger/delete buttons
- `.input-field` - Form input fields
- `.card` - Card container
- `.badge-*` - Status badges

## 🔄 State Management

- **AuthContext**: Manages user authentication state, login/logout, and user data
- **Local State**: Component-specific state using `useState`
- **API Calls**: Handled via Axios with interceptors for authentication

## 🚧 Features to Implement (Backend Required)

Some features are currently using mock data and require backend API implementation:

1. **Service Management**
   - CRUD operations for services
   - Service categories

2. **Availability Management**
   - Provider availability slots
   - Real-time slot booking

3. **Review System**
   - Submit and fetch reviews
   - Rating calculations

4. **Advanced Booking**
   - Slot conflict prevention
   - Booking notifications

5. **Search & Filters**
   - Advanced search with multiple filters
   - Location-based search

## 🐛 Known Issues

- CSS warnings for Tailwind directives (expected, will be processed by PostCSS)
- Mock data is used for demonstrations until backend APIs are fully implemented

## 📝 Environment Variables

Create a `.env` file in the frontend root (optional):

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

Then update `src/services/api.js` to use:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
```

## 🔗 Backend Integration

Ensure the Spring Boot backend is running before starting the frontend. The Vite dev server is configured to proxy `/api` requests to `http://localhost:8080`.

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🎭 Demo Credentials

### Customer Account
```
Email: customer@example.com
Password: password123
```

### Provider Account
```
Email: provider@example.com
Password: password123
```

*(Note: Create these accounts through the backend or use actual registered accounts)*

## 🤝 Contributing

1. Follow the existing code structure
2. Use functional components with hooks
3. Implement proper error handling
4. Add loading states for async operations
5. Ensure responsive design

## 📄 License

This project is part of the Service-Spot platform.

---

**Built with ❤️ using React and Tailwind CSS**
