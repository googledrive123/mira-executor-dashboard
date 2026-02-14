// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  try {
    const { loginKey } = await request.json();
    if (!loginKey || loginKey.length !== 52) {
      return NextResponse.json({ error: 'Invalid key format.' }, { status: 400 });
    }

    // Find the user by checking the provided key against all stored hashes
    const { rows: users } = await sql`SELECT id, login_key_hash FROM users`;
    let userId = null;
    for (const user of users) {
      const isMatch = await bcrypt.compare(loginKey, user.login_key_hash);
      if (isMatch) {
        userId = user.id;
        break;
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Invalid key.' }, { status: 401 });
    }

    // On success, set a cookie and return success
    const response = NextResponse.json({ success: true, userId });
    
    // Set cookie with proper settings for localhost
    response.cookies.set('userId', userId, { 
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Changed from 'strict' to 'lax'
      maxAge: 60 * 60 * 24 // 24 hours
    });
    
    return response;

  } catch (error) {
    console.error('Mira Executor Login error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}