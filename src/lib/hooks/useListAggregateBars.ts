import { useQueries, useQuery } from "@tanstack/react-query"

interface FetchAggregateBarsFilters {
  stocksTicker: string
  multiplier?: number
  timespan?: 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year'
  from: string
  to: string
  adjusted?: boolean
  sort?: 'asc' | 'desc'
  limit?: number
}

interface FetchAggregateBarsResult {
  ticker: string
  queryCount: number
  resultsCount: number
  count: number
  adjusted: boolean
  status: string
  request_id: string
  results: Array<{
    v: number
    vw: number
    o: number
    c: number
    h: number
    l: number
    t: number
    n: number
  }>
  error?: string
}


const fetchAggregateBars = async (filters: FetchAggregateBarsFilters): Promise<FetchAggregateBarsResult> => {
  const defaultFilters: Partial<FetchAggregateBarsFilters> = {
    multiplier: 1,
    timespan: 'day',
    adjusted: true,
    sort: 'asc',
    limit: 5000,
  }

  const params: Record<string, any> = { ...defaultFilters, ...filters }
  const queryParams = new URLSearchParams(params).toString()
  const response = await fetch(`/api/agg-bar?${queryParams}`)
  return response.json()
}

interface UseListAggregateBarsFilters extends Omit<FetchAggregateBarsFilters, 'stocksTicker'> {
  stocksTickers: Array<FetchAggregateBarsFilters['stocksTicker']>
}

interface UseListAggregateBarsProps {
  filters: UseListAggregateBarsFilters
}

export const useListAggregateBars = (props:UseListAggregateBarsProps) => {
  const { filters } = props
  const { stocksTickers, ...restOfFilters } = filters
  const queryKey = JSON.stringify(restOfFilters)

  const userQueries = useQueries({
    queries: stocksTickers.map((stocksTicker) => {
      return {
        queryKey: ["list-aggregate-bars", stocksTicker, queryKey],
        queryFn: () => fetchAggregateBars({ ...restOfFilters, stocksTicker }),
      }
    }),
  })

  return userQueries
}