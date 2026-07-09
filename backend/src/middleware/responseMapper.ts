import { type Request, type Response, type NextFunction } from "express";

export const recursiveMap = (val: any): any => {
  if (val === null || val === undefined) return val;
  if (Array.isArray(val)) {
    return val.map(recursiveMap);
  }
  if (typeof val === "object") {
    if (val instanceof Date) return val;
    if (val.constructor && val.constructor.name !== "Object") {
      return val;
    }

    const newObj: any = {};
    for (const key of Object.keys(val)) {
      let newKey = key;
      if (key === "academic_year") newKey = "academicYear";
      else if (key === "class_teacher") newKey = "classTeacher";
      else if (key === "from_year") newKey = "fromYear";
      else if (key === "to_year") newKey = "toYear";
      else if (key === "is_current") newKey = "isCurrent";
      else if (key === "is_active") newKey = "isActive";
      else if (key === "teacher_subject") newKey = "teacherSubjects";
      else if (key === "student_class") newKey = "studentClass";
      else if (key === "due_date") newKey = "dueDate";
      else if (key === "submitted_at") newKey = "submittedAt";
      else if (key === "subject_id") newKey = "subjectId";
      else if (key === "class_id") newKey = "classId";
      else if (key === "teacher_id") newKey = "teacherId";
      else if (key === "student_id") newKey = "studentId";
      else if (key === "exam_id") newKey = "examId";
      else if (key === "academic_year_id") newKey = "academicYearId";
      else if (key === "subject_ids") newKey = "subjectIds";
      else if (key === "ca_score") newKey = "caScore";
      else if (key === "exam_score") newKey = "examScore";
      else if (key === "total_score") newKey = "totalScore";
      else if (key === "quality_points") newKey = "qualityPoints";
      else if (key === "result_status") newKey = "resultStatus";

      newObj[newKey] = recursiveMap(val[key]);
    }
    if (val.id !== undefined && val.id !== null) {
      newObj._id = val.id;
    }
    return newObj;
  }
  return val;
};

export const responseMapper = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json;
  res.json = function (body) {
    const mappedBody = recursiveMap(body);
    return originalJson.call(this, mappedBody);
  };
  next();
};
