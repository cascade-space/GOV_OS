"use client";
import { useState } from 'react';
import { User, Building2, Clock, CheckCircle, XCircle, MoreVertical, Mail, Trash2, KeyRound, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

interface Officer {
    id: number;
    name: string;
    email: string;
    department: string;
    status: string;
    created_at: string;
    last_login?: string;
}

interface OfficersListProps {
    officers: Officer[];
    onStatusChange: (id: number, status: string) => void;
    onDelete: (id: number) => void;
}

export default function OfficersList({ officers, onStatusChange, onDelete }: OfficersListProps) {
    const [actionId, setActionId] = useState<number | null>(null);
    const [resendingId, setResendingId] = useState<number | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
    const [regeneratingId, setRegeneratingId] = useState<number | null>(null);
    const [newCredentials, setNewCredentials] = useState<{ name: string; email: string; password: string; emailSent: boolean } | null>(null);

    const handleRegeneratePassword = async (officer: Officer) => {
        setRegeneratingId(officer.id);
        setActionId(null);
        try {
            const storedUser = localStorage.getItem('civicpath_user');
            const userData = storedUser ? JSON.parse(storedUser) : null;
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

            const res = await fetch(`${apiUrl}/api/v1/officers/${officer.id}/regenerate-password`, {
                method: 'POST',
                headers: { 'x-user-email': userData?.email || '' }
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);

            setNewCredentials({
                name: officer.name,
                email: officer.email,
                password: data.data.newPassword,
                emailSent: data.data.emailSent
            });
        } catch {
            toast.error('Failed to regenerate password');
        } finally {
            setRegeneratingId(null);
        }
    };

    const handleDelete = async (officer: Officer) => {
        setDeletingId(officer.id);
        setConfirmDeleteId(null);
        setActionId(null);
        try {
            const storedUser = localStorage.getItem('civicpath_user');
            const userData = storedUser ? JSON.parse(storedUser) : null;
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

            const res = await fetch(`${apiUrl}/api/v1/officers/${officer.id}`, {
                method: 'DELETE',
                headers: { 'x-user-email': userData?.email || '' }
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);

            onDelete(officer.id);
            toast.success(`Officer ${officer.name} deleted`);
        } catch {
            toast.error('Failed to delete officer');
        } finally {
            setDeletingId(null);
        }
    };

    const handleResendCredentials = async (officer: Officer) => {
        setResendingId(officer.id);
        setActionId(null);
        try {
            const storedUser = localStorage.getItem('civicpath_user');
            const userData = storedUser ? JSON.parse(storedUser) : null;
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

            const res = await fetch(`${apiUrl}/api/v1/officers/${officer.id}/resend-credentials`, {
                method: 'POST',
                headers: { 'x-user-email': userData?.email || '' }
            });
            const data = await res.json();
            if (data.emailSent) {
                toast.success(`Login reminder sent to ${officer.email}`);
            } else {
                toast(`Reminder sent (email delivery may be delayed)`, { icon: '📧' });
            }
        } catch {
            toast.error('Failed to resend credentials');
        } finally {
            setResendingId(null);
        }
    };

    const handleStatusToggle = async (officer: Officer) => {
        const newStatus = officer.status === 'active' ? 'inactive' : 'active';
        try {
            const storedUser = localStorage.getItem('civicpath_user');
            const userData = storedUser ? JSON.parse(storedUser) : null;
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

            const res = await fetch(`${apiUrl}/api/v1/officers/${officer.id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'x-user-email': userData?.email || '' },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await res.json();
            if (!data.success) throw new Error(data.error);

            onStatusChange(officer.id, newStatus);
            toast.success(`Officer ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
        } catch {
            toast.error('Failed to update officer status');
        }
        setActionId(null);
    };

    if (officers.length === 0) {
        return (
            <div className="text-center py-10">
                <User className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400 font-medium">No officers created yet</p>
                <p className="text-xs text-gray-400 mt-1">Click "Create Officer" to add your first officer</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {officers.map(officer => (
                <div key={officer.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    {/* Avatar */}
                    <div className="w-10 h-10 bg-gradient-to-br from-civic-blue to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-black text-sm">{officer.name.charAt(0).toUpperCase()}</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate">{officer.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                            <Building2 className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            <p className="text-xs text-gray-500 truncate">{officer.department}</p>
                        </div>
                        {officer.last_login && (
                            <div className="flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3 text-gray-300" />
                                <p className="text-xs text-gray-400">
                                    Last login: {new Date(officer.last_login).toLocaleDateString()}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Status badge */}
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${
                        officer.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-600'
                    }`}>
                        {officer.status}
                    </span>

                    {/* Actions */}
                    <div className="relative flex-shrink-0">
                        <button
                            onClick={() => setActionId(actionId === officer.id ? null : officer.id)}
                            disabled={resendingId === officer.id}
                            className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {resendingId === officer.id
                                ? <Mail className="w-4 h-4 text-blue-500 animate-pulse" />
                                : <MoreVertical className="w-4 h-4 text-gray-500" />
                            }
                        </button>
                        {actionId === officer.id && (
                            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-xl shadow-lg z-10 min-w-[160px] py-1">
                                <button
                                    onClick={() => handleResendCredentials(officer)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
                                >
                                    <Mail className="w-4 h-4 text-blue-500" />
                                    <span className="text-blue-600">Resend Credentials</span>
                                </button>
                                <button
                                    onClick={() => handleRegeneratePassword(officer)}
                                    disabled={regeneratingId === officer.id}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-purple-50 transition-colors disabled:opacity-50"
                                >
                                    <KeyRound className="w-4 h-4 text-purple-500" />
                                    <span className="text-purple-600">
                                        {regeneratingId === officer.id ? 'Regenerating...' : 'Regenerate Password'}
                                    </span>
                                </button>
                                <button
                                    onClick={() => handleStatusToggle(officer)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
                                >
                                    {officer.status === 'active' ? (
                                        <><XCircle className="w-4 h-4 text-red-500" /><span className="text-red-600">Deactivate</span></>
                                    ) : (
                                        <><CheckCircle className="w-4 h-4 text-green-500" /><span className="text-green-600">Activate</span></>
                                    )}
                                </button>
                                <div className="border-t border-gray-100 my-1" />
                                <button
                                    onClick={() => { setConfirmDeleteId(officer.id); setActionId(null); }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-red-50 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                    <span className="text-red-600">Delete Officer</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ))}

            {/* New Password Modal */}
            {newCredentials && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <KeyRound className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-black text-gray-900 text-center">Password Regenerated</h3>
                        <p className="text-sm text-gray-500 text-center mt-1 mb-5">
                            New credentials for <span className="font-semibold text-gray-700">{newCredentials.name}</span>
                        </p>
                        <div className="space-y-3 mb-5">
                            <div className="bg-gray-50 rounded-xl p-3">
                                <p className="text-xs text-gray-400 mb-1">Email</p>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold text-gray-800">{newCredentials.email}</p>
                                    <button onClick={() => { navigator.clipboard.writeText(newCredentials.email); toast.success('Copied!'); }}>
                                        <Copy className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                                    </button>
                                </div>
                            </div>
                            <div className="bg-purple-50 rounded-xl p-3">
                                <p className="text-xs text-purple-400 mb-1">New Password</p>
                                <div className="flex items-center justify-between">
                                    <p className="font-mono font-bold text-purple-800 text-lg">{newCredentials.password}</p>
                                    <button onClick={() => { navigator.clipboard.writeText(newCredentials.password); toast.success('Copied!'); }}>
                                        <Copy className="w-4 h-4 text-purple-400 hover:text-purple-600" />
                                    </button>
                                </div>
                            </div>
                            <div className={`rounded-xl p-3 ${newCredentials.emailSent ? 'bg-green-50' : 'bg-amber-50'}`}>
                                <p className={`text-xs ${newCredentials.emailSent ? 'text-green-700' : 'text-amber-700'}`}>
                                    {newCredentials.emailSent
                                        ? '✅ New credentials emailed to officer'
                                        : '📋 Email not configured — share credentials manually'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setNewCredentials(null)}
                            className="w-full py-2.5 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 text-sm"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}

            {/* Confirm Delete Dialog */}
            {confirmDeleteId !== null && (() => {
                const officer = officers.find(o => o.id === confirmDeleteId);
                if (!officer) return null;
                return (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-black text-gray-900 text-center">Delete Officer?</h3>
                            <p className="text-sm text-gray-500 text-center mt-2 mb-6">
                                <span className="font-semibold text-gray-700">{officer.name}</span> will be permanently removed. This cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDelete(officer)}
                                    disabled={deletingId === officer.id}
                                    className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 text-sm"
                                >
                                    {deletingId === officer.id ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}
