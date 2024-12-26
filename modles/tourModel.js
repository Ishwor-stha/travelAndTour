const mongoose = require("mongoose");
const slugify = require("slugify");
const tourSchema = new mongoose.Schema({
    name: {
        type: "String",
        required: [true, "Name of prodct  is missing"],
        unique: [true, "Tour name already exists"]
    },
    adult_price: {
        type: Number,
        required: [true, "A adult price is missing"]
    },
    youth_price: {
        type: Number,
        required: [true, "A youth price is missing"]
    },
    description: {
        type: "String",
        required: [true, "A Product should have Description"]
    },
    placeName: {
        type: "String",
        required: [true, "A Tour Must have place name"]
    },
    image: {
        type: "String",
        required: [true, " Photo of Tour is missing"]
    },
    category: {
        type: String,
        required: [true, "Category is missing"]//luxury,holiday,vacation

    },
    tour_type: {
        type: String,
        required: [true, "Tour is missing tour type (Domestic,International)"],
        enum: ["Domestic", "International"]
    },
    active_month: {
        type: [String],
        validate: {
            validator: function (months) {
                const validMonths = [
                    "january", "february", "march", "april", "may", "june",
                    "july", "august", "september", "october", "november", "december"
                ];
                for (const month of months) {
                    if (!validMonths.includes(month.toLowerCase())) {
                        return false;
                    }
                }
                return true;
            },
            message: "Active month must contain valid month names"
        }
    },
    count: {
        type: Number,
        default: 0
    },
    total_number_of_people: {
        type: Number,
        required: [true, "A tour must have a total number of people"],
        min: [1, "Total number of people must be at least 1"],
        validate: {
            validator: Number.isInteger,
            message: "Total number of people must be an integer"
        }
    },
    duration: {
        type: Number,
        required: [true, "Duration is Missing"],
        validate: {
            validator: function (value) {
                return typeof value === "number"
            },
            message: "Duration must be a number"
        }
    },
    Discount: {
        type: Number,
        default: 0,
        validate: {
            validator: function (discount) {
                return discount >= 0 && discount <= 100;
            },
            message: "Discount must be between 0 and 100"
        }
    },
    slug: {
        type: String
    }

});
tourSchema.pre("save", function (next) {
    if (this.isModified("name")) {
        this.slug = slugify(this.name);
    }
    next();

})
tourSchema.pre("findOneAndUpdate", function (next) {
    const update = this.getUpdate();
    if (update.name) {
        update.slug = slugify(update.name);
    }
    next();
});

const Tour = mongoose.model("tour", tourSchema);
module.exports = Tour;