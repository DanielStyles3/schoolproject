# YABATECH Student Result Portal — HTML / CSS / JavaScript

Course registration and student result management for Yaba College of Technology,
built with **plain HTML, CSS and JavaScript**. No React, no TypeScript, no build
step, no bundler, no framework.

Data lives in **Supabase** (hosted PostgreSQL + Auth), reached from the browser
with the official Supabase JavaScript client loaded from a CDN.

---

## Running it

**Option 1 — with the included server (recommended)**

```
cd vanilla
node serve.js
```

Then open <http://localhost:4173>.

**Option 2 — open the file directly**

Double-click `index.html`. This works, but browsers treat `file://` as an opaque
origin, which can occasionally drop the stored login session. Use Option 1 for a
demo or presentation.

There is nothing to install and nothing to compile.

---

## Demo accounts

Password for all three: `ChangeMe123!`

| Role | Sign in with |
|---|---|
| Admin | `admin@yabatech.local` |
| Lecturer | `teacher@yabatech.local` |
| Student | `student@yabatech.local`, or matric `D/ND/23/3210359` |

The login page has a **Demo login** row that fills these in. Delete that block
from `index.html` before any real deployment.

---

## One-time database setup

Students sign in with a **matric number**. That needs one migration:

1. Open your Supabase project → **SQL Editor** → **New query**
2. Paste the contents of [`sql/001_matric_number.sql`](sql/001_matric_number.sql)
3. Click **Run**

This adds:

- a `matric_number` column on `users`, uniquely indexed
- `resolve_login_email(identifier)` — turns a matric number into an email so the
  browser can sign in, without exposing any other student data
- `verify_published_results(matric, session)` — powers the public
  **Verify a result** page, returning published results only
- matric numbers for the two demo students

**Until you run it**, matric sign-in shows a clear message and email sign-in
keeps working, so the portal is usable either way.

---

## Files

```
vanilla/
├── index.html                 Sign in (matric number or email)
├── forgot-password.html       Request a password-reset email
├── verify-result.html         Public result check by matric number
│
├── dashboard.html             Role-aware landing page
├── course-registration.html   Student: pick courses, submit
├── results.html               Student: result sheet + GPA
│                              Staff: score entry and publishing
├── registrations.html         Admin: approve registrations
├── classes.html               Admin: classes and their courses
├── courses.html               Admin: courses and lecturers
├── students.html              Admin: student accounts
├── teachers.html              Admin: lecturer accounts
├── academic-years.html        Admin: sessions, set the current one
├── profile.html               Change own name, email, password
│
├── css/styles.css             Entire design system, one file
│
├── js/
│   ├── config.js              Supabase keys, grading scale
│   ├── app.js                 Client, helpers, toasts, modals, grading
│   ├── auth.js                Sign in/out, session guard, sidebar
│   ├── api.js                 Every database query
│   └── users-page.js          Shared logic for students + lecturers pages
│
├── assets/                    College logo, crest, favicon
├── sql/001_matric_number.sql  One-time database migration
└── serve.js                   Optional local static server
```

Every page loads the same four scripts in the same order:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="js/config.js"></script>
<script src="js/app.js"></script>
<script src="js/auth.js"></script>
<script src="js/api.js"></script>
```

…then one inline `<script>` holding that page's own logic.

---

## How it works

**Sign in.** `index.html` accepts a matric number or an email. A matric number
goes to `resolve_login_email` to find the matching email, then
`supabase.auth.signInWithPassword` runs. The session is stored by the Supabase
client and survives page navigation.

**Page protection.** Every protected page starts with:

```js
if (!(await requireAuth(["admin"]))) return;
```

`requireAuth` loads the signed-in profile, redirects to the login page when there
is no session, redirects to the dashboard when the role is not allowed, then
draws the sidebar. Passing no argument allows any signed-in role.

**Roles.**

| | Admin | Lecturer | Student |
|---|:--:|:--:|:--:|
| Dashboard | ✓ | ✓ | ✓ |
| Register courses | | | ✓ |
| Approve registrations | ✓ | | |
| Enter and publish results | ✓ | own courses | |
| View own results | | | ✓ |
| Manage classes, courses, users, sessions | ✓ | | |

The sidebar only draws links the current role may use, and `requireAuth`
enforces the same rule if someone types a URL directly. The real boundary is
**Row Level Security** in PostgreSQL — even a modified page cannot read or write
data the signed-in role is not entitled to.

**Grading.** Defined once in `config.js` and applied in `app.js`:

| Total | Grade | Remark | Points |
|---|---|---|---|
| 70–100 | A | Excellent | 5 |
| 60–69 | B | Very Good | 4 |
| 50–59 | C | Good | 3 |
| 45–49 | D | Pass | 2 |
| 40–44 | E | Fair | 1 |
| 0–39 | F | Fail | 0 |

CA is out of 40, exam out of 60. Quality points = grade points × course units.
GPA = total quality points ÷ total units.

**Result visibility.** Saved scores are `draft` and invisible to students. A
lecturer must press **Publish** for a course before that class can see them.

**Registration flow.** A student submits → status `submitted` → an admin
approves on `registrations.html` → status `approved`. Submitting again returns it
to `submitted` for re-approval.

---

## Security notes

- The **anon key** in `config.js` is public by design — it identifies the
  project, it does not grant access. All access control is enforced by Row Level
  Security policies on the database.
- Creating, updating and deleting user accounts needs service-role rights, so
  those calls go to the deployed `admin-users` Edge Function, which checks the
  caller is an admin before acting. The service-role key never reaches the browser.
- Every value taken from the database is passed through `esc()` before being
  written into `innerHTML`, so a name containing HTML cannot inject markup.
- `verify_published_results` returns published results only, and only for the
  matric number asked for.

---

## Troubleshooting

**"Matric number sign-in is not set up on this database yet"**
Run `sql/001_matric_number.sql` (see above), or sign in with an email address.

**Spinner never stops / "This page could not load"**
The error text below the heading is the database's own message. Most often the
account lacks permission for that table, or there is no internet connection to
reach Supabase.

**Admin lands on Academic Sessions with a warning**
No session is marked current. Create one, or press **Make current** on an
existing row. Registration and results both key off the current session.

**A lecturer sees "No courses available" for a class**
Lecturers may only enter results for courses assigned to them *and* attached to
that class. Fix on `courses.html` (assign the lecturer) and `classes.html`
(attach the course).
