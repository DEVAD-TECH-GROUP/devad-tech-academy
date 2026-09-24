import { toast } from "react-hot-toast";

export default function useToast() {
  return {
    success: (msg) => toast.success(msg),
    error: (msg) => toast.error(msg),
    info: (msg) => toast(msg),
    loading: (msg) => toast.loading(msg),
    dismiss: () => toast.dismiss(),
  };
}
