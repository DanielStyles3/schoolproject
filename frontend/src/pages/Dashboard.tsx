import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  ArrowRight,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

import { useAuth } from "@/hooks/AuthProvider";
import { api } from "@/lib/api";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import type { Class, courseRegistration, resultRecord, subject, user as UserRecord } from "@/types";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStatsResponse {
  totalStudents?: number;
  totalTeachers?: number;
  totalClasses?: number;
  totalSubjects?: number;
  totalResults?: number;
  pendingRegistrations?: number;
  approvedRegistrations?: number;
  myClassesCount?: number;
  mySubjectsCount?: number;
  resultsEntered?: number;
  availableCourses?: number;
  publishedResultsCount?: number;
  registrationStatus?: "submitted" | "approved" | "not_submitted";
  currentAcademicYear?: string;
  studentClassName?: string;
}

interface StudentRegistrationOptions {
  subjects: subject[];
  registration?: courseRegistration | null;
}

interface StudentResultsPayload {
  results: resultRecord[];
  summary?: {
    totalCourses: number;
    totalUnits: number;
    totalQualityPoints: number;
    gpa: number;
  };
}

interface TeacherCourseDetail {
  subject: subject;
  classes: Class[];
  students: UserRecord[];
}

const registrationTone = (status?: string) => {
  if (status === "approved") return "brand-status-approved";
  if (status === "submitted") return "brand-status-pending";
  return "brand-status-idle";
};

const registrationLabel = (status?: string) => {
  if (status === "approved") return "Approved";
  if (status === "submitted") return "Submitted";
  return "Not Submitted";
};

