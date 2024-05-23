"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeStatus = exports.getClient = void 0;
const ClientModel_1 = __importDefault(require("../../Model/Client/ClientModel"));
const mongoose_1 = __importDefault(require("mongoose"));
const getClient = (req, res) => {
    const page = 1;
    console.log("pase", page);
    const limit = 10;
    const skip = (page - 1) * limit;
    ClientModel_1.default.countDocuments({ isDeleted: false }).exec().then((count) => {
        // const count = (await CustomerModel.find({ clientID: new mongoose.Types.ObjectId(req?.user?._id) }).exec()).length
        // console.log(cou)
        ClientModel_1.default.aggregate([
            {
                $match: {
                    isDeleted: false
                }
            },
            {
                $project: {
                    password: 0,
                    secretKey: 0,
                    // createdOn: 0,
                    updatedOn: 0,
                    token: 0,
                    __v: 0
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
};
exports.getClient = getClient;
const changeStatus = (req, res) => {
    ClientModel_1.default.findOneAndUpdate({
        _id: new mongoose_1.default.Types.ObjectId(req.params.id)
    }, {
        $set: {
            status: req.body.status
        }
    }).then(() => {
        res.status(200).json({
            status: true,
            massage: "Update client status succesfully !"
        });
    }).catch((error) => {
        res.status(301).json({
            status: false,
            massage: "Server error ! Data not found !",
            error
        });
    });
};
exports.changeStatus = changeStatus;
