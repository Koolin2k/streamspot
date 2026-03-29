import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const VALID_STATUSES = ['pending', 'preparing', 'ready', 'picked_up', 'cancelled'] as const;

// GET /api/orders/[orderNumber] — customer-facing status lookup
export async function GET(
  _request: NextRequest,
  { params }: { params: { orderNumber: string } }
) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('order_number', params.orderNumber)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json({ order: data });
}

// PATCH /api/orders/[orderNumber] — staff updates order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { orderNumber: string } }
) {
  const body = await request.json();

  if (!VALID_STATUSES.includes(body.status)) {
    return NextResponse.json(
      { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('orders')
    .update({ status: body.status })
    .eq('order_number', params.orderNumber)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ order: data });
}
