import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
// import Alert from "@/components/global/alert";
import type { academicYear } from "@/types";
import { api } from "@/lib/api";
import AcademicYearTable from "@/components/academic-year/academic-year-table";
import Search from "@/components/global/Search";
import AcademicYearForm from "@/components/academic-year/AcademicYearForm";
import CustomAlert from "@/components/global/CustomAlert";
import PageShell from "@/components/global/PageShell";

const AcademicYear = () => {
  const [years, setYears] = useState<academicYear[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Search & Pagination State ---
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pageNum, setPageNum] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Dialog States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingYear, setEditingYear] = useState<academicYear | null>(null);

  // Alert States
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

//   Fetch Years
  const fetchYears = useCallback(async () => {
    try {
      setLoading(true);

      // Construct Query Params
      const params = new URLSearchParams();
      params.append("page", pageNum.toString());
      params.append("limit", "10");
      if (debouncedSearch) params.append("search", debouncedSearch);

      const { data } = await api.get(`/academic-years?${params.toString()}`);

      // Handle response structure { academicYears: [], pagination: {} }
      if (data.academicYears) {
        setYears(data.academicYears);
        setTotalPages(data.pagination?.pages ?? 1);
      } else {
        setYears([]);
        setTotalPages(1);
      }
    } catch {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [pageNum, debouncedSearch]);

  // Trigger fetch when Page or Search changes
  useEffect(() => {
    fetchYears();
  }, [fetchYears]);

  // Debounce Search Input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPageNum(1); // Reset to first page on new search
    }, 500); // 500ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  const handleCreate = () => {
    setEditingYear(null);
    setIsFormOpen(true);
  };

  const handleEdit = (year: academicYear) => {
    setEditingYear(year);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setIsAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      await api.delete(`/academic-years/delete/${deletingId}`);
      toast.success("Academic year deleted");
      fetchYears();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to delete");
    } finally {
      setIsAlertOpen(false);
      setDeletingId(null);
    }
  };

  //   console.log(years);
  return (
    <PageShell
      title="Academic Years"
      description="Manage school sessions."
      actions={
        <>
          <Search search={search} setSearch={setSearch} title="Academic Year" />
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add New Year
          </Button>
        </>
      }
    >
      {/* Table Component */}
      <AcademicYearTable
        data={years}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        pageNum={pageNum}
        setPageNum={setPageNum}
        totalPages={totalPages}
      />
      <AcademicYearForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        initialData={editingYear}
        onSuccess={fetchYears}
      />
      <CustomAlert
        handleDelete={confirmDelete}
        isOpen={isAlertOpen}
        setIsOpen={setIsAlertOpen}
        title="Delete Academic Year"
        description="Are you sure you want to delete this Academic Year? This action cannot be undone."
      />
    </PageShell>
  );
};

export default AcademicYear;

