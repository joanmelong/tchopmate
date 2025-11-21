/**
 * API Route: /api/orders/scan
 * Méthode: POST
 * Corps attendu: { qrData: string, validatedBy?: number }
 * qrData: JSON string encodée dans le QR (doit contenir au moins orderId)
 */

import { NextResponse } from 'next/server';
import { SupabaseOrderRepository } from '@/data/repositories/SupabaseOrderRepository';
import { ValidateOrderByScanUseCase } from '@/core/use-cases/order/ValidateOrderByScanUseCase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { qrData, validatedBy } = body;

    if (!qrData) {
      return NextResponse.json({ error: 'qrData missing' }, { status: 400 });
    }

    let payload: any;
    try {
      payload = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
    } catch (err) {
      return NextResponse.json({ error: 'Invalid qrData JSON' }, { status: 400 });
    }

    const orderId = Number(payload.orderId ?? payload.id);
    if (!orderId || Number.isNaN(orderId)) {
      return NextResponse.json({ error: 'orderId not found in qrData' }, { status: 400 });
    }

    const repo = new SupabaseOrderRepository();
    const useCase = new ValidateOrderByScanUseCase(repo);

    await useCase.execute(orderId, validatedBy);

    return NextResponse.json({ success: true, orderId });
  } catch (err: any) {
    console.error('API /api/orders/scan error:', err);
    return NextResponse.json({ error: err?.message ?? 'Unknown error' }, { status: 500 });
  }
}
