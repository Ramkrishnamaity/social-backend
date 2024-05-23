"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const responseCode_1 = require("../../lib/service/responseCode");
const Transaction_1 = __importDefault(require("../../Model/Common/Transaction"));
const mongoose_1 = __importDefault(require("mongoose"));
const weeklyGraph = (req, res) => {
    var _a;
    try {
        const endDate = new Date();
        // startDate.setDate(startDate.getDate() - 28)
        // console.log(startDate, "==", endDate)
        // Initialize an array to store the intervals
        const weekIntervals = [];
        for (let i = 0; i < 4; i++) {
            const startDate = new Date(endDate);
            startDate.setDate(startDate.getDate() - (i + 1) * 7);
            const endDateOfWeek = new Date(endDate);
            endDateOfWeek.setDate(endDateOfWeek.getDate() - i * 7 - 1);
            weekIntervals.push({
                week: i + 1,
                startDate,
                endDateOfWeek
            });
        }
        // console.log(weekIntervals, "==", endDate)
        Transaction_1.default.aggregate([
            {
                $match: {
                    userID: new mongoose_1.default.Types.ObjectId((_a = req.user) === null || _a === void 0 ? void 0 : _a._id),
                    tag: "Product Sell",
                    date: {
                        $gte: weekIntervals[3].startDate,
                        $lte: endDate
                    }
                }
            },
            {
                $addFields: {
                    week: {
                        $switch: {
                            branches: [
                                {
                                    case: { $gte: ["$date", weekIntervals[0].startDate] },
                                    then: weekIntervals[0]
                                },
                                {
                                    case: { $gte: ["$date", weekIntervals[1].startDate] },
                                    then: weekIntervals[1]
                                },
                                {
                                    case: { $gte: ["$date", weekIntervals[2].startDate] },
                                    then: weekIntervals[2]
                                },
                                {
                                    case: { $gte: ["$date", weekIntervals[3].startDate] },
                                    then: weekIntervals[3]
                                }
                            ],
                            default: "Unknown" // Default value if the transaction date does not match any interval
                        }
                    }
                }
            },
            {
                $group: {
                    _id: "$week",
                    transaction: { $sum: "$amount" }
                }
            },
            {
                $project: {
                    __v: 0,
                    userID: 0,
                    week: 0
                }
            },
            {
                $sort: { _id: 1 }
            }
        ])
            .then(result => {
            res.status(responseCode_1.errorCode.SUCCESS).json({
                status: true,
                message: "Weekly Transaction Data get Successfully.",
                data: result
            });
        })
            .catch(error => {
            res.status(responseCode_1.errorCode.SERVER_ERROR).json({
                status: false,
                message: "Server error..!",
                error
            });
        });
    }
    catch (error) {
        res.status(responseCode_1.errorCode.SERVER_ERROR).json({
            status: false,
            message: "Server error..!",
            error
        });
    }
};
const monthlyGraph = (req, res) => {
    var _a;
    try {
        const endDate = new Date();
        const monthIntervals = [];
        for (let i = 0; i < 12; i++) {
            const startDate = new Date(endDate.getFullYear(), endDate.getMonth() - (i + 1), 1);
            const endDateOfMonth = new Date(endDate.getFullYear(), endDate.getMonth() - i, 0);
            monthIntervals.push({
                month: i + 1,
                startDate,
                endDate: endDateOfMonth
            });
        }
        // console.log(monthIntervals, "==", endDate)
        Transaction_1.default.aggregate([
            {
                $match: {
                    userID: new mongoose_1.default.Types.ObjectId((_a = req.user) === null || _a === void 0 ? void 0 : _a._id),
                    tag: "Product Sell",
                    date: {
                        $gte: monthIntervals[3].startDate,
                        $lte: endDate
                    }
                }
            },
            {
                $addFields: {
                    month: {
                        $switch: {
                            branches: [
                                {
                                    case: { $gte: ["$date", monthIntervals[0].startDate] },
                                    then: monthIntervals[0]
                                },
                                {
                                    case: { $gte: ["$date", monthIntervals[1].startDate] },
                                    then: monthIntervals[1]
                                },
                                {
                                    case: { $gte: ["$date", monthIntervals[2].startDate] },
                                    then: monthIntervals[2]
                                },
                                {
                                    case: { $gte: ["$date", monthIntervals[3].startDate] },
                                    then: monthIntervals[3]
                                }
                            ],
                            default: "Unknown" // Default value if the transaction date does not match any interval
                        }
                    }
                }
            },
            {
                $group: {
                    _id: "$month",
                    transaction: { $sum: "$amount" }
                }
            },
            {
                $project: {
                    __v: 0,
                    userID: 0,
                    month: 0
                }
            },
            {
                $sort: { _id: 1 }
            }
        ])
            .then(result => {
            res.status(responseCode_1.errorCode.SUCCESS).json({
                status: true,
                message: "Monthly Transaction Data get Successfully.",
                data: result
            });
        })
            .catch(error => {
            res.status(responseCode_1.errorCode.SERVER_ERROR).json({
                status: false,
                message: "Server error..!",
                error
            });
        });
    }
    catch (error) {
        res.status(responseCode_1.errorCode.SERVER_ERROR).json({
            status: false,
            message: "Server error..!",
            error
        });
    }
};
const lastTransaction = (req, res) => {
    var _a;
    try {
        Transaction_1.default.aggregate([
            {
                $match: {
                    userID: new mongoose_1.default.Types.ObjectId((_a = req.user) === null || _a === void 0 ? void 0 : _a._id),
                    tag: "Product Sell"
                }
            },
            {
                $lookup: {
                    from: "orders",
                    localField: "transactionID",
                    foreignField: "orderID",
                    as: "order",
                    pipeline: [
                        {
                            $lookup: {
                                from: "customers",
                                localField: "customerID",
                                foreignField: "_id",
                                as: "customer",
                                pipeline: [
                                    {
                                        $project: {
                                            fristName: 1,
                                            lastName: 1,
                                            image: 1,
                                            email: 1
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $lookup: {
                                from: "customers",
                                localField: "vendorID",
                                foreignField: "_id",
                                as: "vendor",
                                pipeline: [
                                    {
                                        $project: {
                                            fristName: 1,
                                            lastName: 1,
                                            image: 1,
                                            email: 1
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $lookup: {
                                from: "client-products",
                                localField: "product._id",
                                foreignField: "_id",
                                as: "productData"
                            }
                        },
                        {
                            $unwind: {
                                path: "$vendor",
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        {
                            $unwind: {
                                path: "$productData",
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        {
                            $unwind: {
                                path: "$customer",
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        {
                            $addFields: {
                                "product.name": "$productData.productName"
                            }
                        },
                        {
                            $project: {
                                vendor: 1,
                                customer: 1,
                                product: 1,
                                orderID: 1
                            }
                        }
                    ]
                }
            },
            {
                $unwind: {
                    path: "$order",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    amount: 1,
                    type: 1,
                    tag: 1,
                    transactionID: 1,
                    date: 1,
                    order: 1
                }
            },
            {
                $sort: {
                    date: -1
                }
            },
            {
                $limit: 10
            }
        ])
            .then(result => {
            res.status(responseCode_1.errorCode.SUCCESS).json({
                status: true,
                message: "Last Recent Transaction fetched Successfully.",
                data: result
            });
        })
            .catch(error => {
            res.status(responseCode_1.errorCode.SERVER_ERROR).json({
                status: false,
                message: "Server error..!",
                error
            });
        });
    }
    catch (error) {
        res.status(responseCode_1.errorCode.SERVER_ERROR).json({
            status: false,
            message: "Server error..!",
            error
        });
    }
};
const ClientTransactionController = {
    weeklyGraph,
    monthlyGraph,
    lastTransaction
};
exports.default = ClientTransactionController;
