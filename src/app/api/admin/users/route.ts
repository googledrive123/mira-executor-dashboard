// src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest) {
  try {
    // Check admin auth
    const adminAuth = request.cookies.get('adminAuth')?.value;
    if (adminAuth !== 'true') {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { rows } = await sql`
      SELECT 
        u.id,
        u.created_at,
        COUNT(DISTINCT uk.id) as key_count,
        COUNT(DISTINCT us.id) as execution_count
      FROM users u
      LEFT JOIN user_keys uk ON u.id = uk.user_id
      LEFT JOIN usage_stats us ON u.id = us.user_id
      GROUP BY u.id, u.created_at
      ORDER BY u.created_at DESC
    `;

    return NextResponse.json({ users: rows });
  } catch (error) {
    console.error('Admin users fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}