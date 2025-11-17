import { SwapActionRequest } from "@/types/swap-action-request"

// 환경 변수에서 API URL을 가져오거나 기본값 사용
// .env.local 파일에 NEXT_PUBLIC_API_URL=http://localhost:3001/api 설정 가능
const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    // 클라이언트 사이드
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
  }
  // 서버 사이드 - 절대 URL 사용
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
}

interface ApiResponse {
  success: boolean
  data: SwapActionRequest[]
}

export async function fetchSwapActionRequests(): Promise<SwapActionRequest[]> {
  try {
    const apiBaseUrl = getApiUrl()
    const apiUrl = `${apiBaseUrl}/api/v2/dex/swap-action-requests`
    
    console.log('API 요청 URL:', apiUrl) // 디버깅용
    
    const response = await fetch(apiUrl, {
      cache: "no-store",
      headers: {
        'accept': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`)
    }
    
    const result: ApiResponse = await response.json()
    
    // 응답 구조: { success: true, data: [...] }
    if (result.success && Array.isArray(result.data)) {
      // BigInt 필드들을 숫자로 변환
      return result.data.map((item) => ({
        ...item,
        id: typeof item.id === 'string' ? parseInt(item.id, 10) : item.id,
        amount_in: typeof item.amount_in === 'string' ? parseFloat(item.amount_in) : item.amount_in,
        wallet_info_id: item.wallet_info_id ? (typeof item.wallet_info_id === 'string' ? parseInt(item.wallet_info_id, 10) : item.wallet_info_id) : undefined,
        swap_pair_id: item.swap_pair_id ? (typeof item.swap_pair_id === 'string' ? parseInt(item.swap_pair_id, 10) : item.swap_pair_id) : undefined,
      }))
    }
    
    return []
  } catch (error) {
    console.error("데이터 페칭 오류:", error)
    throw error
  }
}

