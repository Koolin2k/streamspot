import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/orders — list orders (staff dashboard)
// Query params: ?status=pending|preparing|ready|picked_up|cancelled|active
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get('status');

  // Default: last 24 hours of orders
  const since = new Date();
  since.setHours(since.getHours() - 24);

  let query = supabase
    .from('orders')
    .select('*')
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false });

  if (statusFilter && statusFilter !== 'active') {
    query = query.eq('status', statusFilter);
  } else if (statusFilter === 'active') {
    query = query.in('status', ['pending', 'preparing', 'ready']);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ orders: data });
}

// POST /api/orders — create a new order (manual, by staff)
export async function POST(request: NextRequest) {
  const body = await request.json();

  // Generate order number: count of today's orders + 1, zero-padded to 3 digits
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const { count, error: countError } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startOfDay.toISOString());

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }

  const orderNumber = String((count ?? 0) + 1).padStart(3, '0');

  const { data, error } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      square_order_id: body.square_order_id ?? null,
      square_payment_id: body.square_payment_id ?? null,
      customer_name: body.customer_name ?? null,
      customer_phone: body.customer_phone ?? null,
      items_json: body.items ?? null,
      total_amount: body.total_amount ?? null,
      status: 'pending',
      notes: body.notes ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ order: data }, { status: 201 });
}
