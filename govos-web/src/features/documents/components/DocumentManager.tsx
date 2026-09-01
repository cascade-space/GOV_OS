import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { documentsApi } from '../api/api';
import { useUpdateDocument, useDeleteDocument } from '../hooks/useDocuments';
import { useUiStore } from '../../../store/ui.store';
import { FileText, Search, Plus, Filter, Send, Download, Edit2, Trash2, Check, X, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AddDocumentModal from './AddDocumentModal';

export default function DocumentManager() {
  const { setActiveModule } = useUiStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const updateMutation = useUpdateDocument();
  const deleteMutation = useDeleteDocument();

  useEffect(() => {
    setActiveModule('documents');
  }, [setActiveModule]);

  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentsApi.list(),
  });

  const filtered = documents?.filter((d: any) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      d.title?.toLowerCase().includes(q) ||
      d.documentNumber?.toLowerCase().includes(q) ||
      d.currentDesk?.toLowerCase().includes(q)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'IN_TRANSIT': return <span className="px-2 py-1 bg-amber-500/20 text-amber-600 rounded-full text-xs font-semibold">In Transit</span>;
      case 'RECEIVED': return <span className="px-2 py-1 bg-green-500/20 text-green-600 rounded-full text-xs font-semibold">Received</span>;
      case 'DRAFT': return <span className="px-2 py-1 bg-secondary text-muted-foreground rounded-full text-xs font-semibold">Draft</span>;
      case 'ARCHIVED': return <span className="px-2 py-1 bg-red-500/20 text-red-600 rounded-full text-xs font-semibold">Archived</span>;
      default: return <span className="px-2 py-1 bg-secondary text-muted-foreground rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  const handleEditClick = (doc: any) => {
    setEditingId(doc.id);
    setEditForm({ ...doc });
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
            <FileText className="text-govos-blue" />
            Peshi & Document Register
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Track physical and digital file movement across municipal departments.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search file no..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-secondary rounded-md text-sm border-transparent focus:border-govos-blue focus:ring-1 focus:ring-govos-blue w-64 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-secondary text-sm font-medium transition-colors">
            <Filter size={16} />
            Filter
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-govos-blue text-white rounded-md hover:bg-govos-blue/90 text-sm font-medium transition-colors shadow-sm"
          >
            <Plus size={16} />
            New File
          </button>
        </div>
      </div>

      <div className="flex-1 bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col relative">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground uppercase text-xs font-semibold sticky top-0">
              <tr>
                <th className="px-6 py-4">File Number & Subject</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Current Desk</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    <div className="animate-pulse flex flex-col items-center gap-2">
                      <div className="h-4 w-32 bg-secondary rounded" />
                      <div className="h-4 w-48 bg-secondary rounded" />
                    </div>
                  </td>
                </tr>
              ) : (filtered ?? []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <FileText size={48} className="mx-auto mb-4 opacity-20" />
                    {searchTerm ? `No documents matching "${searchTerm}"` : 'No documents found in registry.'}
                  </td>
                </tr>
              ) : (
                (filtered ?? []).map((doc: any, index: number) => {
                  const isEditing = editingId === doc.id;
                  return (
                    <motion.tr 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      key={doc.id} 
                      className={`hover:bg-secondary/30 transition-colors group ${isEditing ? 'bg-secondary/20' : ''}`}
                    >
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <div className="flex flex-col gap-2">
                            <input 
                              type="text" 
                              className="px-2 py-1 bg-background border border-border rounded text-xs font-mono" 
                              value={editForm.documentNumber}
                              onChange={(e) => setEditForm({...editForm, documentNumber: e.target.value})}
                            />
                            <input 
                              type="text" 
                              className="px-2 py-1 bg-background border border-border rounded text-sm" 
                              value={editForm.title}
                              onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                            />
                          </div>
                        ) : (
                          <div>
                            <div className="font-mono text-xs text-muted-foreground mb-1">{doc.documentNumber}</div>
                            <div className="font-medium">{doc.title}</div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {isEditing ? (
                          <select 
                            className="px-2 py-1 bg-background border border-border rounded text-sm w-full"
                            value={editForm.type}
                            onChange={(e) => setEditForm({...editForm, type: e.target.value})}
                          >
                            <option value="GENERAL_CORRESPONDENCE">General</option>
                            <option value="NOTE_SHEET">Note Sheet</option>
                            <option value="CIRCULAR">Circular</option>
                          </select>
                        ) : (
                          doc.type.replace('_', ' ')
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <input 
                            type="text" 
                            className="px-2 py-1 bg-background border border-border rounded text-sm w-full" 
                            value={editForm.currentDesk}
                            onChange={(e) => setEditForm({...editForm, currentDesk: e.target.value})}
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-muted-foreground font-medium">
                            <UserCheck size={14} className="text-govos-blue" />
                            {doc.currentDesk}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <select 
                            className="px-2 py-1 bg-background border border-border rounded text-sm w-full"
                            value={editForm.status}
                            onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                          >
                            <option value="DRAFT">Draft</option>
                            <option value="RECEIVED">Received</option>
                            <option value="IN_TRANSIT">In Transit</option>
                            <option value="ARCHIVED">Archived</option>
                          </select>
                        ) : (
                          getStatusBadge(doc.status)
                        )}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {isEditing ? (
                          <input 
                            type="date" 
                            className="px-2 py-1 bg-background border border-border rounded text-sm w-full" 
                            value={editForm.receivedDate?.split('T')[0] || ''}
                            onChange={(e) => setEditForm({...editForm, receivedDate: e.target.value})}
                          />
                        ) : (
                          new Date(doc.receivedDate).toLocaleDateString()
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
                              <button onClick={() => handleEditClick(doc)} className="p-2 hover:bg-secondary rounded-md text-govos-blue transition-colors" title="Edit">
                                <Edit2 size={16} />
                              </button>
                              <button onClick={() => setDeletingId(doc.id)} className="p-2 hover:bg-red-500/10 rounded-md text-red-500 transition-colors" title="Delete">
                                <Trash2 size={16} />
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
              <h3 className="text-lg font-bold mb-2">Delete Document</h3>
              <p className="text-muted-foreground text-sm mb-6">Are you sure you want to delete this document? This action cannot be undone.</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setDeletingId(null)} className="px-4 py-2 rounded-md hover:bg-secondary transition-colors text-sm font-medium">Cancel</button>
                <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <AddDocumentModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
}
