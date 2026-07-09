import { Button } from "@/components/ui/button";
import type { pagination, user, UserRole } from "@/types";
import CustomAlert from "@/components/global/CustomAlert";
import Search from "@/components/global/Search";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { api } from "@/lib/api";
import UserTable from "@/components/users/UserTable";
import UserDialog from "@/components/users/UserDialog";

interface Props {
  role: UserRole;
  title: string;
  description: string;
}

export default function UserManagementPage({
  role,
  title,
  description,
}: Props) {
  const [users, setUsers] = useState<user[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<user | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);

    return () => clearTimeout(handler);
  }, [search]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const searchParam = debouncedSearch ? `&search=${debouncedSearch}` : "";
      const roleParam = `&role=${role}`;
      const { data } = (await api.get(
        `/users?page=${page}&limit=10${roleParam}${searchParam}`
      )) as { data: { users: user[]; pagination: pagination } };

      if (data.users) {
        setUsers(data.users);
        setTotalPages(data.pagination.pages);
      } else {
        setUsers([]);
      }
    } catch {
      toast.error(`Failed to load ${role}s`);
    } finally {
      setLoading(false);
    }
  }, [role, page, debouncedSearch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreate = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/users/delete/${deleteId}`);
      toast.success("User deleted");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to delete user");
      console.log(error);
    } finally {
      setIsDeleteOpen(false);
      setDeleteId(null);
    }
  };

  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
  const addButtonLabel = role === "teacher" ? "Add New Teacher" : `Add ${roleLabel}`;

  return (
    <div className="space-y-6 rounded-[2rem] border border-[#E8F5EE] bg-white/60 p-4 shadow-[0_24px_50px_rgba(0,132,61,0.05)] backdrop-blur-sm sm:p-6">
      <div className="flex flex-col gap-4 rounded-[1.5rem] border border-[#E8F5EE] bg-[#E8F5EE] p-4 sm:p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight capitalize sm:text-3xl">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Search search={search} setSearch={setSearch} title={`${role}s`} />
          <Button className="w-full sm:w-auto" onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            {addButtonLabel}
          </Button>
        </div>
      </div>

      <UserTable
        role={role}
        loading={loading}
        setDeleteId={setDeleteId}
        setIsDeleteOpen={setIsDeleteOpen}
        setEditingUser={setEditingUser}
        setIsFormOpen={setIsFormOpen}
        users={users}
        setPageNum={setPage}
        pageNum={page}
        totalPages={totalPages}
      />

      <UserDialog
        editingUser={editingUser}
        role={role}
        open={isFormOpen}
        setOpen={setIsFormOpen}
        onSuccess={fetchUsers}
      />

      <CustomAlert
        isOpen={isDeleteOpen}
        setIsOpen={setIsDeleteOpen}
        handleDelete={handleDelete}
        title="Delete User?"
        description="This will permanently delete this user from the system."
      />
    </div>
  );
}

