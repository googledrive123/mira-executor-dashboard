// src/app/api/admin/auth/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
    // Use an environment variable for the admin password
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme123';
    
    if (password === ADMIN_PASSWORD) {
      const response = NextResponse.json({ success: true });
      response.cookies.set('adminAuth', 'true', { 
        path: '/', 
        httpOnly: true, 
        secure: true, 
        sameSite: 'strict',
        maxAge: 3600 // 1 hour
      });
      return response;
    }
    
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  } catch (error) {
    console.error('Admin auth error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}