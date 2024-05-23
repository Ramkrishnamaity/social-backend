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
exports.viewCatSubCat = exports.deleteSubCategory = exports.updateSubCategory = exports.viewSubCategory = exports.createSubCategory = void 0;
const SubCategoryModel_1 = __importDefault(require("./../../Model/SubCategoryModel"));
const mongoose_1 = __importDefault(require("mongoose"));
const ClientCategory_1 = __importDefault(require("../../Model/Client/ClientCategory"));
const responseCode_1 = require("../../lib/service/responseCode");
const createSubCategory = (req, res) => {
    const dataSet = new SubCategoryModel_1.default(Object.assign({}, req.body));
    dataSet.save().then((data) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        yield data.linkUser((_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id) !== null && _b !== void 0 ? _b : "");
        res.status(200).json({
            status: true,
            massage: "Sub category added succesfully !",
            data: {
                name: data.name,
                description: data.description,
                image: data.image
            }
        });
    })).catch((error) => {
        res.status(301).json({
            status: false,
            error,
            massage: "Server error. Please try again."
        });
    });
};
exports.createSubCategory = createSubCategory;
const viewSubCategory = (req, res) => {
    var _a;
    const page = 1;
    console.log("pase", page);
    const limit = 10;
    const skip = (page - 1) * limit;
    ClientCategory_1.default.findOne({
        userID: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id
    })
        .then(data => {
        if (data === null) {
            res.status(200).json({
                status: true,
                massage: "Get data succesfully !",
                dataLimit: 0,
                data: []
            });
        }
        else {
            SubCategoryModel_1.default.countDocuments({
                _id: {
                    $in: data.subcategories
                },
                status: true,
                isDeleted: false
            }).exec().then((count) => {
                SubCategoryModel_1.default.aggregate([
                    {
                        $match: {
                            _id: {
                                $in: data.subcategories
                            },
                            status: true,
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
                            from: "client-products",
                            pipeline: [
                                {
                                    $match: {
                                        isDeleted: false,
                                        status: true
                                    }
                                }
                            ],
                            localField: "_id",
                            foreignField: "subcategoryID",
                            as: "productList"
                        }
                    },
                    {
                        $addFields: {
                            productCount: { $size: "$productList" }
                        }
                    },
                    {
                        $project: {
                            password: 0,
                            secretKey: 0,
                            // createdOn: 0,
                            updatedOn: 0,
                            modifiedOn: 0,
                            isDeleted: 0,
                            categoryID: 0,
                            __v: 0,
                            productList: 0
                        }
                    },
                    { $skip: skip },
                    { $limit: limit },
                    {
                        $sort: {
                            createdOn: -1
                        }
                    }
                ]).then((data) => {
                    res.status(200).json({
                        status: true,
                        massage: "Get data succesfully !",
                        dataLimit: count,
                        data
                    });
                }).catch((error) => {
                    console.log(error);
                    res.status(301).json({
                        status: false,
                        massage: "Server error ! Data not found !",
                        error
                    });
                });
            })
                .catch((error) => {
                console.log(error);
                res.status(301).json({
                    status: false,
                    massage: "Server error ! Data not found !",
                    error
                });
            });
        }
    })
        .catch((error) => {
        console.log(error);
        res.status(301).json({
            status: false,
            massage: "Server error ! Data not found !",
            error
        });
    });
};
exports.viewSubCategory = viewSubCategory;
const viewCatSubCat = (req, res) => {
    try {
        SubCategoryModel_1.default.aggregate([
            {
                $match: {
                    categoryID: new mongoose_1.default.Types.ObjectId(req.params.id),
                    status: true,
                    isDeleted: false
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1
                }
            },
            {
                $sort: { _id: -1 }
            }
        ])
            .then(result => {
            res.status(responseCode_1.errorCode.SUCCESS).json({
                status: true,
                massage: "sub category fetched succesfully !",
                data: result
            });
        })
            .catch(error => {
            res.status(responseCode_1.errorCode.SERVER_ERROR).json({
                status: false,
                massage: "Server error ! Data not found !",
                error
            });
        });
    }
    catch (error) {
        res.status(responseCode_1.errorCode.SERVER_ERROR).json({
            status: false,
            massage: "Server error ! Data not found !",
            error
        });
    }
};
exports.viewCatSubCat = viewCatSubCat;
const updateSubCategory = (req, res) => {
    SubCategoryModel_1.default.findOneAndUpdate({
        _id: new mongoose_1.default.Types.ObjectId(req.params.id)
    }, {
        $set: Object.assign({}, req.body)
    }).then(() => {
        res.status(200).json({
            status: true,
            massage: "Update sub category data succesfully !"
        });
    }).catch((error) => {
        res.status(301).json({
            status: false,
            massage: "Server error ! Data not found !",
            error
        });
    });
};
exports.updateSubCategory = updateSubCategory;
const deleteSubCategory = (req, res) => {
    SubCategoryModel_1.default.findOneAndUpdate({
        _id: new mongoose_1.default.Types.ObjectId(req.params.id)
    }, {
        $set: {
            isDeleted: true
        }
    }).then((data) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        yield (data === null || data === void 0 ? void 0 : data.linkUser((_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id) !== null && _b !== void 0 ? _b : ""));
        res.status(200).json({
            status: true,
            massage: "sub category Deleted succesfully !"
        });
    })).catch((error) => {
        res.status(301).json({
            status: false,
            massage: "Server error ! Data not found !",
            error
        });
    });
};
exports.deleteSubCategory = deleteSubCategory;
