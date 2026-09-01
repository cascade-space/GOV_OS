import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, ShieldCheck } from 'lucide-react';
import { useAddOfficer } from '../hooks/useOfficers';
import { useNotificationStore } from '../../../store/notification.store';

const AddOfficerSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  department: z.string().min(2, "Department is required"),
  designation: z.string().min(2, "Designation is required"),
  phone: z.string().min(10, "Valid phone number required"),
  email: z.string().email("Valid email required"),
  assignedWard: z.string().optional(),
});

type AddOfficerForm = z.infer<typeof AddOfficerSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddOfficerModal({ isOpen, onClose }: Props) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<AddOfficerForm>({
    resolver: zodResolver(AddOfficerSchema),
  });

  const addMutation = useAddOfficer();
  const addNotification = useNotificationStore(s => s.addNotification);

  const onSubmit = (data: AddOfficerForm) => {
    const payload = {
      fullName: `${data.firstName} ${data.lastName}`,
      phone: data.phone,
      email: data.email,
      designation: data.designation,
      wardId: data.assignedWard,
      departmentId: data.department,
    };
    addMutation.mutate(payload, {
      onSuccess: () => {
        addNotification({
          id: crypto.randomUUID(),
          title: 'Officer Onboarded',
          message: `${data.firstName} ${data.lastName} has been added to the registry.`,
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
                <ShieldCheck className="text-govos-blue" size={20} />
                Onboard New Officer
              </h2>
              <button onClick={onClose} className="p-1 rounded-md hover:bg-secondary transition-colors text-muted-foreground">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">First Name</label>
                  <input
                    {...register('firstName')}
                    type="text"
                    className="w-full h-10 px-3 bg-secondary/50 border border-border rounded-lg focus:border-govos-blue outline-none transition-colors"
                  />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Last Name</label>
                  <input
                    {...register('lastName')}
                    type="text"
                    className="w-full h-10 px-3 bg-secondary/50 border border-border rounded-lg focus:border-govos-blue outline-none transition-colors"
                  />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Department</label>
                  <select
                    {...register('department')}
                    className="w-full h-10 px-3 bg-secondary/50 border border-border rounded-lg focus:border-govos-blue outline-none transition-colors"
                  >
                    <option value="">Select Dept...</option>
                    <option value="00000000-0000-0000-0003-000000000001">Public Works Department</option>
                    <option value="00000000-0000-0000-0003-000000000002">Water Supply Department</option>
                    <option value="00000000-0000-0000-0003-000000000003">Solid Waste Management</option>
                  </select>
                  {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Designation</label>
                  <input
                    {...register('designation')}
                    type="text"
                    placeholder="E.g. Chief Engineer"
                    className="w-full h-10 px-3 bg-secondary/50 border border-border rounded-lg focus:border-govos-blue outline-none transition-colors"
                  />
                  {errors.designation && <p className="text-red-500 text-xs mt-1">{errors.designation.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Email</label>
                  <input
                    {...register('email')}
                    type="email"
                    className="w-full h-10 px-3 bg-secondary/50 border border-border rounded-lg focus:border-govos-blue outline-none transition-colors"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Phone (Mobile)</label>
                  <input
                    {...register('phone')}
                    type="text"
                    placeholder="+91..."
                    className="w-full h-10 px-3 bg-secondary/50 border border-border rounded-lg focus:border-govos-blue outline-none transition-colors"
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Ward Assignment (Optional)</label>
                  <select
                    {...register('assignedWard')}
                    className="w-full h-10 px-3 bg-secondary/50 border border-border rounded-lg focus:border-govos-blue outline-none transition-colors"
                  >
                    <option value="">Select Ward...</option>
                    <option value="00000000-0000-0000-0002-000000000001">Ward 1 (Downtown)</option>
                    <option value="22222222-2222-2222-2222-222222222222">Ward 2 (North)</option>
                    <option value="33333333-3333-3333-3333-333333333333">Ward 3 (East)</option>
                    <option value="44444444-4444-4444-4444-444444444444">Ward 4 (South)</option>
                  </select>
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
                  Register Officer
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
