# 🚀 Deploy Service Spot for FREE

**Time: 15-20 minutes | Cost: $0/month**

---

## 1️⃣ Backend (Railway)

### Create Account
- Go to https://railway.app
- Click "Login with GitHub"

### Deploy Backend
```bash
# 1. Push code to GitHub
cd C:\Users\Ahmed\OneDrive\Desktop\service-spotV4
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR-USERNAME/service-spot-backend.git
git push -u origin main

# 2. In Railway Dashboard:
# - New Project → Deploy from GitHub
# - Select your repository
# - Add MySQL database (click "+ New" → Database → MySQL)

# 3. Set Environment Variables (in backend service):
PORT=8080
SPRING_PROFILES_ACTIVE=prod
JWT_SECRET=<run command below>
FRONTEND_URL=http://localhost:3000

# Generate JWT Secret (PowerShell):
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})

# 4. Link DATABASE_URL:
# - Click backend service → Variables
# - Click "+ Reference" → Select MySQL → DATABASE_URL

# 5. Deploy automatically starts!
```

**Your backend URL**: `https://service-spot-production-xxxx.up.railway.app`

---

## 2️⃣ Frontend (Vercel)

### Create Account
- Go to https://vercel.com
- Click "Continue with GitHub"

### Deploy Frontend
```bash
# 1. Push code to GitHub
cd C:\Users\Ahmed\OneDrive\Desktop\service-spotV4\frontend
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR-USERNAME/service-spot-frontend.git
git push -u origin main

# 2. In Vercel Dashboard:
# - Add New → Project
# - Import your frontend repository
# - Framework: Vite
# - Build Command: npm run build
# - Output Directory: dist

# 3. Add Environment Variable:
VITE_API_BASE_URL=<your-railway-backend-url>

# 4. Deploy!
```

**Your frontend URL**: `https://service-spot-frontend-xxxx.vercel.app`

---

## 3️⃣ Connect Them

### Update CORS in Railway
```
1. Go to Railway → Your Backend Service → Variables
2. Update: FRONTEND_URL=<your-vercel-url>
3. Save (auto-redeploys)
```

---

## 4️⃣ Test

```bash
# Test backend
curl https://your-railway-url/api/categories

# Test frontend
# Open your Vercel URL in browser
# Register → Login → Browse Services
```

---

## 🐛 Troubleshooting

| Problem | Fix |
|---------|-----|
| CORS error | Update `FRONTEND_URL` in Railway (no trailing slash) |
| Can't connect | Check `VITE_API_BASE_URL` in Vercel |
| Build fails | Check logs in dashboard |

---

## ✅ Done!

Your app is LIVE! 🎉

- Frontend: https://your-app.vercel.app
- Backend: https://your-api.railway.app

**Free hosting | Auto-deploy on git push | HTTPS included**


