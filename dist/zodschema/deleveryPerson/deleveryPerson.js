import { z } from "zod";
const genderEnum = ["male", "female"];
export const DeleveryPersonZodSchema = z.object({
    firstname: z.string().min(1, { message: "firstname must be 1 character" }),
    lastname: z.string().min(1, { message: "lastname must be 1 character" }),
    address: z.string().min(1, { message: "address must be 1 character" }),
    phone: z.string().min(1, { message: "phone must be 1 character" }),
    email: z.string().email({ message: "invalid email" }),
    citiNumber: z.string().min(3, { message: "citiNumber must be 3 character" }),
    idDocument: z.string().min(1, { message: "profileImage required" }),
    profileImage: z.string().min(1, { message: "profileImage required" }),
    gender: z
        .string()
        .refine((data) => genderEnum.includes(data), { message: "invalid gender" }),
});
