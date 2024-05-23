"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.viewPersentage = exports.updateAffititedPersentage = void 0;
const ClientAftlitePersentage_1 = __importDefault(require("../../Model/ClientAftlitePersentage"));
const mongoose_1 = __importDefault(require("mongoose"));
const updateAffititedPersentage = (req, res) => {
    var _a;
    ClientAftlitePersentage_1.default.findOneAndUpdate({
        clientID: new mongoose_1.default.Types.ObjectId((_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a._id)
    }, {
        $set: Object.assign({}, req.body)
    }).then(() => {
        return res.status(200).json({
            status: true,
            massage: "Update afflited persentage data succesfully !"
        });
    }).catch((error) => {
        return res.status(301).json({
            status: false,
            massage: "Server error ! Data not found !",
            error
        });
    });
};
exports.updateAffititedPersentage = updateAffititedPersentage;
const viewPersentage = (req, res) => {
    var _a, _b;
    console.log((_a = req.user) === null || _a === void 0 ? void 0 : _a._id);
    ClientAftlitePersentage_1.default.aggregate([
        {
            $match: {
                clientID: new mongoose_1.default.Types.ObjectId((_b = req.user) === null || _b === void 0 ? void 0 : _b._id)
            }
        },
        {
            $project: {
                ownPersentage: 1,
                affiliatedPersentage: 1
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
            // dataLimit: count,
            data: data[0]
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
exports.viewPersentage = viewPersentage;
