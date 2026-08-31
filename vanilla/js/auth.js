/* ==========================================================================
   Authentication, session, role guard, and the shared app shell.
   ========================================================================== */

var Session = {
  user: null,        // row from public.users (id, name, email, role, ...)
  year: null,        // current academic year row
  ready: false,
};

/* --------------------------------------------------------------------------
   Sign in / out
   -------------------------------------------------------------------------- */

/**
 * Resolve a login identifier to an email address.
 *
 * Students sign in with a matric number (D/ND/23/3210359). Anonymous clients
 * cannot read the users table directly — RLS forbids it — so the lookup goes
 * through a SECURITY DEFINER function, `resolve_login_email`, created by
 * sql/001_matric_number.sql.
 *
 * Anything containing "@" is treated as an email and passed straight through,
 * so staff accounts (and the seeded demo accounts) keep working whether or not
 * that migration has been applied yet.
 */
async function resolveLoginEmail(identifier) {
  var value = (identifier || "").trim();
  if (!value) return { error: "Enter your matric number or email" };
  if (value.indexOf("@") !== -1) return { email: value };

  var res = await db.rpc("resolve_login_email", { p_identifier: value });
  if (res.error) {
    // Function missing => migration not applied yet. Say so plainly.
    if (/function|does not exist|schema cache/i.test(res.error.message || "")) {
      return {
        error:
          "Matric number sign-in is not set up on this database yet. " +
          "Run vanilla/sql/001_matric_number.sql in the Supabase SQL editor, " +
          "or sign in with your email address.",
      };
    }
    return { error: errMessage(res.error, "Could not look up that matric number") };
  }
  if (!res.data) return { error: "No account found for that matric number" };
  return { email: res.data };
}

async function signIn(identifier, password) {
  var resolved = await resolveLoginEmail(identifier);
  if (resolved.error) return { error: resolved.error };

  var res = await db.auth.signInWithPassword({
    email: resolved.email,
    password: password,
  });
  if (res.error) {
    var msg = res.error.message || "";
    if (/invalid login credentials/i.test(msg)) {
      return { error: "Incorrect sign-in details. Check your matric number and password." };
    }
    return { error: errMessage(res.error, "Unable to sign in") };
  }
  return { data: res.data };
}

async function signOut() {
  await db.auth.signOut();
  window.location.href = "index.html";
}

/* --------------------------------------------------------------------------
   Loading the signed-in profile
   -------------------------------------------------------------------------- */

async function loadProfile() {
  var sessionRes = await db.auth.getSession();
  var session = sessionRes.data ? sessionRes.data.session : null;
  if (!session) return null;

  var profileRes = await db
    .from("users")
    .select("*")
    .eq("id", session.user.id)
    .maybeSingle();

  if (profileRes.error || !profileRes.data) return null;
  return profileRes.data;
}

async function loadCurrentYear() {
  var res = await db
    .from("academic_years")
    .select("*")
    .eq("is_current", true)
    .maybeSingle();
  return res.error ? null : res.data;
}

/* --------------------------------------------------------------------------
   Page guard
   -------------------------------------------------------------------------- */

/**
 * Call at the top of every protected page.
 *
 *   requireAuth(["admin"]).then(function (ok) { if (!ok) return; ... });
 *
 * Redirects to the login page when signed out, and to the dashboard when the
 * signed-in role is not allowed here. Renders the sidebar on success.
 */
async function requireAuth(allowedRoles) {
  var user = await loadProfile();
  if (!user) {
    window.location.replace("index.html");
    return false;
  }

  if (user.is_active === false) {
    await db.auth.signOut();
    window.location.replace("index.html?disabled=1");
    return false;
  }

  if (allowedRoles && allowedRoles.length && allowedRoles.indexOf(user.role) === -1) {
    window.location.replace("dashboard.html");
    return false;
  }

  Session.user = user;
  Session.year = await loadCurrentYear();
  Session.ready = true;

  renderShell();
  return true;
}

/* --------------------------------------------------------------------------
   Sidebar / shell
   -------------------------------------------------------------------------- */

