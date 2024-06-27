import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { Stock } from "@/lib/types/stocks"

interface FetchStocksFilters {
  ticker?: string
  type?: string
  market?: 'stocks' | 'cryptos' | 'fx' | 'otc' | 'indices'
  exchange?: string
  cusip?: string
  cik?: string
  date?: string
  search?: string
  active?: boolean
  order?: 'asc' | 'desc'
  limit?: number
  sort?: string
}

interface FetchStocksResult {
  count: number
  next_url: string
  request_id: string
  status: string
  results: Stock[]
  error?: string
}


const fetchStocks = async (filters: FetchStocksFilters = {}): Promise<FetchStocksResult> => {
  const defaultFilters: FetchStocksFilters = {
    market: 'stocks',
    order: 'asc',
    sort: 'ticker'
  }

  const params: Record<string, any> = { ...defaultFilters, ...filters }
  const queryParams = new URLSearchParams(params).toString()
  const response = await fetch(`/api/stocks?${queryParams}`)
  return response.json()
}

interface UseListStocksProps {
  filters?: FetchStocksFilters
}

export const useListStocks = (props?:UseListStocksProps) => {
  const { filters } = props || {}
  const queryKey = JSON.stringify(filters)

  const onUseQuery = useInfiniteQuery({ 
    queryKey: ["list-stock-tickers", queryKey], 
    queryFn: ({ pageParam }) => fetchStocks({ ...filters, ...pageParam, }),
    getNextPageParam: (lastPage) => lastPage.next_url && Object.fromEntries(new URL(lastPage.next_url).searchParams.entries()),
    initialPageParam: {}
  })

  return onUseQuery
}