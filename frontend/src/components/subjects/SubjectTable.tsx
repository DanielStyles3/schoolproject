import {
  MoreHorizontal,
  Loader2,
  Pencil,
  Trash2,
  BookOpen,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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
import CustomPagination from "@/components/global/CustomPagination";
import type { subject } from "@/types";

interface Props {
  data: subject[];
  loading: boolean;
  onEdit: (item: subject) => void;
  onDelete: (id: string) => void;
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
}

export function SubjectTable({
  data,
  loading,
  onEdit,
  onDelete,
  page,
  setPage,
  totalPages,
}: Props) {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-[#E8F5EE] bg-white shadow-[0_18px_35px_rgba(0,132,61,0.05)]">
      <div className="overflow-x-auto">
        <Table className="min-w-[760px]">
          <TableHeader className="bg-[#E8F5EE]">
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Course Name</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Teachers</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  No courses found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item._id}>
                  <TableCell className="font-mono text-xs text-[#4B5563]">{item.code}</TableCell>
                  <TableCell className="font-medium text-[#111111]">
                    <div className="flex items-center gap-2 whitespace-normal">
                      <BookOpen className="h-4 w-4 shrink-0 text-[#00843D]" />
                      <span>{item.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{item.unit || 3}</TableCell>
                  <TableCell>{item.teacher?.length}</TableCell>
                  <TableCell>
                    {item.isActive ? (
                      <Badge className="brand-status-approved">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Archived</Badge>
                    )}
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
                        <DropdownMenuItem onClick={() => onEdit(item)}>
                          <Pencil className="mr-2 h-4 w-4" /> Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => onDelete(item._id)}
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
}
