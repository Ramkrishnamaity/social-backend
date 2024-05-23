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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const Product_1 = __importDefault(require("./Product"));
const Utility_1 = __importDefault(require("../../lib/service/Utility"));
const OrderSchema = new mongoose_1.Schema({
    orderID: {
        type: String,
        required: true
    },
    customerID: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true
    },
    vendorID: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true
    },
    postID: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true
    },
    product: {
        _id: mongoose_1.default.Schema.Types.ObjectId,
        price: Number,
        purchasePrice: Number,
        discount: Number,
        quantity: Number
    },
    address: {
        name: String,
        mobileNo: String,
        address: String,
        landmark: String,
        pincode: String,
        addressType: String,
        city: String,
        state: String,
        country: String
    },
    orderStatus: [
        {
            status: {
                type: String,
                enum: ["Pending", "Confirmed", "Canceled", "Delivered", "Out for Delivery"]
            },
            date: {
                type: Date,
                default: Date.now
            }
        }
    ],
    paymentMode: {
        type: String,
        enum: ["Online", "COD", "Wallet"]
    },
    transactionID: {
        type: String
    },
    createdOn: {
        type: Date,
        default: Date.now
    }
});
OrderSchema.methods.changeStatus = function (statusName, isVendor) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        let flag = true;
        const product = yield Product_1.default.findById(this.product._id);
        if (this.orderStatus[this.orderStatus.length - 1].status === "Pending" && !isVendor && statusName === "Confirmed") {
            this.orderStatus.push({
                status: statusName
            });
            this.save();
            product === null || product === void 0 ? void 0 : product.updateStock(false, this.product.quantity);
            return true;
        }
        else {
            if (isVendor) {
                const status = ["Pending", "Canceled", "Delivered"]; // if not include in last
                if (status.includes(this.orderStatus[this.orderStatus.length - 1].status)) {
                    flag = false;
                }
                else {
                    this.orderStatus.push({
                        status: statusName
                    });
                    this.save();
                }
            }
            else {
                const status = ["Pending", "Canceled", "Delivered", "Out for Delivery"]; // if not include in last
                if (status.includes(this.orderStatus[this.orderStatus.length - 1].status)) {
                    flag = false;
                }
                else {
                    this.orderStatus.push({
                        status: statusName
                    });
                    this.save();
                }
            }
            if (statusName === "Canceled" && flag) {
                // update stock
                product === null || product === void 0 ? void 0 : product.updateStock(true, this.product.quantity);
            }
            else if (statusName === "Delivered" && flag) {
                // distribute money
                yield (0, Utility_1.default)(this.orderID, this.vendorID.toString(), (_a = product === null || product === void 0 ? void 0 : product.clientID.toString()) !== null && _a !== void 0 ? _a : "", this.postID.toString(), this.product._id.toString(), this.customerID.toString(), (this.product.purchasePrice * this.product.quantity), this.paymentMode);
            }
            return flag;
        }
    });
};
const OrderModel = mongoose_1.default.model("Order", OrderSchema);
exports.default = OrderModel;
