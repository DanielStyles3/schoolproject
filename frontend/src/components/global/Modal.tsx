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
      <DialogContent className="max-h-[90vh] overflow-hidden border-border bg-card p-0 shadow-sm sm:max-w-2xl">
        <DialogHeader className="border-b border-border bg-surface-muted px-4 py-4 text-left sm:px-6 sm:py-5">
          <DialogTitle className="text-xl font-semibold text-foreground sm:text-2xl">{title}</DialogTitle>
          <DialogDescription className="text-sm leading-6 text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">{children}</div>
        <DialogFooter className="border-t border-border bg-surface-muted px-4 py-4 sm:justify-end sm:px-6">
          <DialogClose asChild>
            <Button variant="outline" className="w-full rounded-full border-border bg-card text-foreground hover:bg-accent-soft sm:w-auto">
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
