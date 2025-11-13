'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

interface Order {
  id: string;
  customer_email: string;
  customer_name: string;
  total: number;
  status: string;
  created_at: string;
  items_count: number;
}

export default function AdminOrdersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock data - replace with actual API call
  const orders: Order[] = [];

  const filteredOrders = orders.filter(
    (order) =>
      order.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Orders</h1>
        <p className="text-secondary mt-2">Manage customer orders and fulfillment</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <Input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="text-sm text-secondary">
          {filteredOrders.length} orders
        </div>
      </div>

      {/* Orders Table */}
      <Card className="overflow-hidden">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 text-secondary mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="text-lg font-semibold text-foreground mb-2">No orders yet</h3>
            <p className="text-secondary">Orders will appear here when customers make purchases</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 text-sm font-semibold text-foreground">Order ID</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-foreground">Customer</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-foreground">Items</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-foreground">Total</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-foreground">Status</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-foreground">Date</th>
                  <th className="text-right py-4 px-4 text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-4 px-4">
                      <span className="text-sm font-mono text-foreground">
                        #{order.id.substring(0, 8)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">{order.customer_name}</p>
                        <p className="text-xs text-secondary">{order.customer_email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-foreground">{order.items_count} items</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm font-semibold text-foreground">
                        ${order.total.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-secondary">
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="p-2 text-secondary hover:text-accent transition-colors"
                          title="View order"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Order Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        <Card className="p-6">
          <p className="text-sm text-secondary mb-2">Total Orders</p>
          <p className="text-3xl font-bold text-foreground">0</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-secondary mb-2">Pending</p>
          <p className="text-3xl font-bold text-yellow-600">0</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-secondary mb-2">Processing</p>
          <p className="text-3xl font-bold text-blue-600">0</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-secondary mb-2">Completed</p>
          <p className="text-3xl font-bold text-green-600">0</p>
        </Card>
      </div>
    </div>
  );
}
