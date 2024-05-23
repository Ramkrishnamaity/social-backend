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
const Wallet_1 = __importDefault(require("../../Model/Common/Wallet"));
const responseCode_1 = require("../../lib/service/responseCode");
const mongoose_1 = __importDefault(require("mongoose"));
const Transaction_1 = __importDefault(require("../../Model/Common/Transaction"));
const getBalance = (req, res) => {
    try {
        const limit = 10;
        if (!req.query.page) {
            Wallet_1.default.aggregate([
                {
                    $match: {
                        userID: new mongoose_1.default.Types.ObjectId(req.header("X-User-Id"))
                    }
                },
                {
                    $lookup: {
                        from: "transactions",
                        foreignField: "userID",
                        localField: "userID",
                        as: "transactions",
                        pipeline: [
                            {
                                $lookup: {
                                    from: "client-products",
                                    foreignField: "_id",
                                    localField: "productID",
                                    as: "product",
                                    pipeline: [
                                        {
                                            $project: {
                                                _id: 1,
                                                productName: 1,
                                                productMedia: 1
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                $unwind: {
                                    path: "$product",
                                    preserveNullAndEmptyArrays: true
                                }
                            },
                            {
                                $limit: limit
                            },
                            {
                                $sort: { _id: -1 }
                            }
                        ]
                    }
                }
            ])
                .then((result) => __awaiter(void 0, void 0, void 0, function* () {
                if (result.length !== 0) {
                    const totalPage = yield Transaction_1.default.countDocuments({ userID: req.header("X-User-Id") });
                    res.status(responseCode_1.errorCode.SUCCESS).json({
                        status: true,
                        message: "Wallet Data Fetched.",
                        data: result[0],
                        totalPage: Math.ceil(totalPage / limit) - 1
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
        else {
            const page = req.query.page;
            const skip = limit + limit * (page - 1);
            Transaction_1.default.aggregate([
                {
                    $match: {
                        userID: new mongoose_1.default.Types.ObjectId(req.header("X-User-Id"))
                    }
                },
                {
                    $lookup: {
                        from: "client-products",
                        foreignField: "_id",
                        localField: "productID",
                        as: "product",
                        pipeline: [
                            {
                                $project: {
                                    _id: 1,
                                    productName: 1,
                                    productMedia: 1
                                }
                            }
                        ]
                    }
                },
                {
                    $unwind: {
                        path: "$product",
                        preserveNullAndEmptyArrays: true
                    }
                },
                { $skip: skip },
                { $limit: limit },
                {
                    $sort: { _id: -1 }
                }
            ])
                .then(result => {
                res.status(responseCode_1.errorCode.SUCCESS).json({
                    status: true,
                    message: "Transaction Data Fetched.",
                    data: result
                });
            })
                .catch(error => {
                res.status(responseCode_1.errorCode.SERVER_ERROR).json({
                    status: false,
                    message: "Server Error..!",
                    error
                });
            });
        }
    }
    catch (error) {
        res.status(responseCode_1.errorCode.SERVER_ERROR).json({
            status: false,
            message: "Server Error..!",
            error
        });
    }
};
const moneyWithdraw = (req, res) => {
    try {
        Wallet_1.default.findOne({
            userID: req.body.customerID
        })
            .then((result) => __awaiter(void 0, void 0, void 0, function* () {
            if (!result) {
                res.status(responseCode_1.errorCode.NOT_FOUND_ERROR).json({
                    status: false,
                    message: "Invalid Data..!"
                });
            }
            else {
                if (result.balance < req.body.amount) {
                    res.status(responseCode_1.errorCode.BAD_REQUEST).json({
                        status: false,
                        message: "Insufficient Balance..!"
                    });
                }
                else {
                    yield result.debit(req.body.amount, req.body.transactionID);
                    res.status(responseCode_1.errorCode.SUCCESS).json({
                        status: true,
                        message: "wallet Updated..!"
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
const CustomerWalletController = {
    getBalance,
    moneyWithdraw
};
exports.default = CustomerWalletController;
