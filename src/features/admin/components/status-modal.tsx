import { Dialog, DialogContent } from "./ui/dialog";
import { Button } from "./ui/button";
import { CheckCircle2, XCircle } from "lucide-react";

type StatusModalProps = {
  open: boolean;
  onClose: () => void;
  type: "success" | "error";
  message: string;
};

export function StatusModal({ open, onClose, type, message }: StatusModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm text-center">
        <div className="flex flex-col items-center py-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${type === "success" ? "bg-green-100" : "bg-red-100"}`}>
            {type === "success" ? (
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            ) : (
              <XCircle className="h-8 w-8 text-red-600" />
            )}
          </div>
          <h3 className={`text-lg font-semibold mb-2 ${type === "success" ? "text-slate-900" : "text-red-900"}`}>
            {type === "success" ? "Successful" : "Error"}
          </h3>
          <p className="text-sm text-slate-500 mb-5">{message}</p>
          <Button
            onClick={onClose}
            className={type === "success" ? "bg-black text-white hover:bg-slate-800 px-8" : "bg-red-600 text-white hover:bg-red-700 px-8"}
          >
            {type === "success" ? "Done" : "Close"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
