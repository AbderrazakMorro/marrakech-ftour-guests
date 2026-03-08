# Event Guest Management PWA

A full-stack Progressive Web Application for managing event guests and invitations, built with Next.js, Supabase, and optimized for Vercel deployment.

## Features

- 🔐 **Authentication** - Secure login system using Supabase
- 👥 **Guest Management** - Add, view, and manage guests
- 📧 **Email Invitations** - Automatic invitation emails with QR codes
- 📥 **CSV Import/Export** - Bulk import and export guest lists
- 📷 **QR Code Scanner** - Browser-based QR code scanning for guest verification
- 📱 **Progressive Web App** - Installable PWA with offline support
- 🎨 **Marrakech Theme** - Beautiful UI inspired by Moroccan Ftour experience

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Email**: Nodemailer
- **QR Codes**: qrcode library
- **QR Scanner**: html5-qrcode
- **CSV**: papaparse
- **Styling**: TailwindCSS
- **Deployment**: Vercel

## Setup Instructions

### 1. Clone and Install

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the following SQL in your Supabase SQL Editor:

```sql
CREATE TABLE responsable (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT NOT NULL
);

INSERT INTO responsable (email, password, name)
VALUES ('admin@example.com', '$2b$10$YourHashedPasswordHere', 'Default Admin');

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

-- Create index for faster lookups
CREATE INDEX idx_guests_qr_code ON guests(qr_code);
CREATE INDEX idx_guests_verified ON guests(verified);
```

**Note**: You'll need to hash the admin password using bcrypt. You can use an online tool or run:
```javascript
const bcrypt = require('bcrypt');
bcrypt.hash('admin123', 10).then(hash => console.log(hash));
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
SESSION_SECRET=your_random_session_secret_here
```

### 4. Email Setup

For Gmail:
1. Enable 2-Factor Authentication
2. Generate an App Password
3. Use the app password in `EMAIL_PASS`

For other providers, use your SMTP credentials.

### 5. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 6. Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## Project Structure

```
/app
  /api          # API routes
  /dashboard    # Dashboard page
  /guests       # Guest management pages
  /login        # Login page
  /scanner      # QR scanner page
/components    # React components
/lib           # Utility libraries
  /auth        # Authentication utilities
  /csv         # CSV parsing
  /email       # Email sending
  /qr          # QR code generation
  /supabase    # Supabase client
/public        # Static assets and PWA files
```

## Usage

### Default Login

- Email: `admin@example.com`
- Password: `admin123` (or whatever you set)

### Adding Guests

1. Navigate to "Add Guest" from the dashboard
2. Fill in guest information
3. System automatically generates QR code and sends invitation email

### Importing CSV

1. Prepare a CSV file with columns: `first_name`, `last_name`, `email`, `phone`
2. Navigate to "Import CSV"
3. Upload your file
4. System processes and sends invitations automatically

### Scanning QR Codes

1. Navigate to "QR Scanner"
2. Click "Start Scanner"
3. Allow camera permissions
4. Scan guest QR codes to verify check-in

## PWA Features

- **Installable**: Add to home screen on mobile/desktop
- **Offline Support**: Cached static assets work offline
- **Service Worker**: Implements cache-first and network-first strategies

## Security

- Passwords are hashed using bcrypt
- JWT tokens for session management
- QR codes contain encrypted verification tokens
- Protected API routes require authentication
- Input sanitization for CSV imports

## License

MIT

