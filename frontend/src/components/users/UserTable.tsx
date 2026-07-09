import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Loader2,
  UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { user } from "@/types";
import CustomPagination from "@/components/global/CustomPagination";

interface Props {
  role: string;
  loading: boolean;
  setDeleteId: (id: string) => void;
  setIsDeleteOpen: (open: boolean) => void;
  setEditingUser: (user: user | null) => void;
  setIsFormOpen: (open: boolean) => void;
  users: user[];
  pageNum: number;
  setPageNum: (page: number) => void;
  totalPages: number;
}

const UserTable = ({
  role,
  loading,
  setDeleteId,
  setIsDeleteOpen,
  setEditingUser,
  setIsFormOpen,
  pageNum,
  setPageNum,
  users,
  totalPages,
}: Props) => {
  const handleEdit = (user: user) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const colSpan = role === "teacher" || role === "student" ? 4 : 3;

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-[#E8F5EE] bg-white shadow-[0_18px_35px_rgba(0,132,61,0.05)]">
      <div className="overflow-x-auto">
        <Table className="min-w-[760px]">
          <TableHeader className="bg-[#E8F5EE]">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              {role === "teacher" && <TableHead>Courses</TableHead>}
              {role === "student" && <TableHead>Class</TableHead>}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={colSpan} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colSpan} className="h-24 text-center text-muted-foreground">
                  No {role}s found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell className="font-medium text-[#111111]">
                    <div className="flex min-w-[180px] items-center gap-3 whitespace-normal">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FFF9CC]">
                        <UserIcon className="h-4 w-4 text-[#00843D]" />
                      </div>
                      <span>{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[220px] break-words">{user.email}</TableCell>
                  {role === "teacher" && (
                    <TableCell>
                      {user.teacherSubjects?.length ? (
                        <div className="flex max-w-[280px] flex-wrap gap-1.5">
                          {user.teacherSubjects.map((subject) => (
                            <Badge
                              variant="outline"
                              className="border-[#E8F5EE] bg-[#E8F5EE] text-[#111111]"
                              key={subject._id}
                            >
                              {subject.name}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm italic text-muted-foreground">Unassigned</span>
                      )}
                    </TableCell>
                  )}
                  {role === "student" && (
                    <TableCell>
                      {user.studentClass?._id ? (
                        <Badge variant="outline" className="border-[#E8F5EE] bg-[#E8F5EE] text-[#111111]">
                          {user.studentClass.name}
                        </Badge>
                      ) : (
                        <span className="text-sm italic text-muted-foreground">Unassigned</span>
                      )}
                    </TableCell>
                  )}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-9 w-9 rounded-full p-0 hover:bg-[#FFF9CC]">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="border-[#E8F5EE]">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEdit(user)}>
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            setDeleteId(user._id);
                            setIsDeleteOpen(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {users.length > 10 && (
        <CustomPagination
          loading={loading}
          page={pageNum}
          setPage={setPageNum}
          totalPages={totalPages}
        />
      )}
    </div>
  );
};

export default UserTable;