export default function Dashboard() {
  useDocumentTitle("Dashboard");
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState<DashboardStatsResponse>({});
  const [registrations, setRegistrations] = useState<courseRegistration[]>([]);
  const [teacherClasses, setTeacherClasses] = useState<Class[]>([]);
  const [adminClasses, setAdminClasses] = useState<Class[]>([]);
  const [adminSubjects, setAdminSubjects] = useState<subject[]>([]);
  const [adminTeachers, setAdminTeachers] = useState<UserRecord[]>([]);
  const [adminStudents, setAdminStudents] = useState<UserRecord[]>([]);
  const [adminResults, setAdminResults] = useState<resultRecord[]>([]);
  const [studentRegistration, setStudentRegistration] =
    useState<StudentRegistrationOptions | null>(null);
  const [studentResults, setStudentResults] =
    useState<StudentResultsPayload | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        setLoading(true);

        const statsRequest = api.get("/dashboard/stats");

        if (user.role === "student") {
          const [statsRes, registrationRes, resultsRes] = await Promise.all([
            statsRequest,
            api.get("/course-registrations/available"),
            api.get("/results"),
          ]);

          setStatsData(statsRes.data);
          setStudentRegistration(registrationRes.data);
          setStudentResults(resultsRes.data);
          setRegistrations([]);
          setTeacherClasses([]);
          setAdminClasses([]);
          setAdminSubjects([]);
          setAdminTeachers([]);
          setAdminStudents([]);
          setAdminResults([]);
          return;
        }

        if (user.role === "teacher") {
          const [statsRes, registrationsRes, classesRes] = await Promise.all([
            statsRequest,
            api.get("/course-registrations"),
            api.get("/classes"),
          ]);

          setStatsData(statsRes.data);
          setRegistrations(registrationsRes.data.registrations || []);
          setTeacherClasses(classesRes.data.classes || []);
          setStudentRegistration(null);
          setStudentResults(null);
          setAdminClasses([]);
          setAdminSubjects([]);
          setAdminTeachers([]);
          setAdminStudents([]);
          setAdminResults([]);
          return;
        }

        const [
          statsRes,
          registrationsRes,
          classesRes,
          subjectsRes,
          teachersRes,
          studentsRes,
          resultsRes,
        ] = await Promise.all([
          statsRequest,
          api.get("/course-registrations"),
          api.get("/classes?limit=100"),
          api.get("/courses?limit=100"),
          api.get("/users?role=teacher&limit=100"),
          api.get("/users?role=student&limit=100"),
          api.get("/results"),
        ]);

        setStatsData(statsRes.data);
        setRegistrations(registrationsRes.data.registrations || []);
        setAdminClasses(classesRes.data.classes || []);
        setAdminSubjects(subjectsRes.data.subjects || []);
        setAdminTeachers(teachersRes.data.users || []);
        setAdminStudents(studentsRes.data.users || []);
        setAdminResults(resultsRes.data || []);
        setTeacherClasses([]);
        setStudentRegistration(null);
        setStudentResults(null);
      } catch (error) {
        console.error("Failed to load dashboard", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);



  const studentSelectedCourses = useMemo(() => {
    if (!studentRegistration?.registration?.subjectIds?.length) return [];

    const selectedIds = new Set(studentRegistration.registration.subjectIds);
    return (studentRegistration.subjects || []).filter((item) => selectedIds.has(item._id));
  }, [studentRegistration]);

  const availableStudentCourses = studentRegistration?.subjects?.length || 0;

  const teacherCourseDetails = useMemo(() => {
    if (user?.role !== "teacher") {
      return [] as TeacherCourseDetail[];
    }

    return (user.teacherSubjects || []).map((assignedSubject) => {
      const classesForSubject = teacherClasses.filter((classItem) =>
        (classItem.subjects || []).some((subjectItem) => subjectItem._id === assignedSubject._id),
      );

      const studentsMap = new Map<string, UserRecord>();
      registrations.forEach((registration) => {
        const hasSubject = (registration.subjects || []).some(
          (subjectItem) => subjectItem._id === assignedSubject._id,
        );

        if (hasSubject && registration.student?._id) {
          studentsMap.set(registration.student._id, registration.student);
        }
      });

      return {
        subject: assignedSubject,
        classes: classesForSubject,
        students: Array.from(studentsMap.values()),
      };
    });
  }, [registrations, teacherClasses, user]);

  const teacherRegisteredStudents = useMemo(() => {
    const studentsMap = new Map<string, UserRecord>();
    teacherCourseDetails.forEach((course) => {
      course.students.forEach((student) => {
        studentsMap.set(student._id, student);
      });
    });
    return Array.from(studentsMap.values());
  }, [teacherCourseDetails]);

  const teacherLargestCourse = useMemo(() => {
    return teacherCourseDetails.reduce<TeacherCourseDetail | null>((largest, item) => {
      if (!largest || item.students.length > largest.students.length) {
        return item;
      }
      return largest;
    }, null);
  }, [teacherCourseDetails]);

  const recentStudentResults = useMemo(
    () => (studentResults?.results || []).slice(0, 5),
    [studentResults],
  );

  const studentDashboardState = useMemo(() => {
    if (user?.role !== "student") {
      return null;
    }

    const registrationStatus = statsData.registrationStatus || "not_submitted";
    const publishedResultsCount = statsData.publishedResultsCount || 0;
    const hasRegistration = studentSelectedCourses.length > 0;
    const resultItems = studentResults?.results || [];
    const hasResults = publishedResultsCount > 0;
    const passedResults = resultItems.filter((item) => item.grade !== "F");
    const failedResults = resultItems.filter((item) => item.grade === "F");
    const strongestCourse = resultItems.reduce<resultRecord | null>((best, item) => {
      if (!best || (item.totalScore ?? 0) > (best.totalScore ?? 0)) {
        return item;
      }
      return best;
    }, null);
    const courseNeedingAttention = resultItems.reduce<resultRecord | null>((weakest, item) => {
      if (!weakest || (item.totalScore ?? 0) < (weakest.totalScore ?? 0)) {
        return item;
      }
      return weakest;
    }, null);

    const nextStep =
      registrationStatus === "not_submitted"
        ? {
            title: "Complete course registration",
            detail: "Pick your courses for the current session so your records and results can be tracked properly.",
            actionLabel: "Register Courses",
            actionPath: "/course-registration",
          }
        : registrationStatus === "submitted"
          ? {
              title: "Wait for approval",
              detail: "Your course registration has been saved for the current session. You can still update it if needed.",
              actionLabel: "View Registration",
              actionPath: "/course-registration",
            }
          : hasResults
            ? {
                title: "Review your published results",
                detail: "Your published results are ready. Check your grades, GPA, and overall performance.",
                actionLabel: "Open Results",
                actionPath: "/results",
              }
            : {
                title: "Stay ready for result release",
                detail: "Your registration is active. The next thing is to watch for published results from your teachers and admin.",
                actionLabel: "Check Results",
                actionPath: "/results",
              };

    const checklist = [
      {
        label: "Class assigned",
        done: Boolean(statsData.studentClassName),
        help: statsData.studentClassName || "Ask the admin to place you in a class.",
      },
      {
        label: "Courses selected",
        done: hasRegistration,
        help: hasRegistration
          ? `${studentSelectedCourses.length} course(s) selected.`
          : "You have not selected any course yet.",
      },
      {
        label: "Registration saved",
        done: registrationStatus === "approved",
        help:
          registrationStatus === "approved"
            ? "Your registration is approved for this session."
            : registrationStatus === "submitted"
              ? "Submitted and waiting for admin approval."
              : "Submit your course registration to continue.",
      },
      {
        label: "Published results available",
        done: hasResults,
        help: hasResults
          ? `${publishedResultsCount} published result(s) available.`
          : "No published results yet.",
      },
    ];

    return {
      nextStep,
      checklist,
      totalSelectedCourses: studentSelectedCourses.length,
      totalAvailableCourses: availableStudentCourses,
      publishedResultsCount,
      passedCourses: passedResults.length,
      failedCourses: failedResults.length,
      strongestCourse,
      courseNeedingAttention,
    };
  }, [
    availableStudentCourses,
    statsData.publishedResultsCount,
    statsData.registrationStatus,
    statsData.studentClassName,
    studentResults,
    studentSelectedCourses,
    user?.role,
  ]);

  const adminHealth = useMemo(() => {
    if (user?.role !== "admin") {
      return null;
    }

    const classesWithoutTeachers = adminClasses.filter((item) => !item.classTeacher?._id);
    const subjectsWithoutTeachers = adminSubjects.filter((item) => !(item.teacher || []).length);
    const teachersWithoutCourses = adminTeachers.filter((item) => !(item.teacherSubjects || []).length);
    const studentsWithoutClasses = adminStudents.filter((item) => !item.studentClass?._id);
    const registeredStudentIds = new Set(
      registrations.map((item) => item.student?._id).filter(Boolean),
    );
    const studentsWithoutRegistration = adminStudents.filter(
      (item) => !registeredStudentIds.has(item._id),
    );
    const draftResults = adminResults.filter((item) => item.resultStatus !== "published");
    const publishedResults = adminResults.filter((item) => item.resultStatus === "published");

    const warnings = [
      {
        title: "Classes without teachers",
        count: classesWithoutTeachers.length,
        detail:
          classesWithoutTeachers.length > 0
            ? `${classesWithoutTeachers.slice(0, 3).map((item) => item.name).join(", ")}${classesWithoutTeachers.length > 3 ? "..." : ""}`
            : "All classes have class teachers assigned.",
      },
      {
        title: "Subjects without teachers",
        count: subjectsWithoutTeachers.length,
        detail:
          subjectsWithoutTeachers.length > 0
            ? `${subjectsWithoutTeachers.slice(0, 3).map((item) => item.name).join(", ")}${subjectsWithoutTeachers.length > 3 ? "..." : ""}`
            : "All subjects currently have teacher assignments.",
      },
      {
        title: "Teachers without courses",
        count: teachersWithoutCourses.length,
        detail:
          teachersWithoutCourses.length > 0
            ? `${teachersWithoutCourses.slice(0, 3).map((item) => item.name).join(", ")}${teachersWithoutCourses.length > 3 ? "..." : ""}`
            : "Every teacher currently has at least one course.",
      },
      {
        title: "Students without classes",
        count: studentsWithoutClasses.length,
        detail:
          studentsWithoutClasses.length > 0
            ? `${studentsWithoutClasses.slice(0, 3).map((item) => item.name).join(", ")}${studentsWithoutClasses.length > 3 ? "..." : ""}`
            : "All students are attached to classes.",
      },
      {
        title: "Students without registration",
        count: studentsWithoutRegistration.length,
        detail:
          studentsWithoutRegistration.length > 0
            ? `${studentsWithoutRegistration.slice(0, 3).map((item) => item.name).join(", ")}${studentsWithoutRegistration.length > 3 ? "..." : ""}`
            : "All loaded students have course registration records.",
      },
    ].sort((a, b) => b.count - a.count);

    return {
      classesWithoutTeachers,
      subjectsWithoutTeachers,
      teachersWithoutCourses,
      studentsWithoutClasses,
      studentsWithoutRegistration,
      draftResults,
      publishedResults,
      warnings,
      activeWarnings: warnings.filter((item) => item.count > 0),
    };
  }, [adminClasses, adminResults, adminStudents, adminSubjects, adminTeachers, registrations, user?.role]);

  const pageTitle =
    user?.role === "admin"
      ? "Admin Dashboard"
      : user?.role === "teacher"
        ? "Teacher Dashboard"
        : "Student Dashboard";

  const pageDescription =
    user?.role === "admin"
      ? "Run the school from one view with registration control, academic oversight, and system health checks."
      : user?.role === "teacher"
        ? "See your assigned courses, registered students, and result-entry workload for the current session."
        : "See your course registration progress, current session details, and published results at a glance.";

  if (loading) {
    return (
      <div className="space-y-6 rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-7">
          <Skeleton className="h-72 lg:col-span-4" />
          <Skeleton className="h-72 lg:col-span-3" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 rounded-xl border border-border bg-card p-4 pt-4 shadow-sm sm:p-6 lg:p-8 lg:pt-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <Badge
            variant="outline"
            className="gap-2 border-accent bg-accent-soft px-3 py-1 text-xs font-medium text-foreground"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {statsData.currentAcademicYear || "Current Session Not Set"}
          </Badge>
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{pageTitle}</h2>
            <p className="text-muted-foreground">
              Welcome back, {user?.name}. {pageDescription}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {user?.role === "admin" && (
            <>
              <Button className="w-full sm:w-auto" onClick={() => navigate("/users/students")}>Manage Students</Button>
              <Button className="w-full sm:w-auto" variant="outline" onClick={() => navigate("/classes")}>
                Manage Classes
              </Button>
            </>
          )}
          {user?.role === "teacher" && (
            <>
              <Button className="w-full sm:w-auto" onClick={() => navigate("/results")}>Enter Results</Button>
              <Button className="w-full sm:w-auto" variant="outline" onClick={() => navigate("/settings/profile")}>
                Update Profile
              </Button>
            </>
          )}
          {user?.role === "student" && (
            <>
              <Button className="w-full sm:w-auto" onClick={() => navigate("/course-registration")}>Register Courses</Button>
              <Button className="w-full sm:w-auto" variant="outline" onClick={() => navigate("/results")}>
                View Results
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardStats role={user?.role || "student"} data={statsData} />
      </div>

      {user?.role === "admin" && adminHealth && (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-7">
            <Card className="border-border bg-card shadow-sm lg:col-span-4">
              <CardHeader>
                <CardTitle>Admin Control Center</CardTitle>
                <CardDescription>
                  See the parts of the school operation that need attention right now.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-surface-muted p-4">
                  <p className="text-sm text-muted-foreground">Registrations This Session</p>
                  <p className="mt-2 text-2xl font-bold">{statsData.pendingRegistrations || 0}</p>
                </div>
                <div className="rounded-lg border border-border bg-surface-muted p-4">
                  <p className="text-sm text-muted-foreground">Draft Results Waiting</p>
                  <p className="mt-2 text-2xl font-bold">{adminHealth.draftResults.length}</p>
                </div>
                <div className="rounded-lg border border-border bg-surface-muted p-4">
                  <p className="text-sm text-muted-foreground">Published Results</p>
                  <p className="mt-2 text-2xl font-bold">{adminHealth.publishedResults.length}</p>
                </div>
                <div className="rounded-lg border border-border bg-surface-muted p-4">
                  <p className="text-sm text-muted-foreground">System Health Warnings</p>
                  <p className="mt-2 text-2xl font-bold">{adminHealth.activeWarnings.length}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-sm lg:col-span-3">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Jump straight to the areas admins use most often.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="ghost" className="w-full justify-between rounded-full border border-border bg-surface-muted text-foreground hover:bg-accent-soft" onClick={() => navigate("/users/teachers")}>
                  Check Teacher Assignments
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="ghost" className="w-full justify-between rounded-full border border-border bg-surface-muted text-foreground hover:bg-accent-soft" onClick={() => navigate("/subjects")}>
                  Review Courses
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="ghost" className="w-full justify-between rounded-full border border-border bg-surface-muted text-foreground hover:bg-accent-soft" onClick={() => navigate("/results")}>
                  Review Result Status
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="ghost" className="w-full justify-between rounded-full border border-border bg-surface-muted text-foreground hover:bg-accent-soft" onClick={() => navigate("/settings/academic-years")}>
                  Manage Academic Session
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-7">
            <Card className="border-border bg-card shadow-sm lg:col-span-4">
              <CardHeader>
                <CardTitle>Attention Needed</CardTitle>
                <CardDescription>
                  These are the school setup or academic issues the admin should resolve first.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {adminHealth.activeWarnings.length === 0 ? (
                  <div className="rounded-lg border border-border bg-surface-muted p-4 text-sm text-muted-foreground">
                    Everything looks healthy right now. Classes, teachers, students, and registrations are properly connected.
                  </div>
                ) : (
                  adminHealth.activeWarnings.map((warning) => (
                    <div key={warning.title} className="rounded-lg border border-border bg-surface-muted p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-1">
                          <p className="font-semibold text-foreground">{warning.title}</p>
                          <p className="text-sm text-muted-foreground">{warning.detail}</p>
                        </div>
                        <Badge className="bg-accent-soft text-foreground hover:bg-accent-soft">
                          {warning.count}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-sm lg:col-span-3">
              <CardHeader>
                <CardTitle>Result Oversight</CardTitle>
                <CardDescription>
                  Keep track of what is still waiting for academic release.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {adminHealth.draftResults.length === 0 ? (
                  <div className="rounded-lg border border-border bg-surface-muted p-4 text-sm text-muted-foreground">
                    No draft results are currently waiting. Teachers have either not entered scores yet or results are already published.
                  </div>
                ) : (
                  adminHealth.draftResults.slice(0, 5).map((item) => (
                    <div key={item._id} className="rounded-lg border border-border bg-surface-muted p-3">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-medium">{item.student?.name || "Unknown Student"}</p>
                          <p className="text-sm text-muted-foreground">{item.subject?.name || "Unknown Course"}</p>
                        </div>
                        <Badge className="brand-status-pending">Draft</Badge>
                      </div>
                    </div>
                  ))
                )}
                <Button variant="ghost" className="w-full justify-between rounded-full border border-border bg-surface-muted text-foreground hover:bg-accent-soft" onClick={() => navigate("/results")}>
                  Open Full Result Oversight
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle>School Health Summary</CardTitle>
              <CardDescription>
                A quick operational view of assignment gaps that can slow down teaching and student progress.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <div className="rounded-lg border border-border bg-surface-muted p-4">
                <div className="flex items-center gap-2 text-foreground"><TriangleAlert className="h-4 w-4" /><p className="text-sm font-semibold">Classes Without Teachers</p></div>
                <p className="mt-3 text-2xl font-bold text-foreground">{adminHealth.classesWithoutTeachers.length}</p>
              </div>
              <div className="rounded-lg border border-border bg-surface-muted p-4">
                <div className="flex items-center gap-2 text-foreground"><TriangleAlert className="h-4 w-4" /><p className="text-sm font-semibold">Subjects Without Teachers</p></div>
                <p className="mt-3 text-2xl font-bold text-foreground">{adminHealth.subjectsWithoutTeachers.length}</p>
              </div>
              <div className="rounded-lg border border-border bg-surface-muted p-4">
                <div className="flex items-center gap-2 text-foreground"><TriangleAlert className="h-4 w-4" /><p className="text-sm font-semibold">Teachers Without Courses</p></div>
                <p className="mt-3 text-2xl font-bold text-foreground">{adminHealth.teachersWithoutCourses.length}</p>
              </div>
              <div className="rounded-lg border border-border bg-surface-muted p-4">
                <div className="flex items-center gap-2 text-foreground"><TriangleAlert className="h-4 w-4" /><p className="text-sm font-semibold">Students Without Classes</p></div>
                <p className="mt-3 text-2xl font-bold text-foreground">{adminHealth.studentsWithoutClasses.length}</p>
              </div>
              <div className="rounded-lg border border-border bg-surface-muted p-4">
                <div className="flex items-center gap-2 text-foreground"><TriangleAlert className="h-4 w-4" /><p className="text-sm font-semibold">Students Without Registration</p></div>
                <p className="mt-3 text-2xl font-bold text-foreground">{adminHealth.studentsWithoutRegistration.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {user?.role === "teacher" && (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-7">
            <Card className="border-border bg-card shadow-sm lg:col-span-4">
              <CardHeader>
                <CardTitle>My Courses</CardTitle>
                <CardDescription>
                  These are the courses assigned to you, including the classes they belong to and how many students have registered for them.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-border bg-surface-muted p-4">
                    <p className="text-sm text-muted-foreground">Assigned Courses</p>
                    <p className="mt-2 text-2xl font-bold">{teacherCourseDetails.length}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-surface-muted p-4">
                    <p className="text-sm text-muted-foreground">Students In My Courses</p>
                    <p className="mt-2 text-2xl font-bold">{teacherRegisteredStudents.length}</p>
                  </div>
                </div>

                {teacherCourseDetails.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border bg-surface-muted p-4 text-sm text-muted-foreground">
                    No course assignment yet. Once an admin assigns courses to this teacher, they will appear here.
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {teacherCourseDetails.map((course) => (
                      <div key={course.subject._id} className="rounded-lg border border-border bg-surface-muted p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="font-semibold text-foreground">{course.subject.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {course.subject.code} • {course.classes.length} class{course.classes.length === 1 ? "" : "es"}
                            </p>
                          </div>
                          <Badge variant="outline">{course.students.length} student{course.students.length === 1 ? "" : "s"}</Badge>
                        </div>
                        <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                          <p>
                            Classes: {course.classes.length > 0 ? course.classes.map((item) => item.name).join(", ") : "Not attached to any class yet"}
                          </p>
                          <p>
                            Registered students: {course.students.length > 0 ? "Ready for score entry" : "No student registration yet"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-sm lg:col-span-3">
              <CardHeader>
                <CardTitle>Teaching Focus</CardTitle>
                <CardDescription>See where to focus first before entering results.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-lg border border-border bg-surface-muted p-3">
                  <p className="font-medium">Current Session</p>
                  <p className="text-sm text-muted-foreground">{statsData.currentAcademicYear || "Not set"}</p>
                </div>
                <div className="rounded-lg border border-border bg-surface-muted p-3">
                  <p className="font-medium">Pending Registrations</p>
                  <p className="text-sm text-muted-foreground">
                    {statsData.pendingRegistrations || 0} student registration record(s) exist for this session.
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-surface-muted p-3">
                  <p className="font-medium">Largest Teaching Load</p>
                  <p className="text-sm text-muted-foreground">
                    {teacherLargestCourse
                      ? `${teacherLargestCourse.subject.name} with ${teacherLargestCourse.students.length} registered student(s).`
                      : "No registered students in your courses yet."}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  className="w-full justify-between rounded-full border border-border bg-surface-muted text-foreground hover:bg-accent-soft"
                  onClick={() => navigate("/results")}
                >
                  Go To Result Entry
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle>Registered Students In My Courses</CardTitle>
              <CardDescription>
                A normal teacher should be able to quickly see which students are already registered under each assigned course.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {teacherCourseDetails.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border bg-surface-muted p-6 text-sm text-muted-foreground">
                  Your student list will appear here after courses are assigned and students register for them.
                </div>
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                  {teacherCourseDetails.map((course) => (
                    <div key={course.subject._id} className="rounded-lg border border-border bg-surface-muted p-4">
                      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold text-foreground">{course.subject.name}</p>
                          <p className="text-sm text-muted-foreground">{course.subject.code}</p>
                        </div>
                        <Badge variant="outline">{course.students.length}</Badge>
                      </div>
                      {course.students.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No registered students for this course yet.</p>
                      ) : (
                        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                          {course.students.slice(0, 10).map((student) => (
                            <Badge key={student._id} variant="secondary" className="rounded-full px-3 py-1">
                              {student.name}
                            </Badge>
                          ))}
                          {course.students.length > 10 && (
                            <Badge variant="outline">+{course.students.length - 10} more</Badge>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

            {user?.role === "student" && studentDashboardState && (
        <div className="space-y-5">
          <Card className="overflow-hidden border-border bg-card shadow-sm">
            <CardContent className="grid gap-6 p-0 lg:grid-cols-12">
              <div className="bg-primary-soft p-6 lg:col-span-7 lg:p-8">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge className={registrationTone(statsData.registrationStatus)}>
                    {registrationLabel(statsData.registrationStatus)}
                  </Badge>
                  <Badge variant="outline" className="border-border bg-card text-foreground">
                    {statsData.currentAcademicYear || "Current session not set"}
                  </Badge>
                </div>
                <div className="mt-5 max-w-2xl space-y-3">
                  <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                    Student Command Center
                  </p>
                  <h3 className="text-xl font-semibold tracking-tight text-foreground">
                    Everything important about your school progress lives here.
                  </h3>
                  <p className="text-sm leading-6 text-muted-foreground sm:text-base">
                    Track registration, know your next action, and keep an eye on your published academic performance from one modern dashboard.
                  </p>
                </div>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Button onClick={() => navigate(studentDashboardState.nextStep.actionPath)} className="w-full rounded-full sm:w-auto">
                    {studentDashboardState.nextStep.actionLabel}
                  </Button>
                  {studentDashboardState.nextStep.actionPath !== "/results" && (
                    <Button
                      variant="outline"
                      className="w-full rounded-full border-border bg-card text-foreground hover:bg-surface-muted sm:w-auto"
                      onClick={() => navigate("/results")}
                    >
                      Open Results
                    </Button>
                  )}
                </div>
              </div>
              <div className="grid gap-3 p-6 lg:col-span-5 lg:grid-cols-2 lg:p-8">
                <div className="rounded-lg border border-border bg-surface-muted p-4">
                  <p className="text-sm text-muted-foreground">GPA</p>
                  <p className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">{studentResults?.summary?.gpa?.toFixed(2) || "0.00"}</p>
                </div>
                <div className="rounded-lg border border-border bg-surface-muted p-4">
                  <p className="text-sm text-muted-foreground">Published Results</p>
                  <p className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">{studentDashboardState.publishedResultsCount}</p>
                </div>
                <div className="rounded-lg border border-border bg-surface-muted p-4">
                  <p className="text-sm text-muted-foreground">Selected Courses</p>
                  <p className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">{studentDashboardState.totalSelectedCourses}</p>
                </div>
                <div className="rounded-lg border border-border bg-surface-muted p-4">
                  <p className="text-sm text-muted-foreground">Passed Courses</p>
                  <p className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">{studentDashboardState.passedCourses}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 xl:grid-cols-12">
            <Card className="border-border bg-card shadow-sm xl:col-span-4">
              <CardHeader>
                <CardTitle>Registration Journey</CardTitle>
                <CardDescription>
                  Follow the key steps between course selection and published results.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {studentDashboardState.checklist.map((item) => (
                  <div key={item.label} className="rounded-lg border border-border bg-surface-muted p-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-medium text-foreground">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.help}</p>
                      </div>
                      <Badge className={item.done ? "brand-status-approved" : "brand-status-pending"}>
                        {item.done ? "Done" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-sm xl:col-span-4">
              <CardHeader>
                <CardTitle>Academic Focus</CardTitle>
                <CardDescription>
                  A clearer picture of how your published scores are shaping up.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-border bg-surface-muted p-4">
                    <p className="text-sm text-muted-foreground">Needs Attention</p>
                    <p className="mt-2 text-2xl font-bold text-foreground">{studentDashboardState.failedCourses}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-surface-muted p-4">
                    <p className="text-sm text-muted-foreground">Quality Points</p>
                    <p className="mt-2 text-2xl font-bold text-foreground">{studentResults?.summary?.totalQualityPoints || 0}</p>
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-surface-muted p-4">
                  <p className="text-sm text-muted-foreground">Best Performing Course</p>
                  <p className="mt-2 text-lg font-bold text-foreground">
                    {studentDashboardState.strongestCourse
                      ? `${studentDashboardState.strongestCourse.subject?.name || "Unknown Course"} (${studentDashboardState.strongestCourse.totalScore})`
                      : "No published course result yet"}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-surface-muted p-4">
                  <p className="text-sm text-muted-foreground">Course To Review First</p>
                  <p className="mt-2 text-lg font-bold text-foreground">
                    {studentDashboardState.courseNeedingAttention
                      ? `${studentDashboardState.courseNeedingAttention.subject?.name || "Unknown Course"} (${studentDashboardState.courseNeedingAttention.totalScore})`
                      : "No result data yet"}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {studentDashboardState.courseNeedingAttention
                      ? "This is your lowest published score right now, so it is the best place to focus extra reading time."
                      : "Once your results are published, this card will point out where you should focus first."}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-sm xl:col-span-4">
              <CardHeader>
                <CardTitle>Current Snapshot</CardTitle>
                <CardDescription>
                  The information students usually need most during the session.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-lg border border-accent bg-accent-soft p-4">
                  <p className="text-sm font-semibold text-foreground">Next Step</p>
                  <p className="mt-2 text-lg font-bold text-foreground">{studentDashboardState.nextStep.title}</p>
                  <p className="mt-2 text-sm text-foreground">{studentDashboardState.nextStep.detail}</p>
                </div>
                <div className="rounded-lg border border-border bg-surface-muted p-4">
                  <p className="text-sm text-muted-foreground">Class</p>
                  <p className="mt-2 text-lg font-bold text-foreground">{statsData.studentClassName || "Not assigned"}</p>
                </div>
                <div className="rounded-lg border border-border bg-surface-muted p-4">
                  <p className="text-sm text-muted-foreground">Registered Course List</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {studentSelectedCourses.length === 0 ? (
                      <span className="text-sm text-muted-foreground">No course registration submitted yet.</span>
                    ) : (
                      studentSelectedCourses.map((item) => (
                        <Badge key={item._id} variant="outline">{item.code}</Badge>
                      ))
                    )}
                  </div>
                </div>
                {availableStudentCourses === 0 && (
                  <div className="rounded-lg border border-dashed border-border bg-surface-muted p-4 text-sm text-muted-foreground">
                    Your class does not have any available courses yet. Contact the system administrator.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle>Latest Published Results</CardTitle>
              <CardDescription>
                Your most recent released scores, kept visible in a more modern card view.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentStudentResults.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border bg-surface-muted p-6 text-sm text-muted-foreground">
                  No published results yet. Once your teachers submit scores and the admin publishes them, they will appear here.
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {recentStudentResults.map((item) => (
                    <div key={item._id} className="rounded-lg border border-border bg-surface-muted p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-semibold text-foreground">{item.subject?.name}</p>
                          <p className="text-sm text-muted-foreground">{item.subject?.code}</p>
                        </div>
                        <Badge variant={item.grade === "F" ? "destructive" : "secondary"}>{item.grade}</Badge>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                        <div className="rounded-xl bg-card p-2 text-center">
                          <p className="text-muted-foreground">CA</p>
                          <p className="font-semibold">{item.caScore}</p>
                        </div>
                        <div className="rounded-xl bg-card p-2 text-center">
                          <p className="text-muted-foreground">Exam</p>
                          <p className="font-semibold">{item.examScore}</p>
                        </div>
                        <div className="rounded-xl bg-card p-2 text-center">
                          <p className="text-muted-foreground">Total</p>
                          <p className="font-semibold">{item.totalScore}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>      )}
    </div>
  );
}















