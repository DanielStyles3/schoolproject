import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/AuthProvider";
import { api } from "@/lib/api";
import type { Class, courseRegistration, resultRecord, user as UserRecord } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileSpreadsheet, Loader2, Sparkles, Target, TrendingUp, TriangleAlert } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface ResultSummary {
  totalCourses: number;
  totalUnits: number;
  totalQualityPoints: number;
  gpa: number;
}

interface BulkScoreRow {
  caScore: string;
  examScore: string;
}

const normalizeScore = (value?: string) => value?.trim() || "";

export default function Results() {
  const { user, year } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [results, setResults] = useState<resultRecord[]>([]);
  const [registrations, setRegistrations] = useState<courseRegistration[]>([]);
  const [summary, setSummary] = useState<ResultSummary | null>(null);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [bulkScores, setBulkScores] = useState<Record<string, BulkScoreRow>>({});

  const fetchClasses = async () => {
    const { data } = await api.get("/classes");
    setClasses(data.classes || []);
  };

  const fetchResults = async (classId?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (classId) params.set("classId", classId);
      if (year?._id) params.set("academicYearId", year._id);
      const query = params.toString() ? `?${params.toString()}` : "";
      const { data } = await api.get(`/results${query}`);
      if (user?.role === "student") {
        setResults(data.results || []);
        setSummary(data.summary || null);
      } else {
        setResults(data || []);
        setSummary(null);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load results");
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async (classId?: string) => {
    if (!classId || user?.role === "student") {
      setRegistrations([]);
      return;
    }

    try {
      const params = new URLSearchParams({ classId });
      if (year?._id) {
        params.set("academicYearId", year._id);
      }
      const { data } = await api.get(`/course-registrations?${params.toString()}`);
      setRegistrations(data.registrations || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load registered courses");
      setRegistrations([]);
    }
  };

  useEffect(() => {
    if (!user) {
      return;
    }

    if (user.role === "student") {
      fetchResults();
      return;
    }

    Promise.all([fetchClasses(), fetchResults()]).catch((error) => {
      console.error(error);
      toast.error("Failed to initialize result management");
      setLoading(false);
    });
  }, [user, year?._id]);

  useEffect(() => {
    if (user?.role !== "student") {
      Promise.all([fetchResults(selectedClass), fetchRegistrations(selectedClass)]).catch((error) => {
        console.error(error);
        toast.error("Failed to refresh results");
      });
    }
  }, [selectedClass, user?.role, year?._id]);

  const activeClass = useMemo(
    () => classes.find((item) => item._id === selectedClass) || null,
    [classes, selectedClass],
  );

  const teacherAssignedIds = new Set((user?.teacherSubjects || []).map((item) => item._id));
  const availableSubjects =
    user?.role === "teacher"
      ? (activeClass?.subjects || []).filter((item) => teacherAssignedIds.has(item._id))
      : activeClass?.subjects || [];

  const registeredStudentsBySubject = useMemo(() => {
    const bySubject = new Map<string, UserRecord[]>();

    registrations.forEach((registration) => {
      const registrationSubjects = registration.subjects || [];
      const student = registration.student;

      if (!student) {
        return;
      }

      registrationSubjects.forEach((subject) => {
        const existing = bySubject.get(subject._id) || [];
        if (!existing.some((item) => item._id === student._id)) {
          existing.push(student);
        }
        bySubject.set(subject._id, existing);
      });
    });

    return bySubject;
  }, [registrations]);

  const availableStudents = useMemo(() => {
    if (!selectedClass || !selectedSubject) {
      return [];
    }

    return registeredStudentsBySubject.get(selectedSubject) || [];
  }, [registeredStudentsBySubject, selectedClass, selectedSubject]);

  useEffect(() => {
    if (selectedSubject && !availableSubjects.some((item) => item._id === selectedSubject)) {
      setSelectedSubject("");
    }
  }, [availableSubjects, selectedSubject]);

  const selectedSubjectResults = useMemo(() => {
    if (!selectedSubject) {
      return [];
    }

    return results.filter((item) => item.subject?._id === selectedSubject);
  }, [results, selectedSubject]);

  const savedScoreMap = useMemo(() => {
    const nextMap: Record<string, BulkScoreRow> = {};
    selectedSubjectResults.forEach((item) => {
      if (item.student?._id) {
        nextMap[item.student._id] = {
          caScore: String(item.caScore ?? 0),
          examScore: String(item.examScore ?? 0),
        };
      }
    });
    return nextMap;
  }, [selectedSubjectResults]);

  useEffect(() => {
    if (!selectedSubject || user?.role === "student") {
      setBulkScores({});
      return;
    }

    const nextRows: Record<string, BulkScoreRow> = {};
    availableStudents.forEach((student) => {
      nextRows[student._id] = savedScoreMap[student._id]
        ? { ...savedScoreMap[student._id] }
        : { caScore: "", examScore: "" };
    });
    setBulkScores(nextRows);
  }, [availableStudents, savedScoreMap, selectedSubject, user?.role]);

  const updateBulkScore = (studentId: string, field: keyof BulkScoreRow, value: string) => {
    setBulkScores((current) => ({
      ...current,
      [studentId]: {
        ...(current[studentId] || { caScore: "", examScore: "" }),
        [field]: value,
      },
    }));
  };

  const resetRow = (studentId: string) => {
    setBulkScores((current) => ({
      ...current,
      [studentId]: savedScoreMap[studentId]
        ? { ...savedScoreMap[studentId] }
        : { caScore: "", examScore: "" },
    }));
  };

  const changedRows = useMemo(() => {
    return availableStudents.filter((student) => {
      const current = bulkScores[student._id] || { caScore: "", examScore: "" };
      const saved = savedScoreMap[student._id] || { caScore: "", examScore: "" };
      return (
        normalizeScore(current.caScore) !== normalizeScore(saved.caScore) ||
        normalizeScore(current.examScore) !== normalizeScore(saved.examScore)
      );
    });
  }, [availableStudents, bulkScores, savedScoreMap]);

  const publishableResults = useMemo(
    () => selectedSubjectResults.filter((item) => item.resultStatus !== "published"),
    [selectedSubjectResults],
  );

  const publishedResults = useMemo(
    () => selectedSubjectResults.filter((item) => item.resultStatus === "published"),
    [selectedSubjectResults],
  );

  const saveBulkResults = async () => {
    if (!selectedSubject || availableStudents.length === 0) {
      toast.error("Select a class and course with registered students first");
      return;
    }

    const payloadRows = changedRows
      .map((student) => ({
        studentId: student._id,
        caScore: normalizeScore(bulkScores[student._id]?.caScore),
        examScore: normalizeScore(bulkScores[student._id]?.examScore),
      }))
      .filter((item) => item.caScore !== "" || item.examScore !== "");

    if (changedRows.length === 0) {
      toast.error("There are no unsaved score changes yet");
      return;
    }

    if (payloadRows.length === 0) {
      toast.error("Enter at least one CA or exam score in the changed rows before saving");
      return;
    }

    const invalidRow = payloadRows.find(
      (item) =>
        Number(item.caScore) < 0 ||
        Number(item.caScore) > 40 ||
        Number(item.examScore) < 0 ||
        Number(item.examScore) > 60,
    );

    if (invalidRow) {
      toast.error("CA must be between 0 and 40, and exam must be between 0 and 60");
      return;
    }

    try {
      setSaving(true);
      await Promise.all(
        payloadRows.map((item) =>
          api.post("/results", {
            studentId: item.studentId,
            subjectId: selectedSubject,
            academicYearId: year?._id,
            caScore: Number(item.caScore || 0),
            examScore: Number(item.examScore || 0),
          }),
        ),
      );
      toast.success(`Saved ${payloadRows.length} updated result record(s)`);
      await fetchResults(selectedClass);
    } catch (error: any) {
      console.error(error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to save bulk results";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const publishSelectedResults = async () => {
    if (!selectedClass || !selectedSubject) {
      toast.error("Select a class and course first");
      return;
    }

    if (changedRows.length > 0) {
      toast.error("Save your score changes before publishing results");
      return;
    }

    if (publishableResults.length === 0) {
      toast.error("There are no draft results left to publish for this course");
      return;
    }

    try {
      setPublishing(true);
      const response = await api.patch("/results/publish", {
        classId: selectedClass,
        subjectId: selectedSubject,
        academicYearId: year?._id,
      });
      toast.success(response.data?.message || "Results published successfully");
      await fetchResults(selectedClass);
    } catch (error: any) {
      console.error(error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to publish results";
      toast.error(message);
    } finally {
      setPublishing(false);
    }
  };

  const teacherSummary = useMemo(() => {
    if (user?.role === "student") return null;
    return {
      totalRecords: results.length,
      averageScore:
        results.length > 0
          ? Math.round(
              results.reduce((sum, item) => sum + (item.totalScore || 0), 0) / results.length,
            )
          : 0,
      passes: results.filter((item) => item.grade !== "F").length,
      fails: results.filter((item) => item.grade === "F").length,
    };
  }, [results, user?.role]);

  const teacherSelectedSubject = useMemo(
    () => availableSubjects.find((item) => item._id === selectedSubject) || null,
    [availableSubjects, selectedSubject],
  );

  const teacherFlowState = useMemo(() => {
    if (user?.role === "student") {
      return null;
    }

    if (!selectedClass) {
      return {
        title: "Choose a class first",
        detail: "Start by choosing the class whose results you want to work on.",
      };
    }

    if (!selectedSubject) {
      return {
        title: "Choose a course next",
        detail: "After picking a class, select one of your assigned courses for that class.",
      };
    }

    if (availableStudents.length === 0) {
      return {
        title: "No registered students yet",
        detail: "Students must register this course before you can enter their scores.",
      };
    }

    if (changedRows.length > 0) {
      return {
        title: "Save draft scores",
        detail: "You have unsaved score changes. Save them as drafts before publishing.",
      };
    }

    if (publishableResults.length > 0) {
      return {
        title: "Publish when ready",
        detail: "Draft scores are saved. Publish this course when you are satisfied with the entries.",
      };
    }

    return {
      title: "Results are up to date",
      detail: "This class and course currently have no unsaved score changes left.",
    };
  }, [availableStudents.length, changedRows.length, publishableResults.length, selectedClass, selectedSubject, user?.role]);

  const studentResultInsights = useMemo(() => {
    if (user?.role !== "student") {
      return null;
    }

    const strongest = results.reduce<resultRecord | null>((best, item) => {
      if (!best || (item.totalScore || 0) > (best.totalScore || 0)) {
        return item;
      }
      return best;
    }, null);

    const weakest = results.reduce<resultRecord | null>((low, item) => {
      if (!low || (item.totalScore || 0) < (low.totalScore || 0)) {
        return item;
      }
      return low;
    }, null);

    return {
      averageScore:
        results.length > 0
          ? Math.round(results.reduce((sum, item) => sum + (item.totalScore || 0), 0) / results.length)
          : 0,
      passedCourses: results.filter((item) => item.grade !== "F").length,
      coursesNeedingAttention: results.filter((item) => item.grade === "F").length,
      meritCourses: results.filter((item) => (item.totalScore || 0) >= 70).length,
      strongest,
      weakest,
    };
  }, [results, user?.role]);

  const noClassesAvailable = user?.role !== "student" && classes.length === 0;
  const noRegistrationsInClass = Boolean(selectedClass) && registrations.length === 0;
  const noCoursesInClass = Boolean(selectedClass) && activeClass && activeClass.subjects.length === 0;
  const teacherHasNoCoursesInClass =
    user?.role === "teacher" && Boolean(selectedClass) && availableSubjects.length === 0;
  const noStudentsForSelectedCourse = Boolean(selectedSubject) && availableStudents.length === 0;

  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-[1.5rem] border border-[#E8F5EE] bg-white/70 p-6 text-[#4B5563] shadow-[0_18px_35px_rgba(0,132,61,0.05)]">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        Loading results and score summaries...
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-[2rem] border border-[#E8F5EE] bg-white/60 p-4 shadow-[0_24px_50px_rgba(0,132,61,0.05)] backdrop-blur-sm sm:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#111111] sm:text-3xl">Results</h1>
        <p className="text-muted-foreground">
          {user?.role === "student"
            ? "View your published academic results."
            : "Enter, save, and publish results for students registered in your assigned courses."}
        </p>
      </div>

      {user?.role === "student" && studentResultInsights && (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="overflow-hidden border-[#E8F5EE] bg-white shadow-sm lg:col-span-2">
            <CardContent className="grid gap-6 p-0 lg:grid-cols-12">
              <div className="bg-[linear-gradient(135deg,#E8F5EE_0%,#FFF9CC_100%)] p-6 lg:col-span-7 lg:p-8">
                <div className="flex items-center gap-2 text-[#4B5563]">
                  <Sparkles className="h-4 w-4" />
                  <p className="text-sm font-medium uppercase tracking-[0.18em]">Published Academic Record</p>
                </div>
                <h2 className="mt-5 text-2xl font-bold tracking-tight text-[#111111] sm:text-3xl">
                  A cleaner view of your academic progress.
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#4B5563] sm:text-base">
                  Check your GPA, strongest course, revision priority, and every published score from one student dashboard.
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[1.5rem] border border-[#E8F5EE] bg-white/80 p-4">
                    <p className="text-sm text-muted-foreground">GPA</p>
                    <p className="mt-2 text-2xl font-bold text-[#111111] sm:text-3xl">{summary?.gpa?.toFixed(2) || "0.00"}</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-[#E8F5EE] bg-white/80 p-4">
                    <p className="text-sm text-muted-foreground">Total Units</p>
                    <p className="mt-2 text-2xl font-bold text-[#111111] sm:text-3xl">{summary?.totalUnits || 0}</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-[#E8F5EE] bg-white/80 p-4">
                    <p className="text-sm text-muted-foreground">Average Score</p>
                    <p className="mt-2 text-2xl font-bold text-[#111111] sm:text-3xl">{studentResultInsights.averageScore}</p>
                  </div>
                </div>
              </div>
              <div className="grid gap-3 p-6 lg:col-span-5 lg:grid-cols-2 lg:p-8">
                <div className="rounded-[1.5rem] border border-[#E8F5EE] bg-[#E8F5EE] p-4">
                  <p className="text-sm text-muted-foreground">Published Courses</p>
                  <p className="mt-2 text-2xl font-bold text-[#111111] sm:text-3xl">{summary?.totalCourses || 0}</p>
                </div>
                <div className="rounded-[1.5rem] border border-[#E8F5EE] bg-[#E8F5EE] p-4">
                  <p className="text-sm text-muted-foreground">Passed Courses</p>
                  <p className="mt-2 text-2xl font-bold text-[#111111] sm:text-3xl">{studentResultInsights.passedCourses}</p>
                </div>
                <div className="rounded-[1.5rem] border border-[#E8F5EE] bg-[#E8F5EE] p-4">
                  <p className="text-sm text-muted-foreground">Merit Scores</p>
                  <p className="mt-2 text-2xl font-bold text-[#111111] sm:text-3xl">{studentResultInsights.meritCourses}</p>
                </div>
                <div className="rounded-[1.5rem] border border-[#E8F5EE] bg-[#E8F5EE] p-4">
                  <p className="text-sm text-muted-foreground">Need Attention</p>
                  <p className="mt-2 text-2xl font-bold text-[#111111] sm:text-3xl">{studentResultInsights.coursesNeedingAttention}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E8F5EE] bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Performance Highlights</CardTitle>
              <CardDescription>Your current strongest and weakest published signals.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-2xl border border-[#E8F5EE] bg-[#E8F5EE] p-4">
                <div className="flex items-center gap-2 text-[#111111]"><TrendingUp className="h-4 w-4" /><p className="text-sm font-medium">Strongest Course</p></div>
                <p className="mt-3 text-lg font-bold text-[#111111]">
                  {studentResultInsights.strongest
                    ? `${studentResultInsights.strongest.subject?.name || "Unknown Course"} (${studentResultInsights.strongest.totalScore})`
                    : "No published result yet"}
                </p>
              </div>
              <div className="rounded-2xl border border-[#E8F5EE] bg-[#E8F5EE] p-4">
                <div className="flex items-center gap-2 text-[#111111]"><TriangleAlert className="h-4 w-4" /><p className="text-sm font-medium">Course To Review Again</p></div>
                <p className="mt-3 text-lg font-bold text-[#111111]">
                  {studentResultInsights.weakest
                    ? `${studentResultInsights.weakest.subject?.name || "Unknown Course"} (${studentResultInsights.weakest.totalScore})`
                    : "No result data yet"}
                </p>
              </div>
              <div className="rounded-2xl border border-[#E8F5EE] bg-[#E8F5EE] p-4">
                <div className="flex items-center gap-2 text-[#111111]"><Target className="h-4 w-4" /><p className="text-sm font-medium">Quality Points</p></div>
                <p className="mt-3 text-lg font-bold text-[#111111]">{summary?.totalQualityPoints || 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {user?.role !== "student" && teacherSummary && teacherFlowState && (
        <div className="space-y-4">
          <Card className="overflow-hidden border-[#E8F5EE] bg-white shadow-sm">
            <CardContent className="grid gap-6 p-0 lg:grid-cols-12">
              <div className="bg-[linear-gradient(135deg,#E8F5EE_0%,#FFF9CC_100%)] p-6 lg:col-span-7 lg:p-8">
                <div className="flex items-center gap-2 text-[#4B5563]">
                  <Sparkles className="h-4 w-4" />
                  <p className="text-sm font-medium uppercase tracking-[0.18em]">Teacher Result Entry</p>
                </div>
                <h2 className="mt-5 text-2xl font-bold tracking-tight text-[#111111] sm:text-3xl">
                  Enter results only for the classes and courses assigned to you.
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#4B5563] sm:text-base">
                  Choose a class, select your course, record scores, save drafts, and publish only when the class sheet is complete.
                </p>
                <div className="mt-6 rounded-2xl border border-[#FFD600] bg-[#FFF9CC] p-4">
                  <p className="text-sm font-semibold text-[#111111]">Current Step</p>
                  <p className="mt-2 text-lg font-bold text-[#111111]">{teacherFlowState.title}</p>
                  <p className="mt-2 text-sm text-[#111111]">{teacherFlowState.detail}</p>
                </div>
              </div>
              <div className="grid gap-3 p-6 lg:col-span-5 lg:grid-cols-2 lg:p-8">
                <div className="rounded-[1.5rem] border border-[#E8F5EE] bg-[#E8F5EE] p-4">
                  <p className="text-sm text-muted-foreground">Recorded Results</p>
                  <p className="mt-2 text-2xl font-bold text-[#111111] sm:text-3xl">{teacherSummary.totalRecords}</p>
                </div>
                <div className="rounded-[1.5rem] border border-[#E8F5EE] bg-[#E8F5EE] p-4">
                  <p className="text-sm text-muted-foreground">Average Score</p>
                  <p className="mt-2 text-2xl font-bold text-[#111111] sm:text-3xl">{teacherSummary.averageScore}</p>
                </div>
                <div className="rounded-[1.5rem] border border-[#E8F5EE] bg-[#E8F5EE] p-4">
                  <p className="text-sm text-muted-foreground">Published</p>
                  <p className="mt-2 text-2xl font-bold text-[#111111] sm:text-3xl">{publishedResults.length}</p>
                </div>
                <div className="rounded-[1.5rem] border border-[#E8F5EE] bg-[#E8F5EE] p-4">
                  <p className="text-sm text-muted-foreground">Draft Results</p>
                  <p className="mt-2 text-2xl font-bold text-[#111111] sm:text-3xl">{publishableResults.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E8F5EE] bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Pick Class And Course</CardTitle>
              <CardDescription>
                Teachers can only record results for students registered in their own assigned courses.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <Select
                  value={selectedClass}
                  onValueChange={(value) => {
                    setSelectedClass(value);
                    setSelectedSubject("");
                  }}
                >
                  <SelectTrigger className="border-[#E8F5EE] bg-[#E8F5EE] text-[#111111]">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((item) => (
                      <SelectItem key={item._id} value={item._id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={!selectedClass}>
                  <SelectTrigger className="border-[#E8F5EE] bg-[#E8F5EE] text-[#111111]">
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSubjects.map((item) => (
                      <SelectItem key={item._id} value={item._id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="rounded-2xl border border-[#E8F5EE] bg-[#E8F5EE] px-4 py-3">
                  <p className="text-sm text-muted-foreground">Registered Students</p>
                  <p className="mt-1 text-xl font-bold text-[#111111]">{availableStudents.length}</p>
                </div>
                <div className="rounded-2xl border border-[#E8F5EE] bg-[#E8F5EE] px-4 py-3">
                  <p className="text-sm text-muted-foreground">Unsaved Changes</p>
                  <p className="mt-1 text-xl font-bold text-[#111111]">{changedRows.length}</p>
                </div>
                <div className="rounded-2xl border border-[#E8F5EE] bg-[#E8F5EE] px-4 py-3">
                  <p className="text-sm text-muted-foreground">Selected Course</p>
                  <p className="mt-1 text-sm font-bold text-[#111111]">{teacherSelectedSubject?.code || "None yet"}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button onClick={saveBulkResults} disabled={saving || changedRows.length === 0} className="w-full rounded-2xl sm:w-auto">
                  {saving ? "Saving Drafts..." : "Save Changed Scores"}
                </Button>
                <Button
                  onClick={publishSelectedResults}
                  disabled={publishing || !!changedRows.length || publishableResults.length === 0}
                  variant="outline"
                  className="w-full rounded-2xl border-[#00843D] text-[#00843D] hover:bg-[#eff9d6] sm:w-auto"
                >
                  {publishing ? "Publishing..." : "Publish Course Results"}
                </Button>
              </div>
            </CardContent>

            {(noClassesAvailable ||
              noRegistrationsInClass ||
              noCoursesInClass ||
              teacherHasNoCoursesInClass ||
              noStudentsForSelectedCourse) && (
              <CardContent className="pt-0">
                <Empty className="py-8">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <FileSpreadsheet />
                    </EmptyMedia>
                    <EmptyTitle>Result entry needs one more setup step</EmptyTitle>
                    <EmptyDescription>
                      {noClassesAvailable && "No classes have been created yet. Create a class before entering results."}
                      {!noClassesAvailable && noCoursesInClass && "The selected class has no courses attached yet. Add courses to the class first."}
                      {!noClassesAvailable && !noCoursesInClass && noRegistrationsInClass && "No students in this class have registered courses for the current academic year yet."}
                      {!noClassesAvailable && !noCoursesInClass && !noRegistrationsInClass && teacherHasNoCoursesInClass && "You are not assigned to any course in this class yet. Assign this teacher to the course first."}
                      {!noClassesAvailable && !noCoursesInClass && !noRegistrationsInClass && !teacherHasNoCoursesInClass && noStudentsForSelectedCourse && "No registered students were found for the selected course yet."}
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </CardContent>
            )}

            {!!selectedSubject && availableStudents.length > 0 && (
              <CardContent className="space-y-4 pt-0">
                <div className="rounded-2xl border border-[#E8F5EE] bg-[#E8F5EE] p-4 text-sm text-muted-foreground">
                  Save rows as drafts first. Once you publish the course, students will be able to see only the published results.
                </div>
                <div className="overflow-x-auto rounded-[1.25rem] border border-[#E8F5EE]">
                  <Table className="min-w-[760px]">
                    <TableHeader className="bg-[#E8F5EE]">
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>CA Score</TableHead>
                        <TableHead>Exam Score</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {availableStudents.map((student) => {
                        const row = bulkScores[student._id] || { caScore: "", examScore: "" };
                        const saved = savedScoreMap[student._id] || { caScore: "", examScore: "" };
                        const currentResult = selectedSubjectResults.find((item) => item.student?._id === student._id);
                        const total = Number(row.caScore || 0) + Number(row.examScore || 0);
                        const isDirty =
                          normalizeScore(row.caScore) !== normalizeScore(saved.caScore) ||
                          normalizeScore(row.examScore) !== normalizeScore(saved.examScore);
                        const hasAnyInput = normalizeScore(row.caScore) !== "" || normalizeScore(row.examScore) !== "";

                        return (
                          <TableRow key={student._id}>
                            <TableCell className="max-w-[220px] whitespace-normal font-medium">{student.name}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="0"
                                max="40"
                                value={row.caScore}
                                onChange={(event) => updateBulkScore(student._id, "caScore", event.target.value)}
                                className="min-w-[110px] border-[#E8F5EE] bg-white text-[#111111]"
                                placeholder="0 - 40"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="0"
                                max="60"
                                value={row.examScore}
                                onChange={(event) => updateBulkScore(student._id, "examScore", event.target.value)}
                                className="min-w-[110px] border-[#E8F5EE] bg-white text-[#111111]"
                                placeholder="0 - 60"
                              />
                            </TableCell>
                            <TableCell>{total}</TableCell>
                            <TableCell>
                              {isDirty ? (
                                <Badge className="bg-[#FFF4A3] text-[#111111] hover:bg-[#FFF4A3]">Unsaved changes</Badge>
                              ) : currentResult?.resultStatus === "published" ? (
                                <Badge className="brand-status-approved">Published</Badge>
                              ) : currentResult ? (
                                <Badge className="brand-status-pending">Draft saved</Badge>
                              ) : hasAnyInput ? (
                                <Badge variant="outline">Ready to save</Badge>
                              ) : (
                                <Badge variant="outline">Blank</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button type="button" variant="ghost" size="sm" onClick={() => resetRow(student._id)} disabled={!isDirty}>
                                Reset
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}

      <Card className="border-[#E8F5EE] bg-white shadow-sm">
        <CardHeader>
          <CardTitle>{user?.role === "student" ? "Published Results" : "Recorded Results"}</CardTitle>
          <CardDescription>
            {user?.role === "student"
              ? "Your latest published score breakdown across registered courses."
              : "All saved result entries for the current selection."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <Empty className="py-10">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FileSpreadsheet />
                </EmptyMedia>
                <EmptyTitle>No results yet</EmptyTitle>
                <EmptyDescription>
                  {user?.role === "student"
                    ? "Your published results will appear here once your teachers release them."
                    : "Saved results will appear here after score entry."}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="overflow-x-auto rounded-[1.25rem] border border-[#E8F5EE]">
              <Table className="min-w-[760px]">
                <TableHeader className="bg-[#E8F5EE]">
                  <TableRow>
                    {user?.role !== "student" && <TableHead>Student</TableHead>}
                    <TableHead>Course</TableHead>
                    <TableHead>CA</TableHead>
                    <TableHead>Exam</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Result Status</TableHead>
                    <TableHead>Remark</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((item) => (
                    <TableRow key={item._id}>
                      {user?.role !== "student" && <TableCell className="font-medium">{item.student?.name || "-"}</TableCell>}
                      <TableCell>{item.subject?.name || "-"}</TableCell>
                      <TableCell>{item.caScore}</TableCell>
                      <TableCell>{item.examScore}</TableCell>
                      <TableCell>{item.totalScore}</TableCell>
                      <TableCell>
                        <Badge variant={item.grade === "F" ? "destructive" : "secondary"}>{item.grade}</Badge>
                      </TableCell>
                      <TableCell>
                        {item.resultStatus === "published" ? (
                          <Badge className="brand-status-approved">Published</Badge>
                        ) : (
                          <Badge className="brand-status-pending">Draft</Badge>
                        )}
                      </TableCell>
                      <TableCell>{item.remark}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
