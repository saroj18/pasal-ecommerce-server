import mongoose, { Schema } from "mongoose";
const customerSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
}, {
    timestamps: true
});
export const Customer = mongoose.model('customer', customerSchema);
