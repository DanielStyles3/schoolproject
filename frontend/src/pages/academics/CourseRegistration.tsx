import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/AuthProvider";
import { api } from "@/lib/api";
import type { academicYear, Class, courseRegistration, subject, user } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import PageShell from "@/components/global/PageShell";
import { Info, Loader2, NotebookPen, TriangleAlert } from "lucide-react";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";

interface RegistrationOptionResponse {
  student: user;
  class: Class;
  academicYear: academicYear;
  subjects: subject[];
  registration?: courseRegistration | null;
}

const statusTone = (status?: string) => {
  if (status === "approved") return "brand-status-approved";
  if (status === "submitted") return "brand-status-pending";
  return "brand-status-idle";
};

const statusLabel = (status?: string) => {
  if (status === "approved") return "Approved";
  if (status === "submitted") return "Submitted";
  return "Not Submitted";
};

export default function CourseRegistration() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [registrationOptions, setRegistrationOptions] =
    useState<RegistrationOptionResponse | null>(null);

  const fetchStudentRegistration = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/course-registrations/available");
      setRegistrationOptions(data);
      setSelectedSubjects(data.registration?.subjectIds || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load registration options");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== "student") return;
    fetchStudentRegistration();
  }, [user]);

  const toggleSubject = (subjectId: string, checked: boolean) => {
    setSelectedSubjects((prev) =>
      checked ? Array.from(new Set([...prev, subjectId])) : prev.filter((id) => id !== subjectId),
    );
  };

  const saveRegistration = async () => {
    try {
      setSaving(true);
      await api.post("/course-registrations", {
        subjectIds: selectedSubjects,
      });
      toast.success("Course registration saved successfully");
      await fetchStudentRegistration();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save registration");
    } finally {
      setSaving(false);
    }
  };

  const selectedCourses = useMemo(() => {
    if (!registrationOptions) return [];
    const ids = new Set(selectedSubjects);
    return (registrationOptions.subjects || []).filter((item) => ids.has(item._id));
  }, [registrationOptions, selectedSubjects]);

  const currentRegistrationStatus = registrationOptions?.registration?.status;

  const selectedUnitTotal = useMemo(
    () => selectedCourses.reduce((sum, item) => sum + (item.unit || 0), 0),
    [selectedCourses],
  );

  const availableUnitTotal = useMemo(
    () => (registrationOptions?.subjects || []).reduce((sum, item) => sum + (item.unit || 0), 0),
    [registrationOptions],
  );

  const registrationGuidance = useMemo(() => {
    if (!registrationOptions) {
      return {
        tone: "idle",
        title: "Loading registration guidance",
        detail: "Your class registration setup is still loading.",
      };
    }

    if ((registrationOptions.subjects || []).length === 0) {
      return {
        tone: "warning",
        title: "Courses are not ready yet",
        detail: "Your class does not have any available courses yet. The admin needs to finish the class-course setup.",
      };
    }

    if (selectedSubjects.length === 0) {
      return {
        tone: "idle",
        title: "Start selecting your courses",
        detail: "Choose the subjects you want to register before submitting your session registration.",
      };
    }

    if (selectedUnitTotal > 24) {
      return {
        tone: "warning",
        title: "Heavy course load selected",
        detail: "This selection is quite heavy. Double-check that the total units match what your school expects for the session.",
      };
    }

    if (selectedUnitTotal < 12) {
      return {
        tone: "warning",
        title: "Light course load selected",
        detail: "You may have selected too few units. Make sure you are not missing required courses for your class.",
      };
    }

    if (currentRegistrationStatus === "submitted" || currentRegistrationStatus === "approved") {
      return {
        tone: "success",
        title: "Registration saved",
        detail: "Your selected courses have been saved for the current session.",
      };
    }

    if (false) {
      return {
        tone: "success",
        title: "Registration approved",
        detail: "Your selected courses are approved for the current academic session.",
      };
    }

    return {
      tone: "success",
      title: "Selection looks ready",
      detail: "Your current selection looks balanced enough to submit for review.",
    };
  }, [currentRegistrationStatus, registrationOptions, selectedSubjects.length, selectedUnitTotal]);

  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-6 text-muted-foreground shadow-sm">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        Loading course registration details...
      </div>
    );
  }

  return (
    <PageShell
      title="Course Registration"
      description="Select the courses you want to register for the current academic year."
    >

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border bg-card shadow-sm"><CardHeader><CardTitle>Student</CardTitle></CardHeader><CardContent>{registrationOptions?.student?.name || "N/A"}</CardContent></Card>
        <Card className="border-border bg-card shadow-sm"><CardHeader><CardTitle>Class</CardTitle></CardHeader><CardContent>{registrationOptions?.class?.name || "Not assigned"}</CardContent></Card>
        <Card className="border-border bg-card shadow-sm"><CardHeader><CardTitle>Academic Year</CardTitle></CardHeader><CardContent>{registrationOptions?.academicYear?.name || "Not set"}</CardContent></Card>
        <Card className="border-border bg-card shadow-sm"><CardHeader><CardTitle>Status</CardTitle></CardHeader><CardContent><Badge className={statusTone(registrationOptions?.registration?.status)}>{statusLabel(registrationOptions?.registration?.status)}</Badge></CardContent></Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>Available Courses</CardTitle>
            <CardDescription>
              Your class courses are listed below. Choose the ones you want to register.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className={`border ${registrationGuidance.tone === "warning" ? "border-accent bg-accent-soft text-foreground" : registrationGuidance.tone === "success" ? "border-border bg-surface-muted text-foreground" : "border-border bg-surface-muted text-foreground"}`}>
              {registrationGuidance.tone === "warning" ? <TriangleAlert className="h-4 w-4" /> : <Info className="h-4 w-4" />}
              <AlertTitle>{registrationGuidance.title}</AlertTitle>
              <AlertDescription>{registrationGuidance.detail}</AlertDescription>
            </Alert>

            {(registrationOptions?.subjects || []).length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon"><NotebookPen /></EmptyMedia>
                  <EmptyTitle>No courses available yet</EmptyTitle>
                  <EmptyDescription>
                    Your class does not have any courses attached yet. Contact the administrator to finish the setup.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              (registrationOptions?.subjects || []).map((item) => {
                const checked = selectedSubjects.includes(item._id);
                return (
                  <div key={item._id} className="flex items-center justify-between rounded-lg border border-border bg-surface-muted p-4">
                    <div className="flex items-center gap-3">
                      <Checkbox checked={checked} onCheckedChange={(value) => toggleSubject(item._id, Boolean(value))} />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.code} - {item.unit || 3} unit(s)</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="border-border bg-card text-foreground">
                        {item.unit || 3} unit(s)
                      </Badge>
                      <Badge variant="outline" className="border-border bg-card text-foreground">
                        {item.teacher?.length || 0} lecturer(s)
                      </Badge>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>Registration Summary</CardTitle>
            <CardDescription>Review your selection before submitting it for approval.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-lg border border-border bg-surface-muted p-3"><p className="text-sm text-muted-foreground">Selected Courses</p><p className="mt-2 text-2xl font-bold">{selectedSubjects.length}</p></div>
              <div className="rounded-lg border border-border bg-surface-muted p-3"><p className="text-sm text-muted-foreground">Available Courses</p><p className="mt-2 text-2xl font-bold">{registrationOptions?.subjects?.length || 0}</p></div>
              <div className="rounded-lg border border-border bg-surface-muted p-3"><p className="text-sm text-muted-foreground">Selected Units</p><p className="mt-2 text-2xl font-bold">{selectedUnitTotal}</p></div>
              <div className="rounded-lg border border-border bg-surface-muted p-3"><p className="text-sm text-muted-foreground">Available Units</p><p className="mt-2 text-2xl font-bold">{availableUnitTotal}</p></div>
            </div>

            <div className="rounded-lg border border-border bg-surface-muted p-3">
              <p className="mb-3 text-sm text-muted-foreground">Selected Course Codes</p>
              <div className="flex flex-wrap gap-2">
                {selectedCourses.length === 0 ? (
                  <span className="text-sm text-muted-foreground">No course selected yet.</span>
                ) : (
                  selectedCourses.map((item) => (
                    <Badge key={item._id} variant="outline" className="border-border bg-card text-foreground">{item.code}</Badge>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-surface-muted p-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Submission guide</p>
              <p className="mt-2">
                Select the courses meant for your class, confirm the unit load looks right, then save your registration for the session.
              </p>
              <p className="mt-2">
                A very light or very heavy unit load may mean you missed a required course or selected too many.
              </p>
            </div>

            <Button onClick={saveRegistration} disabled={saving || selectedSubjects.length === 0} className="w-full rounded-full">
              {saving ? "Saving..." : currentRegistrationStatus === "approved" || currentRegistrationStatus === "submitted" ? "Update Registration" : "Save Registration"}
            </Button>
            <p className="text-xs text-muted-foreground">
              {currentRegistrationStatus === "approved"
                ? "Your courses were already approved once. Submitting again will update the record for this session."
                : "Once submitted, the school can review and approve your selection."}
            </p>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}

