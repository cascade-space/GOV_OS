"use client";
import { CitizenLayout } from "@/components/layout/CitizenLayout";
import { BarChart3, CheckCircle2, Clock, MapPin, TrendingUp, Users, AlertCircle, FileText } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLogin } from "@/contexts/LoginContext";
import api from "@/lib/api-client";
import { useEffect, useState } from "react";

export default function PublicDashboardPage() {
    const { t } = useLanguage();
    const { user } = useLogin();
    const [myComplaints, setMyComplaints] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setLoading(true);
            api.get("/complaints/public/my")
                .then(res => setMyComplaints(res))
                .catch(err => console.error("Failed to fetch my complaints", err))
                .finally(() => setLoading(false));
        }
    }, [user]);

    const KPI_DATA = [
        { label: "Total Complaints", value: "2,450", icon: <Users className="w-6 h-6 text-blue-500" />, bg: "bg-blue-50" },
        { label: "Resolved", value: "1,832", icon: <CheckCircle2 className="w-6 h-6 text-green-500" />, bg: "bg-green-50" },
        { label: "In Progress", value: "450", icon: <Clock className="w-6 h-6 text-orange-500" />, bg: "bg-orange-50" },
        { label: "Avg Resolution", value: "3.2 Days", icon: <TrendingUp className="w-6 h-6 text-purple-500" />, bg: "bg-purple-50" },
    ];

    const RECENT_ACTIVITY = [
        { id: "CMP-2024-0321", category: "Roads", status: "Resolved", ward: "Ward 12", time: "2 hours ago" },
        { id: "CMP-2024-0322", category: "Water Supply", status: "In Progress", ward: "Ward 7", time: "5 hours ago" },
        { id: "CMP-2024-0323", category: "Street Lighting", status: "Assigned", ward: "Ward 3", time: "1 day ago" },
        { id: "CMP-2024-0324", category: "Sanitation", status: "Resolved", ward: "Ward 5", time: "1 day ago" },
    ];

    return (
        <CitizenLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                <div className="mb-8 animate-slide-up">
                    <h1 className="text-3xl font-black text-gray-900">Public Dashboard</h1>
                    <p className="text-gray-500 mt-2">Live civic metrics and complaint resolution statistics.</p>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {KPI_DATA.map((kpi, i) => (
                        <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${kpi.bg}`}>
                                {kpi.icon}
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">{kpi.label}</p>
                                <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Activity Feed / My Complaints */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                {user ? <FileText className="w-5 h-5 text-civic-blue" /> : <Clock className="w-5 h-5 text-civic-blue" />}
                                {user ? "My Complaints" : "Recent Activity"}
                            </h2>
                            {!user && <button className="text-sm text-civic-blue font-medium hover:underline">View All</button>}
                        </div>
                        
                        {user ? (
                            <div className="space-y-4">
                                {loading ? (
                                    <div className="text-center py-8 text-gray-500">Loading complaints...</div>
                                ) : myComplaints.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500 flex flex-col items-center">
                                        <AlertCircle className="w-8 h-8 text-gray-300 mb-2" />
                                        <p>You haven't submitted any complaints yet.</p>
                                    </div>
                                ) : (
                                    myComplaints.map((c, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-2 h-2 rounded-full ${c.status === 'RESOLVED' ? 'bg-green-500' : 'bg-orange-500'}`} />
                                                <div>
                                                    <p className="font-semibold text-gray-900">{c.complaintNumber} - {c.category}</p>
                                                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                                        <MapPin className="w-3.5 h-3.5" /> {c.locationAddress || 'Location provided'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                    c.status === 'RESOLVED' ? 'bg-green-100 text-green-700' :
                                                    c.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-orange-100 text-orange-700'
                                                }`}>
                                                    {c.status}
                                                </span>
                                                <p className="text-xs text-gray-400 mt-1">{new Date(c.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {RECENT_ACTIVITY.map((activity, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-2 h-2 rounded-full ${activity.status === 'Resolved' ? 'bg-green-500' : 'bg-orange-500'}`} />
                                            <div>
                                                <p className="font-semibold text-gray-900">{activity.id} - {activity.category}</p>
                                                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                                    <MapPin className="w-3.5 h-3.5" /> {activity.ward}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                activity.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                                                activity.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                                'bg-orange-100 text-orange-700'
                                            }`}>
                                                {activity.status}
                                            </span>
                                            <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick Stats / Distribution */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
                            <BarChart3 className="w-5 h-5 text-civic-orange" />
                            Category Breakdown
                        </h2>
                        <div className="space-y-5">
                            {[
                                { name: "Roads & Infra", percent: 45, color: "bg-blue-500" },
                                { name: "Water Supply", percent: 25, color: "bg-cyan-500" },
                                { name: "Sanitation", percent: 15, color: "bg-green-500" },
                                { name: "Electricity", percent: 10, color: "bg-yellow-500" },
                                { name: "Other", percent: 5, color: "bg-gray-400" },
                            ].map((cat) => (
                                <div key={cat.name}>
                                    <div className="flex justify-between text-sm mb-1.5">
                                        <span className="font-medium text-gray-700">{cat.name}</span>
                                        <span className="text-gray-500">{cat.percent}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div className={`${cat.color} h-2 rounded-full`} style={{ width: `${cat.percent}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </CitizenLayout>
    );
}
