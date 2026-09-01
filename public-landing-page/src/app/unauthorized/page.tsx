"use client";
import Link from 'next/link';

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="text-6xl mb-4">🚫</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
                <p className="text-gray-600 mb-4">
                    You don't have permission to access this page.
                </p>
                
                <div className="bg-yellow-50 p-3 rounded-lg mb-4">
                    <p className="text-sm text-yellow-700">
                        You need admin or MLA privileges to access administrative features.
                    </p>
                </div>

                <div className="space-y-3">
                    <Link 
                        href="/citizen" 
                        className="block w-full bg-civic-blue text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Go to Citizen Portal
                    </Link>
                    
                    <Link 
                        href="/admin/login" 
                        className="block w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                    >
                        Admin/MLA Login
                    </Link>

                    <button 
                        onClick={() => window.history.back()}
                        className="block w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                    >
                        Go Back
                    </button>
                </div>

                <div className="mt-6 text-xs text-gray-500">
                    <p>Need access? Contact your system administrator.</p>
                </div>
            </div>
        </div>
    );
}