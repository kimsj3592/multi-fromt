import { DataLoader } from '@/components/data-loader';
import { Activity } from 'lucide-react';

export default function Home() {
  return (
    <main className='min-h-screen bg-background'>
      <div className='container mx-auto py-8 px-4 max-w-7xl'>
        <div className='mb-8'>
          <div className='flex items-center gap-3 mb-3'>
            <div className='p-2 rounded-lg bg-primary/10'>
              <Activity className='h-6 w-6 text-primary' />
            </div>
            <div>
              <h1 className='text-3xl font-bold tracking-tight'>Swap Action Requests</h1>
              <p className='text-muted-foreground mt-1'>DEX 스왑 액션 요청 데이터를 확인하고 필터링할 수 있습니다.</p>
            </div>
          </div>
        </div>
        <DataLoader />
      </div>
    </main>
  );
}
