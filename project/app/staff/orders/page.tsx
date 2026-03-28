'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { Plus, RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type OrderStatus = 'pending' | 'preparing' | 'ready' | 'picked_up' | 'cancelled';

interface Order {
  id: string;
  order_number: string;
  status: OrderStatus;
  customer_name: string | null;
  items_json: Array<{ name: string; quantity: string }> | null;
  total_amount: number | null;
  notes: string | null;
  created_at: string;
  square_order_id: string | null;
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  preparing: 'Preparing',
  ready: 'Ready',
  picked_up: 'Picked Up',
  cancelled: 'Cancelled',
};

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  preparing: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  ready: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  picked_up: 'bg-muted/40 text-muted-foreground border-border',
  cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
};

// What status comes after the current one when clicking "Mark next"
const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: 'preparing',
  preparing: 'ready',
  ready: 'picked_up',
};

type FilterTab = OrderStatus | 'active';

export default function StaffOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>('active');
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [creating, setCreating] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchOrders = useCallback(async () => {
    const res = await fetch('/api/orders');
    const data = await res.json();
    setOrders(data.orders ?? []);
    setLastRefresh(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();
    // Auto-refresh every 15 seconds on the staff dashboard
    const interval = setInterval(fetchOrders, 15_000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  async function handleStatusChange(orderNumber: string, status: OrderStatus) {
    await fetch(`/api/orders/${orderNumber}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchOrders();
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: newName || null,
        notes: newNotes || null,
      }),
    });
    setNewName('');
    setNewNotes('');
    setShowCreate(false);
    setCreating(false);
    fetchOrders();
  }

  const filteredOrders = orders.filter((o) => {
    if (filter === 'active') return ['pending', 'preparing', 'ready'].includes(o.status);
    return o.status === filter;
  });

  const activeCounts = {
    pending: orders.filter((o) => o.status === 'pending').length,
    preparing: orders.filter((o) => o.status === 'preparing').length,
    ready: orders.filter((o) => o.status === 'ready').length,
  };

  const tabs: { key: FilterTab; label: string; count?: number }[] = [
    { key: 'active', label: 'Active', count: activeCounts.pending + activeCounts.preparing + activeCounts.ready },
    { key: 'pending', label: 'Pending', count: activeCounts.pending },
    { key: 'preparing', label: 'Preparing', count: activeCounts.preparing },
    { key: 'ready', label: 'Ready', count: activeCounts.ready },
    { key: 'picked_up', label: 'Picked Up' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <main className="min-h-screen p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between pt-2">
        <div>
          <h1 className="text-2xl font-bold font-space-grotesk">Order Dashboard</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Last refreshed {lastRefresh.toLocaleTimeString()} · auto-updates every 15s
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchOrders} title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button size="sm" onClick={() => setShowCreate((v) => !v)}>
            <Plus className="w-4 h-4 mr-1.5" />
            New Order
          </Button>
        </div>
      </div>

      {/* Create Order Panel */}
      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="border rounded-xl p-5 space-y-4 bg-muted/10"
        >
          <h2 className="font-semibold text-sm">Create Manual Order</h2>
          <Input
            placeholder="Customer name (optional)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Input
            placeholder="Notes — e.g. extra sauce, no onions (optional)"
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
          />
          <div className="flex gap-2">
            <Button type="submit" disabled={creating}>
              {creating ? 'Creating…' : 'Create Order'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowCreate(false);
                setNewName('');
                setNewNotes('');
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === tab.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/60 text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={`text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold ${
                  filter === tab.key ? 'bg-white/20' : 'bg-background'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="text-muted-foreground animate-pulse text-sm">Loading orders…</div>
      ) : filteredOrders.length === 0 ? (
        <div className="border border-dashed rounded-xl py-16 text-center text-muted-foreground text-sm">
          No orders in this category
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const nextStatus = NEXT_STATUS[order.status];
            const age = Math.round(
              (Date.now() - new Date(order.created_at).getTime()) / 60_000
            );

            return (
              <div
                key={order.id}
                className={`border rounded-xl p-4 flex items-start justify-between gap-4 ${
                  order.status === 'ready' ? 'border-emerald-500/40 bg-emerald-500/5' : ''
                }`}
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  {/* Order number + status badge */}
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-3xl font-bold font-mono leading-none">
                      #{order.order_number}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${
                        STATUS_STYLES[order.status]
                      }`}
                    >
                      {STATUS_LABELS[order.status]}
                    </span>
                    {order.square_order_id && (
                      <span className="text-xs text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full">
                        Square
                      </span>
                    )}
                  </div>

                  {/* Customer name */}
                  {order.customer_name && (
                    <p className="text-sm text-muted-foreground">{order.customer_name}</p>
                  )}

                  {/* Items */}
                  {order.items_json && order.items_json.length > 0 && (
                    <p className="text-sm text-muted-foreground truncate">
                      {order.items_json.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
                    </p>
                  )}

                  {/* Notes */}
                  {order.notes && (
                    <p className="text-xs text-muted-foreground italic">{order.notes}</p>
                  )}

                  {/* Meta */}
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {' · '}
                    {age < 60 ? `${age}m ago` : `${Math.floor(age / 60)}h ${age % 60}m ago`}
                    {order.total_amount != null &&
                      ` · $${(order.total_amount / 100).toFixed(2)}`}
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {nextStatus && (
                    <Button
                      size="sm"
                      className="whitespace-nowrap"
                      onClick={() => handleStatusChange(order.order_number, nextStatus)}
                    >
                      Mark {STATUS_LABELS[nextStatus]}
                    </Button>
                  )}
                  {order.status !== 'cancelled' && order.status !== 'picked_up' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="whitespace-nowrap text-red-400 border-red-400/30 hover:bg-red-400/10"
                      onClick={() => handleStatusChange(order.order_number, 'cancelled')}
                    >
                      Cancel
                    </Button>
                  )}
                  <a
                    href={`/orders/${order.order_number}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" /> Customer view
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
