import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Loader2, Sparkles } from 'lucide-react';
import { useCreateComplaint } from '../hooks/useComplaints';
import { CreateComplaintSchema, CreateComplaintRequest } from '../types';
import { useNotificationStore } from '../../../store/notification.store';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateComplaintModal({ isOpen, onClose }: Props) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateComplaintRequest>({
    resolver: zodResolver(CreateComplaintSchema),
    defaultValues: {
      latitude: 19.0760, // Default to Mumbai for demo
      longitude: 72.8777,
    }
  });

  const createMutation = useCreateComplaint();
  const addNotification = useNotificationStore(s => s.addNotification);

  const onSubmit = (data: CreateComplaintRequest) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        addNotification({
          id: crypto.randomUUID(),
          title: 'Complaint Submitted',
          message: 'Your complaint has been submitted and is being analyzed by GovOS AI.',
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
                New Complaint
              </h2>
              <button onClick={onClose} className="p-1 rounded-md hover:bg-secondary transition-colors text-muted-foreground">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1.5">Issue Title</label>
                <input
                  {...register('title')}
                  type="text"
                  placeholder="E.g. Broken water pipe on Main St"
                  className="w-full h-10 px-3 bg-secondary/50 border border-border rounded-lg focus:border-govos-blue outline-none transition-colors"
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Description</label>
                <textarea
                  {...register('description')}
                  rows={4}
                  placeholder="Please provide details to help AI classify accurately..."
                  className="w-full p-3 bg-secondary/50 border border-border rounded-lg focus:border-govos-blue outline-none transition-colors resize-none"
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
              </div>

              <div className="p-3 bg-govos-blue/10 border border-govos-blue/20 rounded-lg flex items-start gap-3">
                <Sparkles size={18} className="text-govos-blue mt-0.5 shrink-0" />
                <div className="text-sm text-govos-blue">
                  <strong>AI Assessment:</strong> Category, priority, and ward assignment will be automatically determined by GovOS AI upon submission.
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 flex items-center gap-1">
                    <MapPin size={14} className="text-muted-foreground" /> Latitude
                  </label>
                  <input
                    {...register('latitude', { valueAsNumber: true })}
                    type="number"
                    step="any"
                    className="w-full h-10 px-3 bg-secondary/50 border border-border rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 flex items-center gap-1">
                    <MapPin size={14} className="text-muted-foreground" /> Longitude
                  </label>
                  <input
                    {...register('longitude', { valueAsNumber: true })}
                    type="number"
                    step="any"
                    className="w-full h-10 px-3 bg-secondary/50 border border-border rounded-lg outline-none"
                  />
                </div>
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
                  disabled={createMutation.isPending}
                  className="px-4 py-2 bg-govos-blue hover:bg-govos-blue/90 text-white rounded-lg font-medium flex items-center transition-colors disabled:opacity-50"
                >
                  {createMutation.isPending && <Loader2 size={16} className="mr-2 animate-spin" />}
                  Submit to GovOS
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
