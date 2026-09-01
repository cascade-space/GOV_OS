import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { assetsApi } from '../api/api';
import { useUpdateAsset, useDeleteAsset } from '../hooks/useAssets';
import { useUiStore } from '../../../store/ui.store';
import { Truck, MapPin, Search, Plus, Calendar, AlertTriangle, Edit2, Trash2, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AddAssetModal from './AddAssetModal';

export default function AssetRegistry() {
  const { setActiveModule } = useUiStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const updateMutation = useUpdateAsset();
  const deleteMutation = useDeleteAsset();

  useEffect(() => {
    setActiveModule('assets');
  }, [setActiveModule]);

  const { data: assets, isLoading } = useQuery({
    queryKey: ['assets'],
    queryFn: () => assetsApi.list(),
  });

  const filtered = assets?.filter((a: any) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      a.name?.toLowerCase().includes(q) ||
      a.assetId?.toLowerCase().includes(q) ||
      a.category?.toLowerCase().includes(q)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500/20 text-green-600 border-green-500/30';
      case 'MAINTENANCE': return 'bg-amber-500/20 text-amber-600 border-amber-500/30';
      case 'DECOMMISSIONED': return 'bg-red-500/20 text-red-600 border-red-500/30';
      default: return 'bg-secondary text-muted-foreground border-border';
    }
  };

  const handleEditClick = (asset: any) => {
    setEditingId(asset.id);
    setEditForm({ ...asset });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = () => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: editForm }, {
        onSuccess: () => {
          setEditingId(null);
          setEditForm({});
        }
      });
    }
  };

  const confirmDelete = () => {
    if (deletingId) {
      deleteMutation.mutate(deletingId, {
        onSuccess: () => {
          setDeletingId(null);
        }
      });
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto flex flex-col h-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Truck className="text-govos-blue" />
            Asset Registry
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Manage municipal physical infrastructure and maintenance schedules.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search assets..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-secondary rounded-md text-sm border-transparent focus:border-govos-blue focus:ring-1 focus:ring-govos-blue w-64 transition-all"
            />
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-govos-blue text-white rounded-md hover:bg-govos-blue/90 text-sm font-medium transition-colors shadow-sm"
          >
            <Plus size={16} />
            Add Asset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
        {isLoading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-56 bg-card border border-border rounded-xl animate-pulse" />
          ))
        ) : (filtered ?? []).length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            <Truck size={48} className="mx-auto mb-4 opacity-20" />
            {searchTerm ? `No assets matching "${searchTerm}"` : 'No assets registered in the system.'}
          </div>
        ) : (
          (filtered ?? []).map((asset: any, index: number) => {
            const isEditing = editingId === asset.id;
            
            return (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                key={asset.id} 
                className={`bg-card border border-border rounded-xl overflow-hidden shadow-sm transition-all group relative ${isEditing ? 'ring-1 ring-govos-blue' : 'hover:shadow-md'}`}
              >
                {/* Actions Top Right */}
                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100 z-10">
                  {isEditing ? (
                    <>
                      <button onClick={handleSaveEdit} className="p-1.5 bg-green-500/10 hover:bg-green-500/20 rounded-md text-green-600 transition-colors" title="Save">
                        <Check size={16} />
                      </button>
                      <button onClick={handleCancelEdit} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-md text-red-500 transition-colors" title="Cancel">
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEditClick(asset)} className="p-1.5 hover:bg-secondary rounded-md text-govos-blue transition-colors bg-card/80 backdrop-blur" title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => setDeletingId(asset.id)} className="p-1.5 hover:bg-red-500/10 rounded-md text-red-500 transition-colors bg-card/80 backdrop-blur" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>

                <div className="p-5 relative">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-full pr-16">
                      <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-1 rounded-md mb-2 inline-block">
                        {asset.assetId}
                      </span>
                      {isEditing ? (
                        <>
                          <input
                            type="text"
                            className="font-semibold text-lg bg-background border border-border rounded px-2 py-1 w-full mb-1"
                            value={editForm.name}
                            onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                          />
                          <select
                            className="text-sm text-muted-foreground mt-1 bg-background border border-border rounded px-2 py-1 w-full"
                            value={editForm.category}
                            onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                          >
                            <option value="VEHICLE">Vehicle</option>
                            <option value="BUILDING">Building</option>
                            <option value="EQUIPMENT">Equipment</option>
                          </select>
                        </>
                      ) : (
                        <>
                          <h3 className="font-semibold text-lg">{asset.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{asset.category}</p>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {isEditing ? (
                    <div className="mb-4">
                      <select
                        className="px-2 py-1 text-xs font-semibold rounded border w-full bg-background"
                        value={editForm.status}
                        onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="MAINTENANCE">Maintenance</option>
                        <option value="DECOMMISSIONED">Decommissioned</option>
                      </select>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusColor(asset.status)}`}>
                        {asset.status}
                      </span>
                    </div>
                  )}
                  
                  <div className="space-y-3 mt-5 pt-5 border-t border-border/50">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin size={16} className="mr-3 text-govos-blue/70 shrink-0" />
                      {isEditing ? (
                        <div className="flex gap-2 font-mono text-xs w-full">
                          <input
                            type="number"
                            className="bg-background border border-border rounded px-2 py-1 w-full"
                            value={editForm.latitude}
                            onChange={(e) => setEditForm({...editForm, latitude: parseFloat(e.target.value) || 0})}
                          />
                          <input
                            type="number"
                            className="bg-background border border-border rounded px-2 py-1 w-full"
                            value={editForm.longitude}
                            onChange={(e) => setEditForm({...editForm, longitude: parseFloat(e.target.value) || 0})}
                          />
                        </div>
                      ) : (
                        <span className="font-mono text-xs">
                          {asset.latitude.toFixed(4)}, {asset.longitude.toFixed(4)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      {new Date(asset.nextMaintenanceDate) < new Date() ? (
                        <AlertTriangle size={16} className="mr-3 text-red-500 shrink-0" />
                      ) : (
                        <Calendar size={16} className="mr-3 text-govos-blue/70 shrink-0" />
                      )}
                      
                      {isEditing ? (
                        <input
                          type="date"
                          className="bg-background border border-border rounded px-2 py-1 text-xs w-full"
                          value={editForm.nextMaintenanceDate?.split('T')[0] || ''}
                          onChange={(e) => setEditForm({...editForm, nextMaintenanceDate: e.target.value})}
                        />
                      ) : (
                        <span className={new Date(asset.nextMaintenanceDate) < new Date() ? 'text-red-500 font-medium' : ''}>
                          Next Maint: {new Date(asset.nextMaintenanceDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <AnimatePresence>
        {deletingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border p-6 rounded-xl shadow-lg max-w-sm w-full"
            >
              <h3 className="text-lg font-bold mb-2">Delete Asset</h3>
              <p className="text-muted-foreground text-sm mb-6">Are you sure you want to delete this asset? This action cannot be undone.</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setDeletingId(null)} className="px-4 py-2 rounded-md hover:bg-secondary transition-colors text-sm font-medium">Cancel</button>
                <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AddAssetModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
}
