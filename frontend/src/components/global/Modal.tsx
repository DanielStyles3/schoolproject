import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const Modal = ({
  description,
  open,
  setOpen,
  title,
  children,
}: {
  title: string;
  description: string;
  setOpen: (open: boolean) => void;
  open: boolean;
  children: React.ReactNode;
}) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[90vh] overflow-hidden border-[#E8F5EE] bg-white p-0 shadow-[0_30px_70px_rgba(0,132,61,0.10)] sm:max-w-2xl">
        <DialogHeader className="border-b border-[#E8F5EE] bg-[#E8F5EE] px-4 py-4 text-left sm:px-6 sm:py-5">
          <DialogTitle className="text-xl font-black text-[#111111] sm:text-2xl">{title}</DialogTitle>
          <DialogDescription className="text-sm leading-6 text-[#4B5563]">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">{children}</div>
        <DialogFooter className="border-t border-[#E8F5EE] bg-[#F5F7FA] px-4 py-4 sm:justify-end sm:px-6">
          <DialogClose asChild>
            <Button variant="outline" className="w-full rounded-full border-[#E8F5EE] bg-white text-[#111111] hover:bg-[#FFF9CC] sm:w-auto">
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
