"use client";

import * as React from "react";
import { format, parseISO } from "date-fns";
import { toDate, toZonedTime } from "date-fns-tz";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "./scroll-area";
import { convertToCostaRicaTime, convertToUTC, convertToUTCSV } from "@/utils/dateUtils";

const COSTA_RICA_TZ = "America/Costa_Rica";

interface DatePickerWithRangeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  date: DateRange | undefined;
  onDateChange: (date: DateRange | undefined) => void;
}

export function DatePickerWithRange({
  className,
  date,
  onDateChange,
}: DatePickerWithRangeProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // 1) Al mostrar en el input[type="date"], convierto el Date → ISO → CR → "yyyy-MM-dd"
  const adjustToTimeZone = (d?: Date): string => {
    if (!d) return "";
    return convertToCostaRicaTime(d.toISOString()); // ya devuelve "yyyy-MM-dd"
  };

  // 2) Al parsear el valor tecleado ("yyyy-MM-dd"), hago CR → ISO UTC → Date
  const parseFromTimeZone = (dateStr: string): Date | undefined => {
    if (!dateStr) return undefined;
    const iso = convertToUTCSV(dateStr); // "2023-06-02" → "2023-06-02T00:00:00.000Z"
    return parseISO(iso); // ISO → Date
  };

  const handleManualDateChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    isStart: boolean
  ) => {
    const parsed = parseFromTimeZone(e.target.value);
    if (!parsed) return;

    onDateChange({
      from: isStart ? parsed : date?.from,
      to: isStart ? date?.to : parsed,
    });
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full sm:w-[300px] justify-center text-center font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(
                    toDate(toZonedTime(date.from, COSTA_RICA_TZ)),
                    "dd/MM/yyyy"
                  )}{" "}
                  -{" "}
                  {format(
                    toDate(toZonedTime(date.to, COSTA_RICA_TZ)),
                    "dd/MM/yyyy"
                  )}
                </>
              ) : (
                format(
                  toDate(toZonedTime(date.from, COSTA_RICA_TZ)),
                  "dd/MM/yyyy"
                )
              )
            ) : (
              <span>Selecciona un rango de fechas</span>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0 scroll-mx-10" align="start">
          <ScrollArea className="h-[50vh] sm:h-auto rounded-md">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 p-2">
              <div className="w-full sm:w-1/2">
                <label
                  htmlFor="start-date"
                  className="text-sm font-medium block mb-1"
                >
                  Fecha inicial:
                </label>
                <Input
                  id="start-date"
                  type="date"
                  value={adjustToTimeZone(date?.from)}
                  onChange={(e) => handleManualDateChange(e, true)}
                  className="w-auto"
                />
              </div>
              <div className="w-full sm:w-1/2">
                <label
                  htmlFor="end-date"
                  className="text-sm font-medium block mb-1"
                >
                  Fecha final:
                </label>
                <Input
                  id="end-date"
                  type="date"
                  value={adjustToTimeZone(date?.to)}
                  onChange={(e) => handleManualDateChange(e, false)}
                  className="w-auto"
                />
              </div>
            </div>

            <div className="p-2">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                className="h-[340px]"
                selected={{
                  from: date?.from
                    ? toDate(toZonedTime(date.from, COSTA_RICA_TZ))
                    : undefined,
                  to: date?.to
                    ? toDate(toZonedTime(date.to, COSTA_RICA_TZ))
                    : undefined,
                }}
                onSelect={(selectedDate) =>
                  onDateChange({
                    from: selectedDate?.from
                      ? toDate(toZonedTime(selectedDate.from, COSTA_RICA_TZ))
                      : undefined,
                    to: selectedDate?.to
                      ? toDate(toZonedTime(selectedDate.to, COSTA_RICA_TZ))
                      : undefined,
                  })
                }
                numberOfMonths={2}
                fromYear={2000}
                toYear={2050}
              />
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
}
