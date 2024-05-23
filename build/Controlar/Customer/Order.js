"use strict";
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
const responseCode_1 = require("../../lib/service/responseCode");
const Order_1 = __importDefault(require("../../Model/Customer/Order"));
const mongoose_1 = __importDefault(require("mongoose"));
const myOrder = (req, res) => {
    try {
        const page = req.query.page || 1;
        const limit = 10;
        const skip = (page - 1) * limit;
        Order_1.default.aggregate([
            {
                $match: {
                    customerID: new mongoose_1.default.Types.ObjectId(req.params.id)
                }
            },
            {
                $lookup: {
                    from: "client-products",
                    foreignField: "_id",
                    localField: "product._id",
                    as: "productData",
                    pipeline: [
                        {
                            $project: {
                                productName: 1,
                                productMedia: 1
                            }
                        }
                    ]
                }
            },
            {
                $unwind: {
                    path: "$productData",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    orderID: 1,
                    product: 1,
                    productData: 1,
                    orderStatus: 1,
                    createdOn: 1
                }
            },
            {
                $sort: { _id: -1 }
            },
            {
                $skip: skip
            },
            {
                $limit: limit
            }
        ])
            .then((result) => __awaiter(void 0, void 0, void 0, function* () {
            const totalData = yield Order_1.default.countDocuments({
                customerID: req.params.id
            });
            res.status(responseCode_1.errorCode.SUCCESS).json({
                status: true,
                message: "OrderData Fetched",
                data: result,
                pageLimit: Math.ceil(totalData / limit)
            });
        }))
            .catch(error => {
            res.status(responseCode_1.errorCode.SERVER_ERROR).json({
                status: false,
                message: "Server Error..!",
                error
            });
        });
    }
    catch (error) {
        res.status(responseCode_1.errorCode.SERVER_ERROR).json({
            status: false,
            message: "Server Error..!",
            error
        });
    }
};
const myProductOrder = (req, res) => {
    try {
        const page = req.query.page || 1;
        const limit = 10;
        const skip = (page - 1) * limit;
        Order_1.default.aggregate([
            {
                $match: {
                    vendorID: new mongoose_1.default.Types.ObjectId(req.params.id)
                }
            },
            {
                $lookup: {
                    from: "client-products",
                    foreignField: "_id",
                    localField: "product._id",
                    as: "productData",
                    pipeline: [
                        {
                            $project: {
                                productName: 1,
                                productMedia: 1
                            }
                        }
                    ]
                }
            },
            {
                $unwind: {
                    path: "$productData",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    orderID: 1,
                    product: 1,
                    productData: 1,
                    orderStatus: 1,
                    createdOn: 1
                }
            },
            {
                $sort: { _id: -1 }
            },
            {
                $skip: skip
            },
            {
                $limit: limit
            }
        ])
            .then((result) => __awaiter(void 0, void 0, void 0, function* () {
            const totalData = yield Order_1.default.countDocuments({
                vendorID: req.params.id
            });
            res.status(responseCode_1.errorCode.SUCCESS).json({
                status: true,
                message: "OrderData Fetched",
                data: result,
                pageLimit: Math.ceil(totalData / limit)
            });
        }))
            .catch(error => {
            res.status(responseCode_1.errorCode.SERVER_ERROR).json({
                status: false,
                message: "Server Error..!",
                error
            });
        });
    }
    catch (error) {
        res.status(responseCode_1.errorCode.SERVER_ERROR).json({
            status: false,
            message: "Server Error..!",
            error
        });
    }
};
const specificOrder = (req, res) => {
    try {
        Order_1.default.aggregate([
            {
                $match: {
                    _id: new mongoose_1.default.Types.ObjectId(req.params.id)
                }
            },
            {
                $lookup: {
                    from: "client-products",
                    foreignField: "_id",
                    localField: "product._id",
                    as: "productData",
                    pipeline: [
                        {
                            $project: {
                                productName: 1,
                                productMedia: 1
                            }
                        }
                    ]
                }
            },
            {
                $unwind: {
                    path: "$productData",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    orderID: 1,
                    product: 1,
                    vendorID: 1,
                    productData: 1,
                    orderStatus: 1,
                    paymentMode: 1,
                    createdOn: 1
                }
            }
        ])
            .then((result) => __awaiter(void 0, void 0, void 0, function* () {
            if (result.length > 0) {
                res.status(responseCode_1.errorCode.SUCCESS).json({
                    status: true,
                    message: "OrderData Fetched",
                    data: result[0]
                });
            }
            else {
                res.status(responseCode_1.errorCode.NOT_FOUND_ERROR).json({
                    status: false,
                    message: "Invalid Data..!"
                });
            }
        }))
            .catch(error => {
            res.status(responseCode_1.errorCode.SERVER_ERROR).json({
                status: false,
                message: "Server Error..!",
                error
            });
        });
    }
    catch (error) {
        res.status(responseCode_1.errorCode.SERVER_ERROR).json({
            status: false,
            message: "Server Error..!",
            error
        });
    }
};
const changeStatus = (req, res) => {
    try {
        const customerID = req.header("X-User-Id");
        Order_1.default.findById(req.params.id)
            .then((result) => __awaiter(void 0, void 0, void 0, function* () {
            if (!result) {
                res.status(responseCode_1.errorCode.NOT_FOUND_ERROR).json({
                    status: false,
                    message: "Invalid Data..!"
                });
            }
            else {
                let flag = true;
                if (result.vendorID.toString() === customerID) {
                    flag = yield result.changeStatus(req.body.status, true);
                }
                else {
                    flag = yield result.changeStatus("Canceled", false);
                }
                if (flag) {
                    res.status(responseCode_1.errorCode.SUCCESS).json({
                        status: true,
                        message: "Order Status Updated"
                    });
                }
                else {
                    res.status(responseCode_1.errorCode.BAD_REQUEST).json({
                        status: false,
                        message: "Invalid Status..!"
                    });
                }
            }
        }))
            .catch(error => {
            res.status(responseCode_1.errorCode.SERVER_ERROR).json({
                status: false,
                message: "Server Error..!",
                error
            });
        });
    }
    catch (error) {
        res.status(responseCode_1.errorCode.SERVER_ERROR).json({
            status: false,
            message: "Server Error..!",
            error
        });
    }
};
const OrderController = {
    myOrder,
    myProductOrder,
    specificOrder,
    changeStatus
};
exports.default = OrderController;
