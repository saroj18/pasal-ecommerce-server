import { z } from "zod";

const Role = {
  CUSTOMER: "customer",
  ADMIN: "admin",
  SELLER: "seller",
};

const emailZodeSchema = z
  .string({
    required_error: "email must be required",
    invalid_type_error: "envalid email format",
  })
  .trim()
  .email({ message: "invalid email" })
  .min(12, { message: "email is too short" });

const passwordZodSchema = z
  .string({
    required_error: "password must be required",
    invalid_type_error: "password must be string",
  })
  .trim()
  .min(8, { message: "password length must be >8 character" })
  .max(15, { message: "password length must be <15 character" });

const roleZodeSchema = z
  .string({
    required_error: "role must be required",
    invalid_type_error: "invalid role type",
  })
  .trim()
  .refine((values) => Object.values(Role).includes(values), {
    message: "invalid role",
  });

export const UserSignUpZodSchema = z.object({
  fullname: z
    .string({
      required_error: "name must be required",
      invalid_type_error: "name must be string",
    })
    .trim()
    .min(4, { message: "name must be 4 character" })
    .max(25, { message: "name must be less than 25 character" }),
  username: z
    .string({
      required_error: "username must be required",
      invalid_type_error: "username must be string",
    })
    .trim()
    .min(4, { message: "username must be 4 character" })
    .max(25, { message: "username must be less than 25 character" }),
  email: emailZodeSchema,
  password: passwordZodSchema,
  role: roleZodeSchema,
});

export const UserLoginZodSchema = z.object({
  email: emailZodeSchema,
  password: passwordZodSchema,
  role: roleZodeSchema,
});

export const UserProfileEditZodSchema = z.object({
  email: emailZodeSchema,
  mobile: z
    .string({
      required_error: "mobile must be required",
      invalid_type_error: "mobile must be string",
    })
    .trim()
    .min(1, { message: "mobile must be 10 character" })
    .max(10, { message: "mobile must be 10 character" }),
  dob: z
    .string({
      required_error: "dob must be required",
      invalid_type_error: "dob must be string",
    })
    .trim()
    .min(1, { message: "dob must be 1 character" }),
  gender: z
    .string({
      required_error: "gender must be required",
      invalid_type_error: "invalid gender",
    })
    .trim()
    .min(1, { message: "gender must be 1 character" }),
  fullname: z
    .string({
      required_error: "name must be required",
      invalid_type_error: "name must be string",
    })
    .trim()
    .min(4, { message: "name must be 4 character" })
    .max(25, { message: "name must be less than 25 character" }),
});


export const userVerifyZodSchema = z.object({
  fullname: z
    .string({
      required_error: "fullname must be required",
      invalid_type_error: "fullname must be string",
    })
    .trim()
    .min(4, { message: "fullname must be 4 character" })
    .max(25, { message: "fullname must be less than 25 character" }),
  email: emailZodeSchema,
  mobile: z
    .string({
      required_error: "mobile must be required",
      invalid_type_error: "mobile must be string",
    })
    .trim()
    .min(1, { message: "mobile must be 10 character" })
    .max(10, { message: "mobile must be 10 character" }),
  dob: z
    .string({
      required_error: "dob must be required",
      invalid_type_error: "dob must be string",
    })
    .trim()
    .min(1, { message: "dob must be 1 character" }),
  state: z
    .string({
      required_error: "state must be required",
      invalid_type_error: "state must be string",
    })
    .trim()
    .min(1, { message: "state must be 1 character" }),
  district: z
    .string({
      required_error: "district must be required",
      invalid_type_error: "district must be string",
    })
    .trim()
    .min(1, { message: "district must be 1 character" }),
  city: z
    .string({
      required_error: "city must be required",
      invalid_type_error: "city must be string",
    })
    .trim()
    .min(1, { message: "city must be 1 character" }),
  tole: z
    .string({
      required_error: "tole must be required",
      invalid_type_error: "tole must be string",
    })
    .trim()
    .min(1, { message: "tole must be 1 character" }),
  ward: z
    .string({
      required_error: "ward must be required",
      invalid_type_error: "ward must be string",
    })
    .trim()
    .min(1, { message: "ward must be 1 character" }),
  nearBy: z
    .string({
      required_error: "nearBy must be required",
      invalid_type_error: "nearBy must be string",
    })
    .trim()
    .min(1, { message: "nearBy must be 1 character" }),
  defaultAddress: z
    .string({
      required_error: "defaultAddress must be required",
      invalid_type_error: "defaultAddress must be string",
    })
    .trim()
    .min(1, { message: "defaultAddress must be 1 character" }),
  location: z.object({
    lat: z.number({
      required_error: "lat must be required",
      invalid_type_error: "lat must be number",
    }),
    lng: z.number({
      required_error: "lng must be required",
      invalid_type_error: "lng must be number",
    }),
  }),
  gender: z
    .string({
      required_error: "gender must be required",
      invalid_type_error: "invalid gender",
    })
    .trim()
    .min(1, { message: "gender must be 1 character" }),
});

