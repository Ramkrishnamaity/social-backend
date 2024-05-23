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
exports.deleteCategory = exports.viewAllCategory = exports.updateCategory = exports.viewCategory = exports.create = void 0;
const CategoryModel_1 = __importDefault(require("./../../Model/CategoryModel"));
const mongoose_1 = __importDefault(require("mongoose"));
const ClientCategory_1 = __importDefault(require("../../Model/Client/ClientCategory"));
const create = (req, res) => {
    const dataSet = new CategoryModel_1.default(Object.assign({}, req.body));
    dataSet.save().then((data) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        yield data.linkUser((_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id) !== null && _b !== void 0 ? _b : "");
        res.status(200).json({
            status: true,
            massage: "Category added succesfully !",
            data: {
                name: data.name,
                description: data.description
            }
        });
    })).catch((error) => {
        return res.status(301).json({
            status: false,
            error,
            massage: "Server error. Please try again."
        });
    });
};
exports.create = create;
const viewCategory = (req, res) => {
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
            CategoryModel_1.default.countDocuments({
                _id: {
                    $in: data.categories
                },
                status: true,
                isDeleted: false
            })
                .exec()
                .then((count) => {
                CategoryModel_1.default.aggregate([
                    {
                        $match: {
                            _id: {
                                $in: data.categories
                            },
                            status: true,
                            isDeleted: false
                        }
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
                            foreignField: "categoryID",
                            as: "categoryData"
                        }
                    },
                    {
                        $addFields: {
                            productCount: { $size: "$categoryData" }
                        }
                    },
                    {
                        $project: {
                            password: 0,
                            secretKey: 0,
                            updatedOn: 0,
                            modifiedOn: 0,
                            isDeleted: 0,
                            __v: 0,
                            categoryData: 0,
                            image: 0
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
            }).catch((error) => {
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
exports.viewCategory = viewCategory;
const viewAllCategory = (req, res) => {
    CategoryModel_1.default.aggregate([
        {
            $match: {
                isDeleted: false
            }
        },
        {
            $project: {
                name: 1
            }
        },
        {
            $sort: {
                createdOn: -1
            }
        }
    ]).then((data) => {
        return res.status(200).json({
            status: true,
            massage: "Get data succesfully !",
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
};
exports.viewAllCategory = viewAllCategory;
const updateCategory = (req, res) => {
    CategoryModel_1.default.findOneAndUpdate({
        _id: new mongoose_1.default.Types.ObjectId(req.params.id)
    }, {
        $set: Object.assign({}, req.body)
    }).then(() => {
        return res.status(200).json({
            status: true,
            massage: "Update category data succesfully !"
        });
    }).catch((error) => {
        return res.status(301).json({
            status: false,
            massage: "Server error ! Data not found !",
            error
        });
    });
};
exports.updateCategory = updateCategory;
const deleteCategory = (req, res) => {
    CategoryModel_1.default.findOneAndUpdate({
        _id: new mongoose_1.default.Types.ObjectId(req.params.id)
    }, {
        $set: {
            isDeleted: true
        }
    }).then((data) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        if (data !== null)
            yield data.unLinkUser((_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id) !== null && _b !== void 0 ? _b : "");
        return res.status(200).json({
            status: true,
            massage: "Category Deleted Succesfully !"
        });
    })).catch((error) => {
        return res.status(301).json({
            status: false,
            massage: "Server error ! Data not found !",
            error
        });
    });
};
exports.deleteCategory = deleteCategory;
