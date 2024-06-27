"use client"

import React, { MouseEventHandler, useCallback, useEffect, useState } from "react"
import { Check, ChevronsUpDown, CircleAlert, CircleX, Loader, Loader2, X } from "lucide-react"
import debounce from "lodash/debounce"
import sortBy from "lodash/sortBy"
import flatten from "lodash/flatten"
import { cn } from "@/lib/utils"
import { Stock } from "@/lib/types/stocks"
import { useListStocks } from "@/lib/hooks/useListStocks"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { InfiniteScroll } from "@/components/ui/infinite-scroll"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const getStockCompareValue = (stock: Stock): string => {
  return `${stock.ticker} - ${stock.name}`
}

interface StockAutocompleteProps {
  value?: Stock[]
  onChange?: (stocks: Stock[]) => void
  limit?: number
}

export function StockAutocomplete(props: StockAutocompleteProps) {
  const { value, onChange, limit } = props
  const isControlled = typeof onChange === 'function'

  //  LOCAL STATES
  const [open, setOpen] = useState(false)
  const [localValue, setLocalValue] = useState<string[]>([])
  const [search, setSearch] = useState('')

  const debouncedSetSearch = useCallback(debounce(setSearch, 300), [])

  // HOOKS
  const { isLoading, data, hasNextPage, isFetchingNextPage, fetchNextPage } = useListStocks({ filters: { search } })
  const results = flatten(data?.pages?.map((page) => page.results || []))
  const error = data?.pages?.find((page) => page.error)

  // HANDLERS
  const handleOnSelect = (currentValue: string) => {
    setLocalValue((localValue) => {
      // Previously selected
      if (localValue.includes(currentValue)) {
        const nextLocalValue = localValue.filter((item) => item !== currentValue)

        if (isControlled) {
          const nextValue = value?.filter((stock) => getStockCompareValue(stock) !== currentValue) || []
          onChange(nextValue)
        }

        return nextLocalValue
      }

      // Reach limit
      if (typeof limit === 'number' && localValue.length === limit) return localValue

      // Newly added
      const nextLocalValue = localValue.concat(currentValue)
      nextLocalValue.sort()

      if (isControlled) {
        const selectedStock = results?.find((stock) => getStockCompareValue(stock) === currentValue)
        const nextValue = sortBy((value || []).concat(selectedStock || []), 'ticker')
        onChange(nextValue)
      }
      return nextLocalValue
    })
  }

  const handleOnClear: MouseEventHandler = (e) => {
    e.stopPropagation()
    setLocalValue([])
    if (isControlled) onChange([])
  }

  const injectedValueTickers = value?.map(({ ticker }) => ticker).join(', ')
  const label = localValue.map((item) => item.split(' - ')[0]).join(', ')

  // SIDE EFFECTS
  // Update local value if injected value was changed from outside the component
  useEffect(() => {
    if (isControlled && injectedValueTickers !== label) {
      const nextLocalValue = value?.map(getStockCompareValue) || []
      setLocalValue(nextLocalValue)
    }
  }, [injectedValueTickers])


  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between group"
          disabled={isLoading}
        >
          {label || (isLoading ? "Loading..." : "Select Stock...")}
          <div className="flex items-center gap-2 ml-2">
            {Boolean(localValue.length) && <CircleX className="hidden h-4 w-4 shrink-0 opacity-50 group-hover:block" onClick={handleOnClear} />}
            {isLoading ? <Loader className="h-4 w-4 shrink-0 animate-spin" /> : <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search stock..." onValueChange={debouncedSetSearch}/>
          <CommandList>
            <CommandEmpty>{isLoading ? 'Searching stock...' : 'No stock found.'}</CommandEmpty>
            <CommandGroup>
              {results?.map((stock) => {
                const label = getStockCompareValue(stock)
                const isChecked = localValue.includes(label)

                return (
                  <CommandItem
                    key={stock.ticker}
                    value={label}
                    onSelect={handleOnSelect}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        isChecked ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="w-[180px]">
                      {label}
                    </div>
                  </CommandItem>
                )
              })}
              {Boolean(error) && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center justify-center gap-1 my-2 hover:cursor-pointer">
                        <CircleAlert className="w-3.5 h-3.5 text-slate-500" />
                        <div className="text-sm text-center text-slate-500">Error</div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-sm w-[320px] p-1">{error?.error}</div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <InfiniteScroll hasMore={hasNextPage} isLoading={isFetchingNextPage} next={fetchNextPage} threshold={1}>
                {hasNextPage && <Loader className="my-4 h-4 w-4 mx-auto animate-spin" />}
              </InfiniteScroll>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
