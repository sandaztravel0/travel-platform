# Sri Lanka Travel Platform — Phase 1 Starter

මේක ඔයාගේ travel platform එකේ **Phase 1 foundation එක**: database, backend API, සහ frontend starter page එකක්.

## 📁 Folder structure

```
travel-platform/
├── database/
│   └── schema.sql          → PostgreSQL database structure (හැම table එකම)
├── backend/
│   ├── src/
│   │   ├── config/db.js    → Database connection
│   │   ├── middleware/auth.js → Login token check + role check (user/business/admin)
│   │   └── routes/
│   │       ├── auth.js     → Register/login (user, business, admin)
│   │       ├── listings.js → Business ලා listings add කරන එක + public browsing
│   │       ├── bookings.js → Booking creation, commission calc, live location
│   │       ├── admin.js    → Approve businesses/listings, add locations, payouts
│   │       └── payments.js → PayHere integration
│   ├── .env.example        → Config template (API keys දාන්න ඕන තැන)
│   └── package.json
└── frontend/
    ├── src/pages/index.js  → Example homepage (listings browse කරන්න)
    └── package.json
```

## ⚙️ Setup කරන විදිහ (Local Testing)

### 1. Database
- PostgreSQL install කරන්න (හෝ [Neon.tech](https://neon.tech) / [Supabase](https://supabase.com) වගේ free cloud DB එකක් ගන්න - ලේසි)
- `database/schema.sql` file එක run කරන්න ඕන tables හදාගන්න:
  ```
  psql -U youruser -d your_database -f database/schema.sql
  ```

### 2. Backend
```
cd backend
npm install
cp .env.example .env
```
- `.env` file එක open කරලා ඔයාගේ real values (DATABASE_URL, PayHere keys, Cloudinary keys) දාන්න
- Run කරන්න:
```
npm run dev
```
- API එක `http://localhost:5000` වල run වෙනවා

### 3. Frontend
```
cd frontend
npm install
npm run dev
```
- Website එක `http://localhost:3000` වල පේනවා

## 🔑 API Keys ලබාගන්නේ කොහෙන්ද

| Key | ලබාගන්නේ කොහෙන් |
|---|---|
| PayHere Merchant ID/Secret | payhere.lk → Business account → Integrations |
| Cloudinary keys | cloudinary.com → free account → Dashboard |
| Google Maps API Key | console.cloud.google.com → APIs & Services |
| Database URL | neon.tech හෝ supabase.com (free tier) |

## ✅ මේ Phase 1 එකේ දැනටමත් වැඩ කරන දේවල්

- User & Business registration/login (JWT authentication)
- Business ලා listings (vehicle/driver/stay) add කරන එක — status "pending" විදිහට save වෙනවා
- Admin approve කරන තුරු listing එක public කරන්නේ නෑ (status='approved' වුනාට පස්සේ විතරයි public API එකේ පේන්නේ)
- Booking + automatic commission calculation (COMMISSION_PERCENT .env එකේ)
- Double-booking prevention (dates overlap check)
- PayHere payment flow (initiate + secure webhook verification)
- Payment success → booking confirmed → payout queued for business
- Admin panel APIs: approve business, approve listing, add locations, view stats, release payouts
- Live location tracking endpoints (driver updates, user views)

## 🚧 ඊළඟට කරන්න ඕන දේවල් (Phase 2)

1. **Frontend pages තව හදන්න**: registration/login forms, business dashboard, admin dashboard, booking flow, image upload UI
2. **Image upload**: Cloudinary widget frontend එකේ integrate කරන්න
3. **Trip planner UI**: locations select කරලා route/itinerary හදන පිටුව
4. **Google Maps**: location tracking map, distance calculator
5. **Reviews & ratings UI**
6. **Admin seed script**: මුල් admin account එක database එකට manually දාන්න (SQL insert එකකින්)
7. **Deploy**: Backend → Render/Railway, Frontend → Vercel, Database → Neon/Supabase

## ⚠️ ඔයා manual ම කරන්න ඕන දේවල් (මතක තියාගන්න)

- PayHere Business account register කරන එක
- Domain + hosting purchase කරන එක
- Google Maps API billing setup
- Business registration/license (අවශ්‍ය නම්)
- Deploy කරන එක (හෝ ඒකට කෙනෙක් ලවගන්න)
