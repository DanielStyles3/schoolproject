import Modal from "@/components/global/Modal";
import UniversalUserForm from "@/components/auth/UniversalUserForm";
import type { user, UserRole } from "@/types";

const UserDialog = ({
  open,
  setOpen,
  editingUser,
  role,
  onSuccess,
}: {
  setOpen: (open: boolean) => void;
  open: boolean;
  editingUser: user | null;
  role: UserRole;
  onSuccess?: () => void;
}) => {
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
  const title = editingUser
    ? `Update ${roleLabel}`
    : role === "teacher"
      ? "Add New Teacher"
      : `Create ${roleLabel}`;
  const description = editingUser
    ? `Update ${role} details`
    : role === "teacher"
      ? "Create a teacher account and assign courses."
      : "Add a new user";

  const onSuccessPlus = () => {
    setOpen(false);
    onSuccess?.();
  };

  return (
    <Modal
      title={title}
      description={description}
      open={open}
      setOpen={setOpen}
    >
      <UniversalUserForm
        type={editingUser ? "update" : "create"}
        role={role}
        initialData={editingUser}
        onSuccess={onSuccessPlus}
      />
    </Modal>
  );
};

export default UserDialog;
