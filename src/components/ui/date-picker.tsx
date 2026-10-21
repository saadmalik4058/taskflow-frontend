// components/ui/date-picker.tsx
"use client";

import * as React from "react";
import { format, parseISO } from "date-fns";
import { CalendarIcon, ChevronDownIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface DatePickerProps {
  value?: string; // ISO string (YYYY-MM-DD)
  onChange?: (value: string | undefined) => void;
  onBlur?: (e: React.FocusEvent<any>) => void;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  error?: string;
  id?: string;
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  onBlur,
  placeholder = "Select date",
  disabled = false,
  label,
  error,
  id,
  className,
  ...props
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    value ? parseISO(value) : undefined
  );

  const handleSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setOpen(false);
    if (date) {
      onChange?.(format(date, "yyyy-MM-dd"));
    } else {
      onChange?.(undefined);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "" || /^\d{4}-\d{2}-\d{2}$/.test(val)) {
      onChange?.(val || undefined);
      if (val) {
        try {
          setSelectedDate(parseISO(val));
        } catch {
          setSelectedDate(undefined);
        }
      } else {
        setSelectedDate(undefined);
      }
    }
  };

  const clearDate = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedDate(undefined);
    onChange?.(undefined);
  };

  const formattedValue = selectedDate ? format(selectedDate, "MMM d, yyyy") : "";

  const inputId = id || `date-picker-${Math.random().toString(36).slice(2)}`;

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5"
        >
          {label}
        </label>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger>
          <Button
            id={inputId}
            type="button"
            role="combobox"
            aria-expanded={open}
            aria-haspopup="dialog"
            aria-label={label || "Select date"}
            variant="outline"
            className={cn(
              "w-full justify-between text-left",
              !disabled && "hover:bg-[hsl(var(--muted))]",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            disabled={disabled}
            onClick={() => !disabled && setOpen(!open)}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span className={cn(
                  "truncate",
                  formattedValue
                    ? "text-[hsl(var(--foreground))]"
                    : "text-[hsl(var(--muted-foreground))]"
                )}>
                  {formattedValue || placeholder}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {selectedDate && (
                  <button
                    type="button"
                    onClick={clearDate}
                    className="p-1 rounded hover:bg-[hsl(var(--muted))] text-muted-foreground hover:text-[hsl(var(--foreground))] transition-colors"
                    aria-label="Clear date"
                  >
                    <XIcon className="h-3.5 w-3.5" />
                  </button>
                )}
                <ChevronDownIcon className={cn(
                  "h-4 w-4 text-muted-foreground",
                  open && "rotate-180"
                )} />
              </div>
            </div>
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" sideOffset={5}>
          <div className="p-2">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              numberOfMonths={1}
            />
            <div className="flex justify-end gap-2 pt-2 border-t border-[hsl(var(--border))]">
              <button
                type="button"
                onClick={() => {
                  setSelectedDate(undefined);
                  onChange?.(undefined);
                  setOpen(false);
                }}
                className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm text-[hsl(var(--color-primary))] hover:underline"
              >
                Done
              </button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {error && (
        <p className="mt-1.5 text-xs text-[hsl(var(--color-destructive))]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default DatePicker;
