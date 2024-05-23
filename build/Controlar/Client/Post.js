"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeProductStatus = exports.getAllProduct = exports.getUserProduct = exports.getReportPost = exports.getPostReport = exports.deletePostComment = exports.changeCommentStatus = exports.getPostLike = exports.changePostStatus = exports.getPostComment = exports.getPost = void 0;
const PostModel_1 = __importDefault(require("../../Model/Customer/PostModel"));
const mongoose_1 = __importDefault(require("mongoose"));
const PostCommentModel_1 = __importDefault(require("../../Model/PostCommentModel"));
const PostProduct_1 = __importDefault(require("../../Model/PostProduct"));
const PostLikeModel_1 = __importDefault(require("../../Model/PostLikeModel"));
const PostReportModel_1 = __importDefault(require("../../Model/PostReportModel"));
// import { CustomerUpdate } from '../../lib/DataSet/CustomerAuth';
const getPost = (req, res) => {
    var _a, _b;
    const page = (_a = parseInt(req.params.page)) !== null && _a !== void 0 ? _a : 1;
    console.log("pase", page);
    const limit = 10;
    const skip = (page - 1) * limit;
    PostModel_1.default.countDocuments({ clientID: new mongoose_1.default.Types.ObjectId((_b = req === null || req === void 0 ? void 0 : req.user) === null || _b === void 0 ? void 0 : _b._id) }).exec().then((count) => {
        var _a;
        PostModel_1.default.aggregate([
            {
                $match: {
                    clientID: new mongoose_1.default.Types.ObjectId((_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a._id)
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
                                image: 1
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
                massage: "Get data succesfully !",
                dataLimit: count,
                data
            });
        }).catch((error) => {
            console.log("Error", error);
            return res.status(301).json({
                status: false,
                massage: "Server error ! Data not found !",
                error
            });
        });
    })
        .catch((error) => {
        console.log(error);
        return res.status(301).json({
            status: false,
            massage: "Server error ! Data not found !",
            error
        });
    });
};
exports.getPost = getPost;
const getPostComment = (req, res) => {
    var _a, _b;
    const page = (_a = parseInt(req.params.page)) !== null && _a !== void 0 ? _a : 1;
    console.log("pase", page);
    const limit = 10;
    const skip = (page - 1) * limit;
    PostCommentModel_1.default.countDocuments({ postID: new mongoose_1.default.Types.ObjectId((_b = req === null || req === void 0 ? void 0 : req.params) === null || _b === void 0 ? void 0 : _b.postID) }).exec().then((count) => {
        var _a;
        PostCommentModel_1.default.aggregate([
            {
                $match: {
                    postID: new mongoose_1.default.Types.ObjectId((_a = req === null || req === void 0 ? void 0 : req.params) === null || _a === void 0 ? void 0 : _a.postID)
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
                                image: 1,
                                status: 1
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
                massage: "Get data succesfully !",
                dataLimit: count,
                data
            });
        }).catch((error) => {
            console.log(error);
            return res.status(301).json({
                status: false,
                massage: "Server error ! Data not found !",
                error
            });
        });
    })
        .catch((error) => {
        console.log(error);
        return res.status(301).json({
            status: false,
            massage: "Server error ! Data not found !",
            error
        });
    });
};
exports.getPostComment = getPostComment;
const changePostStatus = (req, res) => {
    PostModel_1.default.findOneAndUpdate({
        _id: new mongoose_1.default.Types.ObjectId(req.params.id)
    }, {
        $set: {
            status: req.body.status
        }
    }).then(() => {
        return res.status(200).json({
            status: true,
            massage: "Update customer status succesfully !"
        });
    }).catch((error) => {
        return res.status(301).json({
            status: false,
            massage: "Server error ! Data not found !",
            error
        });
    });
};
exports.changePostStatus = changePostStatus;
const getPostLike = (req, res) => {
    var _a, _b;
    const page = (_a = parseInt(req.params.page)) !== null && _a !== void 0 ? _a : 1;
    console.log("pase", page);
    const limit = 10;
    const skip = (page - 1) * limit;
    PostLikeModel_1.default.countDocuments({ postID: new mongoose_1.default.Types.ObjectId((_b = req === null || req === void 0 ? void 0 : req.params) === null || _b === void 0 ? void 0 : _b.postID) }).exec().then((count) => {
        var _a;
        PostLikeModel_1.default.aggregate([
            {
                $match: {
                    postID: new mongoose_1.default.Types.ObjectId((_a = req === null || req === void 0 ? void 0 : req.params) === null || _a === void 0 ? void 0 : _a.postID)
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
                                image: 1,
                                status: 1
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
                massage: "Get data succesfully !",
                dataLimit: count,
                data
            });
        }).catch((error) => {
            console.log(error);
            return res.status(301).json({
                status: false,
                massage: "Server error ! Data not found !",
                error
            });
        });
    })
        .catch((error) => {
        console.log(error);
        return res.status(301).json({
            status: false,
            massage: "Server error ! Data not found !",
            error
        });
    });
};
exports.getPostLike = getPostLike;
const changeCommentStatus = (req, res) => {
    PostCommentModel_1.default.findOneAndUpdate({
        _id: new mongoose_1.default.Types.ObjectId(req.params.id)
    }, {
        $set: {
            status: req.body.status
        }
    }).then(() => {
        return res.status(200).json({
            status: true,
            massage: "Update comment status succesfully !"
        });
    }).catch((error) => {
        return res.status(301).json({
            status: false,
            massage: "Server error ! Data not found !",
            error
        });
    });
};
exports.changeCommentStatus = changeCommentStatus;
const deletePostComment = (req, res) => {
    PostCommentModel_1.default.deleteOne({
        _id: new mongoose_1.default.Types.ObjectId(req.params.id)
    }).then(() => {
        return res.status(200).json({
            status: true,
            massage: "Deleted comment status succesfully !"
        });
    }).catch((error) => {
        return res.status(301).json({
            status: false,
            massage: "Server error ! Data not found !",
            error
        });
    });
};
exports.deletePostComment = deletePostComment;
const getPostReport = (req, res) => {
    var _a, _b;
    const page = (_a = parseInt(req.params.page)) !== null && _a !== void 0 ? _a : 1;
    console.log("pase", page);
    const limit = 10;
    const skip = (page - 1) * limit;
    PostReportModel_1.default.countDocuments({ postID: new mongoose_1.default.Types.ObjectId((_b = req === null || req === void 0 ? void 0 : req.params) === null || _b === void 0 ? void 0 : _b.postID) }).exec().then((count) => {
        var _a;
        PostReportModel_1.default.aggregate([
            {
                $match: {
                    postID: new mongoose_1.default.Types.ObjectId((_a = req === null || req === void 0 ? void 0 : req.params) === null || _a === void 0 ? void 0 : _a.postID)
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
                                image: 1,
                                status: 1
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
                massage: "Get data succesfully !",
                dataLimit: count,
                data
            });
        }).catch((error) => {
            console.log(error);
            return res.status(301).json({
                status: false,
                massage: "Server error ! Data not found !",
                error
            });
        });
    })
        .catch((error) => {
        console.log(error);
        return res.status(301).json({
            status: false,
            massage: "Server error ! Data not found !",
            error
        });
    });
};
exports.getPostReport = getPostReport;
const getReportPost = (req, res) => {
    var _a, _b;
    const page = (_a = parseInt(req.params.page)) !== null && _a !== void 0 ? _a : 1;
    console.log("pase", page);
    const limit = 10;
    const skip = (page - 1) * limit;
    PostModel_1.default.countDocuments({ clientID: new mongoose_1.default.Types.ObjectId((_b = req === null || req === void 0 ? void 0 : req.user) === null || _b === void 0 ? void 0 : _b._id) }).exec().then(() => {
        var _a;
        PostModel_1.default.aggregate([
            {
                $match: {
                    clientID: new mongoose_1.default.Types.ObjectId((_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a._id)
                }
            },
            {
                $lookup: {
                    from: "client-post-reports",
                    foreignField: "postID",
                    localField: "_id",
                    as: "reports"
                }
            },
            {
                $addFields: {
                    reportsCount: {
                        $size: "$reports"
                    }
                }
            },
            {
                $unwind: "$reports"
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
            // {
            // 	$lookup: {
            // 		from: "client-post-reports",
            // 		localField: "_id",
            // 		foreignField: "postID",
            // 		as: "reportList",
            // 		// pipeline: [
            // 		// 	{
            // 		// 		$lookup: {
            // 		// 			from: "customers",
            // 		// 			pipeline: [
            // 		// 				{
            // 		// 					$project: {
            // 		// 						email: 1,
            // 		// 						fristName: 1,
            // 		// 						lastName: 1,
            // 		// 						userImage: 1
            // 		// 					}
            // 		// 				}
            // 		// 			],
            // 		// 			localField: "customerID",
            // 		// 			foreignField: "_id",
            // 		// 			as: "reportedCustomerData"
            // 		// 		}
            // 		// 	},
            // 		// 	{
            // 		// 		$unwind: "$reportedCustomerData"
            // 		// 	},
            // 		// 	{
            // 		// 		$project: {
            // 		// 			title: 1,
            // 		// 			note: 1,
            // 		// 			customerID: 1
            // 		// 		}
            // 		// 	}
            // 		// ]
            // 	}
            // },
            // {
            // 	$unwind: "$reportList"
            // },
            {
                $lookup: {
                    from: "customers",
                    pipeline: [
                        {
                            $project: {
                                email: 1,
                                fristName: 1,
                                lastName: 1,
                                image: 1
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
                    likeList: 0,
                    reports: 0,
                    commentList: 0
                }
            },
            { $skip: skip },
            { $limit: limit }
        ]).then((data) => {
            return res.status(200).json({
                status: true,
                massage: "Get data succesfully !",
                dataLimit: data.length,
                data
            });
        }).catch((error) => {
            console.log(error);
            return res.status(301).json({
                status: false,
                massage: "Server error ! Data not found !",
                error
            });
        });
    })
        .catch((error) => {
        console.log(error);
        return res.status(301).json({
            status: false,
            massage: "Server error ! Data not found !",
            error
        });
    });
};
exports.getReportPost = getReportPost;
const getUserProduct = (req, res) => {
    var _a, _b;
    const page = (_a = parseInt(req.params.page)) !== null && _a !== void 0 ? _a : 1;
    console.log("pase", page);
    const limit = 10;
    const skip = (page - 1) * limit;
    PostProduct_1.default.countDocuments({ customerID: new mongoose_1.default.Types.ObjectId((_b = req === null || req === void 0 ? void 0 : req.params) === null || _b === void 0 ? void 0 : _b.id), isDeleted: false }).exec().then((count) => {
        var _a;
        PostProduct_1.default.aggregate([
            {
                $match: {
                    customerID: new mongoose_1.default.Types.ObjectId((_a = req === null || req === void 0 ? void 0 : req.params) === null || _a === void 0 ? void 0 : _a.id),
                    isDeleted: false
                }
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "categoryID",
                    foreignField: "_id",
                    as: "categoryData",
                    pipeline: [
                        {
                            $project: {
                                name: 1,
                                description: 1
                                // image: 1
                            }
                        }
                    ]
                }
            },
            {
                $unwind: "$categoryData"
            },
            {
                $lookup: {
                    from: "subcategories",
                    localField: "subCategoryID",
                    foreignField: "_id",
                    as: "subSategoryData",
                    pipeline: [
                        {
                            $project: {
                                name: 1,
                                description: 1
                                // image: 1
                            }
                        }
                    ]
                }
            },
            {
                $unwind: "$subSategoryData"
            },
            {
                $project: {
                    isDeleted: 0,
                    createdOn: 0,
                    modifiedOn: 0,
                    __v: 0
                }
            },
            { $skip: skip },
            { $limit: limit }
        ]).then((data) => {
            return res.status(200).json({
                status: true,
                massage: "Get data succesfully !",
                dataLimit: count,
                data
            });
        }).catch((error) => {
            console.log(error);
            return res.status(301).json({
                status: false,
                massage: "Server error ! Data not found !",
                error
            });
        });
    })
        .catch((error) => {
        console.log(error);
        return res.status(301).json({
            status: false,
            massage: "Server error ! Data not found !",
            error
        });
    });
};
exports.getUserProduct = getUserProduct;
const getAllProduct = (req, res) => {
    var _a;
    const page = (_a = parseInt(req.params.page)) !== null && _a !== void 0 ? _a : 1;
    console.log("pase", page);
    const limit = 10;
    const skip = (page - 1) * limit;
    PostProduct_1.default.countDocuments({ isDeleted: false }).exec().then((count) => {
        PostProduct_1.default.aggregate([
            {
                $match: {
                    isDeleted: false
                }
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "categoryID",
                    foreignField: "_id",
                    as: "categoryData",
                    pipeline: [
                        {
                            $project: {
                                name: 1,
                                description: 1
                                // image: 1
                            }
                        }
                    ]
                }
            },
            {
                $unwind: "$categoryData"
            },
            {
                $lookup: {
                    from: "customers",
                    localField: "customerID",
                    foreignField: "_id",
                    as: "customersData",
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
                $unwind: "$customersData"
            },
            {
                $lookup: {
                    from: "subcategories",
                    localField: "subCategoryID",
                    foreignField: "_id",
                    as: "subSategoryData",
                    pipeline: [
                        {
                            $project: {
                                name: 1,
                                description: 1
                                // image: 1
                            }
                        }
                    ]
                }
            },
            {
                $unwind: "$subSategoryData"
            },
            {
                $project: {
                    isDeleted: 0,
                    createdOn: 0,
                    modifiedOn: 0,
                    __v: 0
                }
            },
            { $skip: skip },
            { $limit: limit }
        ]).then((data) => {
            return res.status(200).json({
                status: true,
                massage: "Get data succesfully !",
                dataLimit: count,
                data
            });
        }).catch((error) => {
            console.log(error);
            return res.status(301).json({
                status: false,
                massage: "Server error ! Data not found !",
                error
            });
        });
    })
        .catch((error) => {
        console.log(error);
        return res.status(301).json({
            status: false,
            massage: "Server error ! Data not found !",
            error
        });
    });
};
exports.getAllProduct = getAllProduct;
const changeProductStatus = (req, res) => {
    PostProduct_1.default.findOneAndUpdate({
        _id: new mongoose_1.default.Types.ObjectId(req.params.id)
    }, {
        $set: {
            enableStatus: req.body.status
        }
    }).then(() => {
        return res.status(200).json({
            status: true,
            massage: "Update product status succesfully !"
        });
    }).catch((error) => {
        return res.status(301).json({
            status: false,
            massage: "Server error ! Data not found !",
            error
        });
    });
};
exports.changeProductStatus = changeProductStatus;
