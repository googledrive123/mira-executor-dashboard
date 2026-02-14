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

    // Generate a secure 36-character session key for Mira Executor
    const sessionKey = randomBytes(18).toString('hex');

    // Insert the new key into the database for this user
    await sql`
      INSERT INTO user_keys (user_id, session_key)
      VALUES (${userId}, ${sessionKey})
    `;

    return NextResponse.json({ sessionKey });

  } catch (error) {
    console.error('Mira Executor Key generation error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}