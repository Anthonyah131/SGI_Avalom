"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (from: string, to: string) => void;
  title?: string;
}

export default function DateRangeDialog({
  open,
  onOpenChange,
  onGenerate,
  title = "Generar Reporte",
}: Props) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="space-y-4">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <label className="text-sm font-medium">Desde</label>
          <input
            type="month"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Hasta</label>
          <input
            type="month"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Button disabled={!from || !to} onClick={() => onGenerate(from, to)}>
            Generar por Rango
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
