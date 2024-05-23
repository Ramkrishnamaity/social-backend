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
const PostModel_1 = __importDefault(require("../../Model/Customer/PostModel"));
const mongoose_1 = __importDefault(require("mongoose"));
const PostLikeModel_1 = __importDefault(require("../../Model/PostLikeModel"));
const PostCommentModel_1 = __importDefault(require("../../Model/PostCommentModel"));
const PostReportModel_1 = __importDefault(require("../../Model/PostReportModel"));
// import WalletModel from "../../Model/Common/Wallet"
const PostShare_1 = __importDefault(require("../../Model/Customer/PostShare"));
const createPost = (req, res) => {
    var _a;
    try {
        const post = new PostModel_1.default(Object.assign(Object.assign({}, req.body), { clientID: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id }));
        post.save()
            .then(() => {
            res.status(responseCode_1.errorCode.SUCCESS).json({
                status: true,
                message: "Post Created Successfully."
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
const updatePost = (req, res) => {
    try {
        PostModel_1.default.findOneAndUpdate({
            _id: req.params.id
        }, {
            $set: Object.assign(Object.assign({}, req.body), { updatedOn: new Date() })
        })
            .then(result => {
            if (result) {
                res.status(responseCode_1.errorCode.SUCCESS).json({
                    status: true,
                    message: "Post Created Successfully."
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
const deletePost = (req, res) => {
    try {
        PostModel_1.default.findByIdAndUpdate({
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
                    message: "Post Deleted Successfully."
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
const getPosts = (req, res) => {
    var _a;
    try {
        const customerID = req.header("X-User-Id");
        const page = req.query.page || 1;
        const limit = 10;
        const today = new Date();
        const skip = limit * (page - 1);
        PostModel_1.default.aggregate([
            {
                $match: {
                    clientID: new mongoose_1.default.Types.ObjectId((_a = req.user) === null || _a === void 0 ? void 0 : _a._id),
                    status: true,
                    isDeleted: false,
                    visibility: "public"
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
                    localField: "_id",
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
            { $limit: limit },
            {
                $sort: { _id: -1 }
            }
        ])
            .then((result) => __awaiter(void 0, void 0, void 0, function* () {
            var _b;
            const totalCustomer = yield PostModel_1.default.countDocuments({
                clientID: (_b = req.user) === null || _b === void 0 ? void 0 : _b._id,
                visibility: "public", status: true, isDeleted: false
            });
            res.status(responseCode_1.errorCode.SUCCESS).json({
                status: true,
                message: "Post Data Fetched Succesfully",
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
const getSearchPosts = (req, res) => {
    var _a;
    try {
        const customerID = req.header("X-User-Id");
        const searchParameter = req.query.value;
        console.log(searchParameter);
        const today = new Date();
        PostModel_1.default.aggregate([
            {
                $match: {
                    clientID: new mongoose_1.default.Types.ObjectId((_a = req.user) === null || _a === void 0 ? void 0 : _a._id),
                    status: true,
                    isDeleted: false,
                    visibility: "public"
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
                $match: {
                    $or: [
                        { "customer.fristName": { $regex: new RegExp(searchParameter, "gi") } },
                        { "customer.lastName": { $regex: new RegExp(searchParameter, "gi") } },
                        { postTitle: { $regex: new RegExp(searchParameter, "gi") } }
                    ]
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
                    localField: "_id",
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
                $sort: { _id: -1 }
            }
        ])
            .then((result) => __awaiter(void 0, void 0, void 0, function* () {
            res.status(responseCode_1.errorCode.SUCCESS).json({
                status: true,
                message: "Post Data Fetched Succesfully",
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
const getComment = (req, res) => {
    try {
        const page = req.query.page || 1;
        const limit = 10;
        const skip = limit * (page - 1);
        PostCommentModel_1.default.aggregate([
            {
                $match: {
                    postID: new mongoose_1.default.Types.ObjectId(req.params.id),
                    status: true
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
                                _id: 1,
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
                    _id: 1,
                    customer: 1,
                    createdOn: 1,
                    comment: 1
                }
            },
            { $skip: skip },
            { $limit: limit },
            {
                $sort: { _id: -1 }
            }
        ])
            .then((result) => __awaiter(void 0, void 0, void 0, function* () {
            const totalData = yield PostCommentModel_1.default.countDocuments({ postID: req.params.id });
            res.status(responseCode_1.errorCode.SUCCESS).json({
                status: true,
                message: "Comment Data Fetched Succesfully",
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
const getSinglePost = (req, res) => {
    try {
        const { id } = req.params;
        const today = new Date();
        const customerID = req.header("X-User-Id");
        PostModel_1.default.aggregate([
            {
                $match: {
                    _id: new mongoose_1.default.Types.ObjectId(id)
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
                    localField: "_id",
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
                    },
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
            }
        ])
            .then((result) => __awaiter(void 0, void 0, void 0, function* () {
            res.status(responseCode_1.errorCode.SUCCESS).json({
                status: true,
                message: "Post Data Fetched Succesfully",
                data: result[0]
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
const likePost = (req, res) => {
    try {
        if (req.body.like) {
            const likeDoc = new PostLikeModel_1.default({ customerID: req.body.customerID, postID: req.params.id });
            likeDoc.save()
                .then(() => {
                res.status(responseCode_1.errorCode.SUCCESS).json({
                    status: true,
                    message: "Post Liked Successfully."
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
            PostLikeModel_1.default.findOneAndDelete({
                customerID: req.body.customerID,
                postID: req.params.id
            })
                .then(result => {
                if (result) {
                    res.status(responseCode_1.errorCode.SUCCESS).json({
                        status: true,
                        message: "Post Like Removed Successfully."
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
const addComment = (req, res) => {
    try {
        const comment = new PostCommentModel_1.default(Object.assign({}, req.body));
        comment.save()
            .then(() => {
            res.status(responseCode_1.errorCode.SUCCESS).json({
                status: true,
                message: "Comment Added Successfully."
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
const updateComment = (req, res) => {
    try {
        PostCommentModel_1.default.findByIdAndUpdate(req.params.id, {
            $set: Object.assign({}, req.body)
        })
            .then((result) => {
            if (result) {
                res.status(responseCode_1.errorCode.SUCCESS).json({
                    status: true,
                    message: "Comment Updated Successfully."
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
const deleteComment = (req, res) => {
    try {
        PostCommentModel_1.default.findByIdAndDelete(req.params.id)
            .then(result => {
            if (result) {
                res.status(responseCode_1.errorCode.SUCCESS).json({
                    status: true,
                    message: "Comment Deleted Successfully."
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
const addReport = (req, res) => {
    try {
        const report = new PostReportModel_1.default(Object.assign({}, req.body));
        report.save()
            .then(result => {
            if (result) {
                res.status(responseCode_1.errorCode.SUCCESS).json({
                    status: true,
                    message: "Report Addded Successfully."
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
const doShare = (req, res) => {
    try {
        const { postID, userID } = req.params;
        const referedUserID = req.header("X-User-Id");
        if (referedUserID === userID.toString()) {
            res.status(responseCode_1.errorCode.SUCCESS).json({
                status: true,
                message: "Same user use link.."
            });
        }
        else {
            PostShare_1.default.aggregate([
                {
                    $match: {
                        postID: new mongoose_1.default.Types.ObjectId(postID),
                        $or: [
                            {
                                reffererID: new mongoose_1.default.Types.ObjectId(userID)
                            },
                            {
                                $expr: {
                                    $in: [new mongoose_1.default.Types.ObjectId(userID), "$refferedUserID"]
                                }
                            },
                            {
                                $expr: {
                                    $in: [new mongoose_1.default.Types.ObjectId(referedUserID), "$refferedUserID"]
                                }
                            }
                        ]
                    }
                },
                {
                    $lookup: {
                        from: "client-posts",
                        foreignField: "_id",
                        localField: "postID",
                        as: "post",
                        pipeline: [
                            {
                                $project: {
                                    customerID: 1
                                }
                            }
                        ]
                    }
                },
                {
                    $unwind: "$post"
                },
                {
                    $sort: { _id: -1 }
                }
            ])
                .then((result) => __awaiter(void 0, void 0, void 0, function* () {
                if (result.length !== 0) {
                    if (result[0].post.customerID === userID || result[0].post.customerID === referedUserID) {
                        res.status(responseCode_1.errorCode.SUCCESS).json({
                            status: true,
                            message: "Chain not Created."
                        });
                    }
                    else {
                        if (result[result.length - 1].refferedUserID.some((id) => id.equals(referedUserID))) {
                            res.status(responseCode_1.errorCode.SUCCESS).json({
                                status: true,
                                message: "Already Reffered..!"
                            });
                        }
                        else {
                            const index = result[0].refferedUserID.findIndex((id) => id.equals(userID));
                            if (index !== -1) {
                                if (referedUserID !== result[0].reffererID) {
                                    if (index === result[0].refferedUserID.length - 1) {
                                        result[0].refferedUserID.push(new mongoose_1.default.Types.ObjectId(referedUserID));
                                        yield PostShare_1.default.findByIdAndUpdate(result[0]._id, {
                                            $set: {
                                                refferedUserID: result[0].refferedUserID
                                            }
                                        });
                                        res.status(responseCode_1.errorCode.SUCCESS).json({
                                            status: true,
                                            message: "Chain Updated Successfully."
                                        });
                                    }
                                    else {
                                        const updatedRefferedUserID = result[0].refferedUserID.slice(0, index + 1);
                                        updatedRefferedUserID.push(new mongoose_1.default.Types.ObjectId(referedUserID));
                                        yield PostShare_1.default.create({
                                            postID: result[0].postID,
                                            reffererID: result[0].reffererID,
                                            refferedUserID: updatedRefferedUserID
                                        });
                                        res.status(responseCode_1.errorCode.SUCCESS).json({
                                            status: true,
                                            message: "Chain Created Successfully."
                                        });
                                    }
                                }
                                else {
                                    res.status(responseCode_1.errorCode.SUCCESS).json({
                                        status: true,
                                        message: "Already Reffered..!"
                                    });
                                }
                            }
                            else {
                                console.log("Case ---");
                                yield PostShare_1.default.create({
                                    postID: result[0].postID,
                                    reffererID: result[0].reffererID,
                                    refferedUserID: [referedUserID]
                                });
                                res.status(responseCode_1.errorCode.SUCCESS).json({
                                    status: true,
                                    message: "Chain Created Successfully."
                                });
                            }
                        }
                    }
                }
                else {
                    const postshare = new PostShare_1.default({ postID, reffererID: userID, refferedUserID: [referedUserID] });
                    postshare.save()
                        .then(() => {
                        res.status(responseCode_1.errorCode.SUCCESS).json({
                            status: true,
                            message: "Chain Created Successfully."
                        });
                    })
                        .catch(error => {
                        res.status(responseCode_1.errorCode.SERVER_ERROR).json({
                            status: false,
                            message: "Chain Created Successfully.",
                            error
                        });
                    });
                }
            }))
                .catch(error => {
                console.log(error);
                res.status(responseCode_1.errorCode.SERVER_ERROR).json({
                    status: false,
                    message: "Server Error..!",
                    error
                });
            });
        }
    }
    catch (error) {
        console.log("error", error);
        res.status(responseCode_1.errorCode.SERVER_ERROR).json({
            status: false,
            message: "Server Error..!",
            error
        });
    }
};
const PostController = {
    createPost,
    updatePost,
    deletePost,
    getPosts,
    getSearchPosts,
    likePost,
    getComment,
    addComment,
    updateComment,
    deleteComment,
    addReport,
    doShare,
    getSinglePost
};
exports.default = PostController;
