# Phase 1 — Test flow (Register → Login → Profile)

Run the app with `npm run dev`, then follow these steps and check each box.

---

## 1. Home page

- [ ] Open **http://localhost:3000**
- [ ] You see: "Showroom" title, "Live digital showroom for local shops", **Sign in** and **Create account** buttons
- [ ] Click **Create account** → you go to `/register`

---

## 2. Register

- [ ] On **http://localhost:3000/register** you see the registration form
- [ ] Fill in:
  - **Email:** e.g. `test@example.com`
  - **Password:** at least 8 characters
  - **Your name:** e.g. `Test User` (required)
  - **Shop name:** e.g. `Pescheria Centro`
  - **Storefront URL slug:** should auto-fill from shop name (e.g. `pescheria-centro`); you can edit it (only `a-z`, `0-9`, `-`)
- [ ] Click **Create account**
- [ ] You are redirected to **/login** (and see "Sign in" form)
- [ ] No error message on screen

**If you see errors:** check that email is valid, password ≥ 8 chars, name is filled, slug is lowercase letters/numbers/hyphens only. If email or slug is already used, change them.

---

## 3. Login

- [ ] On **http://localhost:3000/login** enter the same **email** and **password** you used to register
- [ ] Click **Sign in**
- [ ] You are redirected to **/dashboard** (then to **/dashboard/profile**)
- [ ] You see the dashboard: header with "Dashboard" and "Sign out", nav with "Profile" and "View storefront"

**If "Invalid email or password":** confirm email/password match the ones used at register; check terminal for server errors.

---

## 4. Profile page (load)

- [ ] You are on **/dashboard/profile**
- [ ] Form shows your shop data: **Shop name**, **Storefront URL slug**, **Description**, **WhatsApp**, **Address**, **Google Maps link**
- [ ] Shop name and slug match what you entered at register

---

## 5. Profile page (edit & save)

- [ ] Change **Shop name** (e.g. add " – Test")
- [ ] Change **Description** (e.g. "Fresh fish daily")
- [ ] Fill **WhatsApp** (e.g. `+39 123 456 7890`)
- [ ] Fill **Address** (e.g. `Via Roma 1`)
- [ ] Click **Save profile**
- [ ] You see a green "Profile saved." message
- [ ] Refresh the page: the new values are still there

**If "This URL slug is already taken":** choose another slug (unique per shop).

---

## 6. Sign out

- [ ] Click **Sign out** in the header
- [ ] You are redirected to the **home page** (http://localhost:3000)
- [ ] Open **http://localhost:3000/dashboard** in the same tab
- [ ] You are redirected to **/login** (dashboard is protected when not logged in)

---

## 7. Login again (existing user)

- [ ] On **/login** sign in again with the same email/password
- [ ] You land on **/dashboard/profile** again
- [ ] Profile still shows the data you saved (description, WhatsApp, address, etc.)

---

## Quick API checks (optional)

With the app running (`npm run dev`):

**Register (must succeed once per new email/slug):**
```bash
curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d "{\"email\":\"api-test@example.com\",\"password\":\"password123\",\"name\":\"API Tester\",\"shopName\":\"API Test Shop\",\"shopSlug\":\"api-test-shop\"}"
```
Expected: `{"ok":true}`

**Shops me without auth (must fail 401):**
```bash
curl -s http://localhost:3000/api/shops/me
```
Expected: `{"error":"Unauthorized"}` with status 401.
