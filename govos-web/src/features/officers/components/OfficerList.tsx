import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { officersApi } from '../api/api';
import { useUpdateOfficer, useDeleteOfficer } from '../hooks/useOfficers';
import { useUiStore } from '../../../store/ui.store';
import { Users, Briefcase, Activity, UserPlus, Edit2, Trash2, Check, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AddOfficerModal from './AddOfficerModal';

export default function OfficerList() {
  const { setActiveModule } = useUiStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const updateMutation = useUpdateOfficer();
  const deleteMutation = useDeleteOfficer();

  useEffect(() => {
    setActiveModule('officers');
  }, [setActiveModule]);

  const { data: officers, isLoading } = useQuery({
    queryKey: ['officers'],
    queryFn: () => officersApi.list(),
  });

  const filtered = officers?.filter((o: any) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      o.fullName?.toLowerCase().includes(q) ||
      o.designation?.toLowerCase().includes(q)
    );
  });

  const handleEditClick = (officer: any) => {
    setEditingId(officer.id);
    setEditForm({ ...officer });
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
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto flex flex-col h-full">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Officer Roster</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage personnel and monitor active workloads.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search officers..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-secondary rounded-md text-sm border-transparent focus:border-govos-blue focus:ring-1 focus:ring-govos-blue w-56 transition-all"
            />
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-govos-blue hover:bg-govos-blue/90 text-white rounded-lg font-medium flex items-center transition-colors shadow-sm"
          >
            <UserPlus size={18} className="mr-2" /> Add Officer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
        {isLoading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-card border border-border rounded-xl animate-pulse" />
          ))
        ) : (filtered ?? []).length === 0 ? (
          <div className="col-span-full py-16 text-center text-muted-foreground">
            <Users size={48} className="mx-auto mb-4 opacity-20" />
            {searchTerm ? `No officers matching "${searchTerm}"` : 'No officers found.'}
          </div>
        ) : (
          (filtered ?? []).map((officer: any) => {
            const isEditing = editingId === officer.id;
            
            return (
              <div key={officer.id} className={`bg-card border border-border rounded-xl p-6 shadow-sm transition-all relative overflow-hidden group ${isEditing ? 'ring-1 ring-govos-blue' : 'hover:shadow-md'}`}>
                <div className="absolute top-0 left-0 w-1 h-full bg-govos-blue opacity-50 group-hover:opacity-100 transition-opacity" />
                
                {/* Actions Top Right */}
                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
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
                      <button onClick={() => handleEditClick(officer)} className="p-1.5 hover:bg-secondary rounded-md text-govos-blue transition-colors" title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => setDeletingId(officer.id)} className="p-1.5 hover:bg-red-500/10 rounded-md text-red-500 transition-colors" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>

                <div className="flex justify-between items-start mb-4 pr-16">
                  <div className="w-full">
                    {isEditing ? (
                      <input
                        type="text"
                        className="font-semibold text-lg bg-background border border-border rounded px-2 py-1 w-full mb-1"
                        value={editForm.fullName}
                        onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                      />
                    ) : (
                      <h3 className="font-semibold text-lg">{officer.fullName}</h3>
                    )}
                    
                    <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Briefcase size={14} /> 
                      {isEditing ? (
                        <input
                          type="text"
                          className="bg-background border border-border rounded px-2 py-0.5 text-xs w-full ml-1"
                          value={editForm.designation}
                          onChange={(e) => setEditForm({...editForm, designation: e.target.value})}
                        />
                      ) : (
                        officer.designation
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mb-4">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id={`avail-${officer.id}`}
                        checked={editForm.isAvailable}
                        onChange={(e) => setEditForm({...editForm, isAvailable: e.target.checked})}
                        className="rounded text-govos-blue focus:ring-govos-blue"
                      />
                      <label htmlFor={`avail-${officer.id}`} className="text-sm font-medium">Available</label>
                    </div>
                  ) : (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${officer.isAvailable ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'}`}>
                      {officer.isAvailable ? 'Available' : 'Busy'}
                    </span>
                  )}
                </div>
                
                <div className="pt-4 border-t border-border mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Activity size={14} /> Active Workload
                    </span>
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          className="bg-background border border-border rounded px-2 py-0.5 text-sm w-16 text-right font-bold"
                          value={editForm.currentWorkload}
                          onChange={(e) => setEditForm({...editForm, currentWorkload: parseInt(e.target.value) || 0})}
                        />
                        <span className="text-sm font-normal text-muted-foreground">issues</span>
                      </div>
                    ) : (
                      <span className="font-bold text-lg">{officer.currentWorkload} <span className="text-sm font-normal text-muted-foreground">issues</span></span>
                    )}
                  </div>
                  {/* Visual Workload Bar */}
                  <div className="h-2 w-full bg-secondary rounded-full mt-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        (isEditing ? editForm.currentWorkload : officer.currentWorkload) > 5 ? 'bg-red-500' : (isEditing ? editForm.currentWorkload : officer.currentWorkload) > 2 ? 'bg-amber-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(((isEditing ? editForm.currentWorkload : officer.currentWorkload) / 10) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
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
              <h3 className="text-lg font-bold mb-2">Delete Officer</h3>
              <p className="text-muted-foreground text-sm mb-6">Are you sure you want to delete this officer? This action cannot be undone.</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setDeletingId(null)} className="px-4 py-2 rounded-md hover:bg-secondary transition-colors text-sm font-medium">Cancel</button>
                <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AddOfficerModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
}
