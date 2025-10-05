"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface DataTableProps {
  children: ReactNode;
  className?: string;
  maxHeight?: string;
}

export function DataTable({
  children,
  className,
  maxHeight = "600px",
}: DataTableProps) {
  return (
    <div className={cn("w-full", className)}>
      <div
        className="relative overflow-auto border border-gray-200 rounded-lg bg-white shadow-sm"
        style={{ maxHeight }}
      >
        <table className="w-full text-sm">{children}</table>
      </div>
    </div>
  );
}

interface DataTableHeaderProps {
  children: ReactNode;
  className?: string;
}

export function DataTableHeader({ children, className }: DataTableHeaderProps) {
  return (
    <thead
      className={cn(
        "bg-gray-50 border-b border-gray-200 sticky top-0 z-10",
        className
      )}
    >
      {children}
    </thead>
  );
}

interface DataTableBodyProps {
  children: ReactNode;
  className?: string;
}

export function DataTableBody({ children, className }: DataTableBodyProps) {
  return (
    <tbody className={cn("divide-y divide-gray-200", className)}>
      {children}
    </tbody>
  );
}

interface DataTableRowProps {
  children: ReactNode;
  className?: string;
}

export function DataTableRow({ children, className }: DataTableRowProps) {
  return (
    <tr className={cn("hover:bg-gray-50 transition-colors", className)}>
      {children}
    </tr>
  );
}

interface DataTableCellProps {
  children: ReactNode;
  className?: string;
  colSpan?: number;
}

export function DataTableCell({
  children,
  className,
  colSpan,
}: DataTableCellProps) {
  return (
    <td
      className={cn("px-6 py-4 text-gray-900 align-middle", className)}
      colSpan={colSpan}
    >
      {children}
    </td>
  );
}

interface DataTableHeadProps {
  children: ReactNode;
  className?: string;
}

export function DataTableHead({ children, className }: DataTableHeadProps) {
  return (
    <th
      className={cn(
        "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200 sticky top-0 z-10",
        className
      )}
    >
      {children}
    </th>
  );
}
