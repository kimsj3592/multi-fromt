export interface SwapActionRequest {
  id: number
  wallet_address: string
  dex_identifier: string
  chain_identifier: string
  token_in_symbol: string
  token_out_symbol: string
  amount_in: number
  action_time: string
  created_at: string
  updated_at: string
  country_code?: string
  risk_profile?: string
  wallet_info_id?: number
  swap_pair_id?: number
  status?: string
  attempts?: number
}

export type SortField = 
  | "id"
  | "wallet_address"
  | "dex_identifier"
  | "chain_identifier"
  | "token_in_symbol"
  | "token_out_symbol"
  | "amount_in"
  | "action_time"
  | "created_at"
  | "country_code"
  | "status"
  | "risk_profile"

export type SortDirection = "asc" | "desc"

export interface FilterState {
  dex_identifier?: string
  chain_identifier?: string
  token_in_symbol?: string
  token_out_symbol?: string
  country_code?: string
  status?: string
  risk_profile?: string
  dateFrom?: Date
  dateTo?: Date
}

