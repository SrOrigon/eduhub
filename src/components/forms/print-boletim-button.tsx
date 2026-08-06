"use client";

import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintBoletimButton() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={() => window.print()}>
        <Printer className="mr-2 h-4 w-4" aria-hidden="true" />
        Imprimir
      </Button>
      <Button variant="default" size="sm" onClick={() => window.print()}>
        <Download className="mr-2 h-4 w-4" aria-hidden="true" />
        Salvar como PDF
      </Button>
    </div>
  );
}
