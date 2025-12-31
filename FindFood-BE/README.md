# FindFood-BE

Minimal backend scaffold for FindFood app.

- POST /locations
  - body: { locations: [{ lat, lng }, ...] }
  - returns: { center: { lat, lng } }

Run locally:

1. cd FindFood-BE
2. npm install
3. npm run dev

Notes:

- This is a starter scaffold. Add database/repository logic, auth, and production readiness as needed.
