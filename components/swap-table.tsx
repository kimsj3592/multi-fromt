'use client';

import * as React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Search, Filter, X, Columns3 } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { CopyButton } from '@/components/ui/copy-button';
import { Pagination } from '@/components/ui/pagination';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SwapActionRequest, SortField, SortDirection, FilterState } from '@/types/swap-action-request';

interface SwapTableProps {
  data: SwapActionRequest[];
}

// 지갑 주소 축약 함수
const formatWalletAddress = (address: string): string => {
  if (address.length <= 10) return address;
  return `${address.slice(0, 5)}...${address.slice(-5)}`;
};

// 컬럼 정의
type ColumnKey = 'id' | 'wallet_address' | 'dex_identifier' | 'chain_identifier' | 'token_in_symbol' | 'token_out_symbol' | 'amount_in' | 'action_time' | 'country_code' | 'status' | 'risk_profile';

interface ColumnConfig {
  key: ColumnKey;
  label: string;
  defaultVisible: boolean;
}

const COLUMNS: ColumnConfig[] = [
  { key: 'id', label: 'ID', defaultVisible: true },
  { key: 'wallet_address', label: '지갑 주소', defaultVisible: true },
  { key: 'dex_identifier', label: 'DEX', defaultVisible: true },
  { key: 'chain_identifier', label: '체인', defaultVisible: true },
  { key: 'token_in_symbol', label: '입력 토큰', defaultVisible: true },
  { key: 'token_out_symbol', label: '출력 토큰', defaultVisible: true },
  { key: 'amount_in', label: '수량', defaultVisible: true },
  { key: 'action_time', label: '액션 시간', defaultVisible: true },
  { key: 'country_code', label: '국가', defaultVisible: true },
  { key: 'status', label: '상태', defaultVisible: true },
  { key: 'risk_profile', label: '특성', defaultVisible: true },
];

