import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://128.134.64.51:19996/api';

export async function GET() {
  try {
    const baseUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;
    const apiUrl = `${baseUrl}/api/v2/dex/swap-action-requests`;

    console.log('프록시 API 요청 URL:', apiUrl);

    const response = await fetch(apiUrl, {
      cache: 'no-store',
      headers: {
        accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('프록시 API 오류:', error);
    return NextResponse.json({ success: false, error: 'API 요청 실패' }, { status: 500 });
  }
}
