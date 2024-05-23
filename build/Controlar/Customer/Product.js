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
const Product_1 = __importDefault(require("../../Model/Customer/Product"));
const responseCode_1 = require("../../lib/service/responseCode");
const mongoose_1 = __importDefault(require("mongoose"));
const uuid_1 = require("uuid");
const Order_1 = __importDefault(require("../../Model/Customer/Order"));
const Utility_1 = __importDefault(require("../../lib/service/Utility"));
const Wishlist_1 = __importDefault(require("../../Model/Customer/Wishlist"));
const Wallet_1 = __importDefault(require("../../Model/Common/Wallet"));
const Transaction_1 = __importDefault(require("../../Model/Common/Transaction"));
// import WalletModel from "../../Model/Common/Wallet"
const createProduct = (req, res) => {
    var _a;
    try {
        const Product = new Product_1.default(Object.assign(Object.assign({}, req.body), { clientID: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id }));
        Product.save()
            .then(() => {
            res.status(responseCode_1.errorCode.SUCCESS).json({
                status: true,
                message: "Product Created Successfully."
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
    catch (error) {
        res.status(responseCode_1.errorCode.SERVER_ERROR).json({
            status: false,
            message: "Server Error..!",
            error
        });
    }
};
const updateProduct = (req, res) => {
    try {
        Product_1.default.findOneAndUpdate({
            _id: req.params.id
        }, {
            $set: Object.assign(Object.assign({}, req.body), { updatedOn: new Date() })
        })
            .then(result => {
            if (result) {
                res.status(responseCode_1.errorCode.SUCCESS).json({
                    status: true,
                    message: "Product Updated Successfully."
                });
            }
            else {
                res.status(responseCode_1.errorCode.NOT_FOUND_ERROR).json({
                    status: false,
                    message: "Product Not Found."
                });
            }
        })
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
const deleteProduct = (req, res) => {
    try {
        Product_1.default.findByIdAndUpdate({
            _id: req.params.id
        }, {
            $set: {
                isDeleted: true
            }
        })
            .then(result => {
            if (result) {
                res.status(responseCode_1.errorCode.SUCCESS).json({
                    status: true,
                    message: "Product Deleted Successfully."
                });
            }
            else {
                res.status(responseCode_1.errorCode.NOT_FOUND_ERROR).json({
                    status: false,
                    message: "Product Not Found."
                });
            }
        })
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
const addDiscount = (req, res) => {
    try {
        Product_1.default.findOneAndUpdate({
            _id: req.params.id
        }, {
            $set: Object.assign(Object.assign({}, req.body), { updatedOn: new Date() })
        })
            .then(result => {
            if (result) {
                res.status(responseCode_1.errorCode.SUCCESS).json({
                    status: true,
                    message: "Discount Added Successfully."
                });
            }
            else {
                res.status(responseCode_1.errorCode.NOT_FOUND_ERROR).json({
                    status: false,
                    message: "Product Not Found."
                });
            }
        })
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
const getProducts = (req, res) => {
    var _a, _b, _c, _d;
    try {
        const page = req.query.page || 1;
        const limit = 12;
        const skip = limit * (page - 1);
        const today = new Date();
        let match = {};
        let countMatch = {};
        if (req.header("X-User-Id")) {
            match = {
                clientID: new mongoose_1.default.Types.ObjectId((_a = req.user) === null || _a === void 0 ? void 0 : _a._id),
                customerID: new mongoose_1.default.Types.ObjectId(req.header("X-User-Id")),
                status: true,
                isDeleted: false
            };
            countMatch = { clientID: (_b = req.user) === null || _b === void 0 ? void 0 : _b._id, customerID: req.header("X-User-Id"), isDeleted: false };
        }
        else {
            match = {
                clientID: new mongoose_1.default.Types.ObjectId((_c = req.user) === null || _c === void 0 ? void 0 : _c._id),
                isDeleted: false
            };
            countMatch = { clientID: (_d = req.user) === null || _d === void 0 ? void 0 : _d._id, isDeleted: false };
        }
        Product_1.default.aggregate([
            {
                $match: match
            },
            {
                $lookup: {
                    from: "categories",
                    foreignField: "_id",
                    localField: "categoryID",
                    as: "category",
                    pipeline: [
                        {
                            $project: {
                                _id: 1,
                                name: 1
                            }
                        }
                    ]
                }
            },
            {
                $lookup: {
                    from: "subcategories",
                    foreignField: "_id",
                    localField: "subcategoryID",
                    as: "subcategory",
                    pipeline: [
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                image: 1
                            }
                        }
                    ]
                }
            },
            {
                $lookup: {
                    from: "customers",
                    foreignField: "_id",
                    localField: "customerID",
                    as: "customer",
                    pipeline: [
                        {
                            $project: {
                                fristName: 1,
                                lastName: 1,
                                image: 1
                            }
                        }
                    ]
                }
            },
            {
                $unwind: {
                    path: "$customer",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: "$subcategory",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: "$category",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    discount: {
                        $cond: {
                            if: {
                                $and: [
                                    { $ifNull: ["$discount", false] },
                                    { $gte: [today, "$discount.startDate"] },
                                    { $lte: [today, "$discount.endDate"] }
                                ]
                            },
                            then: "$discount.percentage",
                            else: 0
                        }
                    },
                    sellingPrice: {
                        $cond: {
                            if: {
                                $and: [
                                    { $ifNull: ["$discount", false] },
                                    { $gte: [today, "$discount.startDate"] },
                                    { $lte: [today, "$discount.endDate"] }
                                ]
                            },
                            then: {
                                $multiply: [
                                    "$price",
                                    {
                                        $divide: [
                                            {
                                                $subtract: [100, "$discount.percentage"]
                                            },
                                            100
                                        ]
                                    }
                                ]
                            },
                            else: "$price"
                        }
                    }
                }
            },
            {
                $project: {
                    categoryID: 0,
                    subcategoryID: 0,
                    customerID: 0,
                    clientID: 0,
                    isDeleted: 0,
                    __v: 0
                }
            },
            { $skip: skip },
            { $limit: limit }
        ])
            .then((result) => __awaiter(void 0, void 0, void 0, function* () {
            const totalCustomer = yield Product_1.default.countDocuments(countMatch);
            res.status(responseCode_1.errorCode.SUCCESS).json({
                status: true,
                message: "Product Fetched Succesfully",
                data: result,
                totalPage: Math.ceil(totalCustomer / limit)
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
const getTopProducts = (req, res) => {
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
                $group: {
                    _id: "$productID"
                }
            },
            {
                $lookup: {
                    from: "orders",
                    localField: "_id",
                    foreignField: "product._id",
                    as: "orders"
                }
            },
            {
                $lookup: {
                    from: "client-products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "product",
                    pipeline: [
                        {
                            $lookup: {
                                from: "customers",
                                localField: "customerID",
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
                            $unwind: {
                                path: "$vendor",
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        {
                            $project: {
                                productName: 1,
                                vendor: 1
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
                $addFields: {
                    totalOrderQuantity: {
                        $sum: "$orders.product.quantity"
                    },
                    totalOrderAmount: {
                        $sum: {
                            $map: {
                                input: "$orders",
                                as: "order",
                                in: {
                                    $multiply: ["$$order.product.quantity", "$$order.product.purchasePrice"]
                                }
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    orders: 0,
                }
            },
            {
                $sort: { totalOrderAmount: -1 }
            },
            {
                $limit: 10
            }
        ])
            .then(result => {
            res.status(responseCode_1.errorCode.SUCCESS).json({
                status: true,
                message: "Top 10 product fetched.",
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
    catch (error) {
        res.status(responseCode_1.errorCode.SERVER_ERROR).json({
            status: false,
            message: "Server Error..!",
            error
        });
    }
};
const getSingleProduct = (req, res) => {
    var _a;
    try {
        const today = new Date();
        const customerID = req.header("X-User-Id");
        console.log(customerID);
        Product_1.default.aggregate([
            {
                $match: {
                    clientID: new mongoose_1.default.Types.ObjectId((_a = req.user) === null || _a === void 0 ? void 0 : _a._id),
                    _id: new mongoose_1.default.Types.ObjectId(req.params.id),
                    isDeleted: false
                }
            },
            {
                $lookup: {
                    from: "categories",
                    foreignField: "_id",
                    localField: "categoryID",
                    as: "category",
                    pipeline: [
                        {
                            $project: {
                                _id: 1,
                                name: 1
                            }
                        }
                    ]
                }
            },
            {
                $lookup: {
                    from: "subcategories",
                    foreignField: "_id",
                    localField: "subcategoryID",
                    as: "subcategory",
                    pipeline: [
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                image: 1
                            }
                        }
                    ]
                }
            },
            {
                $lookup: {
                    from: "customers",
                    foreignField: "_id",
                    localField: "customerID",
                    as: "customer",
                    pipeline: [
                        {
                            $project: {
                                fristName: 1,
                                lastName: 1,
                                image: 1
                            }
                        }
                    ]
                }
            },
            {
                $unwind: {
                    path: "$customer",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: "$subcategory",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: "$category",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "wishlists",
                    foreignField: "productID",
                    localField: "_id",
                    as: "wishlist"
                }
            },
            {
                $addFields: {
                    isWishListed: {
                        $cond: {
                            if: {
                                $eq: [
                                    { $indexOfArray: ["$wishlist.customerID", new mongoose_1.default.Types.ObjectId(customerID)] },
                                    -1
                                ]
                            },
                            then: false,
                            else: true
                        }
                    },
                    discount: {
                        $cond: {
                            if: {
                                $and: [
                                    { $ifNull: ["$discount", false] },
                                    { $gte: [today, "$discount.startDate"] },
                                    { $lte: [today, "$discount.endDate"] }
                                ]
                            },
                            then: "$discount.percentage",
                            else: 0
                        }
                    },
                    sellingPrice: {
                        $cond: {
                            if: {
                                $and: [
                                    { $ifNull: ["$discount", false] },
                                    { $gte: [today, "$discount.startDate"] },
                                    { $lte: [today, "$discount.endDate"] }
                                ]
                            },
                            then: {
                                $multiply: [
                                    "$price",
                                    {
                                        $divide: [
                                            {
                                                $subtract: [100, "$discount.percentage"]
                                            },
                                            100
                                        ]
                                    }
                                ]
                            },
                            else: "$price"
                        }
                    }
                }
            },
            {
                $project: {
                    categoryID: 0,
                    subcategoryID: 0,
                    customerID: 0,
                    wishlist: 0,
                    clientID: 0,
                    isDeleted: 0,
                    __v: 0
                }
            }
        ])
            .then((result) => __awaiter(void 0, void 0, void 0, function* () {
            res.status(responseCode_1.errorCode.SUCCESS).json({
                status: true,
                message: "Product Fetched Succesfully",
                data: result
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
const getSpecificProduct = (req, res) => {
    var _a;
    try {
        const today = new Date();
        Product_1.default.aggregate([
            {
                $match: {
                    clientID: new mongoose_1.default.Types.ObjectId((_a = req.user) === null || _a === void 0 ? void 0 : _a._id),
                    _id: new mongoose_1.default.Types.ObjectId(req.params.id),
                    isDeleted: false
                }
            },
            {
                $lookup: {
                    from: "categories",
                    foreignField: "_id",
                    localField: "categoryID",
                    as: "category",
                    pipeline: [
                        {
                            $project: {
                                _id: 1,
                                name: 1
                            }
                        }
                    ]
                }
            },
            {
                $lookup: {
                    from: "subcategories",
                    foreignField: "_id",
                    localField: "subcategoryID",
                    as: "subcategory",
                    pipeline: [
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                image: 1
                            }
                        }
                    ]
                }
            },
            {
                $lookup: {
                    from: "customers",
                    foreignField: "_id",
                    localField: "customerID",
                    as: "customer",
                    pipeline: [
                        {
                            $project: {
                                email: 1,
                                fristName: 1,
                                lastName: 1,
                                image: 1
                            }
                        }
                    ]
                }
            },
            {
                $unwind: {
                    path: "$customer",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: "$subcategory",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: "$category",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "orders",
                    foreignField: "product._id",
                    localField: "_id",
                    as: "orders",
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
                                            email: 1,
                                            image: 1
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $unwind: {
                                path: "$customer",
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        {
                            $project: {
                                orderID: 1,
                                customer: 1,
                                paymentMode: 1,
                                product: 1,
                                createdOn: 1,
                                orderStatus: {
                                    $arrayElemAt: [
                                        "$orderStatus",
                                        {
                                            $subtract: [
                                                { $size: "$orderStatus" },
                                                1
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    ]
                }
            },
            {
                $addFields: {
                    discount: {
                        $cond: {
                            if: {
                                $and: [
                                    { $ifNull: ["$discount", false] },
                                    { $gte: [today, "$discount.startDate"] },
                                    { $lte: [today, "$discount.endDate"] }
                                ]
                            },
                            then: "$discount.percentage",
                            else: 0
                        }
                    },
                    sellingPrice: {
                        $cond: {
                            if: {
                                $and: [
                                    { $ifNull: ["$discount", false] },
                                    { $gte: [today, "$discount.startDate"] },
                                    { $lte: [today, "$discount.endDate"] }
                                ]
                            },
                            then: {
                                $multiply: [
                                    "$price",
                                    {
                                        $divide: [
                                            {
                                                $subtract: [100, "$discount.percentage"]
                                            },
                                            100
                                        ]
                                    }
                                ]
                            },
                            else: "$price"
                        }
                    },
                    orderCount: {
                        $size: "$orders"
                    }
                }
            },
            {
                $project: {
                    categoryID: 0,
                    subcategoryID: 0,
                    customerID: 0,
                    clientID: 0,
                    isDeleted: 0,
                    __v: 0
                }
            }
        ])
            .then((result) => __awaiter(void 0, void 0, void 0, function* () {
            if (result.length > 0) {
                res.status(responseCode_1.errorCode.SUCCESS).json({
                    status: true,
                    message: "Product Fetched Succesfully",
                    data: result[0]
                });
            }
            else {
                res.status(responseCode_1.errorCode.NOT_FOUND_ERROR).json({
                    status: false,
                    message: "Invaild Data..!"
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
const productCheckout = (req, res) => {
    try {
        const orderID = (0, uuid_1.v4)();
        const today = new Date();
        Product_1.default.aggregate([
            {
                $match: {
                    _id: new mongoose_1.default.Types.ObjectId(req.body.productID)
                }
            },
            {
                $lookup: {
                    from: "addresses",
                    as: "address",
                    pipeline: [
                        {
                            $match: {
                                _id: new mongoose_1.default.Types.ObjectId(req.body.addressID)
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                __v: 0,
                                customerID: 0
                            }
                        }
                    ]
                }
            },
            {
                $unwind: {
                    path: "$address",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    discount: {
                        $cond: {
                            if: {
                                $and: [
                                    { $ifNull: ["$discount", false] },
                                    { $gte: [today, "$discount.startDate"] },
                                    { $lte: [today, "$discount.endDate"] }
                                ]
                            },
                            then: "$discount.percentage",
                            else: 0
                        }
                    },
                    sellingPrice: {
                        $cond: {
                            if: {
                                $and: [
                                    { $ifNull: ["$discount", false] },
                                    { $gte: [today, "$discount.startDate"] },
                                    { $lte: [today, "$discount.endDate"] }
                                ]
                            },
                            then: {
                                $multiply: [
                                    "$price",
                                    {
                                        $divide: [
                                            {
                                                $subtract: [100, "$discount.percentage"]
                                            },
                                            100
                                        ]
                                    }
                                ]
                            },
                            else: "$price"
                        }
                    }
                }
            }
        ])
            .then((result) => __awaiter(void 0, void 0, void 0, function* () {
            if (req.body.quantity > result[0].stock) {
                res.status(responseCode_1.errorCode.BAD_REQUEST).json({
                    status: false,
                    message: "Stock Limit Exceeded."
                });
            }
            else {
                const customerBalance = yield Wallet_1.default.findOne({ userID: req.body.customerID });
                if (req.body.paymentMode === "Wallet") {
                    if (!customerBalance) {
                        return res.status(responseCode_1.errorCode.NOT_FOUND_ERROR).json({
                            status: false,
                            message: "Invalid Data..!"
                        });
                    }
                    else if (customerBalance.balance < (result[0].sellingPrice * Number(req.body.quantity))) {
                        return res.status(responseCode_1.errorCode.BAD_REQUEST).json({
                            status: false,
                            message: "Insufficient Balance.!"
                        });
                    }
                }
                const orderData = {
                    orderID,
                    customerID: req.body.customerID,
                    postID: req.body.postID,
                    vendorID: result[0].customerID,
                    product: {
                        _id: result[0]._id,
                        price: result[0].price,
                        purchasePrice: result[0].sellingPrice,
                        discount: result[0].discount,
                        quantity: Number(req.body.quantity)
                    },
                    address: result[0].address,
                    orderStatus: req.body.paymentMode === "COD" ? [
                        { status: "Confirmed" },
                        { status: "Delivered" }
                    ] : [
                        { status: "Pending" }
                    ],
                    paymentMode: req.body.paymentMode
                };
                if (req.body.paymentMode === "Wallet") {
                    yield (customerBalance === null || customerBalance === void 0 ? void 0 : customerBalance.debit((result[0].sellingPrice * Number(req.body.quantity)), "Product Buy", orderID, result[0]._id));
                    orderData.orderStatus.push({ status: "Confirmed" });
                }
                const order = new Order_1.default(orderData);
                order.save()
                    .then((order) => __awaiter(void 0, void 0, void 0, function* () {
                    var _a, _b, _c;
                    const product = yield Product_1.default.findById(result[0]._id);
                    if (orderData.orderStatus[orderData.orderStatus.length - 1].status !== "Pending") {
                        // update stock
                        product === null || product === void 0 ? void 0 : product.updateStock(false, Number(req.body.quantity));
                    }
                    if (orderData.orderStatus[orderData.orderStatus.length - 1].status === "Delivered") {
                        yield (0, Utility_1.default)(orderData.orderID, (_a = product === null || product === void 0 ? void 0 : product.customerID.toString()) !== null && _a !== void 0 ? _a : "", (_c = (_b = req.user) === null || _b === void 0 ? void 0 : _b._id) !== null && _c !== void 0 ? _c : "", req.body.postID, req.body.productID, req.body.customerID, (result[0].sellingPrice * Number(req.body.quantity)), orderData.paymentMode);
                    }
                    res.status(responseCode_1.errorCode.SUCCESS).json({
                        status: true,
                        message: "Order Created.",
                        data: order._id
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
const addWishList = (req, res) => {
    try {
        if (req.body.wishlist) {
            const wishListDoc = new Wishlist_1.default({ customerID: req.body.customerID, postID: req.body.postID, productID: req.params.id });
            wishListDoc.save()
                .then(() => {
                res.status(responseCode_1.errorCode.SUCCESS).json({
                    status: true,
                    message: "Post Wishlisted Successfully."
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
        else {
            Wishlist_1.default.findOneAndDelete({
                customerID: req.body.customerID,
                productID: req.params.id
            })
                .then(result => {
                if (result) {
                    res.status(responseCode_1.errorCode.SUCCESS).json({
                        status: true,
                        message: "Post Wishlist Removed Successfully."
                    });
                }
                else {
                    res.status(responseCode_1.errorCode.NOT_FOUND_ERROR).json({
                        status: false,
                        message: "Invalid Data..!"
                    });
                }
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
const ProductController = {
    createProduct,
    updateProduct,
    deleteProduct,
    addDiscount,
    getProducts,
    getTopProducts,
    getSingleProduct,
    getSpecificProduct,
    productCheckout,
    addWishList
};
exports.default = ProductController;
