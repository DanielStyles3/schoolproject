/* ==========================================================================
   Data access. Every database read/write in the portal goes through here.
   Each function returns { data, error } so callers handle failures uniformly.
   ========================================================================== */

var API = {};

/* --------------------------------------------------------------------------
   Academic sessions
   -------------------------------------------------------------------------- */

API.listYears = function () {
  return db.from("academic_years").select("*").order("from_year", { ascending: false });
};

API.createYear = function (payload) {
  return db.from("academic_years").insert(payload).select("*").single();
};

API.updateYear = function (id, payload) {
  return db.from("academic_years").update(payload).eq("id", id).select("*").single();
};

API.deleteYear = function (id) {
  return db.from("academic_years").delete().eq("id", id);
};

/** Only one session may be current, so clear the flag everywhere else first. */
API.makeYearCurrent = async function (id) {
  var clear = await db.from("academic_years").update({ is_current: false }).neq("id", id);
  if (clear.error) return clear;
  return db.from("academic_years").update({ is_current: true }).eq("id", id).select("*").single();
};

/* --------------------------------------------------------------------------
   Users
   -------------------------------------------------------------------------- */

API.listUsers = function (role, search) {
  var q = db.from("users").select("*").order("name");
  if (role) q = q.eq("role", role);
  if (search) q = q.or("name.ilike.%" + search + "%,email.ilike.%" + search + "%");
  return q;
};

API.getUsersByIds = async function (ids) {
  var unique = Array.from(new Set((ids || []).filter(Boolean)));
  if (!unique.length) return { data: [], error: null };
  return db.from("users").select("*").in("id", unique);
};

API.updateUser = function (id, payload) {
  return db.from("users").update(payload).eq("id", id).select("*").single();
};

/* Creating and deleting auth accounts needs service-role privileges, so those
   go through the deployed `admin-users` Edge Function rather than direct SQL. */
API.adminUsers = function (action, payload) {
  return db.functions.invoke("admin-users", {
    body: Object.assign({ action: action }, payload),
  });
};

API.updateOwnProfile = function (payload) {
  return API.adminUsers("update-own-profile", payload);
};

/* --------------------------------------------------------------------------
   Classes
   -------------------------------------------------------------------------- */

API.listClasses = function (search) {
  var q = db.from("classes").select("*").order("name");
  if (search) q = q.ilike("name", "%" + search + "%");
  return q;
};

API.getClass = function (id) {
  return db.from("classes").select("*").eq("id", id).maybeSingle();
};

API.createClass = function (payload) {
  return db.from("classes").insert(payload).select("*").single();
};

API.updateClass = function (id, payload) {
  return db.from("classes").update(payload).eq("id", id).select("*").single();
};

API.deleteClass = function (id) {
  return db.from("classes").delete().eq("id", id);
};

/* --------------------------------------------------------------------------
   Courses (stored in the `subjects` table)
   -------------------------------------------------------------------------- */

API.listCourses = function (search) {
  var q = db.from("subjects").select("*").order("code");
  if (search) q = q.or("name.ilike.%" + search + "%,code.ilike.%" + search + "%");
  return q;
};

API.getCoursesByIds = async function (ids) {
  var unique = Array.from(new Set((ids || []).filter(Boolean)));
  if (!unique.length) return { data: [], error: null };
  return db.from("subjects").select("*").in("id", unique);
};

API.createCourse = function (payload) {
  return db.from("subjects").insert(payload).select("*").single();
};

API.updateCourse = function (id, payload) {
  return db.from("subjects").update(payload).eq("id", id).select("*").single();
};

API.deleteCourse = function (id) {
  return db.from("subjects").delete().eq("id", id);
};

/* --------------------------------------------------------------------------
   Course registrations
   -------------------------------------------------------------------------- */

API.listRegistrations = function (opts) {
  opts = opts || {};
  var q = db.from("course_registrations").select("*").order("updated_at", { ascending: false });
  if (opts.classId) q = q.eq("class_id", opts.classId);
  if (opts.academicYearId) q = q.eq("academic_year_id", opts.academicYearId);
  if (opts.studentId) q = q.eq("student_id", opts.studentId);
  return q;
};

API.getMyRegistration = function (studentId, yearId) {
  return db
    .from("course_registrations")
    .select("*")
    .eq("student_id", studentId)
    .eq("academic_year_id", yearId)
    .maybeSingle();
};

/**
 * Submit or update a registration. Always lands in "submitted" — approval is
 * an explicit admin action, never automatic.
 */
