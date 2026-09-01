import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { projectsApi } from '../api/api';
import { useUpdateProject, useDeleteProject } from '../hooks/useProjects';
import { useUiStore } from '../../../store/ui.store';
import { HardHat, Search, Plus, Calendar, IndianRupee, Clock, Edit2, Trash2, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AddProjectModal from './AddProjectModal';

export default function ProjectTracker() {
  const { setActiveModule } = useUiStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const updateMutation = useUpdateProject();
  const deleteMutation = useDeleteProject();

  useEffect(() => {
    setActiveModule('projects');
  }, [setActiveModule]);

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.list(),
  });

  const filtered = projects?.filter((p: any) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      p.title?.toLowerCase().includes(q) ||
      p.projectId?.toLowerCase().includes(q) ||
      p.contractor?.toLowerCase().includes(q)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS': return 'bg-blue-500/20 text-blue-600 border-blue-500/30';
      case 'PLANNING': return 'bg-amber-500/20 text-amber-600 border-amber-500/30';
      case 'DELAYED': return 'bg-red-500/20 text-red-600 border-red-500/30';
      case 'COMPLETED': return 'bg-green-500/20 text-green-600 border-green-500/30';
      default: return 'bg-secondary text-muted-foreground border-border';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleEditClick = (project: any) => {
    setEditingId(project.id);
    setEditForm({ ...project });
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
            <HardHat className="text-govos-blue" />
            Project Tracker
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Monitor civic infrastructure projects, timelines, and budget utilization.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search projects..." 
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
            New Project
          </button>
        </div>
      </div>

      <div className="space-y-4 relative">
        {isLoading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-40 bg-card border border-border rounded-xl animate-pulse" />
          ))
        ) : (filtered ?? []).length === 0 ? (
          <div className="py-12 text-center text-muted-foreground bg-card border border-border rounded-xl">
            <HardHat size={48} className="mx-auto mb-4 opacity-20" />
            {searchTerm ? `No projects matching "${searchTerm}"` : 'No active projects found.'}
          </div>
        ) : (
          (filtered ?? []).map((project: any, index: number) => {
            const isEditing = editingId === project.id;
            
            return (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                key={project.id} 
                className={`bg-card border border-border rounded-xl p-6 shadow-sm transition-all group ${isEditing ? 'ring-1 ring-govos-blue' : 'hover:shadow-md'}`}
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  
                  {/* Project Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="w-full mr-4">
                        <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-1 rounded-md mb-2 inline-block">
                          {project.projectId}
                        </span>
                        {isEditing ? (
                          <input
                            type="text"
                            className="font-semibold text-lg bg-background border border-border rounded px-2 py-1 w-full mt-1"
                            value={editForm.title}
                            onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                          />
                        ) : (
                          <h3 className="font-semibold text-lg">{project.title}</h3>
                        )}
                      </div>
                      
                      {isEditing ? (
                        <select
                          className="text-xs font-semibold rounded border bg-background px-2 py-1"
                          value={editForm.status}
                          onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                        >
                          <option value="PLANNING">Planning</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="DELAYED">Delayed</option>
                          <option value="COMPLETED">Completed</option>
                        </select>
                      ) : (
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusColor(project.status)} whitespace-nowrap`}>
                          {project.status.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <Calendar size={15} className="mr-2 text-govos-blue/70" />
                        {isEditing ? (
                          <input
                            type="date"
                            className="bg-background border border-border rounded px-2 py-0.5 text-xs w-full"
                            value={editForm.startDate?.split('T')[0] || ''}
                            onChange={(e) => setEditForm({...editForm, startDate: e.target.value})}
                          />
                        ) : (
                          <span>Start: {new Date(project.startDate).toLocaleDateString()}</span>
                        )}
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Clock size={15} className="mr-2 text-govos-blue/70" />
                        {isEditing ? (
                          <input
                            type="date"
                            className="bg-background border border-border rounded px-2 py-0.5 text-xs w-full"
                            value={editForm.estimatedEndDate?.split('T')[0] || ''}
                            onChange={(e) => setEditForm({...editForm, estimatedEndDate: e.target.value})}
                          />
                        ) : (
                          <span>Est. End: {new Date(project.estimatedEndDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Vertical Divider */}
                  <div className="hidden lg:block w-px bg-border/50" />

                  {/* Progress & Budget */}
                  <div className="flex-1 space-y-5">
                    <div>
                      <div className="flex justify-between items-center text-sm mb-1">
                        <span className="text-muted-foreground font-medium">Overall Progress</span>
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="0" max="100"
                              className="bg-background border border-border rounded px-2 py-0.5 text-xs w-16 text-right font-bold"
                              value={editForm.completionPercentage}
                              onChange={(e) => setEditForm({...editForm, completionPercentage: parseInt(e.target.value) || 0})}
                            />
                            <span className="font-bold">%</span>
                          </div>
                        ) : (
                          <span className="font-bold">{project.completionPercentage}%</span>
                        )}
                      </div>
                      <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${project.status === 'DELAYED' ? 'bg-amber-500' : 'bg-govos-blue'}`}
                          style={{ width: `${isEditing ? editForm.completionPercentage : project.completionPercentage}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-sm mb-1">
                        <span className="text-muted-foreground font-medium flex items-center gap-1">
                          <IndianRupee size={14} /> Budget Utilization
                        </span>
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              className="bg-background border border-border rounded px-2 py-0.5 text-xs w-20 text-right font-medium"
                              value={editForm.spent}
                              onChange={(e) => setEditForm({...editForm, spent: parseInt(e.target.value) || 0})}
                            />
                            <span className="text-muted-foreground text-xs font-normal">/</span>
                            <input
                              type="number"
                              className="bg-background border border-border rounded px-2 py-0.5 text-xs w-24 text-right font-medium"
                              value={editForm.budget}
                              onChange={(e) => setEditForm({...editForm, budget: parseInt(e.target.value) || 0})}
                            />
                          </div>
                        ) : (
                          <span className="font-medium">
                            {formatCurrency(project.spent)} <span className="text-muted-foreground text-xs font-normal">/ {formatCurrency(project.budget)}</span>
                          </span>
                        )}
                      </div>
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            ((isEditing ? editForm.spent : project.spent) / (isEditing ? editForm.budget : project.budget)) > ((isEditing ? editForm.completionPercentage : project.completionPercentage) / 100) ? 'bg-red-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${((isEditing ? editForm.spent : project.spent) / (isEditing ? editForm.budget : project.budget)) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Vertical Divider */}
                  <div className="hidden lg:block w-px bg-border/50" />

                  {/* Actions */}
                  <div className="flex flex-row lg:flex-col justify-end lg:justify-center items-center gap-2 pt-4 lg:pt-0 lg:pl-2">
                    {isEditing ? (
                      <>
                        <button onClick={handleSaveEdit} className="p-2 bg-green-500/10 hover:bg-green-500/20 rounded-md text-green-600 transition-colors w-full flex justify-center" title="Save">
                          <Check size={18} />
                        </button>
                        <button onClick={handleCancelEdit} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-md text-red-500 transition-colors w-full flex justify-center" title="Cancel">
                          <X size={18} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEditClick(project)} className="p-2 hover:bg-secondary rounded-md text-govos-blue transition-colors w-full flex justify-center" title="Edit">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => setDeletingId(project.id)} className="p-2 hover:bg-red-500/10 rounded-md text-red-500 transition-colors w-full flex justify-center" title="Delete">
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
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
              <h3 className="text-lg font-bold mb-2">Delete Project</h3>
              <p className="text-muted-foreground text-sm mb-6">Are you sure you want to delete this project? This action cannot be undone.</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setDeletingId(null)} className="px-4 py-2 rounded-md hover:bg-secondary transition-colors text-sm font-medium">Cancel</button>
                <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AddProjectModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
}
