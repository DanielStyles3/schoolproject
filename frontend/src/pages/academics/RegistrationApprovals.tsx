import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Loader2, RotateCcw } from "lucide-react";

import PageShell from "@/components/global/PageShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/AuthProvider";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

interface RegistrationRow {
  _id: string;
  status: "submitted" | "approved";
  updatedAt?: string;
  student?: { _id: string; name?: string; email?: string };
  class?: { _id: string; name?: string };
  subjectIds?: string[];
  subjects?: { _id: string; name?: string; code?: string; unit?: number }[];
}

interface ClassOption {
  _id: string;
  name: string;
}

const statusClass = (status: string) =>
  status === "approved" ? "brand-status-approved" : "brand-status-pending";

const statusLabel = (status: string) =>
  status === "approved" ? "Approved" : "Awaiting Approval";

const RegistrationApprovals = () => {
  useDocumentTitle("Registration Approvals");
  const { year } = useAuth();

  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [registrations, setRegistrations] = useState<RegistrationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Load the class list once — the picker scopes everything below it.
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const { data } = await api.get("/classes?limit=100");
        setClasses(data.classes || []);
      } catch {
        toast.error("Failed to load classes");
      }
    };
    fetchClasses();
  }, []);

  const fetchRegistrations = useCallback(async () => {
    if (!year?._id) return;
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("academicYearId", year._id);
      if (selectedClass) params.append("classId", selectedClass);

      const { data } = await api.get(`/course-registrations?${params.toString()}`);
      setRegistrations(data.registrations || []);
    } catch {
      toast.error("Failed to load course registrations");
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  }, [selectedClass, year?._id]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const updateStatus = async (id: string, status: "approved" | "submitted") => {
    try {
      setUpdatingId(id);
      await api.patch(`/course-registrations/${id}/status`, { status });
      toast.success(
        status === "approved" ? "Registration approved" : "Approval reverted",
      );
      await fetchRegistrations();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update registration status";
      toast.error(message);
    } finally {
      setUpdatingId(null);
    }
  };

  const pendingCount = useMemo(
    () => registrations.filter((item) => item.status !== "approved").length,
    [registrations],
  );

  return (
    <PageShell
      title="Registration Approvals"
      description={`Review and approve student course registrations for ${year?.name || "the current session"}.`}
      actions={
        <Select
          value={selectedClass || "all"}
          onValueChange={(value) => setSelectedClass(value === "all" ? "" : value)}
        >
          <SelectTrigger className="w-full sm:w-[240px]">
            <SelectValue placeholder="All classes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All classes</SelectItem>
            {classes.map((item) => (
              <SelectItem key={item._id} value={item._id}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-surface-muted p-4">
          <p className="text-sm text-muted-foreground">Total Registrations</p>
          <p className="mt-1 text-2xl font-semibold">{registrations.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-surface-muted p-4">
          <p className="text-sm text-muted-foreground">Awaiting Approval</p>
          <p className="mt-1 text-2xl font-semibold">{pendingCount}</p>
        </div>
        <div className="rounded-lg border border-border bg-surface-muted p-4">
          <p className="text-sm text-muted-foreground">Approved</p>
          <p className="mt-1 text-2xl font-semibold">
            {registrations.length - pendingCount}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-muted">
              <TableHead>Student</TableHead>
              <TableHead>Class</TableHead>
              <TableHead className="text-center">Courses</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-28 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-primary" />
                </TableCell>
              </TableRow>
            ) : registrations.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-28 text-center text-sm text-muted-foreground"
                >
                  No course registrations found for this selection.
                </TableCell>
              </TableRow>
            ) : (
              registrations.map((item) => (
                <TableRow key={item._id}>
                  <TableCell>
                    <p className="font-medium text-foreground">
                      {item.student?.name || "Unknown student"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.student?.email}
                    </p>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.class?.name || "—"}
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {item.subjectIds?.length ?? 0}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusClass(item.status)}>
                      {statusLabel(item.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {item.status === "approved" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={updatingId === item._id}
                        onClick={() => updateStatus(item._id, "submitted")}
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Revert
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        disabled={updatingId === item._id}
                        onClick={() => updateStatus(item._id, "approved")}
                      >
                        {updatingId === item._id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                        )}
                        Approve
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </PageShell>
  );
};

export default RegistrationApprovals;
