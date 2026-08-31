import {
  Users,
  BookOpen,
  GraduationCap,
  School,
  CalendarDays,
  ClipboardCheck,
  FileCheck2,
  BadgeCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminStats {
  totalStudents?: number;
  totalTeachers?: number;
  totalClasses?: number;
  totalSubjects?: number;
  totalResults?: number;
  pendingRegistrations?: number;
  approvedRegistrations?: number;
  currentAcademicYear?: string;
}

interface TeacherStats {
  myClassesCount?: number;
  mySubjectsCount?: number;
  totalStudents?: number;
  resultsEntered?: number;
  pendingRegistrations?: number;
  currentAcademicYear?: string;
}

interface StudentStats {
  totalSubjects?: number;
  availableCourses?: number;
  publishedResultsCount?: number;
  registrationStatus?: string;
  currentAcademicYear?: string;
  studentClassName?: string;
}

type DashboardStatsData = AdminStats & TeacherStats & StudentStats;

interface StatsProps {
  role: string;
  data: DashboardStatsData;
}

const statusLabel = (status?: string) => {
  if (status === "approved" || status === "submitted") return "Registered";
  return "Not Submitted";
};

const statCardClassName =
  "h-full overflow-hidden border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-sm";
const statHeaderClassName =
  "flex flex-row items-center justify-between space-y-0 border-b border-border bg-surface-muted px-4 pb-3 pt-4 sm:px-6";
const statIconClassName = "h-4 w-4 shrink-0 text-primary";
const statValueClassName = "text-2xl font-semibold text-foreground sm:text-3xl";
const statCopyClassName = "text-xs leading-5 text-muted-foreground sm:text-sm";
const statContentClassName = "space-y-2 px-4 pb-4 pt-3 sm:px-6 sm:pb-6";

export function DashboardStats({ role, data }: StatsProps) {
  if (role === "admin") {
    return (
      <>
        <Card className={statCardClassName}><CardHeader className={statHeaderClassName}><CardTitle className="pr-3 text-sm font-semibold text-foreground">Students</CardTitle><Users className={statIconClassName} /></CardHeader><CardContent className={statContentClassName}><div className={statValueClassName}>{data.totalStudents || 0}</div><p className={statCopyClassName}>Registered student accounts</p></CardContent></Card>
        <Card className={statCardClassName}><CardHeader className={statHeaderClassName}><CardTitle className="pr-3 text-sm font-semibold text-foreground">Lecturers</CardTitle><GraduationCap className={statIconClassName} /></CardHeader><CardContent className={statContentClassName}><div className={statValueClassName}>{data.totalTeachers || 0}</div><p className={statCopyClassName}>Teaching staff configured</p></CardContent></Card>
        <Card className={statCardClassName}><CardHeader className={statHeaderClassName}><CardTitle className="pr-3 text-sm font-semibold text-foreground">Courses</CardTitle><BookOpen className={statIconClassName} /></CardHeader><CardContent className={statContentClassName}><div className={statValueClassName}>{data.totalSubjects || 0}</div><p className={statCopyClassName}>Available for registration</p></CardContent></Card>
        <Card className={statCardClassName}><CardHeader className={statHeaderClassName}><CardTitle className="pr-3 text-sm font-semibold text-foreground">Registrations This Session</CardTitle><ClipboardCheck className={statIconClassName} /></CardHeader><CardContent className={statContentClassName}><div className={statValueClassName}>{data.pendingRegistrations || 0}</div><p className={statCopyClassName}>Student course records saved</p></CardContent></Card>
      </>
    );
  }

  if (role === "teacher") {
    return (
      <>
        <Card className={statCardClassName}><CardHeader className={statHeaderClassName}><CardTitle className="pr-3 text-sm font-semibold text-foreground">My Classes</CardTitle><School className={statIconClassName} /></CardHeader><CardContent className={statContentClassName}><div className={statValueClassName}>{data.myClassesCount || 0}</div><p className={statCopyClassName}>Classes under your supervision</p></CardContent></Card>
        <Card className={statCardClassName}><CardHeader className={statHeaderClassName}><CardTitle className="pr-3 text-sm font-semibold text-foreground">My Courses</CardTitle><BookOpen className={statIconClassName} /></CardHeader><CardContent className={statContentClassName}><div className={statValueClassName}>{data.mySubjectsCount || 0}</div><p className={statCopyClassName}>Assigned courses to teach</p></CardContent></Card>
        <Card className={statCardClassName}><CardHeader className={statHeaderClassName}><CardTitle className="pr-3 text-sm font-semibold text-foreground">My Students</CardTitle><Users className={statIconClassName} /></CardHeader><CardContent className={statContentClassName}><div className={statValueClassName}>{data.totalStudents || 0}</div><p className={statCopyClassName}>Students in your classes</p></CardContent></Card>
        <Card className={statCardClassName}><CardHeader className={statHeaderClassName}><CardTitle className="pr-3 text-sm font-semibold text-foreground">Results Entered</CardTitle><FileCheck2 className={statIconClassName} /></CardHeader><CardContent className={statContentClassName}><div className={statValueClassName}>{data.resultsEntered || 0}</div><p className={statCopyClassName}>Saved results this session</p></CardContent></Card>
      </>
    );
  }

  return (
    <>
      <Card className={statCardClassName}><CardHeader className={statHeaderClassName}><CardTitle className="pr-3 text-sm font-semibold text-foreground">Registered Courses</CardTitle><BookOpen className={statIconClassName} /></CardHeader><CardContent className={statContentClassName}><div className={statValueClassName}>{data.totalSubjects || 0}</div><p className={statCopyClassName}>Courses in your current submission</p></CardContent></Card>
      <Card className={statCardClassName}><CardHeader className={statHeaderClassName}><CardTitle className="pr-3 text-sm font-semibold text-foreground">Available Courses</CardTitle><School className={statIconClassName} /></CardHeader><CardContent className={statContentClassName}><div className={statValueClassName}>{data.availableCourses || 0}</div><p className={statCopyClassName}>Courses attached to your class</p></CardContent></Card>
      <Card className={statCardClassName}><CardHeader className={statHeaderClassName}><CardTitle className="pr-3 text-sm font-semibold text-foreground">Results Published</CardTitle><BadgeCheck className={statIconClassName} /></CardHeader><CardContent className={statContentClassName}><div className={statValueClassName}>{data.publishedResultsCount || 0}</div><p className={statCopyClassName}>Recorded course results so far</p></CardContent></Card>
      <Card className={statCardClassName}><CardHeader className={statHeaderClassName}><CardTitle className="pr-3 text-sm font-semibold text-foreground">Registration Status</CardTitle><CalendarDays className={statIconClassName} /></CardHeader><CardContent className={statContentClassName}><div className="text-lg font-semibold text-foreground sm:text-xl">{statusLabel(data.registrationStatus)}</div><p className={statCopyClassName}>Current academic session</p></CardContent></Card>
    </>
  );
}