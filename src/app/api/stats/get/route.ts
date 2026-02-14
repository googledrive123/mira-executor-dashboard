// src/app/api/stats/get/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get('userId')?.value;
    
    console.log('Stats API - userId from cookie:', userId);
    
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    }

    // Fetch aggregated stats for the user
    const { rows } = await sql`
      SELECT
        (SELECT COUNT(*) FROM usage_stats WHERE user_id = ${userId}) AS total_executions,
        (SELECT COUNT(*) FROM user_keys WHERE user_id = ${userId} AND is_active = TRUE) AS active_keys,
        (SELECT COUNT(*) FROM user_keys WHERE user_id = ${userId} AND hwid IS NOT NULL) AS locked_keys,
        (SELECT MAX(timestamp) FROM usage_stats WHERE user_id = ${userId}) AS last_used
    `;

    console.log('Stats API - query result:', rows[0]);

    return NextResponse.json(rows[0]);

  } catch (error) {
    console.error('Mira Executor Stats fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}