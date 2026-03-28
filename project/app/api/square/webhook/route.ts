import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';

/**
 * Square webhook handler.
 *
 * Setup in Square Developer Dashboard:
 *   1. Go to Webhooks → Add endpoint
 *   2. URL: https://your-domain.com/api/square/webhook
 *   3. Subscribe to: payment.completed, order.created, order.updated
 *   4. Copy the signature key → set SQUARE_WEBHOOK_SIGNATURE_KEY in .env.local
 *
 * When a customer pays at a Square terminal, this endpoint:
 *   - Creates an order in our DB with a short order number (e.g. "042")
 *   - Staff marks the order ready via the /staff/orders dashboard
 *   - Customer checks status at /orders/042
 */

function verifySignature(body: string, signature: string, key: string, url: string): boolean {
  const hmac = crypto.createHmac('sha256', key);
  hmac.update(url + body);
  return hmac.digest('base64') === signature;
}

export async function POST(request: NextRequest) {
  const body = await request.text();

  // Verify webhook signature when key is configured
  const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  if (signatureKey) {
    const signature = request.headers.get('x-square-hmacsha256-signature') ?? '';
    if (!verifySignature(body, signature, signatureKey, request.url)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
  }

  let event: Record<string, unknown>;
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const eventType = event.type as string;

  // Only handle events that represent a completed/new order
  if (eventType !== 'payment.completed' && eventType !== 'order.created') {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const eventData = event.data as Record<string, unknown> | undefined;
  const obj = eventData?.object as Record<string, unknown> | undefined;
  const payment = obj?.payment as Record<string, unknown> | undefined;
  const order = obj?.order as Record<string, unknown> | undefined;

  const squareOrderId = (payment?.order_id ?? order?.id) as string | undefined;
  if (!squareOrderId) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  // Idempotency: skip if we already have this Square order
  const { data: existing } = await supabase
    .from('orders')
    .select('id')
    .eq('square_order_id', squareOrderId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  // Generate order number: count of today's orders + 1
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startOfDay.toISOString());

  const orderNumber = String((count ?? 0) + 1).padStart(3, '0');

  // Parse line items from Square payload
  const lineItems = (
    (order as Record<string, unknown> | undefined)?.line_items ?? []
  ) as Array<{ name?: string; quantity?: string; base_price_money?: { amount?: number } }>;

  const items = lineItems.map((item) => ({
    name: item.name ?? 'Item',
    quantity: item.quantity ?? '1',
    amount: item.base_price_money?.amount,
  }));

  const amountMoney = payment?.amount_money as { amount?: number } | undefined;
  const totalMoney = (order as Record<string, unknown> | undefined)?.total_money as
    | { amount?: number }
    | undefined;

  await supabase.from('orders').insert({
    order_number: orderNumber,
    square_order_id: squareOrderId,
    square_payment_id: (payment?.id as string) ?? null,
    items_json: items.length > 0 ? items : null,
    total_amount: amountMoney?.amount ?? totalMoney?.amount ?? null,
    status: 'pending',
  });

  return NextResponse.json({ ok: true, order_number: orderNumber });
}
