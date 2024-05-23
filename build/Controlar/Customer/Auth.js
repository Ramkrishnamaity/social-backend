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
const CustomerModel_1 = __importDefault(require("../../Model/Customer/CustomerModel"));
const responseCode_1 = require("../../lib/service/responseCode");
const mongoose_1 = __importDefault(require("mongoose"));
const Wallet_1 = __importDefault(require("../../Model/Common/Wallet"));
const PostModel_1 = __importDefault(require("../../Model/Customer/PostModel"));
const Product_1 = __importDefault(require("../../Model/Customer/Product"));
const Wishlist_1 = __importDefault(require("../../Model/Customer/Wishlist"));
const addCustomer = (req, res) => {
    try {
        CustomerModel_1.default.findOne({ email: req.body.email })
            .then(result => {
            var _a;
            if (!result) {
                const customer = new CustomerModel_1.default(Object.assign(Object.assign({}, req.body), { clientID: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id }));
                customer.save()
                    .then((result) => __awaiter(void 0, void 0, void 0, function* () {
                    yield Wallet_1.default.create({ userID: result._id });
                    res.status(responseCode_1.errorCode.SUCCESS).json({
                        status: true,
                        message: "Customer Created Succesfully",
                        data: { _id: result._id.toString() }
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
            else {
                res.status(responseCode_1.errorCode.BAD_REQUEST).json({
                    status: false,
                    message: "Customer Already Exist.."
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
const updateCustomer = (req, res) => {
    var _a;
    try {
        CustomerModel_1.default.findOneAndUpdate({
            _id: req.params.id,
            clientID: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id
        }, {
            $set: Object.assign(Object.assign({}, req.body), { updatedOn: new Date() })
        })
            .then(result => {
            if (result) {
                res.status(responseCode_1.errorCode.SUCCESS).json({
                    status: true,
                    message: "Customer Updated Succesfully"
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
    catch (error) {
        res.status(responseCode_1.errorCode.SERVER_ERROR).json({
            status: false,
            message: "Server Error..!",
            error
        });
    }
};
const getProfile = (req, res) => {
    try {
        const customerID = req.header("X-User-Id");
        const limit = 10;
        const today = new Date();
        if (!req.query.page) {
            CustomerModel_1.default.aggregate([
                {
                    $match: {
                        _id: new mongoose_1.default.Types.ObjectId(req.params.id)
                    }
                },
                {
                    $lookup: {
                        from: "client-posts",
                        foreignField: "customerID",
                        localField: "_id",
                        as: "posts",
                        pipeline: [
                            {
                                $match: {
                                    status: true,
                                    isDeleted: false
                                }
                            },
                            {
                                $lookup: {
                                    from: "customers",
                                    localField: "customerID",
                                    foreignField: "_id",
                                    as: "customer",
                                    pipeline: [
                                        {
                                            $project: {
                                                email: 1,
                                                image: 1,
                                                fristName: 1,
                                                lastName: 1
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                $unwind: {
                                    path: "$customer",
                                    preserveNullAndEmptyArrays: false
                                }
                            },
                            {
                                $lookup: {
                                    from: "client-post-likes",
                                    localField: "_id",
                                    foreignField: "postID",
                                    as: "likes"
                                }
                            },
                            {
                                $lookup: {
                                    from: "client-post-comments",
                                    localField: "postID",
                                    foreignField: "postID",
                                    as: "comments"
                                }
                            },
                            {
                                $lookup: {
                                    from: "client-products",
                                    localField: "products",
                                    foreignField: "_id",
                                    as: "product",
                                    pipeline: [
                                        {
                                            $match: {
                                                isDeleted: false,
                                                status: true
                                            }
                                        },
                                        {
                                            $project: {
                                                _id: 1,
                                                productName: 1,
                                                productMedia: 1,
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
                                    ]
                                }
                            },
                            {
                                $addFields: {
                                    isLiked: {
                                        $cond: {
                                            if: {
                                                $eq: [
                                                    { $indexOfArray: ["$likes.customerID", new mongoose_1.default.Types.ObjectId(customerID)] },
                                                    -1
                                                ]
                                            },
                                            then: false,
                                            else: true
                                        }
                                    },
                                    like: {
                                        $size: "$likes"
                                    },
                                    comment: {
                                        $size: "$comments"
                                    }
                                }
                            },
                            {
                                $project: {
                                    clientID: 0,
                                    customerID: 0,
                                    products: 0,
                                    likes: 0,
                                    comments: 0,
                                    isDeleted: 0,
                                    __v: 0
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
                },
                {
                    $project: {
                        _id: 1,
                        fristName: 1,
                        lastName: 1,
                        email: 1,
                        image: 1,
                        posts: 1
                    }
                }
            ])
                .then((result) => __awaiter(void 0, void 0, void 0, function* () {
                const totalData = yield PostModel_1.default.countDocuments({ customerID: customerID, status: true, isDeleted: false });
                res.status(responseCode_1.errorCode.SUCCESS).json({
                    status: true,
                    message: "Customer Profile Fetched Succesfully",
                    data: result,
                    totalPage: Math.ceil(totalData / limit) - 1
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
        else {
            const page = req.query.page || 1;
            const limit = 10;
            const skip = limit * (page - 1);
            PostModel_1.default.aggregate([
                {
                    $match: {
                        customerID: new mongoose_1.default.Types.ObjectId(customerID),
                        status: true,
                        isDeleted: false
                    }
                },
                {
                    $lookup: {
                        from: "customers",
                        localField: "customerID",
                        foreignField: "_id",
                        as: "customer",
                        pipeline: [
                            {
                                $project: {
                                    email: 1,
                                    image: 1,
                                    fristName: 1,
                                    lastName: 1
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
                    $lookup: {
                        from: "client-post-likes",
                        localField: "_id",
                        foreignField: "postID",
                        as: "likes"
                    }
                },
                {
                    $lookup: {
                        from: "client-post-comments",
                        localField: "postID",
                        foreignField: "postID",
                        as: "comments"
                    }
                },
                {
                    $lookup: {
                        from: "client-products",
                        localField: "products",
                        foreignField: "_id",
                        as: "product",
                        pipeline: [
                            {
                                $match: {
                                    isDeleted: false,
                                    status: true
                                }
                            },
                            {
                                $project: {
                                    _id: 1,
                                    productName: 1,
                                    productMedia: 1,
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
                        ]
                    }
                },
                {
                    $addFields: {
                        isLiked: {
                            $cond: {
                                if: {
                                    $eq: [
                                        { $indexOfArray: ["$likes.customerID", new mongoose_1.default.Types.ObjectId(customerID)] },
                                        -1
                                    ]
                                },
                                then: false,
                                else: true
                            }
                        },
                        like: {
                            $size: "$likes"
                        },
                        comment: {
                            $size: "$comments"
                        }
                    }
                },
                {
                    $project: {
                        clientID: 0,
                        customerID: 0,
                        products: 0,
                        likes: 0,
                        comments: 0,
                        isDeleted: 0,
                        __v: 0
                    }
                },
                { $skip: skip },
                { $limit: limit }
            ])
                .then(result => {
                res.status(responseCode_1.errorCode.SUCCESS).json({
                    status: true,
                    message: "Customer Post Fetched Succesfully",
                    data: result[0]
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
const updateProfile = (req, res) => {
    try {
        CustomerModel_1.default.findByIdAndUpdate(req.params.id, {
            $set: Object.assign(Object.assign({}, req.body), { updatedOn: new Date() })
        })
            .then(() => {
            res.status(responseCode_1.errorCode.SUCCESS).json({
                status: true,
                message: "Customer Profile Updated Succesfully"
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
const deleteCustomer = (req, res) => {
    var _a;
    try {
        CustomerModel_1.default.findOneAndUpdate({
            clientID: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
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
                    message: "Customer Deleted Succesfully"
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
    catch (error) {
        res.status(responseCode_1.errorCode.SERVER_ERROR).json({
            status: false,
            message: "Server Error..!",
            error
        });
    }
};
const getCustomers = (req, res) => {
    var _a;
    try {
        const page = req.query.page || 1;
        const limit = 10;
        const skip = limit * (page - 1);
        CustomerModel_1.default.aggregate([
            {
                $match: {
                    clientID: new mongoose_1.default.Types.ObjectId((_a = req.user) === null || _a === void 0 ? void 0 : _a._id),
                    isDeleted: false
                }
            },
            {
                $project: {
                    clientID: 0,
                    isDeleted: 0,
                    __v: 0
                }
            },
            { $skip: skip },
            { $limit: limit }
        ])
            .then((result) => __awaiter(void 0, void 0, void 0, function* () {
            var _b;
            const totalCustomer = yield CustomerModel_1.default.countDocuments({ clientID: (_b = req.user) === null || _b === void 0 ? void 0 : _b._id, isDeleted: false });
            res.status(responseCode_1.errorCode.SUCCESS).json({
                status: true,
                message: "Customer Fetched Succesfully",
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
const getCustomerPost = (req, res) => {
    var _a;
    try {
        const page = req.query.page || 1;
        console.log("pase", page);
        const limit = 10;
        const skip = (page - 1) * limit;
        PostModel_1.default.countDocuments({ clientID: (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a._id, customerID: req.params.id }).exec().then((count) => {
            var _a;
            PostModel_1.default.aggregate([
                {
                    $match: {
                        clientID: new mongoose_1.default.Types.ObjectId((_a = req.user) === null || _a === void 0 ? void 0 : _a._id),
                        customerID: new mongoose_1.default.Types.ObjectId(req.params.id)
                    }
                },
                {
                    $lookup: {
                        from: "client-post-reports",
                        localField: "_id",
                        foreignField: "postID",
                        as: "reportList"
                    }
                },
                {
                    $addFields: {
                        reportsCount: { $size: "$reportList" }
                    }
                },
                {
                    $lookup: {
                        from: "client-post-comments",
                        localField: "_id",
                        foreignField: "postID",
                        as: "commentList"
                    }
                },
                {
                    $addFields: {
                        commentsCount: { $size: "$commentList" }
                    }
                },
                {
                    $lookup: {
                        from: "client-post-likes",
                        localField: "_id",
                        foreignField: "postID",
                        as: "likeList"
                    }
                },
                {
                    $addFields: {
                        likeCount: { $size: "$likeList" }
                    }
                },
                {
                    $lookup: {
                        from: "customers",
                        pipeline: [
                            {
                                $project: {
                                    email: 1,
                                    fristName: 1,
                                    lastName: 1,
                                    userImage: 1
                                }
                            }
                        ],
                        localField: "customerID",
                        foreignField: "_id",
                        as: "customerData"
                    }
                },
                {
                    $unwind: "$customerData"
                },
                {
                    $project: {
                        password: 0,
                        updatedOn: 0,
                        token: 0,
                        clientID: 0,
                        customerID: 0,
                        reportList: 0,
                        commentList: 0,
                        likeList: 0,
                        __v: 0
                    }
                },
                { $skip: skip },
                { $limit: limit }
            ]).then((data) => {
                return res.status(200).json({
                    status: true,
                    message: "Get data succesfully !",
                    totalPage: Math.ceil(count / limit),
                    data
                });
            }).catch((error) => {
                console.log(error);
                return res.status(301).json({
                    status: false,
                    message: "Server error ! Data not found !",
                    error
                });
            });
        })
            .catch((error) => {
            console.log(error);
            return res.status(301).json({
                status: false,
                message: "Server error ! Data not found !",
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
const getCustomerProduct = (req, res) => {
    var _a, _b;
    try {
        const page = req.query.page || 1;
        console.log("pase", page);
        const limit = 10;
        const skip = (page - 1) * limit;
        const match = {
            clientID: new mongoose_1.default.Types.ObjectId((_a = req.user) === null || _a === void 0 ? void 0 : _a._id),
            customerID: new mongoose_1.default.Types.ObjectId(req.params.id),
            isDeleted: false
        };
        const countMatch = { clientID: (_b = req.user) === null || _b === void 0 ? void 0 : _b._id, customerID: req.params.id, isDeleted: false };
        // const today = new Date()
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
const mywishList = (req, res) => {
    try {
        const customerID = req.header("X-User-Id");
        const today = new Date();
        const limit = 10;
        const page = req.query.page || 1;
        const skip = (page - 1) * limit;
        Wishlist_1.default.aggregate([
            {
                $match: {
                    customerID: new mongoose_1.default.Types.ObjectId(customerID)
                }
            },
            {
                $lookup: {
                    from: "client-products",
                    localField: "productID",
                    foreignField: "_id",
                    as: "product",
                    pipeline: [
                        {
                            $match: {
                                isDeleted: false,
                                status: true
                            }
                        },
                        {
                            $project: {
                                productName: 1,
                                productDesc: 1,
                                productMedia: 1,
                                price: {
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
                    ]
                }
            },
            {
                $unwind: "$product"
            },
            {
                $skip: skip
            },
            {
                $limit: limit
            },
            {
                $sort: { _id: -1 }
            }
        ])
            .then((result) => __awaiter(void 0, void 0, void 0, function* () {
            const totalData = yield Wishlist_1.default.countDocuments({ customerID: customerID });
            console.log(totalData);
            res.status(responseCode_1.errorCode.SUCCESS).json({
                status: true,
                message: "WishList Fetched Succesfully",
                data: result,
                totalPage: Math.ceil(totalData / limit)
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
const customerWalletHistory = (req, res) => {
    try {
        Wallet_1.default.aggregate([
            {
                $match: {
                    userID: new mongoose_1.default.Types.ObjectId(req.params.id),
                }
            },
            {
                $lookup: {
                    from: "transactions",
                    localField: "userID",
                    foreignField: "userID",
                    as: "refferal-transaction",
                    pipeline: [
                        {
                            $match: {
                                tag: "Affiliate"
                            }
                        },
                        {
                            $sort: { _id: -1 }
                        }
                    ]
                }
            }
        ])
            .then((result) => __awaiter(void 0, void 0, void 0, function* () {
            res.status(responseCode_1.errorCode.SUCCESS).json({
                status: true,
                message: "Customer wallet Fetched Succesfully",
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
const CustomerController = {
    addCustomer,
    mywishList,
    getCustomers,
    deleteCustomer,
    updateCustomer,
    getProfile,
    updateProfile,
    getCustomerPost,
    customerWalletHistory,
    getCustomerProduct
};
exports.default = CustomerController;
