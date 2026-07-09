import { MoreHorizontal, Loader2, Pencil, Trash2, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import type { Class } from "@/types";
import CustomPagination from "@/components/global/CustomPagination";

interface Props {
  data: Class[];
  loading: boolean;
  onEdit: (cls: Class) => void;
  onDelete: (id: string) => void;
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
}

const ClassTable = ({
  data,
  loading,
  onEdit,
  onDelete,
  page,
  setPage,
  totalPages,
}: Props) => {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-[#E8F5EE] bg-white shadow-[0_18px_35px_rgba(0,132,61,0.05)]">
      <div className="overflow-x-auto">
        <Table className="min-w-[720px]">
          <TableHeader className="bg-[#E8F5EE]">
            <TableRow>
              <TableHead>Class</TableHead>
              <TableHead>Academic Year</TableHead>
              <TableHead>Class Teacher</TableHead>
              <TableHead>Students</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No classes found. Add one to get started.
                </TableCell>
              </TableRow>
            ) : (
              data.map((cls) => (
                <TableRow key={cls._id}>
                  <TableCell className="font-medium text-[#111111]">{cls.name}</TableCell>
                  <TableCell>{cls.academicYear?.name || "N/A"}</TableCell>
                  <TableCell>
                    {cls.classTeacher ? (
                      <span className="flex items-center gap-2">{cls.classTeacher.name}</span>
                    ) : (
                      <span className="italic text-muted-foreground">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-[#4B5563]">
                      <Users className="h-4 w-4 text-[#00843D]" />
                      {cls.students?.length || 0} / {cls.capacity}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-9 w-9 rounded-full p-0 hover:bg-[#FFF9CC]">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="border-[#E8F5EE]">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onEdit(cls)}>
                          <Pencil className="mr-2 h-4 w-4" /> Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => onDelete(cls._id)}>
                          <Trash2 className="mr-2 size-4" /> Delete Class
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
      {data.length > 10 && (
        <CustomPagination
          loading={loading}
          page={page}
          setPage={setPage}
          totalPages={totalPages}
        />
      )}
    </div>
  );
};

export default ClassTable;
