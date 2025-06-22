"use client"

import * as React from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Calendar as CalendarIcon, Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateTimePickerProps {
  value?: Date
  onChange?: (date: Date) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  error?: boolean
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Sélectionner une date et heure",
  disabled = false,
  className,
  error = false,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(value)
  const [timeValue, setTimeValue] = React.useState<string>(
    value ? format(value, "HH:mm") : "10:00"
  )


  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const [hours, minutes] = timeValue.split(":")
      const newDate = new Date(date)
      newDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0)
      setSelectedDate(newDate)
      onChange?.(newDate)
    }
  }

  const handleTimeChange = (time: string) => {
    setTimeValue(time)
    if (selectedDate && time) {
      const [hours, minutes] = time.split(":")
      const newDate = new Date(selectedDate)
      newDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0)
      setSelectedDate(newDate)
      onChange?.(newDate)
    }
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground",
              error && "border-red-500",
              className
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? (
              <span>
                {format(selectedDate, "PPP", { locale: fr })} à {timeValue}
              </span>
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3 space-y-3">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              captionLayout="dropdown"
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
            />
            <div className="flex items-center space-x-2 px-3 pb-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Input
                type="time"
                value={timeValue}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="w-auto"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

// Composant simplifié pour juste la date
interface DatePickerProps {
  date?: Date
  onSelect?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function DatePicker({
  date,
  onSelect,
  placeholder = "Sélectionner une date",
  disabled = false,
  className,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP", { locale: fr }) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onSelect}
          initialFocus
          captionLayout="dropdown"
        />
      </PopoverContent>
    </Popover>
  )
}