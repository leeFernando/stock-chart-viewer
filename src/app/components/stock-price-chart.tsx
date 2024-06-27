'use client'
import { useState } from "react"
import { subDays } from "date-fns"
import { DateRange } from "react-day-picker"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StockAutocomplete } from "./stock-autocomplete"
import { useListAggregateBars } from "@/lib/hooks/useListAggregateBars"
import { Stock } from "@/lib/types/stocks"
import sortBy from "lodash/sortBy"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const PRICE_TYPES = [
  { key: 'open-prices', label: 'Open Prices', value: 'open prices' },
  { key: 'high-prices', label: 'High Prices', value: 'high prices' },
  { key: 'low-prices', label: 'Low Prices', value: 'low prices' },
  { key: 'close-prices', label: 'Close Prices', value: 'close prices' },
]
const DEFAULT_PRICE_TYPE_VALUE = PRICE_TYPES[0].value
const DEFAULT_STOCKS = [
  { ticker: 'AAPL', name: 'Apple Inc.' },
  { ticker: 'AMZN', name: 'Amazon.Com Inc' },
]
const CHART_COLORS = ['#8884d8', '#82ca9d', '#ffc658']

function getYAxisDataKey(priceType: string) {
  switch (priceType) {
    case 'open prices':
      return 'o'
    case 'high prices':
      return 'h'
    case 'low prices':
      return 'l'
    default:
      return 'c'
  }
}

export const StockPriceChart = () => {
  // LOCAL STATES
  const [stocks, setStocks] = useState<Stock[]>(DEFAULT_STOCKS)
  const [priceType, setPriceType] = useState(DEFAULT_PRICE_TYPE_VALUE)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date(),
  })

  // HOOKS
  const responses = useListAggregateBars({
    filters: {
      stocksTickers: stocks.map(({ ticker }) => ticker),
      from: dateRange?.from?.toISOString().split('T')[0] || '',
      to: dateRange?.to?.toISOString().split('T')[0] || '',
    }
  })
  const yAxisDataKey = getYAxisDataKey(priceType) 
  const dataGroupedByDate = responses?.reduce((acc, response) => {
    if (!response.data) return acc

    const tickerLabel = response.data.ticker || 'n.a.'

    response.data.results?.forEach((item) => {
      const dateLabel = new Date(item.t).toISOString().split('T')[0]
      acc[dateLabel] = {
        ...acc[dateLabel],
        [tickerLabel]: item[yAxisDataKey] // e.g. acc['2024-06-20'] = { AAPL: <y_value> }
      }
    })

    return acc
  }, {} as Record<string, any>) || {}
  const chartData = sortBy(Object.entries(dataGroupedByDate).map(([dateLabel, object]) => ({ ...object, xAxis: dateLabel })), 'xAxis')
  const error = responses?.find(({ data }) => data?.error)?.data
  
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <StockAutocomplete limit={3} value={stocks} onChange={setStocks} />
      </div>
      <Card>
        <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Charts</CardTitle>
          <div className="flex items-center justify-end gap-2">
            <DateRangePicker value={dateRange} onChange={setDateRange} />
            <Select value={priceType} onValueChange={setPriceType}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Select Price" />
              </SelectTrigger>
              <SelectContent>
                {PRICE_TYPES.map(({ key, label, value }) => (
                  <SelectItem key={key} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-sm text-center my-[170px] text-slate-500">{error?.error}</div>
          ) : !stocks.length ? (
            <div className="text-sm text-center my-[170px] text-slate-500">Please pick a stock</div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart width={400} height={400} data={chartData}>
                <XAxis
                  dataKey="xAxis"
                  stroke="#888888"
                  fontSize={10}
                  tickLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={10}
                  tickLine={false}
                />
                <Tooltip />
                {
                  responses?.map((response, index) => {
                    const { ticker } = response.data || {}
                    return (
                      <Line key={ticker} type="monotone" dataKey={ticker} stroke={CHART_COLORS[index]} strokeWidth={2} />
                    )
                  })
                }
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}