/* url, label, icon, roles */
var NAV = [
  { group: "Overview", items: [
    { url: "dashboard.html", label: "Dashboard", icon: "▦", roles: ["admin", "teacher", "student"] },
  ]},
  { group: "Academics", items: [
    { url: "course-registration.html", label: "Course Registration", icon: "✎", roles: ["student"] },
    { url: "results.html", label: "Results", icon: "▤", roles: ["admin", "teacher", "student"] },
    { url: "registrations.html", label: "Registration Approvals", icon: "✔", roles: ["admin"] },
    { url: "classes.html", label: "Classes", icon: "▣", roles: ["admin"] },
    { url: "courses.html", label: "Courses", icon: "▧", roles: ["admin"] },
  ]},
  { group: "People", items: [
    { url: "students.html", label: "Students", icon: "◍", roles: ["admin"] },
    { url: "teachers.html", label: "Lecturers", icon: "◎", roles: ["admin"] },
  ]},
  { group: "Setup", items: [
    { url: "academic-years.html", label: "Academic Sessions", icon: "◷", roles: ["admin"] },
    { url: "profile.html", label: "My Profile", icon: "☰", roles: ["admin", "teacher", "student"] },
  ]},
];

function renderShell() {
  var role = Session.user.role;
  var here = window.location.pathname.split("/").pop() || "dashboard.html";

  var navHtml = "";
  NAV.forEach(function (group) {
    var visible = group.items.filter(function (i) { return i.roles.indexOf(role) !== -1; });
    if (!visible.length) return;
    navHtml += '<div class="nav-group-label">' + esc(group.group) + "</div>";
    visible.forEach(function (item) {
      navHtml +=
        '<a class="nav-link' + (item.url === here ? " active" : "") + '" href="' + item.url + '">' +
          '<span class="ico" aria-hidden="true">' + item.icon + "</span>" +
          "<span>" + esc(item.label) + "</span>" +
        "</a>";
    });
  });

  var sidebar = $("#sidebar");
  if (sidebar) {
    sidebar.innerHTML =
      '<div class="sidebar-brand">' +
        '<img src="assets/yabatech-logo.png" alt="Yaba College of Technology" width="168" height="50">' +
        '<div class="sidebar-session">' +
          "<span>Current session</span>" +
          "<strong>" + esc(Session.year ? Session.year.name : "Not set") + "</strong>" +
        "</div>" +
      "</div>" +
      '<nav class="sidebar-nav">' + navHtml + "</nav>" +
      '<div class="sidebar-user">' +
        '<div class="avatar">' + esc(initials(Session.user.name)) + "</div>" +
        '<div class="who">' +
          "<strong>" + esc(Session.user.name) + "</strong>" +
          "<span>" + esc(titleCase(Session.user.role)) + "</span>" +
        "</div>" +
        '<button class="icon-btn" id="btn-signout" title="Sign out" aria-label="Sign out">⏻</button>' +
      "</div>";

    $("#btn-signout").addEventListener("click", function () {
      confirmAction("Sign out", "End your session and return to the login page?",
        signOut, "Sign out");
    });
  }

  // Mobile: hamburger toggles the sidebar with a backdrop.
  var burger = $("#btn-menu");
  if (burger) {
    burger.addEventListener("click", function () {
      sidebar.classList.add("open");
      var bd = document.createElement("div");
      bd.id = "sidebar-backdrop";
      bd.addEventListener("click", function () {
        sidebar.classList.remove("open");
        bd.remove();
      });
      document.body.appendChild(bd);
    });
  }

  // Admins cannot do anything useful without a current session set.
  if (!Session.year && role === "admin" && here !== "academic-years.html") {
    var banner = document.createElement("div");
    banner.className = "alert alert-warn";
    banner.innerHTML =
      "<strong>No active academic session</strong>" +
      'Set one on the <a href="academic-years.html">Academic Sessions</a> page before ' +
      "registering courses or recording results.";
    var content = $(".content");
    if (content) content.insertBefore(banner, content.firstChild);
  }
}

/** Show the page body once data has loaded, hiding the initial spinner. */
function pageReady() {
  hide($("#page-loading"));
  show($("#page-content"));
}
