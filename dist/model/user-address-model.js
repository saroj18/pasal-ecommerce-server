import mongoose, { Schema } from "mongoose";
const AddressSchema = new Schema({
    state: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    tole: {
        type: String,
        required: true,
        trim: true
    },
    district: {
        type: String,
        required: true,
        trim: true
    },
    ward: {
        type: String,
        required: true,
        trim: true
    },
    nearBy: {
        type: String,
        required: true,
        trim: true
    },
    defaultAddress: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: Object,
        required: true
    },
    addressOf: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    }
});
export const Address = mongoose.model('address', AddressSchema);
