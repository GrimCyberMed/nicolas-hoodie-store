'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

interface SupportTicket {
  id: string;
  ticket_number: string;
  customer_email: string;
  customer_name: string | null;
  subject: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_type: string;
  message: string;
  is_internal: boolean;
  created_at: string;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
  is_active: boolean;
  view_count: number;
  helpful_count: number;
}

type TabType = 'tickets' | 'faq';

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState<TabType>('tickets');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketMessages, setTicketMessages] = useState<TicketMessage[]>([]);
  const [replyMessage, setReplyMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  
  // FAQ Form
  const [showFaqForm, setShowFaqForm] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);
  const [faqForm, setFaqForm] = useState({
    question: '',
    answer: '',
    category: 'general',
    sort_order: 0,
    is_active: true,
  });

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch tickets
      const { data: ticketsData } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch FAQs
      const { data: faqsData } = await supabase
        .from('faq_items')
        .select('*')
        .order('sort_order', { ascending: true });

      setTickets(ticketsData || []);
      setFaqs(faqsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTicketMessages = async (ticketId: string) => {
    const { data } = await supabase
      .from('ticket_messages')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });
    
    setTicketMessages(data || []);
  };

  const handleSelectTicket = async (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    await fetchTicketMessages(ticket.id);
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;

    try {
      await supabase.from('ticket_messages').insert([{
        ticket_id: selectedTicket.id,
        sender_type: 'admin',
        message: replyMessage,
        is_internal: isInternal,
      }]);

      // Update ticket status if it was waiting for customer
      if (selectedTicket.status === 'open') {
        await supabase
          .from('support_tickets')
          .update({ status: 'in_progress' })
          .eq('id', selectedTicket.id);
      }

      setReplyMessage('');
      setIsInternal(false);
      await fetchTicketMessages(selectedTicket.id);
      fetchData();
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Failed to send reply');
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string, status: string) => {
    try {
      const updateData: { status: string; resolved_at?: string | null } = { status };
      if (status === 'resolved' || status === 'closed') {
        updateData.resolved_at = new Date().toISOString();
      } else {
        updateData.resolved_at = null;
      }

      await supabase
        .from('support_tickets')
        .update(updateData)
        .eq('id', ticketId);

      fetchData();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status });
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // FAQ handlers
  const handleFaqSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFaq) {
        await supabase
          .from('faq_items')
          .update(faqForm)
          .eq('id', editingFaq.id);
      } else {
        await supabase
          .from('faq_items')
          .insert([faqForm]);
      }
      resetFaqForm();
      fetchData();
    } catch (error) {
      console.error('Error saving FAQ:', error);
      alert('Failed to save FAQ');
    }
  };

  const handleEditFaq = (faq: FAQItem) => {
    setEditingFaq(faq);
    setFaqForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      sort_order: faq.sort_order,
      is_active: faq.is_active,
    });
    setShowFaqForm(true);
  };

  const handleDeleteFaq = async (id: string) => {
    if (!confirm('Delete this FAQ?')) return;
    try {
      await supabase.from('faq_items').delete().eq('id', id);
      fetchData();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
    }
  };

  const resetFaqForm = () => {
    setFaqForm({
      question: '',
      answer: '',
      category: 'general',
      sort_order: 0,
      is_active: true,
    });
    setEditingFaq(null);
    setShowFaqForm(false);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      waiting_customer: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      resolved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      closed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    };
    return colors[status] || colors.open;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return colors[priority] || colors.medium;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      order_issue: 'Order Issue',
      product_question: 'Product Question',
      shipping: 'Shipping',
      returns: 'Returns',
      payment: 'Payment',
      account: 'Account',
      technical: 'Technical',
      feedback: 'Feedback',
      other: 'Other',
    };
    return labels[category] || category;
  };

  const filteredTickets = tickets.filter(ticket => {
    if (statusFilter !== 'all' && ticket.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && ticket.category !== categoryFilter) return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Customer Support</h1>
        <p className="text-muted-foreground mt-1">
          Manage support tickets and FAQ
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-border">
        {(['tickets', 'faq'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'text-accent border-b-2 border-accent'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'faq' ? 'FAQ' : tab}
          </button>
        ))}
      </div>

      {/* Tickets Tab */}
      {activeTab === 'tickets' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ticket List */}
          <div className="lg:col-span-1">
            {/* Filters */}
            <div className="flex gap-2 mb-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="waiting_customer">Waiting</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground"
              >
                <option value="all">All Categories</option>
                <option value="order_issue">Order Issue</option>
                <option value="shipping">Shipping</option>
                <option value="returns">Returns</option>
                <option value="payment">Payment</option>
                <option value="account">Account</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Ticket List */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredTickets.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No tickets found
                </div>
              ) : (
                filteredTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => handleSelectTicket(ticket)}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedTicket?.id === ticket.id
                        ? 'bg-accent/10 border-accent'
                        : 'bg-card border-border hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-mono text-muted-foreground">
                        {ticket.ticket_number}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </div>
                    <h4 className="font-medium text-foreground text-sm mb-1 line-clamp-1">
                      {ticket.subject}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(ticket.status)}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {getCategoryLabel(ticket.category)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Ticket Detail */}
          <div className="lg:col-span-2">
            {selectedTicket ? (
              <div className="bg-card border border-border rounded-lg">
                {/* Ticket Header */}
                <div className="p-4 border-b border-border">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-foreground text-lg">{selectedTicket.subject}</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedTicket.ticket_number} • {selectedTicket.customer_email}
                      </p>
                    </div>
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => handleUpdateTicketStatus(selectedTicket.id, e.target.value)}
                      className="px-3 py-1 bg-background border border-border rounded text-sm text-foreground"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="waiting_customer">Waiting for Customer</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(selectedTicket.priority)}`}>
                      {selectedTicket.priority}
                    </span>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-muted text-foreground">
                      {getCategoryLabel(selectedTicket.category)}
                    </span>
                  </div>
                </div>

                {/* Messages */}
                <div className="p-4 max-h-[400px] overflow-y-auto space-y-4">
                  {ticketMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-lg ${
                        msg.sender_type === 'admin'
                          ? msg.is_internal
                            ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                            : 'bg-accent/10 ml-8'
                          : 'bg-muted mr-8'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-foreground">
                          {msg.sender_type === 'admin' ? 'Support' : 'Customer'}
                          {msg.is_internal && ' (Internal Note)'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(msg.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-foreground whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  ))}
                </div>

                {/* Reply Form */}
                <div className="p-4 border-t border-border">
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your reply..."
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground mb-2"
                    rows={3}
                  />
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-foreground">
                      <input
                        type="checkbox"
                        checked={isInternal}
                        onChange={(e) => setIsInternal(e.target.checked)}
                        className="w-4 h-4"
                      />
                      Internal note (not visible to customer)
                    </label>
                    <Button onClick={handleSendReply} disabled={!replyMessage.trim()}>
                      Send Reply
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground">
                Select a ticket to view details
              </div>
            )}
          </div>
        </div>
      )}

      {/* FAQ Tab */}
      {activeTab === 'faq' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <p className="text-muted-foreground">
              Manage frequently asked questions
            </p>
            <Button onClick={() => setShowFaqForm(true)}>
              Add FAQ
            </Button>
          </div>

          {/* FAQ Form */}
          {showFaqForm && (
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-foreground mb-4">
                {editingFaq ? 'Edit FAQ' : 'New FAQ'}
              </h3>
              <form onSubmit={handleFaqSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Question *</label>
                  <input
                    type="text"
                    value={faqForm.question}
                    onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Answer *</label>
                  <textarea
                    value={faqForm.answer}
                    onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                    rows={4}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Category *</label>
                    <select
                      value={faqForm.category}
                      onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                    >
                      <option value="general">General</option>
                      <option value="orders">Orders</option>
                      <option value="shipping">Shipping</option>
                      <option value="returns">Returns</option>
                      <option value="payments">Payments</option>
                      <option value="products">Products</option>
                      <option value="account">Account</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Sort Order</label>
                    <input
                      type="number"
                      value={faqForm.sort_order}
                      onChange={(e) => setFaqForm({ ...faqForm, sort_order: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                      min="0"
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 text-sm text-foreground">
                      <input
                        type="checkbox"
                        checked={faqForm.is_active}
                        onChange={(e) => setFaqForm({ ...faqForm, is_active: e.target.checked })}
                        className="w-4 h-4"
                      />
                      Active
                    </label>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button type="submit">{editingFaq ? 'Update' : 'Create'}</Button>
                  <Button type="button" variant="outline" onClick={resetFaqForm}>Cancel</Button>
                </div>
              </form>
            </div>
          )}

          {/* FAQ List */}
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-bold text-foreground mb-2">{faq.question}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{faq.answer}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="px-2 py-1 bg-muted rounded">{faq.category}</span>
                      <span>Views: {faq.view_count}</span>
                      <span>Helpful: {faq.helpful_count}</span>
                      {!faq.is_active && (
                        <span className="text-red-500">Inactive</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEditFaq(faq)}
                      className="px-3 py-1 bg-accent text-white rounded text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteFaq(faq.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
