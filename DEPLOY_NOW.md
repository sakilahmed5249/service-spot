# 🚀 DEPLOY NOW - Quick Commands

**Copy and paste these commands to deploy your app in 15 minutes**

---

## Step 1: Create Accounts (5 min)

1. **GitHub**: https://github.com (if you don't have)
2. **Railway**: https://railway.app (login with GitHub)
3. **Vercel**: https://vercel.com (login with GitHub)

---

## Step 2: Deploy Backend (10 min)

### Generate JWT Secret (PowerShell)
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```
**Copy the output - you'll need it!**

### Push to GitHub
```powershell
cd C:\Users\Ahmed\OneDrive\Desktop\service-spotV4
git init
git add .
git commit -m "Production ready"
git remote add origin https://github.com/YOUR-USERNAME/service-spot-backend.git
git push -u origin main
```

### In Railway Dashboard:
1. New Project → Deploy from GitHub → Select your repo
2. Click "+ New" → Database → MySQL
3. Click backend service → Variables → Add:
   ```
   PORT=8080
   SPRING_PROFILES_ACTIVE=prod
   JWT_SECRET=<paste-your-generated-secret>
   FRONTEND_URL=http://localhost:3000
   ```
4. Click "+ Reference" → Select MySQL → DATABASE_URL
5. Wait for deploy (5-10 min)
6. **Copy your Railway URL** (Settings → Networking)

---

## Step 3: Deploy Frontend (5 min)

### Update .env.production
```powershell
# Edit this file: frontend\.env.production
# Replace with your Railway URL:
VITE_API_BASE_URL=https://your-railway-url.up.railway.app
```

### Push to GitHub
```powershell
cd C:\Users\Ahmed\OneDrive\Desktop\service-spotV4\frontend
git init
git add .
git commit -m "Production ready"
git remote add origin https://github.com/YOUR-USERNAME/service-spot-frontend.git
git push -u origin main
```

### In Vercel Dashboard:
1. Add New → Project → Import your frontend repo
2. Framework: Vite
3. Add Environment Variable:
   ```
   VITE_API_BASE_URL=https://your-railway-url.up.railway.app
   ```
4. Deploy!
5. **Copy your Vercel URL**

---

## Step 4: Connect Them (2 min)

### Update CORS in Railway
1. Go to Railway → Backend Service → Variables
2. Update:
   ```
   FRONTEND_URL=https://your-vercel-url.vercel.app
   ```
3. Save (auto-redeploys)

---

## Step 5: Test! 🎉

**Open your Vercel URL in browser**
- Register new user
- Login
- Browse services
- Create booking

**Done! Your app is LIVE!** 🚀

---

## 🆘 Quick Fixes

| Problem | Fix |
|---------|-----|
| CORS error | Update FRONTEND_URL in Railway (no trailing slash) |
| Can't connect | Check VITE_API_BASE_URL in Vercel |
| Build fails | Check logs in dashboard, verify all files pushed |

---

**Total Time: 15-20 minutes | Cost: $0**

For detailed guide, see: `DEPLOYMENT_GUIDE_FREE.md`

