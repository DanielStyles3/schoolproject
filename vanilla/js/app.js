/* ==========================================================================
   Shared helpers: Supabase client, formatting, toasts, modals, DOM utilities.
   Loaded on every page before any page-specific script.
   ========================================================================== */

/* The CDN bundle exposes the library as window.supabase. Create the client and
   keep it on window.db so `supabase` still refers to the library itself. */
var db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true },
});
window.db = db;

/* --------------------------------------------------------------------------
   DOM shorthands
   -------------------------------------------------------------------------- */

function $(sel, root) { return (root || document).querySelector(sel); }
function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

/** Escape text before putting it into innerHTML. Always use for DB values. */
function esc(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function show(el) { if (el) el.classList.remove("hidden"); }
function hide(el) { if (el) el.classList.add("hidden"); }

/* --------------------------------------------------------------------------
   Toasts
   -------------------------------------------------------------------------- */

function toast(message, kind) {
  var host = $("#toasts");
  if (!host) {
    host = document.createElement("div");
    host.id = "toasts";
    document.body.appendChild(host);
  }
  var el = document.createElement("div");
  el.className = "toast " + (kind || "ok");
  el.textContent = message;
  host.appendChild(el);
  setTimeout(function () {
    el.style.transition = "opacity .25s";
    el.style.opacity = "0";
    setTimeout(function () { el.remove(); }, 250);
  }, 3600);
}

var toastOk = function (m) { toast(m, "ok"); };
var toastErr = function (m) { toast(m, "err"); };

/** Pull a readable message out of a Supabase/JS error. */
function errMessage(error, fallback) {
  if (!error) return fallback || "Something went wrong";
  return error.message || error.error_description || fallback || "Something went wrong";
}

/* --------------------------------------------------------------------------
   Formatting
   -------------------------------------------------------------------------- */

function fmtDate(value) {
  if (!value) return "—";
  var d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function initials(name) {
  if (!name) return "U";
  return name.trim().split(/\s+/).slice(0, 2)
    .map(function (p) { return p.charAt(0).toUpperCase(); }).join("") || "U";
}

function titleCase(value) {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/* --------------------------------------------------------------------------
   Grading
   -------------------------------------------------------------------------- */

/** Compute total, grade, remark and quality points for one course result. */
function gradeResult(caScore, examScore, unit) {
  var ca = Number(caScore) || 0;
  var exam = Number(examScore) || 0;
  var total = ca + exam;
  var band = GRADE_SCALE.find(function (b) { return total >= b.min; }) ||
             GRADE_SCALE[GRADE_SCALE.length - 1];
  return {
    total: total,
    grade: band.grade,
    remark: band.remark,
    qualityPoints: band.points * (Number(unit) || 0),
  };
}

/** GPA = total quality points / total units. */
function computeGpa(rows) {
  var units = 0, points = 0;
  rows.forEach(function (r) {
    units += Number(r.unit) || 0;
    points += Number(r.qualityPoints) || 0;
  });
  return units ? points / units : 0;
}

function gradeBadgeClass(grade) {
  if (grade === "F") return "badge badge-red";
  if (grade === "D" || grade === "E") return "badge badge-gold";
  return "badge badge-green";
}

function statusBadge(status) {
  if (status === "approved") return '<span class="badge badge-green">Approved</span>';
  if (status === "submitted") return '<span class="badge badge-gold">Awaiting Approval</span>';
  if (status === "published") return '<span class="badge badge-green">Published</span>';
  if (status === "draft") return '<span class="badge badge-gold">Draft</span>';
  return '<span class="badge badge-grey">Not Submitted</span>';
}

/* --------------------------------------------------------------------------
   Table render helpers
   -------------------------------------------------------------------------- */

function tableLoading(tbody, colspan) {
  tbody.innerHTML =
    '<tr><td colspan="' + colspan + '" class="table-loading"><div class="spinner"></div></td></tr>';
}

function tableEmpty(tbody, colspan, message) {
  tbody.innerHTML =
    '<tr><td colspan="' + colspan + '" class="table-empty">' + esc(message) + "</td></tr>";
}

/* --------------------------------------------------------------------------
   Modal + confirm
   -------------------------------------------------------------------------- */

/**
 * Open a modal. `body` is an HTML string. Returns the backdrop element so the
 * caller can query fields inside it.
 */
function openModal(title, bodyHtml, footHtml) {
  closeModal();
  var backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.id = "modal-backdrop";
  backdrop.innerHTML =
    '<div class="modal" role="dialog" aria-modal="true">' +
      '<div class="modal-head"><h3>' + esc(title) + "</h3></div>" +
      '<div class="modal-body">' + bodyHtml + "</div>" +
      (footHtml ? '<div class="modal-foot">' + footHtml + "</div>" : "") +
    "</div>";
  backdrop.addEventListener("click", function (e) {
    if (e.target === backdrop) closeModal();
  });
  document.body.appendChild(backdrop);
  document.addEventListener("keydown", escToClose);
  return backdrop;
}

function closeModal() {
  var m = $("#modal-backdrop");
  if (m) m.remove();
  document.removeEventListener("keydown", escToClose);
}

function escToClose(e) { if (e.key === "Escape") closeModal(); }

/** Simple yes/no confirmation. `onYes` runs when confirmed. */
function confirmAction(title, message, onYes, confirmLabel) {
  var backdrop = openModal(
    title,
    "<p>" + esc(message) + "</p>",
    '<button class="btn btn-outline" id="cf-no">Cancel</button>' +
    '<button class="btn btn-danger" id="cf-yes">' + esc(confirmLabel || "Delete") + "</button>"
  );
  $("#cf-no", backdrop).addEventListener("click", closeModal);
  $("#cf-yes", backdrop).addEventListener("click", function () {
    closeModal();
    onYes();
  });
}

/* --------------------------------------------------------------------------
   Misc
   -------------------------------------------------------------------------- */

/** Debounce for search inputs. */
function debounce(fn, wait) {
  var t;
  return function () {
    var args = arguments, self = this;
    clearTimeout(t);
    t = setTimeout(function () { fn.apply(self, args); }, wait || 400);
  };
}

/** Read a query-string parameter. */
function queryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

/** Build a lookup map keyed by id. */
function byId(rows) {
  var map = {};
  (rows || []).forEach(function (r) { map[r.id] = r; });
  return map;
}

/* --------------------------------------------------------------------------
   Global failure reporting
   --------------------------------------------------------------------------
   Without this an exception inside an async page script leaves the spinner up
   forever with nothing in the console for the user to act on. */

function showPageError(message) {
  var loading = $("#page-loading");
  if (loading) hide(loading);
  var content = $("#page-content");
  if (content) show(content);
  var host = content || document.body;
  var box = document.createElement("div");
  box.className = "alert alert-error";
  box.innerHTML = "<strong>This page could not load</strong>" + esc(message);
  host.insertBefore(box, host.firstChild);
}

window.addEventListener("unhandledrejection", function (e) {
  var msg = errMessage(e.reason, String(e.reason));
  console.error("Unhandled rejection:", e.reason);
  showPageError(msg);
});

window.addEventListener("error", function (e) {
  if (e.message) showPageError(e.message);
});
