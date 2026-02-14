// src/app/api/admin/users/[userId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Check admin auth
    const adminAuth = request.cookies.get('adminAuth')?.value;
    if (adminAuth !== 'true') {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userId = params.userId;

    const { rows } = await sql`
      SELECT 
        uk.session_key,
        uk.hwid,
        uk.is_active,
        uk.created_at,
        COUNT(us.id) as execution_count
      FROM user_keys uk
      LEFT JOIN usage_stats us ON uk.user_id = us.user_id
      WHERE uk.user_id = ${userId}
      GROUP BY uk.id, uk.session_key, uk.hwid, uk.is_active, uk.created_at
      ORDER BY uk.created_at DESC
    `;

    return NextResponse.json({ keys: rows });
  } catch (error) {
    console.error('Admin user details fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}