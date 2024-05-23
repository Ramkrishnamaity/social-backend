"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = __importStar(require("jsonwebtoken"));
const responseCode_1 = require("./responseCode");
const ClientModel_1 = __importDefault(require("../../Model/Client/ClientModel"));
const middleware = (req, res, next) => {
    if (typeof (req.headers.authorization) === "undefined") {
        res
            .status(200)
            .json({
            error: "No credentials sent!",
            status: false,
            credentials: false
        });
    }
    else {
        const authorization = req.headers.authorization;
        const userType = typeof req.headers.usertype !== "undefined" ? req.headers.usertype : "User";
        if (userType === "client") {
            const decode = jwt.decode(authorization);
            if (typeof (decode) !== "undefined" && decode !== null) {
                req.user = { _id: decode === null || decode === void 0 ? void 0 : decode._id };
                next();
            }
            else {
                res
                    .status(401)
                    .json({
                    error: "credentials not match",
                    status: false,
                    credentials: false
                });
            }
        }
        else if (userType === "admin") {
            const decode = jwt.decode(authorization);
            if (typeof (decode) !== "undefined" && decode !== null) {
                req.user = { _id: decode === null || decode === void 0 ? void 0 : decode._id };
                next();
            }
            else {
                res
                    .status(401)
                    .json({
                    error: "credentials not match",
                    status: false,
                    credentials: false
                });
            }
        }
        else {
            res
                .status(401)
                .json({
                error: "credentials not match",
                status: false,
                credentials: false
            });
        }
    }
};
const CustomerMiddleware = (req, res, next) => {
    try {
        if (!req.header("X-API-KEY")) {
            res.status(responseCode_1.errorCode.AUTH_ERROR).json({
                status: false,
                message: "Credentials Not Found..!"
            });
        }
        else {
            ClientModel_1.default.findOne({ apiKey: req.header("X-API-KEY") })
                .then(result => {
                if (!result) {
                    res.status(responseCode_1.errorCode.NOT_FOUND_ERROR).json({
                        status: false,
                        message: "Invalid Api Key..!"
                    });
                }
                else {
                    req.user = { _id: result._id.toString() };
                    next();
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
const CheckSecret = (req, res, next) => {
    try {
        if (!req.header("X-SECRET-KEY")) {
            res.status(responseCode_1.errorCode.AUTH_ERROR).json({
                status: false,
                message: "No Credential Sent..!"
            });
        }
        else {
            ClientModel_1.default.findOne({
                secretKey: req.header("X-SECRET-KEY")
            })
                .then(result => {
                if (!result) {
                    res.status(responseCode_1.errorCode.NOT_FOUND_ERROR).json({
                        status: false,
                        message: "Invalid Secret Key..!"
                    });
                }
                else {
                    req.user = { _id: result._id.toString() };
                    next();
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
const authZ = {
    middleware,
    CustomerMiddleware,
    CheckSecret
};
exports.default = authZ;
