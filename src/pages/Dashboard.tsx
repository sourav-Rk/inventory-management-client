
import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import {
  FaBox,
  FaChartLine,
  FaExclamationTriangle,
  FaUsers,
} from "react-icons/fa";

interface DashboardStats {
  totalSales: number;
  totalSalesValue: number;
  totalInventoryValue: number;
  totalItems : number;
  totalCustomers: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get(API_ENDPOINTS.REPORTS.DASHBOARD);
        setStats(response.data.data);
      } catch (err) {
        setError("Failed to load dashboard statistics");
        
        setStats({
          totalSales: 0,
          totalInventoryValue : 0,
          totalItems :0,
          totalSalesValue :0,
          totalCustomers: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-yellow-50 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 mx-auto text-amber-600 mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Sales value",
      value: `₹${stats?.totalSalesValue?.toFixed(2).toLocaleString() ?? "0"}`,
      icon: FaChartLine,
      gradient: "from-green-500 to-emerald-500",
      iconBg: "from-green-100 to-emerald-100",
    },
    {
      title: "Total Sales",
      value: stats?.totalSales || 0,
      icon: FaChartLine,
      gradient: "from-blue-500 to-indigo-500",
      iconBg: "from-blue-100 to-indigo-100",
    },
    {
      title: "Total Items",
      value: stats?.totalItems || 0,
      icon: FaExclamationTriangle,
      gradient: "from-orange-500 to-red-500",
      iconBg: "from-orange-100 to-red-100",
    },
      {
      title: "Total Inventory value",
      value: stats?.totalInventoryValue || 0,
      icon: FaChartLine,
      gradient: "from-blue-500 to-indigo-500",
      iconBg: "from-blue-100 to-indigo-100",
    },
    {
      title: "Total Customers",
      value: stats?.totalCustomers || 0,
      icon: FaUsers,
      gradient: "from-purple-500 to-pink-500",
      iconBg: "from-purple-100 to-pink-100",
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-yellow-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Dashboard Overview</h1>
            <p className="text-gray-600 text-sm mt-1">
              Welcome back! Here's what's happening with your inventory today.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-gray-600 font-medium">System Online</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg shadow-sm flex items-start gap-3">
            <svg className="w-5 h-5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="bg-white border-2 border-amber-200 rounded-2xl shadow-lg p-6 transition-all hover:shadow-xl hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${stat.iconBg} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 text-transparent bg-clip-text bg-linear-to-br ${stat.gradient}`} />
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className="bg-white border-2 border-amber-200 rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-linear-to-r from-amber-100 to-orange-100 px-6 py-4 border-b-2 border-amber-200">
              <h2 className="text-xl font-semibold text-gray-800">Quick Actions</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <button className="group flex flex-col items-center justify-center p-6 bg-linear-to-br from-amber-50 to-orange-50 rounded-xl hover:from-amber-100 hover:to-orange-100 border-2 border-amber-200 transition-all hover:shadow-md">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <FaBox className="text-amber-600 h-6 w-6" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    Add Item
                  </span>
                </button>
                <button className="group flex flex-col items-center justify-center p-6 bg-linear-to-br from-amber-50 to-orange-50 rounded-xl hover:from-amber-100 hover:to-orange-100 border-2 border-amber-200 transition-all hover:shadow-md">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <FaChartLine className="text-amber-600 h-6 w-6" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    New Sale
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white border-2 border-amber-200 rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-linear-to-r from-amber-100 to-orange-100 px-6 py-4 border-b-2 border-amber-200">
              <h2 className="text-xl font-semibold text-gray-800">System Status</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-linear-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Backend Status</span>
                  </div>
                  <span className="text-green-700 font-bold bg-green-100 px-3 py-1 rounded-full text-sm border border-green-300">
                    Online
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-linear-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Database</span>
                  </div>
                  <span className="text-green-700 font-bold bg-green-100 px-3 py-1 rounded-full text-sm border border-green-300">
                    Connected
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="bg-linear-to-r from-amber-500 to-orange-500 border-2 border-amber-400 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1">Getting Started</h3>
              <p className="text-sm opacity-90">
                Explore your inventory management system. Add items, track sales, and manage customers all in one place.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;