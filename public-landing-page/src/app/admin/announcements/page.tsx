"use client";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/Button";
import { Megaphone, Plus, Trash2, Edit3, Calendar, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { MOCK_ANNOUNCEMENTS } from "@/lib/mockData";

export default function AdminAnnouncementsPage() {
    const [items, setItems] = useState(MOCK_ANNOUNCEMENTS);
    const [showAdd, setShowAdd] = useState(false);

    const toggleStatus = (id: string) => {
        setItems(items.map(item => item.id === id ? { ...item, status: item.status === "active" ? "expired" : "active" } : item));
        toast.success("Announcement status updated");
    };

    const deleteItem = (id: string) => {
        setItems(items.filter(item => item.id !== id));
        toast.success("Announcement deleted");
    };

    return (
        <AdminLayout>
            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-gray-900">MLA Announcements</h2>
                        <p className="text-gray-500 text-sm">Post updates and alerts for citizens</p>
                    </div>
                    <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowAdd(true)}>
                        New Announcement
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {items.map(item => (
                        <div key={item.id} className={cn(
                            "civic-card p-5 group transition-all",
                            item.status === "expired" ? "opacity-60 bg-gray-50" : "hover:border-civic-blue/30"
                        )}>
                            <div className="flex items-start justify-between">
                                <div className="flex gap-4">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                                        item.category === "Alert" ? "bg-red-50 text-red-500" :
                                            item.category === "Work" ? "bg-blue-50 text-blue-500" : "bg-green-50 text-green-500"
                                    )}>
                                        <Megaphone className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={cn(
                                                "badge text-[10px]",
                                                item.category === "Alert" ? "badge-red" :
                                                    item.category === "Work" ? "badge-blue" : "badge-green"
                                            )}>{item.category}</span>
                                            <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                                                <Calendar className="w-3 h-3" /> {item.date}
                                            </span>
                                        </div>
                                        <h3 className="text-base font-bold text-gray-900">{item.title}</h3>
                                        <p className="text-sm text-gray-500 mt-1 max-w-2xl">{item.content}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => toggleStatus(item.id)}
                                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-civic-blue transition-colors"
                                        title={item.status === "active" ? "Hide from public" : "Show to public"}
                                    >
                                        {item.status === "active" ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                    <button
                                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-civic-blue transition-colors"
                                        title="Edit"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => deleteItem(item.id)}
                                        className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {items.length === 0 && (
                    <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
                        <Megaphone className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-400 font-medium">No announcements found</p>
                        <button className="text-civic-blue font-bold text-sm mt-1 hover:underline">Post your first update</button>
                    </div>
                )}
            </div>

            {showAdd && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAdd(false)} />
                    <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-card-xl animate-slide-up">
                        <h3 className="text-lg font-black text-gray-900 mb-4">New Announcement</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="label-field">Title</label>
                                <input className="input-field" placeholder="Brief catchy title..." />
                            </div>
                            <div>
                                <label className="label-field">Category</label>
                                <select className="input-field">
                                    <option>Alert</option>
                                    <option>Work</option>
                                    <option>Event</option>
                                </select>
                            </div>
                            <div>
                                <label className="label-field">Content</label>
                                <textarea className="input-field min-h-[100px]" placeholder="Detailed message for citizens..." />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button variant="ghost" className="flex-1" onClick={() => setShowAdd(false)}>Cancel</Button>
                                <Button className="flex-1" onClick={() => { setShowAdd(false); toast.success("Posted successfully!"); }}>Post Now</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
