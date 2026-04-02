# ExamCRK Pro — Full-Stack Setup Guide

## Stack
| Layer      | Tech                         |
|------------|------------------------------|
| Frontend   | Next.js 14 (App Router)      |
| Backend    | Node.js + Express            |
| Database   | MongoDB + Mongoose           |
| OTP        | Twilio (SMS) or Nodemailer   |
| Payments   | Razorpay                     |
| Auth       | JWT + HTTP-only cookies      |
| Hosting    | Vercel (FE) + Render (BE)    |

---

## Quick Start

### 1. Clone & install

```bash
# Root
git clone <your-repo>
cd examcrk

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Environment variables

**backend/.env**
```
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/examcrk
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRES_IN=7d
COOKIE_DOMAIN=localhost

# Twilio (SMS OTP)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxx
TWILIO_PHONE=+1234567890

# OR Nodemailer (email OTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=you@gmail.com
SMTP_PASS=your_app_password

# Razorpay
RAZORPAY_KEY_ID=rzp_live_xxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx

# OTP config
OTP_EXPIRY_MINUTES=10
OTP_MAX_ATTEMPTS=5
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

**frontend/.env.local**
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxx
```

### 3. Run locally

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Visit: http://localhost:3000

---

## Deployment

### Backend → Render
1. Push `backend/` to GitHub
2. New Web Service on Render
3. Build: `npm install`  Start: `npm start`
4. Add all env vars in Render dashboard
5. Note your Render URL: `https://examcrk-api.onrender.com`

### Frontend → Vercel
1. Push `frontend/` to GitHub
2. Import on Vercel
3. Set `NEXT_PUBLIC_API_URL=https://examcrk-api.onrender.com/api`
4. Deploy

---

## Security Checklist
- [x] Passwords hashed with bcrypt (salt rounds: 12)
- [x] JWT stored in HTTP-only cookies (not localStorage)
- [x] OTP verified server-side only
- [x] OTP expires in 10 minutes
- [x] Rate limiting on /auth routes (express-rate-limit)
- [x] Razorpay signature verified on backend
- [x] CORS restricted to frontend domain
- [x] Helmet.js security headers
- [x] Input validation with express-validator
- [x] MongoDB injection protection (mongoose)
