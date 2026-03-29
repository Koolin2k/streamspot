'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, PackageSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function OrderStatusPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = orderNumber.trim();
    if (!trimmed) return;
    // Normalize to 3-digit zero-padded number
    const normalized = String(parseInt(trimmed, 10)).padStart(3, '0');
    router.push(`/orders/${normalized}`);
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="space-y-3">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto">
            <PackageSearch className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold font-space-grotesk">Check Your Order</h1>
          <p className="text-muted-foreground">
            Enter the order number you received at the counter
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="e.g. 042"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value.replace(/\D/g, ''))}
            className="text-center text-2xl font-mono h-14 tracking-widest"
            maxLength={4}
            autoFocus
          />
          <Button
            type="submit"
            disabled={!orderNumber.trim()}
            className="w-full h-12 text-base"
          >
            <Search className="w-4 h-4 mr-2" />
            Check Status
          </Button>
        </form>

        <p className="text-xs text-muted-foreground">
          Your order number is printed on your receipt or displayed at the counter
        </p>
      </div>
    </main>
  );
}
