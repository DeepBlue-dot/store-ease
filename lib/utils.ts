import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Decimal } from "@prisma/client/runtime/library"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: Decimal | number | string): string {
  const value = typeof amount === 'object' && 'toNumber' in amount 
    ? amount.toNumber() 
    : Number(amount)
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}