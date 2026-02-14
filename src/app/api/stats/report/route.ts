// src/app/api/stats/report/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  try {
    const { sessionKey, eventType, metadata } = await request.json();

    if (!sessionKey || !eventType) {
      return NextResponse.json({ error: 'Missing sessionKey or eventType.' }, { status: 400 });
    }

    // Find the user_id from the session key
    const { rows } = await sql`
      SELECT user_id FROM user_keys WHERE session_key = ${sessionKey} AND is_active = TRUE
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Invalid or inactive session key.' }, { status: 404 });
    }

    const userId = rows[0].user_id;

    // Insert the usage stat
    await sql`
      INSERT INTO usage_stats (user_id, event_type, metadata)
      VALUES (${userId}, ${eventType}, ${metadata ? JSON.stringify(metadata) : null})
    `;

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Stats report error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}