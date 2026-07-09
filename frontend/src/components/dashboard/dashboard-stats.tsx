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
  "h-full overflow-hidden border-[#E8F5EE] bg-white shadow-[0_16px_32px_rgba(0,132,61,0.07)] transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_42px_rgba(0,132,61,0.10)]";
const statHeaderClassName =
  "flex flex-row items-center justify-between space-y-0 border-b border-[#E8F5EE] bg-[#F5F7FA] px-4 pb-3 pt-4 sm:px-6";
const statIconClassName = "h-4 w-4 shrink-0 text-[#00843D]";
const statValueClassName = "text-2xl font-black text-[#111111] sm:text-3xl";
const statCopyClassName = "text-xs leading-5 text-[#4B5563] sm:text-sm";
const statContentClassName = "space-y-2 px-4 pb-4 pt-3 sm:px-6 sm:pb-6";

export function DashboardStats({ role, data }: StatsProps) {
  if (role === "admin") {
    return (
      <>
        <Card className={statCardClassName}><CardHeader className={statHeaderClassName}><CardTitle className="pr-3 text-sm font-semibold text-[#111111]">Students</CardTitle><Users className={statIconClassName} /></CardHeader><CardContent className={statContentClassName}><div className={statValueClassName}>{data.totalStudents || 0}</div><p className={statCopyClassName}>Registered student accounts</p></CardContent></Card>
        <Card className={statCardClassName}><CardHeader className={statHeaderClassName}><CardTitle className="pr-3 text-sm font-semibold text-[#111111]">Lecturers</CardTitle><GraduationCap className={statIconClassName} /></CardHeader><CardContent className={statContentClassName}><div className={statValueClassName}>{data.totalTeachers || 0}</div><p className={statCopyClassName}>Teaching staff configured</p></CardContent></Card>
        <Card className={statCardClassName}><CardHeader className={statHeaderClassName}><CardTitle className="pr-3 text-sm font-semibold text-[#111111]">Courses</CardTitle><BookOpen className={statIconClassName} /></CardHeader><CardContent className={statContentClassName}><div className={statValueClassName}>{data.totalSubjects || 0}</div><p className={statCopyClassName}>Available for registration</p></CardContent></Card>
        <Card className={statCardClassName}><CardHeader className={statHeaderClassName}><CardTitle className="pr-3 text-sm font-semibold text-[#111111]">Registrations This Session</CardTitle><ClipboardCheck className={statIconClassName} /></CardHeader><CardContent className={statContentClassName}><div className={statValueClassName}>{data.pendingRegistrations || 0}</div><p className={statCopyClassName}>Student course records saved</p></CardContent></Card>
      </>
    );
  }

  if (role === "teacher") {
    return (
      <>
        <Card className={statCardClassName}><CardHeader className={statHeaderClassName}><CardTitle className="pr-3 text-sm font-semibold text-[#111111]">My Classes</CardTitle><School className={statIconClassName} /></CardHeader><CardContent className={statContentClassName}><div className={statValueClassName}>{data.myClassesCount || 0}</div><p className={statCopyClassName}>Classes under your supervision</p></CardContent></Card>
        <Card className={statCardClassName}><CardHeader className={statHeaderClassName}><CardTitle className="pr-3 text-sm font-semibold text-[#111111]">My Courses</CardTitle><BookOpen className={statIconClassName} /></CardHeader><CardContent className={statContentClassName}><div className={statValueClassName}>{data.mySubjectsCount || 0}</div><p className={statCopyClassName}>Assigned courses to teach</p></CardContent></Card>
        <Card className={statCardClassName}><CardHeader className={statHeaderClassName}><CardTitle className="pr-3 text-sm font-semibold text-[#111111]">My Students</CardTitle><Users className={statIconClassName} /></CardHeader><CardContent className={statContentClassName}><div className={statValueClassName}>{data.totalStudents || 0}</div><p className={statCopyClassName}>Students in your classes</p></CardContent></Card>
        <Card className={statCardClassName}><CardHeader className={statHeaderClassName}><CardTitle className="pr-3 text-sm font-semibold text-[#111111]">Results Entered</CardTitle><FileCheck2 className={statIconClassName} /></CardHeader><CardContent className={statContentClassName}><div className={statValueClassName}>{data.resultsEntered || 0}</div><p className={statCopyClassName}>Saved results this session</p></CardContent></Card>
      </>
    );
  }

  return (
    <>
      <Card className={statCardClassName}><CardHeader className={statHeaderClassName}><CardTitle className="pr-3 text-sm font-semibold text-[#111111]">Registered Courses</CardTitle><BookOpen className={statIconClassName} /></CardHeader><CardContent className={statContentClassName}><div className={statValueClassName}>{data.totalSubjects || 0}</div><p className={statCopyClassName}>Courses in your current submission</p></CardContent></Card>
      <Card className={statCardClassName}><CardHeader className={statHeaderClassName}><CardTitle className="pr-3 text-sm font-semibold text-[#111111]">Available Courses</CardTitle><School className={statIconClassName} /></CardHeader><CardContent className={statContentClassName}><div className={statValueClassName}>{data.availableCourses || 0}</div><p className={statCopyClassName}>Courses attached to your class</p></CardContent></Card>
      <Card className={statCardClassName}><CardHeader className={statHeaderClassName}><CardTitle className="pr-3 text-sm font-semibold text-[#111111]">Results Published</CardTitle><BadgeCheck className={statIconClassName} /></CardHeader><CardContent className={statContentClassName}><div className={statValueClassName}>{data.publishedResultsCount || 0}</div><p className={statCopyClassName}>Recorded course results so far</p></CardContent></Card>
      <Card className={statCardClassName}><CardHeader className={statHeaderClassName}><CardTitle className="pr-3 text-sm font-semibold text-[#111111]">Registration Status</CardTitle><CalendarDays className={statIconClassName} /></CardHeader><CardContent className={statContentClassName}><div className="text-lg font-black text-[#111111] sm:text-xl">{statusLabel(data.registrationStatus)}</div><p className={statCopyClassName}>Current academic session</p></CardContent></Card>
    </>
  );
}