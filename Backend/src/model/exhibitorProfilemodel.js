const mongoose = require("mongoose")

const exhibitorProfileSchema = mongoose.Schema({
    CompanyName: {
        type: String,
        required: [true, "Please Provide Company Name "],
        minlength: [3, "Please Enter more then 3 characters"],
        maxlength: [50, "Please Enter under 50 characters"],
        trim: true
    },
    description: {
        type: String,
        required: [true, "Please provide description"],
        minlength: [10, "Please Enter more then 10 Characters"],
        maxlength: [1000, "Description must be under 1000 characters"],
        trim: true
    },
    products: {
        type: String,
        minlength: [3, "Please Enter more then 3 Characters long"]
    },
    services: {
        type: String,
        minlength: [3, "Please Enter more then 3 Characters long"]
    },
    website: {
        type: String,
        trim: true
    },
    logoUrl: {
        type: String
    },
    contactEmail: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Please provide a valid contact email"]
    },
    phone: {
        type: String,
        trim: true
    },
    documents: {
        type: [String],
        default: []
    },
    category: { type: String, default: "General" },
    createdAt: {
        type: Date,
        default: Date.now
    },
    UpdatedAt: {
        type: Date,
        default: Date.now
    },
    UserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "Please provide an organizer ID for the expo"]
    }
})


const Exhibitor = mongoose.model('ExhibitorProfile', exhibitorProfileSchema);
module.exports = Exhibitor;