export const ShopVerifyZodSchema = z.object({
  shopName: z
    .string({
      invalid_type_error: "invalid shopName",
      required_error: "shopName required",
    })
    .trim()
    .min(1, { message: "shopName must be 1 letter" }),
  address: z
    .string({
      invalid_type_error: "invalid address",
      required_error: "address required",
    })
    .trim()
    .min(1, { message: "address must be 1 letter" }),
  category: z
    .string({
      invalid_type_error: "invalid category",
      required_error: "category required",
    })
    .trim()
    .min(1, { message: "category must be 1 letter" }),
  turnover: z
    .string({
      invalid_type_error: "invalid turnover",
      required_error: "turnover required",
    })
    .trim()
    .min(1, { message: "turnover must be 1 letter" }),
  citiNumber: z
    .string({
      invalid_type_error: "invalid citiNumber",
      required_error: "citiNumber required",
    })
    .trim()
    .min(1, { message: "citiNumber must be 1 letter" }),
  shopImage: z.any().refine((val: any) => val != null, {
    message: "1 images must be required",
  }),
  documentImage: z.any().refine((val: any) => val != null, {
    message: "1 images must be required",
  }),
  shopLocation: z
    .any()
    .refine((val: { [key: string]: number }) => val?.lat && val?.lng, {
      message: "location must be required",
    }),
  yourImage: z.any().refine((val: any) => val != null, {
    message: "1 images must be required",
  }),
});

export const UserAddressZodSchema = z.object({
  state: z
    .string({
      required_error: "state must be required",
      invalid_type_error: "state must be string",
    })
    .trim()
    .min(1, { message: "state must be 1 character" }),
  district: z
    .string({
      required_error: "district must be required",
      invalid_type_error: "district must be string",
    })
    .trim()
    .min(1, { message: "district must be 1 character" }),
  city: z
    .string({
      required_error: "city must be required",
      invalid_type_error: "city must be string",
    })
    .trim()
    .min(1, { message: "city must be 1 character" }),
  tole: z
    .string({
      required_error: "tole must be required",
      invalid_type_error: "tole must be string",
    })
    .trim()
    .min(1, { message: "tole must be 1 character" }),
  ward: z
    .string({
      required_error: "ward must be required",
      invalid_type_error: "ward must be string",
    })
    .trim()
    .min(1, { message: "ward must be 1 character" }),
  nearBy: z
    .string({
      required_error: "nearBy must be required",
      invalid_type_error: "nearBy must be string",
    })
    .trim()
    .min(1, { message: "nearBy must be 1 character" }),
  defaultAddress: z
    .string({
      required_error: "defaultAddress must be required",
      invalid_type_error: "defaultAddress must be string",
    })
    .trim()
    .min(1, { message: "defaultAddress must be 1 character" }),
  location: z.object({
    lat: z.number({
      required_error: "lat must be required",
      invalid_type_error: "lat must be number",
    }),
    lng: z.number({
      required_error: "lng must be required",
      invalid_type_error: "lng must be number",
    }),
  }),
});
