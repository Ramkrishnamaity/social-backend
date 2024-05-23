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
const ClientModel_1 = __importDefault(require("../../Model/Client/ClientModel"));
const responseCode_1 = require("../../lib/service/responseCode");
const Order_1 = __importDefault(require("../../Model/Customer/Order"));
const Wallet_1 = __importDefault(require("../../Model/Common/Wallet"));
const getSecretKey = (req, res) => {
    var _a;
    try {
        ClientModel_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id)
            .then(result => {
            if (result) {
                res.status(responseCode_1.errorCode.SUCCESS).json({
                    status: true,
                    message: "Secret Key Fetched Succesfully.",
                    data: result.secretKey
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
const customerWallet = (req, res) => {
    try {
        Wallet_1.default.findOne({
            userID: req.params.id
        })
            .then((result) => __awaiter(void 0, void 0, void 0, function* () {
            if (!result) {
                res.status(responseCode_1.errorCode.NOT_FOUND_ERROR).json({
                    status: false,
                    message: "Invalid Data..!"
                });
            }
            else {
                if (req.body.isAdd) {
                    yield result.credit(req.body.amount, "Add Balance", req.body.transactionID);
                }
                else {
                    yield result.debit(req.body.amount, "Withdraw Balance", req.body.transactionID);
                }
                res.status(responseCode_1.errorCode.SUCCESS).json({
                    status: true,
                    message: "Transaction Added..!"
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
const confirmStatus = (req, res) => {
    try {
        Order_1.default.findById(req.params.id)
            .then((result) => __awaiter(void 0, void 0, void 0, function* () {
            if (!result) {
                res.status(responseCode_1.errorCode.NOT_FOUND_ERROR).json({
                    status: false,
                    message: "Invalid Data..!"
                });
            }
            else {
                yield result.changeStatus("Confirmed", false);
                res.status(responseCode_1.errorCode.SUCCESS).json({
                    status: true,
                    message: "Order Confirmed."
                });
            }
        }))
            .catch(error => {
            res.status(responseCode_1.errorCode.NOT_FOUND_ERROR).json({
                status: false,
                message: "Invalid Data..!",
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
const ClientController = {
    getSecretKey,
    customerWallet,
    confirmStatus
};
exports.default = ClientController;
