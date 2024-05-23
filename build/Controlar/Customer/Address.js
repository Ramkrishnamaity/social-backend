"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Address_1 = __importDefault(require("../../Model/Customer/Address"));
const responseCode_1 = require("../../lib/service/responseCode");
const mongoose_1 = __importDefault(require("mongoose"));
const getAddress = (req, res) => {
    try {
        Address_1.default.aggregate([
            {
                $match: {
                    customerID: new mongoose_1.default.Types.ObjectId(req.params.id)
                }
            },
            {
                $project: {
                    customerID: 0,
                    __v: 0
                }
            }
        ])
            .then(result => {
            res.status(responseCode_1.errorCode.SUCCESS).json({
                status: true,
                message: "Address Data fetched Successfully",
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
const addAddress = (req, res) => {
    try {
        const address = new Address_1.default(Object.assign({}, req.body));
        address.save()
            .then(() => {
            res.status(responseCode_1.errorCode.SUCCESS).json({
                status: true,
                message: "Address Added Successfully"
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
const updateAddress = (req, res) => {
    try {
        Address_1.default.findByIdAndUpdate(req.params.id, {
            $set: Object.assign({}, req.body)
        })
            .then(result => {
            if (result) {
                res.status(responseCode_1.errorCode.SUCCESS).json({
                    status: true,
                    message: "Address Updated Successfully"
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
const removeAddress = (req, res) => {
    try {
        Address_1.default.findByIdAndDelete(req.params.id)
            .then(result => {
            if (result) {
                res.status(responseCode_1.errorCode.SUCCESS).json({
                    status: true,
                    message: "Address Deleted Successfully"
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
const AddressController = {
    getAddress,
    addAddress,
    updateAddress,
    removeAddress
};
exports.default = AddressController;
