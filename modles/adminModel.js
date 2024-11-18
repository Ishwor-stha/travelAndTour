const mongoose = require("mongoose");
const validator = require("validator"); // We'll use this to validate the email format

const adminSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is Missing"],
        unique: [true, "Name already exists! Please try another name"]
    },
    password: {
        type: String,
        required: [true, "Password is Missing"],
        minlength: [8, "A password must have a minimum of 8 characters"]
    },
    confirmPassword: {
        type: String,
        required: [true, "Confirm Password is Missing"],
        validate: {
            validator: function (value) {
                return value === this.password; // Confirm password must match password
            },
            message: "Password and Confirm Password do not match"
        }
    },
    email: {
        type: String,
        required: [true, "Email is missing"],
        lowercase: true,
        unique: [true, "Email is already in use"],
        validate: {
            validator: function (email) {
                if (!validator.isEmail(email)) {
                    return false
                }
                const allowedDomains = ["gmail.com", "yahoo.com", "outlook.com"];
                const emailDomain = email.split('@')[1]; // Get the part after '@'

                return allowedDomains.includes(emailDomain); // Check if email format is valid  reutrns true of false
            },
            message: "Please enter a valid email address"
        }
    },
    code: {
        resetToken: String
    },
    passwordExpiry: {
        type: Date
    }
});

// Pre-save hook to remove confirmPassword from the document before saving
adminSchema.pre("save", function (next) {
    this.confirmPassword = undefined; // Remove confirmPassword from the saved document
    next();
});

const adminModel = mongoose.model("admin", adminSchema);

module.exports = adminModel;
