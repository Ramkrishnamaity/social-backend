"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const medeaSchema = new mongoose_1.Schema({
    url: {
        type: String
    },
    mediaType: {
        type: String
    }
});
const productSchema = new mongoose_1.Schema({
    customerID: {
        type: mongoose_1.Schema.Types.ObjectId,
        require: true
    },
    productName: {
        type: String,
        required: true
    },
    categoryID: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true
    },
    subCategoryID: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    media: {
        type: [medeaSchema],
        default: []
    },
    sellerAddress: {
        type: Object,
        default: false
    },
    createdOn: {
        type: Date
    },
    modifiedOn: {
        type: Date,
        default: Date.now
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    enableStatus: {
        type: Boolean,
        default: true
    }
});
exports.default = (0, mongoose_1.model)("product", productSchema);
