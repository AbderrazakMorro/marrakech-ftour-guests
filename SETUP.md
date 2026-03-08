# Quick Setup Guide

## 1. Install Dependencies

```bash
npm install
```

## 2. Set Up Supabase Database

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run:

```sql
-- Create responsable table
CREATE TABLE responsable (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT NOT NULL
);

-- Create guests table
CREATE TABLE guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  qr_code TEXT UNIQUE,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_guests_qr_code ON guests(qr_code);
CREATE INDEX idx_guests_verified ON guests(verified);
```

3. Hash your admin password:

```bash
node scripts/hash-password.js admin123
```

4. Insert admin user (replace `YOUR_HASHED_PASSWORD` with the output from step 3):

```sql
INSERT INTO responsable (email, password, name)
VALUES ('admin@example.com', 'YOUR_HASHED_PASSWORD', 'Default Admin');
```

## 3. Configure Environment Variables

Create `.env.local`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
SESSION_SECRET=generate_a_random_string_here
```

**Getting Supabase Keys:**
- Go to Project Settings > API
- Copy "Project URL" → `SUPABASE_URL`
- Copy "service_role" key → `SUPABASE_SERVICE_KEY`

**Email Setup (Gmail):**
1. Enable 2-Factor Authentication
2. Go to Google Account > Security > App Passwords
3. Generate app password → `EMAIL_PASS`
4. Your Gmail address → `EMAIL_USER`

**Session Secret:**
Generate a random string (32+ characters):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 5. Deploy to Vercel

1. Push code to GitHub
2. Import repository in Vercel
3. Add all environment variables
4. Deploy!

## Default Login

- Email: `admin@example.com`
- Password: `admin123` (or whatever you set)

## Troubleshooting

**Email not sending?**
- Check EMAIL_USER and EMAIL_PASS are correct
- For Gmail, use App Password (not regular password)
- Check spam folder

**Database errors?**
- Verify SUPABASE_URL and SUPABASE_SERVICE_KEY
- Check table names match exactly (case-sensitive)
- Ensure indexes are created

**QR codes not generating?**
- Check SESSION_SECRET is set
- Verify QR code library is installed

**Service worker not working?**
- Check browser console for errors
- Ensure HTTPS in production (required for service workers)
- Clear browser cache

