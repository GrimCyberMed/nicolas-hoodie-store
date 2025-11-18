'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export default function SupportPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [ticketForm, setTicketForm] = useState({
    customer_email: '',
    customer_name: '',
    subject: '',
    category: 'other',
    priority: 'medium',
    message: '',
  });

  useEffect(() => {
    fetchFaqs();
    if (user) {
      setTicketForm(prev => ({
        ...prev,
        customer_email: user.email || '',
        customer_name: user.user_metadata?.full_name || '',
      }));
    }
  }, [user]);

  const fetchFaqs = async () => {
    const { data } = await supabase
      .from('faq_items')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    
    setFaqs(data || []);
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create ticket
      const { data: ticket, error: ticketError } = await supabase
        .from('support_tickets')
        .insert([{
          user_id: user?.id || null,
          customer_email: ticketForm.customer_email,
          customer_name: ticketForm.customer_name,
          subject: ticketForm.subject,
          category: ticketForm.category,
          priority: ticketForm.priority,
        }])
        .select()
        .single();

      if (ticketError) throw ticketError;

      // Add initial message
      await supabase.from('ticket_messages').insert([{
        ticket_id: ticket.id,
        sender_type: 'customer',
        message: ticketForm.message,
      }]);

      setSubmitSuccess(true);
      setTicketForm({
        customer_email: user?.email || '',
        customer_name: user?.user_metadata?.full_name || '',
        subject: '',
        category: 'other',
        priority: 'medium',
        message: '',
      });
    } catch (error) {
      console.error('Error submitting ticket:', error);
      alert('Failed to submit ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredFaqs = selectedCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  const categories = [
    { value: 'all', label: 'All' },
    { value: 'orders', label: 'Orders' },
    { value: 'shipping', label: 'Shipping' },
    { value: 'returns', label: 'Returns' },
    { value: 'payments', label: 'Payments' },
    { value: 'products', label: 'Products' },
    { value: 'account', label: 'Account' },
    { value: 'general', label: 'General' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            How can we help you?
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions or contact our support team
          </p>
        </div>

        {/* FAQ Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Frequently Asked Questions
          </h2>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === cat.value
                    ? 'bg-accent text-white'
                    : 'bg-muted text-foreground hover:bg-muted/80'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* FAQ List */}
          <div className="space-y-4">
            {filteredFaqs.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No FAQs found for this category.
              </p>
            ) : (
              filteredFaqs.map(faq => (
                <div
                  key={faq.id}
                  className="bg-card border border-border rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                  >
                    <span className="font-medium text-foreground">{faq.question}</span>
                    <svg
                      className={`w-5 h-5 text-muted-foreground transition-transform ${
                        expandedFaq === faq.id ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedFaq === faq.id && (
                    <div className="px-6 pb-4 text-muted-foreground">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* Contact Section */}
        <section>
          <div className="bg-card border border-border rounded-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Still need help?
              </h2>
              <p className="text-muted-foreground">
                Submit a support ticket and we&apos;ll get back to you within 24 hours
              </p>
            </div>

            {submitSuccess ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Ticket Submitted Successfully!
                </h3>
                <p className="text-muted-foreground mb-4">
                  We&apos;ve received your request and will respond to your email shortly.
                </p>
                <Button onClick={() => {
                  setSubmitSuccess(false);
                  setShowTicketForm(false);
                }}>
                  Submit Another Ticket
                </Button>
              </div>
            ) : showTicketForm ? (
              <form onSubmit={handleSubmitTicket} className="max-w-2xl mx-auto space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      value={ticketForm.customer_name}
                      onChange={(e) => setTicketForm({ ...ticketForm, customer_name: e.target.value })}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={ticketForm.customer_email}
                      onChange={(e) => setTicketForm({ ...ticketForm, customer_email: e.target.value })}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                    required
                    placeholder="Brief description of your issue"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Category *
                    </label>
                    <select
                      value={ticketForm.category}
                      onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                    >
                      <option value="order_issue">Order Issue</option>
                      <option value="product_question">Product Question</option>
                      <option value="shipping">Shipping</option>
                      <option value="returns">Returns</option>
                      <option value="payment">Payment</option>
                      <option value="account">Account</option>
                      <option value="technical">Technical</option>
                      <option value="feedback">Feedback</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Priority
                    </label>
                    <select
                      value={ticketForm.priority}
                      onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Message *
                  </label>
                  <textarea
                    value={ticketForm.message}
                    onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                    rows={5}
                    required
                    placeholder="Please describe your issue in detail..."
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowTicketForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="text-center">
                <Button onClick={() => setShowTicketForm(true)} size="lg">
                  Contact Support
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Contact Info */}
        <section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="text-3xl mb-3">📧</div>
            <h3 className="font-bold text-foreground mb-1">Email</h3>
            <p className="text-muted-foreground text-sm">support@nicolashoodie.com</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="text-3xl mb-3">⏰</div>
            <h3 className="font-bold text-foreground mb-1">Response Time</h3>
            <p className="text-muted-foreground text-sm">Within 24 hours</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="text-3xl mb-3">🌍</div>
            <h3 className="font-bold text-foreground mb-1">Hours</h3>
            <p className="text-muted-foreground text-sm">Mon-Fri, 9AM-6PM EST</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
