import { NextResponse } from 'next/server';
import { getClients, createClient } from '@/lib/db';

export async function GET() {
  try {
    const clients = await getClients();
    return NextResponse.json(clients);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const client = await createClient(body);
    return NextResponse.json(client);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
  }
}
