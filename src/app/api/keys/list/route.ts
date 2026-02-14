// src/app/api/keys/list/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get('userId')?.value;
    
    console.log('Keys List API - userId from cookie:', userId);
    
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    }

    // Fetch all keys for this user
    const { rows } = await sql`
      SELECT id, session_key, hwid, is_active, created_at
      FROM user_keys
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;

    console.log('Keys List API - found', rows.length, 'keys');

    return NextResponse.json({ keys: rows });

  } catch (error) {
    console.error('Keys list fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}