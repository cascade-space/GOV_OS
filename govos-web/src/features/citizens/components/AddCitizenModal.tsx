import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, UserPlus } from 'lucide-react';
import { useAddCitizen } from '../hooks/useCitizens';
import { useNotificationStore } from '../../../store/notification.store';

const AddCitizenSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  phone: z.string().min(10, "Valid phone number required"),
  wardId: z.string().min(1, "Ward assignment required"),
  address: z.string().optional(),
});

type AddCitizenForm = z.infer<typeof AddCitizenSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddCitizenModal({ isOpen, onClose }: Props) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<AddCitizenForm>({
    resolver: zodResolver(AddCitizenSchema),
  });

  const addMutation = useAddCitizen();
  const addNotification = useNotificationStore(s => s.addNotification);

  const onSubmit = (data: AddCitizenForm) => {
    const payload = {
      fullName: `${data.firstName} ${data.lastName}`,
      phone: data.phone,
      wardId: data.wardId,
    };
    addMutation.mutate(payload, {
      onSuccess: () => {
        addNotification({
          id: crypto.randomUUID(),
          title: 'Citizen Registered',
          message: `${data.firstName} ${data.lastName} is now active in the system.`,
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
                <UserPlus className="text-govos-blue" size={20} />
                Register New Citizen
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
                  <label className="block text-sm font-medium mb-1.5">Phone (Mobile)</label>
                  <input
                    {...register('phone')}
                    type="text"
                    placeholder="+91..."
                    className="w-full h-10 px-3 bg-secondary/50 border border-border rounded-lg focus:border-govos-blue outline-none transition-colors"
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Ward Assignment</label>
                  <select
                    {...register('wardId')}
                    className="w-full h-10 px-3 bg-secondary/50 border border-border rounded-lg focus:border-govos-blue outline-none transition-colors"
                  >
                    <option value="">Select Ward...</option>
                    <option value="00000000-0000-0000-0002-000000000001">Ward 1 (Downtown)</option>
                    <option value="22222222-2222-2222-2222-222222222222">Ward 2 (North)</option>
                    <option value="33333333-3333-3333-3333-333333333333">Ward 3 (East)</option>
                    <option value="44444444-4444-4444-4444-444444444444">Ward 4 (South)</option>
                  </select>
                  {errors.wardId && <p className="text-red-500 text-xs mt-1">{errors.wardId.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Primary Address (Optional)</label>
                <textarea
                  {...register('address')}
                  rows={2}
                  className="w-full p-3 bg-secondary/50 border border-border rounded-lg focus:border-govos-blue outline-none transition-colors resize-none"
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
                  Register Citizen
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
