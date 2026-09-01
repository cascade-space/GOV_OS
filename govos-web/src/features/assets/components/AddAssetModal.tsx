import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Database, MapPin } from 'lucide-react';
import { useAddAsset } from '../hooks/useAssets';
import { useNotificationStore } from '../../../store/notification.store';

const AddAssetSchema = z.object({
  assetId: z.string().min(2, "Asset ID is required (e.g. AST-001)"),
  name: z.string().min(2, "Asset name is required"),
  category: z.enum(['VEHICLE', 'BUILDING', 'STREETLIGHT', 'INFRASTRUCTURE', 'PUMP', 'OTHER'], {
    required_error: "Category is required"
  }),
  status: z.enum(['ACTIVE', 'MAINTENANCE', 'DECOMMISSIONED'], {
    required_error: "Status is required"
  }),
  latitude: z.number({ invalid_type_error: "Must be a number" }),
  longitude: z.number({ invalid_type_error: "Must be a number" }),
  nextMaintenanceDate: z.string().optional(),
});

type AddAssetForm = z.infer<typeof AddAssetSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddAssetModal({ isOpen, onClose }: Props) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<AddAssetForm>({
    resolver: zodResolver(AddAssetSchema),
    defaultValues: {
      latitude: 19.0760,
      longitude: 72.8777,
      status: 'ACTIVE'
    }
  });

  const addMutation = useAddAsset();
  const addNotification = useNotificationStore(s => s.addNotification);

  const onSubmit = (data: AddAssetForm) => {
    addMutation.mutate(data, {
      onSuccess: () => {
        addNotification({
          id: crypto.randomUUID(),
          title: 'Infrastructure Registered',
          message: `${data.name} has been added to the civic asset registry.`,
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
                <Database className="text-govos-blue" size={20} />
                Register Civic Asset
              </h2>
              <button onClick={onClose} className="p-1 rounded-md hover:bg-secondary transition-colors text-muted-foreground">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Asset ID</label>
                  <input
                    {...register('assetId')}
                    type="text"
                    placeholder="E.g. AST-001"
                    className="w-full h-10 px-3 bg-secondary/50 border border-border rounded-lg focus:border-govos-blue outline-none transition-colors"
                  />
                  {errors.assetId && <p className="text-red-500 text-xs mt-1">{errors.assetId.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Category</label>
                  <select
                    {...register('category')}
                    className="w-full h-10 px-3 bg-secondary/50 border border-border rounded-lg focus:border-govos-blue outline-none transition-colors"
                  >
                    <option value="">Select Category...</option>
                    <option value="VEHICLE">Vehicle</option>
                    <option value="BUILDING">Building</option>
                    <option value="STREETLIGHT">Streetlight</option>
                    <option value="INFRASTRUCTURE">Infrastructure</option>
                    <option value="PUMP">Pump</option>
                    <option value="OTHER">Other</option>
                  </select>
                  {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Asset Name</label>
                <input
                  {...register('name')}
                  type="text"
                  placeholder="E.g. Primary Water Pump Station 4"
                  className="w-full h-10 px-3 bg-secondary/50 border border-border rounded-lg focus:border-govos-blue outline-none transition-colors"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Status</label>
                <select
                  {...register('status')}
                  className="w-full h-10 px-3 bg-secondary/50 border border-border rounded-lg focus:border-govos-blue outline-none transition-colors"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="MAINTENANCE">Under Maintenance</option>
                  <option value="DECOMMISSIONED">Decommissioned</option>
                </select>
                {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status.message}</p>}
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
                  {errors.latitude && <p className="text-red-500 text-xs mt-1">{errors.latitude.message}</p>}
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
                  {errors.longitude && <p className="text-red-500 text-xs mt-1">{errors.longitude.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Next Maintenance Date</label>
                <input
                  {...register('nextMaintenanceDate')}
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
                  Register Asset
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
