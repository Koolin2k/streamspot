'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Clock,
  ChefHat,
  CheckCircle2,
  PackageCheck,
  XCircle,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';

type OrderStatus = 'pending' | 'preparing' | 'ready' | 'picked_up' | 'cancelled';

interface Order {
  id: string;
  order_number: string;
  status: OrderStatus;
  customer_name: string | null;
  items_json: Array<{ name: string; quantity: string; amount?: number }> | null;
  total_amount: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string;
    description: string;
    Icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
    borderColor: string;
    pulse?: boolean;
  }
> = {
  pending: {
    label: 'Order Received',
    description: 'Your order is in the queue and will be started shortly.',
    Icon: Clock,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10',
    borderColor: 'border-yellow-400/20',
  },
  preparing: {
    label: 'Being Prepared',
    description: "We're working on your order right now!",
    Icon: ChefHat,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    borderColor: 'border-blue-400/20',
    pulse: true,
  },
  ready: {
    label: 'Ready for Pickup!',
    description: 'Your order is ready. Please come to the counter!',
    Icon: CheckCircle2,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-400/10',
    borderColor: 'border-emerald-400/20',
    pulse: true,
  },
  picked_up: {
    label: 'Picked Up',
    description: 'This order has been picked up. Enjoy!',
    Icon: PackageCheck,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/10',
    borderColor: 'border-border',
  },
  cancelled: {
    label: 'Cancelled',
    description: 'This order was cancelled. Please speak to staff.',
    Icon: XCircle,
    color: 'text-red-400',
    bgColor: 'bg-red-400/10',
    borderColor: 'border-red-400/20',
  },
};

// The four forward-progress steps shown in the tracker
const PROGRESS_STEPS: OrderStatus[] = ['pending', 'preparing', 'ready', 'picked_up'];

export default function OrderStatusPage({ params }: { params: { orderNumber: string } }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchOrder = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders/${params.orderNumber}`);
      if (!res.ok) {
        setError('Order not found. Please check your order number.');
        setLoading(false);
        return;
      }
      const data = await res.json();
      setOrder(data.order);
      setLastUpdated(new Date());
    } catch {
      setError('Could not load order. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [params.orderNumber]);

  useEffect(() => {
    fetchOrder();
    // Poll every 30 seconds — customers can have up to 1 hour wait
    const interval = setInterval(fetchOrder, 30_000);
    return () => clearInterval(interval);
  }, [fetchOrder]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground animate-pulse text-sm">Loading your order…</div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-sm">
          <XCircle className="w-14 h-14 text-red-400 mx-auto" />
          <h1 className="text-xl font-semibold">{error ?? 'Order not found'}</h1>
          <Link
            href="/orders/status"
            className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Try a different order number
          </Link>
        </div>
      </main>
    );
  }

  const config = STATUS_CONFIG[order.status];
  const { Icon } = config;
  const stepIndex = PROGRESS_STEPS.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <main className="min-h-screen p-6 pb-24 max-w-md mx-auto space-y-8">
      {/* Back link */}
      <Link
        href="/orders/status"
        className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm transition-colors pt-4"
      >
        <ArrowLeft className="w-4 h-4" /> Check another order
      </Link>

      {/* Order number header */}
      <div className="text-center space-y-1">
        <p className="text-muted-foreground text-sm uppercase tracking-widest">Order</p>
        <h1 className="text-6xl font-bold font-mono tracking-tight">#{order.order_number}</h1>
        {order.customer_name && (
          <p className="text-muted-foreground text-sm">{order.customer_name}</p>
        )}
      </div>

      {/* Status card */}
      <div
        className={`rounded-2xl p-8 text-center space-y-4 border ${config.bgColor} ${config.borderColor}`}
      >
        <Icon
          className={`w-20 h-20 mx-auto ${config.color} ${config.pulse ? 'animate-pulse' : ''}`}
        />
        <div>
          <h2 className={`text-2xl font-bold ${config.color}`}>{config.label}</h2>
          <p className="text-muted-foreground mt-1 text-sm">{config.description}</p>
        </div>

        {/* Big "READY" pulse for pickup notification */}
        {order.status === 'ready' && (
          <div className="mt-2 px-6 py-3 bg-emerald-500 rounded-full text-white font-bold text-lg animate-bounce inline-block">
            Come pick up your order!
          </div>
        )}
      </div>

      {/* Progress steps (not shown for cancelled) */}
      {!isCancelled && (
        <div className="flex items-center">
          {PROGRESS_STEPS.map((step, i) => {
            const stepConfig = STATUS_CONFIG[step];
            const StepIcon = stepConfig.Icon;
            const isCompleted = stepIndex >= i;
            const isCurrent = stepIndex === i;

            return (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                        : 'bg-muted text-muted-foreground'
                    } ${isCurrent ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
                  >
                    <StepIcon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-xs text-center leading-tight max-w-[56px] ${
                      isCompleted ? 'text-foreground font-medium' : 'text-muted-foreground'
                    }`}
                  >
                    {stepConfig.label.split(' ')[0]}
                  </span>
                </div>
                {i < PROGRESS_STEPS.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-1 -mt-5 transition-colors ${
                      stepIndex > i ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Order items */}
      {order.items_json && order.items_json.length > 0 && (
        <div className="border rounded-xl p-4 space-y-3">
          <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-widest">
            Your Items
          </h3>
          <div className="space-y-2">
            {order.items_json.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>{item.name}</span>
                <span className="text-muted-foreground">×{item.quantity}</span>
              </div>
            ))}
          </div>
          {order.total_amount != null && (
            <div className="pt-2 border-t flex justify-between font-semibold text-sm">
              <span>Total</span>
              <span>${(order.total_amount / 100).toFixed(2)}</span>
            </div>
          )}
        </div>
      )}

      {/* Notes */}
      {order.notes && (
        <p className="text-sm text-muted-foreground italic text-center">{order.notes}</p>
      )}

      {/* Auto-refresh notice */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <RefreshCw className="w-3 h-3" />
        <span>
          Auto-refreshes every 30s · Last checked {lastUpdated.toLocaleTimeString()}
        </span>
      </div>
    </main>
  );
}
