import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { AlertTriangle, Trash2, RefreshCw } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning';
  loading?: boolean;
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Yes, proceed",
  cancelText = "Cancel",
  variant = 'danger',
  loading = false,
}: ConfirmModalProps) {
  const isDanger = variant === 'danger';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm border-0 shadow-xl">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isDanger ? 'bg-red-50' : 'bg-amber-50'}`}>
              {isDanger ? (
                <Trash2 className="h-7 w-7 text-red-500" />
              ) : (
                <AlertTriangle className="h-7 w-7 text-amber-500" />
              )}
            </div>
          </div>
          <DialogTitle className="text-lg font-bold text-slate-900 text-center">{title}</DialogTitle>
          <DialogDescription className="text-sm text-slate-500 text-center mt-1">{description}</DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 mt-4">
          <Button variant="outline" onClick={onClose} disabled={loading} className="flex-1">
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 ${isDanger ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-amber-500 hover:bg-amber-600 text-white'}`}
          >
            {loading && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
            {confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
