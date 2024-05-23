"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeStatus = exports.getCustomr = void 0;
const CustomerModel_1 = __importDefault(require("../../Model/Customer/CustomerModel"));
const mongoose_1 = __importDefault(require("mongoose"));
const getCustomr = (req, res) => {
    var _a, _b;
    const page = (_a = parseInt(req.params.page)) !== null && _a !== void 0 ? _a : 1;
    console.log("pase", page);
    const limit = 10;
    const skip = (page - 1) * limit;
    CustomerModel_1.default.countDocuments({ clientID: new mongoose_1.default.Types.ObjectId((_b = req === null || req === void 0 ? void 0 : req.user) === null || _b === void 0 ? void 0 : _b._id) }).exec().then((count) => {
        var _a;
        CustomerModel_1.default.aggregate([
            {
                $match: {
                    clientID: new mongoose_1.default.Types.ObjectId((_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a._id)
                }
            },
            {
                $project: {
                    password: 0,
                    secretKey: 0,
                    updatedOn: 0,
                    token: 0,
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
exports.getCustomr = getCustomr;
const changeStatus = (req, res) => {
    CustomerModel_1.default.findOneAndUpdate({
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
exports.changeStatus = changeStatus;
