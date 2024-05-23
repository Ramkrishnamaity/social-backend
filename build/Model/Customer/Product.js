"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const mediaSchema = new mongoose_1.Schema({
    url: {
        type: String
    },
    mediaType: {
        type: String
    }
});
const productSchema = new mongoose_1.Schema({
    categoryID: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true
    },
    subcategoryID: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true
    },
    customerID: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        require: true
    },
    clientID: {
        type: mongoose_1.default.Schema.Types.ObjectId
    },
    productName: {
        type: String,
        require: true
    },
    productDesc: {
        type: String,
        require: true
    },
    productMedia: {
        type: [mediaSchema]
    },
    price: {
        type: Number,
        required: true
    },
    sellerAddress: [
        {
            lat: String,
            long: String
        }
    ],
    discount: {
        percentage: Number,
        startDate: Date,
        endDate: Date
    },
    stock: {
        type: Number,
        default: 0
    },
    createdOn: {
        type: Date,
        default: Date.now
    },
    updatedOn: {
        type: Date,
        default: Date.now
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    status: {
        type: Boolean,
        default: true
    }
});
productSchema.methods.updateStock = function (isAdd, quantity) {
    isAdd ? (this.stock += quantity) : (this.stock -= quantity);
    this.save();
};
const ProductModel = (0, mongoose_1.model)("client-product", productSchema);
exports.default = ProductModel;
