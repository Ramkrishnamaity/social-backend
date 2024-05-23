"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const Planschema = new mongoose_1.Schema({
    planID: {
        type: String,
    },
    productID: {
        type: String,
    },
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String
    },
    image: {
        type: String,
        default: "https://foodserviceip.com/wp-content/uploads/2022/02/Subscription-image.jpg"
    },
    price: {
        type: Number
    },
    currency: {
        type: String
    },
    interval: {
        type: String
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    createdOn: {
        type: Date,
        default: Date.now
    },
    updatedOn: {
        type: Date,
        default: Date.now
    }
});
Planschema.methods.addPlanIDProductID = function (planID, productID) {
    this.planID = planID;
    this.productID = productID;
    this.save();
};
// ClientSchema.methods.comparePassword = function (candidatePassword) {
//     return passwordHash.verify(candidatePassword, this.password);
// };
const PlanModel = (0, mongoose_1.model)("Plan", Planschema);
exports.default = PlanModel;