export function SwapTable({ data }: SwapTableProps) {
  const [sortField, setSortField] = React.useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = React.useState<SortDirection>('asc');
  const [filters, setFilters] = React.useState<FilterState>({});
  const [searchTerm, setSearchTerm] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(20);

  // 컬럼 가시성 상태
  const [visibleColumns, setVisibleColumns] = React.useState<Record<ColumnKey, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    COLUMNS.forEach((col) => {
      initial[col.key] = col.defaultVisible;
    });
    return initial as Record<ColumnKey, boolean>;
  });

  // 고유 값 추출 (필터 옵션용)
  const uniqueDexIdentifiers = React.useMemo(() => Array.from(new Set(data.map((item) => item.dex_identifier))).sort(), [data]);
  const uniqueChainIdentifiers = React.useMemo(() => Array.from(new Set(data.map((item) => item.chain_identifier))).sort(), [data]);
  const uniqueTokenInSymbols = React.useMemo(() => Array.from(new Set(data.map((item) => item.token_in_symbol))).sort(), [data]);
  const uniqueTokenOutSymbols = React.useMemo(() => Array.from(new Set(data.map((item) => item.token_out_symbol))).sort(), [data]);
  const uniqueCountryCodes = React.useMemo(() => Array.from(new Set(data.map((item) => item.country_code).filter((c): c is string => Boolean(c)))).sort(), [data]);
  const uniqueStatuses = React.useMemo(() => Array.from(new Set(data.map((item) => item.status).filter((s): s is string => Boolean(s)))).sort(), [data]);
  const uniqueRiskProfiles = React.useMemo(() => Array.from(new Set(data.map((item) => item.risk_profile).filter((r): r is string => Boolean(r)))).sort(), [data]);

  // 정렬 및 필터링된 데이터
  const filteredAndSortedData = React.useMemo(() => {
    let result = [...data];

    // 검색어 필터
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      // "planned" 검색 시 "pending" 상태도 매칭
      const statusMatch = (status: string | undefined) => {
        if (!status) return false;
        if (status.toLowerCase().includes(term)) return true;
        if (term === 'planned' && status === 'pending') return true;
        if ('planned'.includes(term) && status === 'pending') return true;
        return false;
      };
      result = result.filter((item) => item.wallet_address.toLowerCase().includes(term) || item.dex_identifier.toLowerCase().includes(term) || item.chain_identifier.toLowerCase().includes(term) || item.token_in_symbol.toLowerCase().includes(term) || item.token_out_symbol.toLowerCase().includes(term) || item.country_code?.toLowerCase().includes(term) || statusMatch(item.status) || item.risk_profile?.toLowerCase().includes(term));
    }

    // 필터 적용
    if (filters.dex_identifier) {
      result = result.filter((item) => item.dex_identifier === filters.dex_identifier);
    }
    if (filters.chain_identifier) {
      result = result.filter((item) => item.chain_identifier === filters.chain_identifier);
    }
    if (filters.token_in_symbol) {
      result = result.filter((item) => item.token_in_symbol === filters.token_in_symbol);
    }
    if (filters.token_out_symbol) {
      result = result.filter((item) => item.token_out_symbol === filters.token_out_symbol);
    }
    if (filters.country_code) {
      result = result.filter((item) => item.country_code === filters.country_code);
    }
    if (filters.status) {
      result = result.filter((item) => item.status === filters.status);
    }
    if (filters.risk_profile) {
      result = result.filter((item) => item.risk_profile === filters.risk_profile);
    }

    // 날짜 필터
    if (filters.dateFrom) {
      result = result.filter((item) => {
        const itemDate = new Date(item.action_time);
        return itemDate >= filters.dateFrom!;
      });
    }
    if (filters.dateTo) {
      result = result.filter((item) => {
        const itemDate = new Date(item.action_time);
        const nextDay = new Date(filters.dateTo!);
        nextDay.setDate(nextDay.getDate() + 1);
        return itemDate < nextDay;
      });
    }

    // 정렬
    if (sortField) {
      result.sort((a, b) => {
        let aValue: any = a[sortField];
        let bValue: any = b[sortField];

        // null/undefined 처리
        const aIsNull = aValue === null || aValue === undefined;
        const bIsNull = bValue === null || bValue === undefined;

        if (aIsNull && bIsNull) return 0;
        if (aIsNull) return 1;
        if (bIsNull) return -1;

        // 날짜 필드 처리
        if (sortField === 'action_time' || sortField === 'created_at') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }
        // 숫자 필드 처리
        else if (sortField === 'id' || sortField === 'amount_in') {
          aValue = typeof aValue === 'string' ? parseFloat(aValue) : aValue;
          bValue = typeof bValue === 'string' ? parseFloat(bValue) : bValue;
        }
        // 문자열 필드 처리
        else if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        // 비교
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, sortField, sortDirection, filters, searchTerm]);

  // 페이지네이션된 데이터
  const paginatedData = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedData.slice(startIndex, endIndex);
  }, [filteredAndSortedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);

  // 필터 변경 시 첫 페이지로 이동
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchTerm, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className='ml-2 h-4 w-4' />;
    }
    return sortDirection === 'asc' ? <ArrowUp className='ml-2 h-4 w-4' /> : <ArrowDown className='ml-2 h-4 w-4' />;
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined) || searchTerm.length > 0;

  const toggleColumn = (columnKey: ColumnKey) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

  const toggleAllColumns = (visible: boolean) => {
    const newVisibility: Record<string, boolean> = {};
    COLUMNS.forEach((col) => {
      newVisibility[col.key] = visible;
    });
    setVisibleColumns(newVisibility as Record<ColumnKey, boolean>);
  };

  const visibleColumnCount = Object.values(visibleColumns).filter(Boolean).length;

  return (
    <div className='space-y-6'>
      {/* 필터 섹션 */}
      <div className='rounded-lg border bg-card shadow-sm'>
        <div className='p-4 border-b bg-muted/50'>
          <div className='flex items-center gap-2'>
            <Filter className='h-4 w-4 text-muted-foreground' />
            <h2 className='font-semibold'>필터 및 검색</h2>
          </div>
        </div>
        <div className='p-4 space-y-4'>
          {/* 검색 */}
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input placeholder='검색 (지갑 주소, DEX, 체인 등)...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className='w-full pl-9' />
          </div>

          {/* 필터 옵션 */}
          <div className='flex flex-wrap gap-3'>
            <div className='w-[200px]'>
              <Select value={filters.dex_identifier || 'all'} onValueChange={(value) => setFilters({ ...filters, dex_identifier: value === 'all' ? undefined : value })}>
                <SelectTrigger>
                  <SelectValue placeholder='DEX 선택' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>모든 DEX</SelectItem>
                  {uniqueDexIdentifiers.map((dex) => (
                    <SelectItem key={dex} value={dex}>
                      {dex}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='w-[200px]'>
              <Select value={filters.chain_identifier || 'all'} onValueChange={(value) => setFilters({ ...filters, chain_identifier: value === 'all' ? undefined : value })}>
                <SelectTrigger>
                  <SelectValue placeholder='체인 선택' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>모든 체인</SelectItem>
                  {uniqueChainIdentifiers.map((chain) => (
                    <SelectItem key={chain} value={chain}>
                      {chain}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='w-[200px]'>
              <Select value={filters.token_in_symbol || 'all'} onValueChange={(value) => setFilters({ ...filters, token_in_symbol: value === 'all' ? undefined : value })}>
                <SelectTrigger>
                  <SelectValue placeholder='입력 토큰' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>모든 토큰</SelectItem>
                  {uniqueTokenInSymbols.map((token) => (
                    <SelectItem key={token} value={token}>
                      {token}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='w-[200px]'>
              <Select value={filters.token_out_symbol || 'all'} onValueChange={(value) => setFilters({ ...filters, token_out_symbol: value === 'all' ? undefined : value })}>
                <SelectTrigger>
                  <SelectValue placeholder='출력 토큰' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>모든 토큰</SelectItem>
                  {uniqueTokenOutSymbols.map((token) => (
                    <SelectItem key={token} value={token}>
                      {token}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {uniqueCountryCodes.length > 0 && (
              <div className='w-[200px]'>
                <Select value={filters.country_code || 'all'} onValueChange={(value) => setFilters({ ...filters, country_code: value === 'all' ? undefined : value })}>
                  <SelectTrigger>
                    <SelectValue placeholder='국가' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>모든 국가</SelectItem>
                    {uniqueCountryCodes.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {uniqueStatuses.length > 0 && (
              <div className='w-[200px]'>
                <Select value={filters.status || 'all'} onValueChange={(value) => setFilters({ ...filters, status: value === 'all' ? undefined : value })}>
                  <SelectTrigger>
                    <SelectValue placeholder='상태' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>모든 상태</SelectItem>
                    {uniqueStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status === 'pending' ? 'Planned' : status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {uniqueRiskProfiles.length > 0 && (
              <div className='w-[200px]'>
                <Select value={filters.risk_profile || 'all'} onValueChange={(value) => setFilters({ ...filters, risk_profile: value === 'all' ? undefined : value })}>
                  <SelectTrigger>
                    <SelectValue placeholder='특성' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>모든 특성</SelectItem>
                    {uniqueRiskProfiles.map((risk) => (
                      <SelectItem key={risk} value={risk}>
                        {risk}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* 날짜 필터 및 초기화 */}
          <div className='flex items-center gap-3 pt-2 border-t'>
            <div className='flex items-center gap-2'>
              <span className='text-sm text-muted-foreground whitespace-nowrap'>기간:</span>
              <DatePicker date={filters.dateFrom} onSelect={(date) => setFilters({ ...filters, dateFrom: date })} placeholder='시작 날짜' />
              <span className='text-muted-foreground'>~</span>
              <DatePicker date={filters.dateTo} onSelect={(date) => setFilters({ ...filters, dateTo: date })} placeholder='종료 날짜' />
            </div>
            {hasActiveFilters && (
              <Button variant='outline' onClick={clearFilters} className='gap-2 ml-auto'>
                <X className='h-4 w-4' />
                필터 초기화
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 결과 카운트 및 컬럼 선택 */}
      <div className='flex items-center justify-between'>
        <div className='text-sm text-muted-foreground'>
          <span className='font-medium text-foreground'>{filteredAndSortedData.length}</span>개 결과
          {hasActiveFilters && (
            <span className='ml-1'>
              (전체 <span className='font-medium'>{data.length}</span>개 중)
            </span>
          )}
        </div>
        <div className='flex items-center gap-4'>
          {sortField && (
            <div className='text-xs text-muted-foreground'>
              정렬: <span className='font-medium'>{sortField}</span> ({sortDirection === 'asc' ? '오름차순' : '내림차순'})
            </div>
          )}
          {/* 컬럼 선택 */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant='outline' size='sm' className='gap-2'>
                <Columns3 className='h-4 w-4' />
                컬럼 선택
                <span className='ml-1 text-xs text-muted-foreground'>
                  ({visibleColumnCount}/{COLUMNS.length})
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-64' align='end'>
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <h4 className='font-medium text-sm'>표시할 컬럼 선택</h4>
                  <p className='text-xs text-muted-foreground'>보고 싶은 컬럼만 선택하세요</p>
                </div>
                <div className='flex gap-2'>
                  <Button variant='outline' size='sm' onClick={() => toggleAllColumns(true)} className='flex-1 text-xs'>
                    전체 선택
                  </Button>
                  <Button variant='outline' size='sm' onClick={() => toggleAllColumns(false)} className='flex-1 text-xs'>
                    전체 해제
                  </Button>
                </div>
                <div className='space-y-2 max-h-80 overflow-y-auto'>
                  {COLUMNS.map((column) => (
                    <label key={column.key} className='flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-muted transition-colors'>
                      <input type='checkbox' checked={visibleColumns[column.key]} onChange={() => toggleColumn(column.key)} className='h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer' />
                      <span className='text-sm'>{column.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* 테이블 */}
      <div className='rounded-lg border bg-card shadow-sm overflow-hidden'>
        <div className='overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow className='bg-muted/50 hover:bg-muted/50'>
                {visibleColumns.id && (
                  <TableHead className='w-[80px]'>
                    <Button variant='ghost' onClick={() => handleSort('id')} className='h-8 px-2 font-semibold hover:bg-transparent'>
                      ID {getSortIcon('id')}
                    </Button>
                  </TableHead>
                )}
                {visibleColumns.wallet_address && (
                  <TableHead className='min-w-[200px]'>
                    <div className='flex items-center gap-2'>
                      <Button variant='ghost' onClick={() => handleSort('wallet_address')} className='h-8 px-2 font-semibold hover:bg-transparent'>
                        지갑 주소 {getSortIcon('wallet_address')}
                      </Button>
                    </div>
                  </TableHead>
                )}
                {visibleColumns.dex_identifier && (
                  <TableHead>
                    <Button variant='ghost' onClick={() => handleSort('dex_identifier')} className='h-8 px-2 font-semibold hover:bg-transparent'>
                      DEX {getSortIcon('dex_identifier')}
                    </Button>
                  </TableHead>
                )}
                {visibleColumns.chain_identifier && (
                  <TableHead>
                    <Button variant='ghost' onClick={() => handleSort('chain_identifier')} className='h-8 px-2 font-semibold hover:bg-transparent'>
                      체인 {getSortIcon('chain_identifier')}
                    </Button>
                  </TableHead>
                )}
                {visibleColumns.token_in_symbol && (
                  <TableHead>
                    <Button variant='ghost' onClick={() => handleSort('token_in_symbol')} className='h-8 px-2 font-semibold hover:bg-transparent'>
                      입력 토큰 {getSortIcon('token_in_symbol')}
                    </Button>
                  </TableHead>
                )}
                {visibleColumns.token_out_symbol && (
                  <TableHead>
                    <Button variant='ghost' onClick={() => handleSort('token_out_symbol')} className='h-8 px-2 font-semibold hover:bg-transparent'>
                      출력 토큰 {getSortIcon('token_out_symbol')}
                    </Button>
                  </TableHead>
                )}
                {visibleColumns.amount_in && (
                  <TableHead className='text-right'>
                    <Button variant='ghost' onClick={() => handleSort('amount_in')} className='h-8 px-2 font-semibold hover:bg-transparent'>
                      수량 {getSortIcon('amount_in')}
                    </Button>
                  </TableHead>
                )}
                {visibleColumns.action_time && (
                  <TableHead>
                    <Button variant='ghost' onClick={() => handleSort('action_time')} className='h-8 px-2 font-semibold hover:bg-transparent'>
                      액션 시간 {getSortIcon('action_time')}
                    </Button>
                  </TableHead>
                )}
                {visibleColumns.country_code && uniqueCountryCodes.length > 0 && (
                  <TableHead>
                    <Button variant='ghost' onClick={() => handleSort('country_code')} className='h-8 px-2 font-semibold hover:bg-transparent'>
                      국가 {getSortIcon('country_code')}
                    </Button>
                  </TableHead>
                )}
                {visibleColumns.status && uniqueStatuses.length > 0 && (
                  <TableHead>
                    <Button variant='ghost' onClick={() => handleSort('status')} className='h-8 px-2 font-semibold hover:bg-transparent'>
                      상태 {getSortIcon('status')}
                    </Button>
                  </TableHead>
                )}
                {visibleColumns.risk_profile && uniqueRiskProfiles.length > 0 && (
                  <TableHead>
                    <Button variant='ghost' onClick={() => handleSort('risk_profile')} className='h-8 px-2 font-semibold hover:bg-transparent'>
                      특성 {getSortIcon('risk_profile')}
                    </Button>
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={visibleColumnCount} className='h-24 text-center text-muted-foreground'>
                    데이터가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item, index) => (
                  <TableRow key={item.id} className='hover:bg-muted/50 transition-colors'>
                    {visibleColumns.id && <TableCell className='font-medium text-muted-foreground'>{item.id}</TableCell>}
                    {visibleColumns.wallet_address && (
                      <TableCell>
                        <div className='flex items-center gap-2 group'>
                          <span className='font-mono text-xs'>{formatWalletAddress(item.wallet_address)}</span>
                          <CopyButton text={item.wallet_address} />
                        </div>
                      </TableCell>
                    )}
                    {visibleColumns.dex_identifier && (
                      <TableCell>
                        <span className='inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium'>{item.dex_identifier}</span>
                      </TableCell>
                    )}
                    {visibleColumns.chain_identifier && (
                      <TableCell>
                        <span className='inline-flex items-center px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium'>{item.chain_identifier}</span>
                      </TableCell>
                    )}
                    {visibleColumns.token_in_symbol && (
                      <TableCell>
                        <span className='font-medium'>{item.token_in_symbol}</span>
                      </TableCell>
                    )}
                    {visibleColumns.token_out_symbol && (
                      <TableCell>
                        <span className='font-medium'>{item.token_out_symbol}</span>
                      </TableCell>
                    )}
                    {visibleColumns.amount_in && (
                      <TableCell className='text-right font-medium'>
                        {item.amount_in.toLocaleString(undefined, {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 6,
                        })}
                      </TableCell>
                    )}
                    {visibleColumns.action_time && <TableCell className='text-muted-foreground'>{format(new Date(item.action_time), 'yyyy-MM-dd HH:mm', { locale: ko })}</TableCell>}
                    {visibleColumns.country_code && uniqueCountryCodes.length > 0 && <TableCell>{item.country_code ? <span className='text-sm'>{item.country_code}</span> : <span className='text-muted-foreground'>-</span>}</TableCell>}
                    {visibleColumns.status && uniqueStatuses.length > 0 && <TableCell>{item.status ? <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${item.status === 'done' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : item.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' : item.status === 'failed' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>{item.status === 'pending' ? 'Planned' : item.status}</span> : <span className='text-muted-foreground'>-</span>}</TableCell>}
                    {visibleColumns.risk_profile && uniqueRiskProfiles.length > 0 && <TableCell>{item.risk_profile ? <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${item.risk_profile === 'low' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : item.risk_profile === 'moderate' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' : item.risk_profile === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>{item.risk_profile}</span> : <span className='text-muted-foreground'>-</span>}</TableCell>}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={filteredAndSortedData.length}
          onItemsPerPageChange={(newItemsPerPage) => {
            setItemsPerPage(newItemsPerPage);
            setCurrentPage(1);
          }}
        />
      )}
    </div>
  );
}
