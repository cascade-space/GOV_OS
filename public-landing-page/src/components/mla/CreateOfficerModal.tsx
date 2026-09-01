"use client";
import { useState } from 'react';
import { X, User, Mail, Building2, Lock, RefreshCw, Eye, EyeOff, CheckCircle, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

interface CreateOfficerModalProps {
    onClose: () => void;
    onSuccess: (officer: Officer) => void;
}
interface Officer {
    id: number;
    name: string;
    email: string;
    department: string;
    status: string;
    created_at: string;
}

const DEPARTMENTS = [
    'Public Works', 'Health Department', 'Traffic Police', 'Water Supply',
    'Sanitation', 'Education', 'Revenue', 'Agriculture', 'Forest Department',
    'Social Welfare', 'Urban Development', 'Rural Development'
];

function generatePassword(): string {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$';
    return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export default function CreateOfficerModal({ onClose, onSuccess }: CreateOfficerModalProps) {
    const [form, setForm] = useState({ name: '', email: '', department: '', password: '' });
    const [autoGenerate, setAutoGenerate] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string; officer: Officer; emailSent?: boolean } | null>(null);

    const handleAutoGenerate = () => {
        setForm(prev => ({ ...prev, password: generatePassword() }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.department) {
            toast.error('Please fill all required fields');
            return;
        }
        if (!autoGenerate && !form.password) {
            toast.error('Please enter a password or use auto-generate');
            return;
        }

        setIsLoading(true);
        try {
            const storedUser = localStorage.getItem('civicpath_user');
            const userData = storedUser ? JSON.parse(storedUser) : null;
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

            const res = await fetch(`${apiUrl}/api/v1/officers/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-email': userData?.email || ''
                },
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    department: form.department,
                    ...(autoGenerate ? {} : { password: form.password })
                })
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Failed to create officer');
            }

            // Show credentials if password was auto-generated
            if (data.data.generatedPassword) {
                setCreatedCredentials({
                    email: form.email,
                    password: data.data.generatedPassword,
                    officer: data.data.officer,
                    emailSent: data.data.emailSent
                });
            } else {
                const emailMsg = data.data.emailSent ? ' — credentials emailed' : '';
                toast.success(`Officer created successfully${emailMsg}!`);
                onSuccess(data.data.officer);
                onClose();
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to create officer');
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
    };

    // Show credentials screen after successful creation
    if (createdCredentials) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                    <div className="text-center mb-6">
                        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <CheckCircle className="w-7 h-7 text-green-600" />
                        </div>
                        <h2 className="text-xl font-black text-gray-900">Officer Created!</h2>
                        <p className="text-sm text-gray-500 mt-1">Share these credentials with the officer</p>
                    </div>

                    <div className="space-y-3 mb-6">
                        <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-xs text-gray-500 mb-1">Email</p>
                            <div className="flex items-center justify-between">
                                <p className="font-semibold text-gray-800">{createdCredentials.email}</p>
                                <button onClick={() => copyToClipboard(createdCredentials.email)} className="text-civic-blue hover:text-blue-700">
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-xs text-gray-500 mb-1">Password (one-time)</p>
                            <div className="flex items-center justify-between">
                                <p className="font-mono font-bold text-gray-800 text-lg">{createdCredentials.password}</p>
                                <button onClick={() => copyToClipboard(createdCredentials.password)} className="text-civic-blue hover:text-blue-700">
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="bg-blue-50 rounded-xl p-3">
                            <p className="text-xs text-blue-700">
                                Officer login URL: <span className="font-semibold">/officer/login</span>
                            </p>
                        </div>
                        <div className={`rounded-xl p-3 ${createdCredentials.emailSent ? 'bg-green-50' : 'bg-gray-50'}`}>
                            <p className={`text-xs ${createdCredentials.emailSent ? 'text-green-700' : 'text-gray-500'}`}>
                                {createdCredentials.emailSent
                                    ? '✅ Credentials emailed to officer'
                                    : '📋 Email not configured — share credentials manually'}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            onSuccess(createdCredentials.officer);
                            onClose();
                        }}
                        className="w-full bg-civic-blue text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-black text-gray-900">Create Officer</h2>
                        <p className="text-sm text-gray-500">Add a new officer to your team</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name *</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={form.name}
                                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                placeholder="Enter officer's full name"
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-civic-blue focus:border-transparent text-sm"
                                required
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address *</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="email"
                                value={form.email}
                                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                placeholder="officer@example.com"
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-civic-blue focus:border-transparent text-sm"
                                required
                            />
                        </div>
                    </div>

                    {/* Department */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Department *</label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select
                                value={form.department}
                                onChange={e => setForm(p => ({ ...p, department: e.target.value }))}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-civic-blue focus:border-transparent text-sm appearance-none bg-white"
                                required
                            >
                                <option value="">Select department</option>
                                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-sm font-semibold text-gray-700">Password *</label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={autoGenerate}
                                    onChange={e => {
                                        setAutoGenerate(e.target.checked);
                                        if (e.target.checked) handleAutoGenerate();
                                        else setForm(p => ({ ...p, password: '' }));
                                    }}
                                    className="rounded"
                                />
                                <span className="text-xs text-gray-500">Auto-generate</span>
                            </label>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={autoGenerate ? '(auto-generated on submit)' : form.password}
                                onChange={e => !autoGenerate && setForm(p => ({ ...p, password: e.target.value }))}
                                placeholder={autoGenerate ? 'Will be auto-generated' : 'Enter password'}
                                disabled={autoGenerate}
                                className="w-full pl-10 pr-20 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-civic-blue focus:border-transparent text-sm disabled:bg-gray-50 disabled:text-gray-400"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                {!autoGenerate && (
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="p-1 text-gray-400 hover:text-gray-600">
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                )}
                            </div>
                        </div>
                        {autoGenerate && (
                            <p className="text-xs text-blue-600 mt-1">A secure password will be generated and shown after creation</p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 py-2.5 bg-civic-blue text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <><RefreshCw className="w-4 h-4 animate-spin" /> Creating...</>
                            ) : 'Create Officer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
