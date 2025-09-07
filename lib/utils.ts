import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import formidable from "formidable";
import { Decimal } from "@prisma/client/runtime/library"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export async function parseForm(req: Request) {
  const form = formidable({ multiples: false });

  return new Promise<{ fields: formidable.Fields; files: formidable.Files }>(
    (resolve, reject) => {
      form.parse(req as any, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    }
  );
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