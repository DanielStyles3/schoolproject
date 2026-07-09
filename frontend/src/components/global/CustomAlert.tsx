import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Props {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  handleDelete: () => void;
  title: string;
  description: string;
}

const CustomAlert = ({
  isOpen,
  setIsOpen,
  handleDelete,
  title,
  description,
}: Props) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="border-[#E8F5EE] bg-white shadow-[0_30px_70px_rgba(0,132,61,0.10)]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-black text-[#111111]">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-sm leading-6 text-[#4B5563]">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-full border-[#E8F5EE] text-[#111111] hover:bg-[#E8F5EE]">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="rounded-full bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CustomAlert;
