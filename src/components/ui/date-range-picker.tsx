"use client"

import React, { useEffect, useState } from "react"
import { format, subDays } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangePickerProps {
  className?: string
  value?: DateRange
  onChange?: (range: DateRange | undefined) => void
}

export function DateRangePicker(props: DateRangePickerProps) {
  const { className, value, onChange } = props
  const isControlled = typeof onChange === 'function'

  // LOCAL STATES
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date(),
  })

  // HANDLERS
  const handleOnSelect = (range: DateRange | undefined) => {
    setDate(range)
    if (isControlled) onChange(range)
  }

  const valueFromLabel = value?.from?.toISOString()?.split('T')?.[0]
  const valueToLabel = value?.to?.toISOString()?.split('T')?.[0]
  const dateFromLabel = date?.from?.toISOString()?.split('T')?.[0]
  const dateToLabel = date?.to?.toISOString()?.split('T')?.[0]

  // SIDE EFFECTS
  // Update local value if injected value was changed from outside the component
  useEffect(() => {
    if (isControlled && (valueFromLabel !== dateFromLabel || valueToLabel !== dateToLabel)) {
      setDate(value)
    }
  }, [valueFromLabel, valueToLabel])

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleOnSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
