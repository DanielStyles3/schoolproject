import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import Search from "@/components/global/Search";
import CustomAlert from "@/components/global/CustomAlert";
import type { pagination, subject } from "@/types";
import { SubjectTable } from "@/components/subjects/SubjectTable";
import { SubjectForm } from "@/components/subjects/SubjectForm";
import PageShell from "@/components/global/PageShell";

export const Subjects = () => {
  const [subjects, setSubjects] = useState<subject[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Search & Pagination State ---
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pageNum, setPageNum] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // --- Dialog States ---
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<subject | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // 1. Handle Debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPageNum(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // 2. Fetch Courses
  const fetchSubjects = useCallback(async () => {
    try {
      setLoading(true);

      // Construct Query Params
      const params = new URLSearchParams();
      params.append("page", pageNum.toString());
      params.append("limit", "10");
      if (debouncedSearch) params.append("search", debouncedSearch);

      const { data } = (await api.get(`/courses?${params.toString()}`)) as {
        data: { subjects: subject[]; pagination: pagination };
      };

      // Handle response structure { subjects: [], pagination: {} }
      if (data.subjects) {
        setSubjects(data.subjects);
        setTotalPages(data.pagination.pages);
      } else {
        setSubjects([]);
      }
    } catch {
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  }, [pageNum, debouncedSearch]);

  // Trigger fetch when Page or Search changes
  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const handleCreate = () => {
    setEditingSubject(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: subject) => {
    setEditingSubject(item);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/courses/delete/${deleteId}`);
      toast.success("Subject deleted successfully");
      fetchSubjects();
    } catch {
      toast.error("Failed to delete subject");
    } finally {
      setIsDeleteOpen(false);
      setDeleteId(null);
    }
  };
  return (
    <PageShell
      title="Courses"
      description="Manage the courses available for registration and result entry."
      actions={
        <>
          <Search search={search} setSearch={setSearch} title="Course" />
          <Button className="w-full sm:w-auto" onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Create Course
          </Button>
        </>
      }
    >
      {/* table */}
      <SubjectTable
        data={subjects}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        page={pageNum}
        setPage={setPageNum}
        totalPages={totalPages}
      />
      {/* form */}
      <SubjectForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        initialData={editingSubject}
        onSuccess={fetchSubjects}
      />
      <CustomAlert
        handleDelete={confirmDelete}
        isOpen={isDeleteOpen}
        setIsOpen={setIsDeleteOpen}
        title="Delete Course"
        description="Are you sure you want to delete this course? This action cannot be undone."
      />
    </PageShell>
  );
};


