import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getClient, updateClient, deleteClient } from '@/lib/db';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }
  try {
    const { id } = await context.params;
    const client = await getClient(session.userId, id);
    if (!client) {
      return NextResponse.json({ error: '고객을 찾을 수 없습니다.' }, { status: 404 });
    }
    return NextResponse.json(client);
  } catch (error) {
    return NextResponse.json({ error: '고객 정보를 불러오지 못했습니다.' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }
  try {
    const { id } = await context.params;
    const body = await request.json();
    const client = await updateClient(session.userId, id, body);
    if (!client) {
      return NextResponse.json({ error: '고객을 찾을 수 없습니다.' }, { status: 404 });
    }
    return NextResponse.json(client);
  } catch (error) {
    const message = error instanceof Error ? error.message : '고객 정보를 수정하지 못했습니다.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }
  try {
    const { id } = await context.params;
    const success = await deleteClient(session.userId, id);
    if (!success) {
      return NextResponse.json({ error: '고객을 찾을 수 없습니다.' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: '고객을 삭제하지 못했습니다.' }, { status: 500 });
  }
}
