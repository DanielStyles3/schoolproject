/* ==========================================================================
   Shared implementation for the Students and Lecturers pages.
   The host page sets window.USERS_PAGE = { role, title, description }
   before loading this file.
   ========================================================================== */

(async function () {
  var cfg = window.USERS_PAGE;
  if (!(await requireAuth(["admin"]))) return;

  var isStudent = cfg.role === "student";
  var tbody = $("#rows");

  $("#page-title").textContent = cfg.title;
  $("#page-sub").textContent = cfg.description;
  $("#btn-new").textContent = "+ New " + (isStudent ? "student" : "lecturer");

  // Students need a class; lecturers need courses. Load whichever applies.
  var classes = isStudent ? (await API.listClasses()).data || [] : [];
  var classMap = byId(classes);
  var courses = !isStudent ? (await API.listCourses()).data || [] : [];
  var courseMap = byId(courses);

  $("#th-extra").textContent = isStudent ? "Class" : "Courses";

  $("#search").addEventListener("input", debounce(load, 350));
  $("#btn-new").addEventListener("click", function () { openForm(null); });

  await load();
  pageReady();

  async function load() {
    tableLoading(tbody, 5);
    var res = await API.listUsers(cfg.role, $("#search").value.trim());
    if (res.error) { tableEmpty(tbody, 5, errMessage(res.error)); return; }

    var rows = res.data || [];
    if (!rows.length) { tableEmpty(tbody, 5, "No " + cfg.title.toLowerCase() + " found."); return; }

    tbody.innerHTML = rows.map(function (u) {
      var extra;
      if (isStudent) {
        var c = classMap[u.student_class];
        extra = c ? esc(c.name) : '<span class="badge badge-gold">No class</span>';
      } else {
        var names = (u.teacher_subject || [])
          .map(function (id) { return courseMap[id] ? courseMap[id].code : null; })
          .filter(Boolean);
        extra = names.length ? esc(names.join(", ")) : '<span class="badge badge-gold">None</span>';
      }

      return "<tr>" +
        "<td><strong>" + esc(u.name) + "</strong>" +
          (u.matric_number ? '<span class="sub">' + esc(u.matric_number) + "</span>" : "") + "</td>" +
        "<td>" + esc(u.email) + "</td>" +
        "<td>" + extra + "</td>" +
        "<td>" + (u.is_active === false
          ? '<span class="badge badge-grey">Inactive</span>'
          : '<span class="badge badge-green">Active</span>') + "</td>" +
        '<td class="numeric">' +
          '<button class="btn btn-outline btn-sm" data-edit="' + esc(u.id) + '">Edit</button> ' +
          '<button class="btn btn-outline btn-sm" data-del="' + esc(u.id) + '">Delete</button>' +
        "</td></tr>";
    }).join("");

    $$("[data-edit]", tbody).forEach(function (b) {
      b.addEventListener("click", function () {
        openForm(rows.find(function (r) { return r.id === b.getAttribute("data-edit"); }));
      });
    });

    $$("[data-del]", tbody).forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-del");
        var row = rows.find(function (r) { return r.id === id; });
        confirmAction("Delete account",
          "Permanently delete " + row.name + "? Their registrations and results will be removed too.",
          async function () {
            var res = await API.adminUsers("delete", { id: id });
            if (res.error) { toastErr(errMessage(res.error, "Could not delete the account")); return; }
            toastOk("Account deleted");
            load();
          });
      });
    });
  }

  function openForm(row) {
    var editing = !!row;

    var extraField = isStudent
      ? '<div class="field"><label for="f-class">Class</label>' +
          '<select id="f-class"><option value="">Not assigned</option>' +
            classes.map(function (c) {
              var on = editing && row.student_class === c.id;
              return '<option value="' + esc(c.id) + '"' + (on ? " selected" : "") + ">" + esc(c.name) + "</option>";
            }).join("") +
          "</select></div>" +
        '<div class="field"><label for="f-matric">Matric number</label>' +
          '<input id="f-matric" value="' + (editing ? esc(row.matric_number || "") : "") + '" ' +
          'placeholder="D/ND/23/3210359"><p class="field-hint">Used to sign in. Requires the ' +
          "matric_number column (see sql/001_matric_number.sql).</p></div>"
      : '<div class="field"><label>Courses taught</label>' +
          '<div id="f-courses" style="max-height:200px;overflow-y:auto">' +
            (courses.length
              ? courses.map(function (c) {
                  var on = editing && (row.teacher_subject || []).indexOf(c.id) !== -1;
                  return '<label class="checkbox-row' + (on ? " selected" : "") + '">' +
                    '<input type="checkbox" value="' + esc(c.id) + '"' + (on ? " checked" : "") + ">" +
                    "<span><strong>" + esc(c.code) + "</strong>" +
                    '<span class="code">' + esc(c.name) + "</span></span></label>";
                }).join("")
              : '<p class="field-hint">No courses exist yet.</p>') +
          "</div></div>";

    var backdrop = openModal(
      (editing ? "Edit " : "New ") + (isStudent ? "student" : "lecturer"),
      '<div class="field"><label for="f-name">Full name</label>' +
        '<input id="f-name" value="' + (editing ? esc(row.name) : "") + '"></div>' +
      '<div class="field"><label for="f-email">Email address</label>' +
        '<input id="f-email" type="email" value="' + (editing ? esc(row.email) : "") + '"></div>' +
      '<div class="field"><label for="f-password">' +
        (editing ? "New password (leave blank to keep)" : "Password") + "</label>" +
        '<input id="f-password" type="password" placeholder="At least 8 characters"></div>' +
      extraField +
      '<div class="field"><label for="f-active">Status</label>' +
        '<select id="f-active">' +
          '<option value="true"' + (editing && row.is_active === false ? "" : " selected") + ">Active</option>" +
          '<option value="false"' + (editing && row.is_active === false ? " selected" : "") + ">Inactive</option>" +
        "</select></div>" +
      '<p class="field-error hidden" id="f-err"></p>',
      '<button class="btn btn-outline" id="f-cancel">Cancel</button>' +
      '<button class="btn btn-primary" id="f-save">' + (editing ? "Save changes" : "Create account") + "</button>"
    );

    $$("#f-courses input", backdrop).forEach(function (i) {
      i.addEventListener("change", function () {
        i.closest(".checkbox-row").classList.toggle("selected", i.checked);
      });
    });

    $("#f-cancel", backdrop).addEventListener("click", closeModal);
    $("#f-save", backdrop).addEventListener("click", async function () {
      var err = $("#f-err", backdrop);
      var name = $("#f-name", backdrop).value.trim();
      var email = $("#f-email", backdrop).value.trim();
      var password = $("#f-password", backdrop).value;

      if (!name || !email) { err.textContent = "Name and email are required."; show(err); return; }
      if (!editing && password.length < 8) {
        err.textContent = "Set a password of at least 8 characters.";
        show(err); return;
      }
      if (editing && password && password.length < 8) {
        err.textContent = "New password must be at least 8 characters.";
        show(err); return;
      }

      var payload = {
        name: name,
        email: email,
        role: cfg.role,
        isActive: $("#f-active", backdrop).value === "true",
      };
      if (password) payload.password = password;

      if (isStudent) {
        payload.studentClass = $("#f-class", backdrop).value || null;
        var matric = $("#f-matric", backdrop).value.trim();
        if (matric) payload.matricNumber = matric;
      } else {
        payload.teacherSubject = $$("#f-courses input:checked", backdrop).map(function (i) { return i.value; });
      }

      var btn = $("#f-save", backdrop);
      btn.disabled = true;
      btn.textContent = "Saving…";

      var res = editing
        ? await API.adminUsers("update", Object.assign({ id: row.id }, payload))
        : await API.adminUsers("create", payload);

      if (res.error) {
        err.textContent = errMessage(res.error, "Could not save the account");
        show(err);
        btn.disabled = false;
        btn.textContent = editing ? "Save changes" : "Create account";
        return;
      }

      closeModal();
      toastOk(editing ? "Account updated" : "Account created");
      load();
    });
  }
})();