API.submitRegistration = function (payload) {
  return db
    .from("course_registrations")
    .upsert(Object.assign({ status: "submitted" }, payload), {
      onConflict: "student_id,academic_year_id",
    })
    .select("*")
    .single();
};

API.setRegistrationStatus = function (id, status) {
  return db
    .from("course_registrations")
    .update({ status: status })
    .eq("id", id)
    .select("*")
    .single();
};

/* --------------------------------------------------------------------------
   Results
   -------------------------------------------------------------------------- */

API.listResults = function (opts) {
  opts = opts || {};
  var q = db.from("results").select("*").order("updated_at", { ascending: false });
  if (opts.classId) q = q.eq("class_id", opts.classId);
  if (opts.subjectId) q = q.eq("subject_id", opts.subjectId);
  if (opts.academicYearId) q = q.eq("academic_year_id", opts.academicYearId);
  if (opts.studentId) q = q.eq("student_id", opts.studentId);
  if (opts.publishedOnly) q = q.eq("result_status", "published");
  return q;
};

/**
 * Save one score row. class_id is NOT NULL in the schema, so callers must
 * always pass it — omitting it is what used to make saving fail silently.
 */
API.saveResult = function (row) {
  var computed = gradeResult(row.caScore, row.examScore, row.unit);
  return db
    .from("results")
    .upsert(
      {
        student_id: row.studentId,
        subject_id: row.subjectId,
        class_id: row.classId,
        academic_year_id: row.academicYearId,
        ca_score: Number(row.caScore) || 0,
        exam_score: Number(row.examScore) || 0,
        total_score: computed.total,
        grade: computed.grade,
        remark: computed.remark,
        quality_points: computed.qualityPoints,
        result_status: "draft",
      },
      { onConflict: "student_id,subject_id,academic_year_id" }
    )
    .select("*")
    .single();
};

API.publishResults = function (classId, subjectId, yearId) {
  var q = db
    .from("results")
    .update({ result_status: "published" })
    .eq("subject_id", subjectId)
    .eq("class_id", classId);
  if (yearId) q = q.eq("academic_year_id", yearId);
  return q;
};

/* --------------------------------------------------------------------------
   Composite reads used by more than one page
   -------------------------------------------------------------------------- */

/**
 * A student's published results, decorated with course details and a GPA
 * summary. Used by both the student dashboard and the results page.
 */
API.studentTranscript = async function (studentId, yearId) {
  var res = await API.listResults({
    studentId: studentId,
    academicYearId: yearId,
    publishedOnly: true,
  });
  if (res.error) return { error: res.error };

  var rows = res.data || [];
  var courses = await API.getCoursesByIds(rows.map(function (r) { return r.subject_id; }));
  var courseMap = byId(courses.data);

  var decorated = rows.map(function (r) {
    var course = courseMap[r.subject_id] || {};
    return {
      id: r.id,
      code: course.code || "—",
      name: course.name || "Unknown course",
      unit: Number(course.unit) || 0,
      caScore: Number(r.ca_score) || 0,
      examScore: Number(r.exam_score) || 0,
      total: Number(r.total_score) || 0,
      grade: r.grade,
      remark: r.remark,
      qualityPoints: Number(r.quality_points) || 0,
    };
  });

  var totalUnits = decorated.reduce(function (s, r) { return s + r.unit; }, 0);
  var totalPoints = decorated.reduce(function (s, r) { return s + r.qualityPoints; }, 0);

  return {
    data: {
      rows: decorated,
      summary: {
        courses: decorated.length,
        units: totalUnits,
        qualityPoints: totalPoints,
        gpa: totalUnits ? totalPoints / totalUnits : 0,
        passed: decorated.filter(function (r) { return r.grade !== "F"; }).length,
      },
    },
  };
};

/** Everything the course-registration page needs in one call. */
API.registrationContext = async function (student, yearId) {
  if (!student.student_class) {
    return { error: { message: "You have not been assigned to a class yet. Contact the admin office." } };
  }

  var cls = await API.getClass(student.student_class);
  if (cls.error) return { error: cls.error };
  if (!cls.data) return { error: { message: "Your assigned class could not be found." } };

  var courses = await API.getCoursesByIds(cls.data.subjects || []);
  if (courses.error) return { error: courses.error };

  var existing = await API.getMyRegistration(student.id, yearId);

  return {
    data: {
      klass: cls.data,
      courses: (courses.data || []).filter(function (c) { return c.is_active !== false; }),
      registration: existing.data || null,
    },
  };
};
