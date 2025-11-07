import { NextResponse } from 'next/server';
import prisma from '@repo/db/client';
import crypto from 'crypto';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('x-razorpay-signature')!;

  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body).digest('hex');

  if (signature !== expected) return new NextResponse('Invalid', { status: 400 });

  const event = JSON.parse(body);
  if (event.event === 'refund.processed') {
    const refundId = event.payload.refund.entity.id;
    await prisma.wrongSendRequest.updateMany({
      where: { razorpayRefundId: refundId },
      data: { status: 'RETURNED' },
    });
  }

  return new NextResponse('OK');
}