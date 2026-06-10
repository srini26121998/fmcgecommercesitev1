import { z } from "zod";

export const productSchema = z.object({
  name: z
    .string()
    .min(2, "Product name must be at least 2 characters")
    .max(200, "Product name must be at most 200 characters"),
  sku: z
    .string()
    .min(1, "SKU is required")
    .max(50, "SKU must be at most 50 characters"),
  price: z
    .number()
    .positive("Price must be greater than 0")
    .max(999999, "Price exceeds maximum allowed"),
  costPrice: z
    .number()
    .nonnegative("Cost price cannot be negative")
    .optional(),
  mrp: z
    .number()
    .positive("MRP must be greater than 0")
    .optional(),
  stock: z
    .number()
    .int("Stock must be a whole number")
    .nonnegative("Stock cannot be negative"),
  lowStockThreshold: z
    .number()
    .int()
    .nonnegative()
    .default(10),
  category: z
    .string()
    .min(1, "Category is required"),
  brand: z
    .string()
    .max(100, "Brand name must be at most 100 characters")
    .optional(),
  description: z
    .string()
    .max(5000, "Description must be at most 5000 characters")
    .optional(),
  shortDescription: z
    .string()
    .max(500, "Short description must be at most 500 characters")
    .optional(),
  tags: z
    .array(z.string().max(50))
    .max(20, "Maximum 20 tags allowed")
    .optional(),
  weight: z
    .string()
    .max(20, "Weight must be at most 20 characters")
    .optional(),
  unit: z
    .string()
    .max(10, "Unit must be at most 10 characters")
    .optional(),
  itemCode: z
    .string()
    .max(100, "Item Code must be at most 100 characters")
    .optional(),
});

export type ProductInput = z.infer<typeof productSchema>;
