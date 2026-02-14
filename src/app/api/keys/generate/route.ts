// src/app/api/keys/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const userId = request.cookies.get('userId')?.value;
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    }

    // Check if user already has a key
    const { rows: existingKeys } = await sql`
      SELECT COUNT(*) as key_count
      FROM user_keys
      WHERE user_id = ${userId}
    `;

    if (existingKeys[0].key_count > 0) {
      return NextResponse.json({ 
        error: 'You already have a key. Only one key per user is allowed.' 
      }, { status: 403 });
    }

    // Generate a secure 36-character session key
    const sessionKey = randomBytes(18).toString('hex');

    // Insert the new key into the database for this user
    await sql`
      INSERT INTO user_keys (user_id, session_key)
      VALUES (${userId}, ${sessionKey})
    `;

    return NextResponse.json({ sessionKey });

  } catch (error) {
    console.error('Key generation error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}