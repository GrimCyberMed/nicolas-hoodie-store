'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { StatsCard } from '@/components/admin/StatsCard';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

interface DashboardStats {
  totalProducts: number;
  inStock: number;
  outOfStock: number;
  lowStock: number;
  totalRevenue: number;
  totalOrders: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch dashboard stats
    // For now, using mock data
    setTimeout(() => {
      setStats({
        totalProducts: 6,
        inStock: 5,
        outOfStock: 1,
        lowStock: 2,
        totalRevenue: 0,
        totalOrders: 0,
      });
      setIsLoading(false);
    }, 500);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-secondary mt-2">Welcome to your admin dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Products"
          value={stats?.totalProducts || 0}
          icon={
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
          description={`${stats?.inStock} in stock, ${stats?.outOfStock} out of stock`}
        />

        <StatsCard
          title="Low Stock Alert"
          value={stats?.lowStock || 0}
          icon={
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
          description="Products with less than 5 items"
        />

        <StatsCard
          title="Total Revenue"
          value={`$${stats?.totalRevenue.toFixed(2) || '0.00'}`}
          icon={
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          trend={{ value: 0, isPositive: true }}
        />

        <StatsCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          icon={
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          description="All time orders"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/admin/products/new">
              <Button variant="primary" className="w-full justify-start">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add New Product
              </Button>
            </Link>
            <Link href="/admin/products">
              <Button variant="outline" className="w-full justify-start">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Manage Products
              </Button>
            </Link>
            <Link href="/admin/orders">
              <Button variant="outline" className="w-full justify-start">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                View Orders
              </Button>
            </Link>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
              <div>
                <p className="text-sm text-foreground">No recent activity</p>
                <p className="text-xs text-secondary mt-1">Activity will appear here</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">System Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-secondary">Database Status</p>
            <p className="text-lg font-semibold text-foreground mt-1">
              {stats ? '✓ Connected' : '✗ Not Connected'}
            </p>
          </div>
          <div>
            <p className="text-sm text-secondary">Last Backup</p>
            <p className="text-lg font-semibold text-foreground mt-1">Never</p>
          </div>
          <div>
            <p className="text-sm text-secondary">Version</p>
            <p className="text-lg font-semibold text-foreground mt-1">1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
