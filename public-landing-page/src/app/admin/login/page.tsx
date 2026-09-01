"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
    MapPin, 
    Mail, 
    Lock, 
    Eye, 
    EyeOff, 
    LogIn, 
    Shield, 
    AlertCircle,
    Loader2
} from 'lucide-react';

interface LoginCredentials {
    email: string;
    password: string;
}

export default function AdminLoginPage() {
    const [credentials, setCredentials] = useState<LoginCredentials>({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const router = useRouter();

    // Check for existing session ONLY if there is one, don't show loading by default
    useEffect(() => {
        const storedUser = localStorage.getItem('civicpath_user');
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                const loginTime = new Date(userData.loginTime);
                const now = new Date();
                const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);
                
                if (hoursDiff < 24) {
                    // Valid session - redirect immediately
                    if (userData.role === 'admin') {
                        router.push('/admin/dashboard');
                    } else if (userData.role === 'mla') {
                        router.push('/mla/dashboard');
                    }
                } else {
                    // Expired session - clear it
                    localStorage.removeItem('civicpath_user');
                }
            } catch (error) {
                localStorage.removeItem('civicpath_user');
            }
        }
        // No loading state needed - form shows immediately
    }, [router]);

    const handleInputChange = (field: keyof LoginCredentials, value: string) => {
        setCredentials(prev => ({ ...prev, [field]: value }));
        if (error) setError(null);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/api/v1/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: credentials.email,
                    password: credentials.password
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                localStorage.setItem('civicpath_user', JSON.stringify(data.data));

                if (data.data.role === 'admin') {
                    router.push('/admin/dashboard');
                } else if (data.data.role === 'mla') {
                    router.push('/mla/dashboard');
                }
            } else {
                throw new Error(data.error || 'Login failed');
            }

        } catch (error) {
            setError(error instanceof Error ? error.message : 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    // Always show the login form - no loading screen for first-time visitors
    return (
        <div className="min-h-screen bg-gradient-to-br from-civic-blue via-blue-600 to-blue-800 flex items-center justify-center p-4">
            <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
            
            <div className="relative w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-civic-blue rounded-2xl mb-4">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 mb-2">Admin Portal</h1>
                        <p className="text-gray-500 text-sm">Sign in to access your dashboard</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    value={credentials.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-civic-blue focus:border-transparent transition-colors"
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={credentials.password}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-civic-blue focus:border-transparent transition-colors"
                                    placeholder="Enter your password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                                    ) : (
                                        <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !credentials.email || !credentials.password}
                            className="w-full bg-civic-blue text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-civic-blue focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    Sign In
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 p-4 bg-gray-50 rounded-xl">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Database Credentials:</h3>
                        <div className="space-y-2 text-xs text-gray-600">
                            <div className="flex justify-between">
                                <span className="font-medium">Admin:</span>
                                <span>admin@civicpath.com / admin123</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">MLA:</span>
                                <span>mla@civicpath.com / mla123</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <Link 
                            href="/citizen" 
                            className="text-sm text-civic-blue hover:text-blue-700 font-medium"
                        >
                            ← Back to Citizen Portal
                        </Link>
                    </div>
                </div>

                <div className="text-center mt-6">
                    <div className="flex items-center justify-center gap-2 text-white/80">
                        <MapPin className="w-5 h-5" />
                        <span className="font-semibold">CivicPath</span>
                    </div>
                    <p className="text-white/60 text-sm mt-1">Connecting Citizens with Government</p>
                </div>
            </div>
        </div>
    );
}