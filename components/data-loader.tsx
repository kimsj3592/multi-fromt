'use client';

import { useEffect, useState } from 'react';
import { SwapTable } from '@/components/swap-table';
import { fetchSwapActionRequests } from '@/lib/api';
import { SwapActionRequest } from '@/types/swap-action-request';

export function DataLoader() {
  const [data, setData] = useState<SwapActionRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchSwapActionRequests();
        setData(result);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
        setError(errorMessage);
        console.error('데이터 로딩 오류:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='text-center'>
          <div className='inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]' />
          <p className='mt-4 text-muted-foreground'>데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='rounded-lg border border-destructive bg-destructive/10 p-4'>
        <h2 className='text-lg font-semibold text-destructive mb-2'>오류 발생</h2>
        <p className='text-destructive mb-2'>{error}</p>
        <p className='text-sm text-muted-foreground mb-2'>API 서버가 실행 중인지 확인해주세요.</p>
        <p className='text-xs text-muted-foreground'>요청 URL: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/api/v2/dex/swap-action-requests</p>
        <button onClick={() => window.location.reload()} className='mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90'>
          다시 시도
        </button>
      </div>
    );
  }

  return <SwapTable data={data} />;
}
