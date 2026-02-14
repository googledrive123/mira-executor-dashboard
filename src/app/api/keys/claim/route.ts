// src/app/api/keys/claim/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  try {
    const { sessionKey, hwid } = await request.json();

    if (!sessionKey || !hwid) {
      return NextResponse.json({ error: 'Missing sessionKey or hwid.' }, { status: 400 });
    }

    // Find the key
    const { rows } = await sql`
      SELECT id, user_id, hwid, is_active FROM user_keys WHERE session_key = ${sessionKey}
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Invalid session key.' }, { status: 404 });
    }

    const key = rows[0];

    if (!key.is_active) {
      return NextResponse.json({ error: 'This key has been deactivated.' }, { status: 403 });
    }

    // If HWID is already set, verify it matches
    if (key.hwid) {
      if (key.hwid !== hwid) {
        return NextResponse.json({ error: 'HWID mismatch. This key is locked to another machine.' }, { status: 403 });
      }
      return NextResponse.json({ success: true, message: 'Key validated.' });
    }

    // Lock the key to this HWID
    await sql`
      UPDATE user_keys
      SET hwid = ${hwid}
      WHERE id = ${key.id}
    `;

    return NextResponse.json({ success: true, message: 'Key locked to this machine.' });

  } catch (error) {
    console.error('Key claim error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}