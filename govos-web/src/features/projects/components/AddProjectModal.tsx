import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, HardHat, CalendarDays, IndianRupee } from 'lucide-react';
import { useAddProject } from '../hooks/useProjects';
import { useNotificationStore } from '../../../store/notification.store';

const AddProjectSchema = z.object({
  projectId: z.string().min(2, "Project ID is required (e.g. PRJ-001)"),
  title: z.string().min(2, "Project title is required"),
  status: z.enum(['PLANNING', 'IN_PROGRESS', 'DELAYED', 'COMPLETED'], {
    required_error: "Status is required"
  }),
  budget: z.number({ invalid_type_error: "Must be a valid number" }).min(1000, "Minimum budget is 1,000"),
  spent: z.number({ invalid_type_error: "Must be a valid number" }).min(0).default(0),
  startDate: z.string().min(1, "Start date is required"),
  estimatedEndDate: z.string().min(1, "Target end date is required"),
  completionPercentage: z.number({ invalid_type_error: "Must be a number" }).min(0).max(100).default(0),
});

type AddProjectForm = z.infer<typeof AddProjectSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddProjectModal({ isOpen, onClose }: Props) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<AddProjectForm>({
    resolver: zodResolver(AddProjectSchema),
    defaultValues: {
      status: 'PLANNING',
      spent: 0,
      completionPercentage: 0,
    }
  });

  const addMutation = useAddProject();
  const addNotification = useNotificationStore(s => s.addNotification);

  const onSubmit = (data: AddProjectForm) => {
    addMutation.mutate(data, {
      onSuccess: () => {
        addNotification({
          id: crypto.randomUUID(),
          title: 'Project Initiated',
          message: `${data.title} has been added to the tracking system.`,
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
                <HardHat className="text-govos-blue" size={20} />
                Initiate Civic Project
              </h2>
              <button onClick={onClose} className="p-1 rounded-md hover:bg-secondary transition-colors text-muted-foreground">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Project ID</label>
                  <input
                    {...register('projectId')}
                    type="text"
                    placeholder="E.g. PRJ-001"
                    className="w-full h-10 px-3 bg-secondary/50 border border-border rounded-lg focus:border-govos-blue outline-none transition-colors"
                  />
                  {errors.projectId && <p className="text-red-500 text-xs mt-1">{errors.projectId.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Status</label>
                  <select
                    {...register('status')}
                    className="w-full h-10 px-3 bg-secondary/50 border border-border rounded-lg focus:border-govos-blue outline-none transition-colors"
                  >
                    <option value="PLANNING">Planning</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DELAYED">Delayed</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                  {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Project Title</label>
                <input
                  {...register('title')}
                  type="text"
                  placeholder="E.g. MG Road Repaving Phase 2"
                  className="w-full h-10 px-3 bg-secondary/50 border border-border rounded-lg focus:border-govos-blue outline-none transition-colors"
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 flex items-center gap-1">
                    <IndianRupee size={14} className="text-muted-foreground" /> Total Budget (₹)
                  </label>
                  <input
                    {...register('budget', { valueAsNumber: true })}
                    type="number"
                    placeholder="500000"
                    className="w-full h-10 px-3 bg-secondary/50 border border-border rounded-lg focus:border-govos-blue outline-none transition-colors"
                  />
                  {errors.budget && <p className="text-red-500 text-xs mt-1">{errors.budget.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Completion %</label>
                  <input
                    {...register('completionPercentage', { valueAsNumber: true })}
                    type="number"
                    min={0}
                    max={100}
                    defaultValue={0}
                    className="w-full h-10 px-3 bg-secondary/50 border border-border rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 flex items-center gap-1">
                    <CalendarDays size={14} className="text-muted-foreground" /> Start Date
                  </label>
                  <input
                    {...register('startDate')}
                    type="date"
                    className="w-full h-10 px-3 bg-secondary/50 border border-border rounded-lg focus:border-govos-blue outline-none transition-colors"
                  />
                  {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 flex items-center gap-1">
                    <CalendarDays size={14} className="text-muted-foreground" /> Est. End Date
                  </label>
                  <input
                    {...register('estimatedEndDate')}
                    type="date"
                    className="w-full h-10 px-3 bg-secondary/50 border border-border rounded-lg focus:border-govos-blue outline-none transition-colors"
                  />
                  {errors.estimatedEndDate && <p className="text-red-500 text-xs mt-1">{errors.estimatedEndDate.message}</p>}
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
                  disabled={addMutation.isPending}
                  className="px-4 py-2 bg-govos-blue hover:bg-govos-blue/90 text-white rounded-lg font-medium flex items-center transition-colors disabled:opacity-50"
                >
                  {addMutation.isPending && <Loader2 size={16} className="mr-2 animate-spin" />}
                  Initiate Project
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
