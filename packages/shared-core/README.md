# Shared Core

Core Firebase and utility functions shared across ELMA portals.

## Modules

### `firebase.js`
Initialize Firebase app with Vite environment variables and export `auth` and `db` instances.

### `auth.js`
Authentication helpers:
- `listen(callback)` - Subscribe to auth state changes
- `signIn(email, password)` - Sign in user
- `signOut()` - Sign out current user
- `changePassword(newPassword)` - Update password
- `getClaims()` - Get custom claims (admin flag)

### `dates.js`
IST timezone utilities:
- `getTodayBoundsIST()` - Get start/end of today in IST
- `getMonthKey(date)` - Get "YYYY-MM" string in IST
- `formatDate(date)` - Format date for display
- `formatTime(date)` - Format time for display

### `money.js`
Currency formatting:
- `inr(amount)` - Format number as Indian Rupees (₹1,23,456)

### `metrics.js`
Firestore query helpers for analytics and reporting:
- User counts (total, DAU, WAU, MAU, new users)
- Therapist counts and stats
- Booking/session metrics
- Revenue calculations
- Therapist-specific queries

All queries handle IST timezone conversion for date ranges.

## Usage

```js
import { auth, db } from 'shared-core/firebase';
import { signIn, getClaims } from 'shared-core/auth';
import { getTodayBoundsIST } from 'shared-core/dates';
import { inr } from 'shared-core/money';
import { countDAU } from 'shared-core/metrics';
```
