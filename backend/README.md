# MyHealthLink - MVP Progress README

**Version:** 1.0  
**Date:** September 12, 2025  
**Document Type:** Development Progress / README

---

## 1. Project Overview

**Product Name:** MyHealthLink  
**Tagline:** “One Link for Your Health”

**Summary:**  
MyHealthLink is a secure, mobile-first platform allowing patients to store, organize, and share their health information via a single link or QR code. Users have full control over their medical records, enabling easy access during emergencies, doctor visits, or travel.

**Purpose of this README:**  
Document the development journey and current implemented features.

---

## 2. Backend Progress (Start → Current)

**Stack:** Node.js, Express, MongoDB  

**Implemented Features:**

### 2.1 User Authentication & Authorization
- Email/Phone signup with OTP verification
- Password-based login with JWT and refresh tokens
- Account lockout after repeated failed logins
- Logout functionality
- Google OAuth callback integration
- Password reset (forgot/reset flows)

### 2.2 Profile Management
- Fetch own profile (`GET /api/profile/me`)
- Update profile (`PUT /api/profile/me`)
- Public profile fetching (`GET /api/profile/:username`)
- Profile completion percentage calculation
- Nested profile structure:
  - Personal: name, dob, gender, phone
  - Medical: blood type, genotype, allergies, chronic conditions, medications
  - Emergency contacts
  - Verified fields

### 2.3 Document Management
- Document schema set up
- Placeholder for routes (PDF, JPG, PNG upload planned)

### 2.4 Middleware & Utilities
- JWT token middleware (`protect`)
- Error handling middleware
- Rate limiting
- CORS setup
- Helmet for security headers
- Logging with Morgan
- Cookie parsing

### 2.5 Environment & Config
- `.env` setup for secrets and URLs
- Database connection established

---

## 3. Current API Routes

**Auth Routes:**
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`
- `POST /api/auth/send-otp`
- `POST /api/auth/verify-otp`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password/:token`

**Profile Routes:**
- `GET /api/profile/me`
- `PUT /api/profile/me`
- `GET /api/profile/:username`

**Document Routes:** (setup, endpoints pending)
- `/api/documents/...`

**Health Check:**
- `GET /health`

---

## 4. Key Backend Schemas

### 4.1 User Schema
- Fields: name, email, phone, passwordHash, role, isVerified, OTP, failedLoginAttempts, lockUntil, refreshTokenHash, googleId
- Profile: nested object with personal, medical, emergency, medications
- Methods:
  - `comparePassword()`
  - `hashPassword()`
  - `getProfileCompletion()`

### 4.2 Profile Schema
- Linked to User via `userId`
- Personal info, medical info, emergency contact, medications

---

## 5. Notes

- Sensitive fields excluded from responses (passwordHash, refreshTokenHash, OTP)
- OTPs expire in 10 minutes
- Failed login attempts are tracked with auto-lockout (15 minutes)
- Cookies are `httpOnly` and `sameSite: strict`
- CORS is enabled only for allowed frontend URLs

---

*This README captures the development progress up to this point.*
