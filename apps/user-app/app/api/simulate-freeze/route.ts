import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: Request) {
  const body = await req.json();
  // Simulate bank freeze
  setTimeout(() => {
    axios.post('http://localhost:3002/hdfcWebhook', {
      token: body.token,
      amount: body.amount,
      status: 'FREEZE_SUCCESS',
      type: 'FREEZE'
    });
  }, 1000);
  return NextResponse.json({ ok: true });
}