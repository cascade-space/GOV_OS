import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, FileText, Send } from 'lucide-react';
import { useAddDocument } from '../hooks/useDocuments';
import { useNotificationStore } from '../../../store/notification.store';

const AddDocumentSchema = z.object({
  documentNumber: z.string().min(2, "Document number is required (e.g. DOC-2026-001)"),
  title: z.string().min(2, "Subject/Title is required"),
  type: z.enum(['LETTER', 'NOTICE', 'INTERNAL_MEMO', 'TENDER'], {
    required_error: "Document type is required"
  }),
  status: z.enum(['DRAFT', 'IN_TRANSIT', 'DELIVERED', 'ARCHIVED'], {
    required_error: "Status is required"
  }),
  currentDesk: z.string().min(2, "Receiving desk is required"),
  receivedDate: z.string().optional(),
});

type AddDocumentForm = z.infer<typeof AddDocumentSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddDocumentModal({ isOpen, onClose }: Props) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<AddDocumentForm>({
    resolver: zodResolver(AddDocumentSchema),
    defaultValues: {
      status: 'DRAFT',
    }
  });

  const addMutation = useAddDocument();
  const addNotification = useNotificationStore(s => s.addNotification);

  const onSubmit = (data: AddDocumentForm) => {
    addMutation.mutate(data, {
      onSuccess: () => {
        addNotification({
          id: crypto.randomUUID(),
          title: 'Document Registered',
          message: `File "${data.title}" has been registered to ${data.currentDesk}.`,
          type: 'success',
          isRead: false,
          createdAt: new Date().toISOString()
        });
        reset();
        onClose();
      }
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-lg bg-card rounded-xl shadow-2xl border border-border overflow-hidden relative z-10 flex flex-col"
          >
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-secondary/30">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="text-govos-blue" size={20} />
                Register New File (Peshi)
              </h2>
              <button onClick={onClose} className="p-1 rounded-md hover:bg-secondary transition-colors text-muted-foreground">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Document Number</label>
                  <input
                    {...register('documentNumber')}
                    type="text"
                    placeholder="E.g. DOC-2026-001"
                    className="w-full h-10 px-3 bg-secondary/50 border border-border rounded-lg focus:border-govos-blue outline-none transition-colors"
                  />
                  {errors.documentNumber && <p className="text-red-500 text-xs mt-1">{errors.documentNumber.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Document Type</label>
                  <select
                    {...register('type')}
                    className="w-full h-10 px-3 bg-secondary/50 border border-border rounded-lg focus:border-govos-blue outline-none transition-colors"
                  >
                    <option value="">Select Type...</option>
                    <option value="LETTER">Official Letter</option>
                    <option value="INTERNAL_MEMO">Internal Memo</option>
                    <option value="NOTICE">Public Notice</option>
                    <option value="TENDER">Tender Document</option>
                  </select>
                  {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Subject / Title</label>
                <input
                  {...register('title')}
                  type="text"
                  placeholder="E.g. Approval for Ward 4 Budget"
                  className="w-full h-10 px-3 bg-secondary/50 border border-border rounded-lg focus:border-govos-blue outline-none transition-colors"
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Status</label>
                  <select
                    {...register('status')}
                    className="w-full h-10 px-3 bg-secondary/50 border border-border rounded-lg focus:border-govos-blue outline-none transition-colors"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="IN_TRANSIT">In Transit</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                  {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Forward To (Desk)</label>
                  <select
                    {...register('currentDesk')}
                    className="w-full h-10 px-3 bg-secondary/50 border border-border rounded-lg focus:border-govos-blue outline-none transition-colors"
                  >
                    <option value="">Select Desk...</option>
                    <option value="Mayor's Office">Mayor's Office</option>
                    <option value="Chief Engineer">Chief Engineer</option>
                    <option value="Finance Dept">Finance Dept</option>
                    <option value="Health Dept">Health Dept</option>
                    <option value="Legal Cell">Legal Cell</option>
                  </select>
                  {errors.currentDesk && <p className="text-red-500 text-xs mt-1">{errors.currentDesk.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Received Date</label>
                <input
                  {...register('receivedDate')}
                  type="date"
                  className="w-full h-10 px-3 bg-secondary/50 border border-border rounded-lg focus:border-govos-blue outline-none transition-colors"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg font-medium hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addMutation.isPending}
                  className="px-4 py-2 bg-govos-blue hover:bg-govos-blue/90 text-white rounded-lg font-medium flex items-center transition-colors disabled:opacity-50"
                >
                  {addMutation.isPending && <Loader2 size={16} className="mr-2 animate-spin" />}
                  <Send size={16} className="mr-2" />
                  Dispatch File
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
