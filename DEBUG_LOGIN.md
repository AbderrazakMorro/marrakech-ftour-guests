# Debugging Login Issues

## Common Issues and Solutions

### 1. Check Environment Variables

Make sure `.env.local` has:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
SESSION_SECRET=your_random_secret_string
```

### 2. Verify Database Setup

Run this SQL in Supabase to check if the admin user exists:

```sql
SELECT * FROM responsable WHERE email = 'admin@example.com';
```

If the user doesn't exist, create it:

```sql
-- First, hash the password using the script:
-- node scripts/hash-password.js admin123

-- Then insert (replace YOUR_HASHED_PASSWORD):
INSERT INTO responsable (email, password, name)
VALUES ('admin@example.com', 'YOUR_HASHED_PASSWORD', 'Default Admin');
```

### 3. Check Browser Console

Open browser DevTools (F12) and check:
- Network tab: Look at the `/api/auth/login` request
  - Status code should be 200
  - Check Response tab for error messages
  - Check Headers tab for `Set-Cookie` header

- Console tab: Look for any JavaScript errors

### 4. Check Server Logs

In your terminal where `npm run dev` is running, look for:
- Any error messages
- "Supabase error:" messages
- "Login error:" messages

### 5. Test Password Verification

The password can be stored as:
- Plain text (for testing): `admin123`
- Bcrypt hash: `$2b$10$...` (recommended)

The system supports both. If using plain text, make sure it matches exactly.

### 6. Check Cookie Settings

The session cookie is set with:
- `httpOnly: true` (can't be accessed via JavaScript)
- `sameSite: "lax"`
- `secure: true` in production (requires HTTPS)

If testing on `localhost`, `secure` should be `false` (it's set automatically based on NODE_ENV).

### 7. Clear Browser Data

Try:
- Clear cookies for localhost
- Use incognito/private mode
- Try a different browser

### 8. Verify SESSION_SECRET

Make sure `SESSION_SECRET` is set and is a long random string:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Quick Test

1. Open browser DevTools (F12)
2. Go to Network tab
3. Try to login
4. Click on the `/api/auth/login` request
5. Check:
   - Status: Should be 200
   - Response: Should be `{"ok":true}`
   - Headers: Should have `Set-Cookie: ftour_session=...`

If you see a 401 error, check:
- Email/password are correct
- User exists in database
- Password matches (plain text or hash)

If you see a 500 error, check:
- Server logs for the actual error
- Environment variables are set
- Supabase connection is working

