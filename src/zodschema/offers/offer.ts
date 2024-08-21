import { z } from "zod";

export const OfferZodSchema = z.object({
  name: z
    .string({
      required_error: "offer name required",
      invalid_type_error: "invalid offer name",
    })
    .trim()
    .min(1, { message: "offer name must be 1 letter" }),
  discount: z
    .string({
      required_error: "discount required",
      invalid_type_error: "invalid discount",
    })
    .min(1, { message: "discount must be 1 letter" }),
  products: z
    .any()
    .refine((val) => val.length > 0, { message: "product required" }),
});
