import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { citizensApi } from '../api/api';
import { useUpdateCitizen, useDeleteCitizen } from '../hooks/useCitizens';
import { useUiStore } from '../../../store/ui.store';
import { Users, Search, Phone, History, UserPlus, Edit2, Trash2, Check, X, MapPin, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AddCitizenModal from './AddCitizenModal';

export default function CitizenList() {
  const { setActiveModule } = useUiStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [historyFor, setHistoryFor] = useState<any | null>(null);
  
  const updateMutation = useUpdateCitizen();
  const deleteMutation = useDeleteCitizen();

  useEffect(() => {
    setActiveModule('citizens');
  }, [setActiveModule]);

  const { data: citizens, isLoading } = useQuery({
    queryKey: ['citizens'],
    queryFn: () => citizensApi.list(),
  });

  const filtered = citizens?.filter((c: any) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      c.fullName?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q)
    );
  });

  const handleEditClick = (citizen: any) => {
    setEditingId(citizen.id);
    setEditForm({ ...citizen });
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
            <Users className="text-govos-blue" />
            Citizen Directory
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Manage constituent profiles and interaction logs.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by name, phone..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-secondary rounded-md text-sm border-transparent focus:border-govos-blue focus:ring-1 focus:ring-govos-blue w-64 transition-all"
            />
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-govos-blue hover:bg-govos-blue/90 text-white rounded-md text-sm font-medium transition-colors shadow-sm"
          >
            <UserPlus size={16} />
            Add Citizen
          </button>
        </div>
      </div>

      <div className="flex-1 bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col relative">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground uppercase text-xs font-semibold sticky top-0">
              <tr>
                <th className="px-6 py-4">Citizen Name</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Ward / Region</th>
                <th className="px-6 py-4 text-right">Total Interactions</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    <div className="animate-pulse flex flex-col items-center gap-2">
                      <div className="h-4 w-32 bg-secondary rounded" />
                      <div className="h-4 w-48 bg-secondary rounded" />
                    </div>
                  </td>
                </tr>
              ) : (filtered ?? []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <Users size={48} className="mx-auto mb-4 opacity-20" />
                    {searchTerm ? `No citizens matching "${searchTerm}"` : 'No citizens found.'}
                  </td>
                </tr>
              ) : (
                (filtered ?? []).map((citizen: any, index: number) => {
                  const isEditing = editingId === citizen.id;
                  
                  return (
                    <motion.tr 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      key={citizen.id} 
                      className={`hover:bg-secondary/30 transition-colors group ${isEditing ? 'bg-secondary/20' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-govos-blue/10 text-govos-blue flex items-center justify-center font-bold shrink-0">
                            {citizen.fullName.charAt(0)}
                          </div>
                          {isEditing ? (
                            <input
                              type="text"
                              className="px-2 py-1 bg-background border border-border rounded text-sm w-full"
                              value={editForm.fullName}
                              onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                            />
                          ) : (
                            <span className="font-medium">{citizen.fullName}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone size={14} className="shrink-0" />
                          {isEditing ? (
                            <input
                              type="text"
                              className="px-2 py-1 bg-background border border-border rounded text-sm w-full"
                              value={editForm.phone || ''}
                              onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                            />
                          ) : (
                            citizen.phone || 'N/A'
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {isEditing ? (
                          <input
                            type="text"
                            placeholder="Ward ID"
                            className="px-2 py-1 bg-background border border-border rounded text-sm w-full"
                            value={editForm.wardId || ''}
                            onChange={(e) => setEditForm({...editForm, wardId: e.target.value})}
                          />
                        ) : (
                          citizen.wardId ? 'Ward Linked' : 'Unassigned'
                        )}
                      </td>
                      <td className="px-6 py-4 text-right font-medium">
                        {isEditing ? (
                          <input
                            type="number"
                            className="px-2 py-1 bg-background border border-border rounded text-sm w-16 text-right ml-auto"
                            value={editForm.totalComplaints}
                            onChange={(e) => setEditForm({...editForm, totalComplaints: parseInt(e.target.value) || 0})}
                          />
                        ) : (
                          citizen.totalComplaints || 0
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {isEditing ? (
                            <>
                              <button onClick={handleSaveEdit} className="p-2 hover:bg-green-500/20 rounded-md text-green-600 transition-colors" title="Save">
                                <Check size={16} />
                              </button>
                              <button onClick={handleCancelEdit} className="p-2 hover:bg-red-500/20 rounded-md text-red-500 transition-colors" title="Cancel">
                                <X size={16} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => handleEditClick(citizen)} className="p-2 hover:bg-secondary rounded-md text-govos-blue transition-colors tooltip-trigger" title="Edit">
                                <Edit2 size={16} />
                              </button>
                              <button onClick={() => setDeletingId(citizen.id)} className="p-2 hover:bg-red-500/10 rounded-md text-red-500 transition-colors tooltip-trigger" title="Delete">
                                <Trash2 size={16} />
                              </button>
                              <button onClick={() => setHistoryFor(citizen)} className="p-2 hover:bg-secondary rounded-md text-govos-blue transition-colors" title="View History">
                                <History size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
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
              <h3 className="text-lg font-bold mb-2">Delete Citizen</h3>
              <p className="text-muted-foreground text-sm mb-6">Are you sure you want to delete this citizen profile? This action cannot be undone.</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setDeletingId(null)} className="px-4 py-2 rounded-md hover:bg-secondary transition-colors text-sm font-medium">Cancel</button>
                <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <AddCitizenModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />

      {/* Citizen History Drawer */}
      <AnimatePresence>
        {historyFor && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setHistoryFor(null)}
              className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-card border-l border-border shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-govos-blue/10 text-govos-blue flex items-center justify-center font-bold text-lg">
                    {historyFor.fullName?.charAt(0)}
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">{historyFor.fullName}</h2>
                    <p className="text-sm text-muted-foreground">{historyFor.phone || 'No phone'}</p>
                  </div>
                </div>
                <button onClick={() => setHistoryFor(null)} className="p-2 hover:bg-secondary rounded-lg transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                {/* Profile summary */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-secondary/50 rounded-xl p-4">
                    <p className="text-xs text-muted-foreground mb-1">Total Complaints</p>
                    <p className="text-2xl font-bold text-govos-blue">{historyFor.totalComplaints ?? 0}</p>
                  </div>
                  <div className="bg-secondary/50 rounded-xl p-4">
                    <p className="text-xs text-muted-foreground mb-1">Ward</p>
                    <p className="text-sm font-semibold">{historyFor.wardId ? 'Linked' : 'Unassigned'}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <FileText size={14} /> Interaction Log
                  </h3>
                  <div className="bg-secondary/30 rounded-xl p-4 text-sm text-muted-foreground text-center">
                    <History size={32} className="mx-auto mb-2 opacity-20" />
                    <p>Complaint history is fetched from the complaints module.</p>
                    <p className="text-xs mt-1">Filter complaints by citizen phone to view their history.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <MapPin size={14} /> Contact Details
                  </h3>
                  <div className="bg-secondary/30 rounded-xl p-4 space-y-2 text-sm">
                    {historyFor.phone && (
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-muted-foreground" />
                        <span>{historyFor.phone}</span>
                      </div>
                    )}
                    {historyFor.email && (
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-muted-foreground" />
                        <span>{historyFor.email}</span>
                      </div>
                    )}
                    {historyFor.address && (
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-muted-foreground" />
                        <span className="text-xs">{historyFor.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
