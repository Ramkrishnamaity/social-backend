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
exports.updateProfile = exports.getApiKeys = exports.getProfile = exports.ClientSignup = exports.ClientLogin = void 0;
const ClientModel_1 = __importDefault(require("../../Model/Client/ClientModel"));
const AdminModel_1 = __importDefault(require("../../Model/AdminModel"));
const ClientAftlitePersentage_1 = __importDefault(require("../../Model/ClientAftlitePersentage"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const uuid_1 = require("uuid");
const responseCode_1 = require("../../lib/service/responseCode");
const Wallet_1 = __importDefault(require("../../Model/Common/Wallet"));
const Stripe_1 = __importDefault(require("../../lib/service/Stripe"));
// import StripeUtilityMethods from "../../lib/service/Stripe"
// const getTokenData = async (token: string) => {
//     let adminData = ClientModel.findOne({ token: token }).exec();
//     return adminData;
// };
function createToken(data) {
    return jsonwebtoken_1.default.sign(data, "admintoken");
}
// const ClientLogin = (req: Request<any, any, ClientAuth>, res: Response<Res<LoginRes>>): any => {
//     const { email, password } = req.body;
//     ClientModel.findOne({ email, status: true })
//         .then(async (data: any) => {
//             console.log("data", data)
//             if (data === null) {
//                 res.status(301).json({
//                     status: false,
//                     massage: 'Invalid Email ID'
//                 })
//             } else {
//                 const validPassword: boolean = await bcrypt.compare(password, data.password);
//                 if (!validPassword) {
//                     return res.status(401).json({
//                         status: false,
//                         massage: 'Invalid Password !'
//                     });
//                 } else {
//                     return res.status(200).json({
//                         status: true,
//                         massage: 'Login succesfully !',
//                         data: {
//                             token: data.token,
//                             userImage: data.userImage,
//                             fristName: data.fristName,
//                             lastName: data.lastName
//                         }
//                     });
//                 }
//             }
//         }).catch((error) => {
//             console.log("err", error)
//         })
// }
const ClientLogin = (req, res) => {
    const { email, password } = req.body;
    AdminModel_1.default.findOne({ email, status: true })
        .then((data) => __awaiter(void 0, void 0, void 0, function* () {
        console.log("data", data);
        if (data === null) {
            // res.status(301).json({
            //     status: false,
            //     massage: 'Invalid Email ID'
            // })
            ClientModel_1.default.findOne({ email, status: true })
                .then((data) => __awaiter(void 0, void 0, void 0, function* () {
                if (data === null) {
                    res.status(301).json({
                        status: false,
                        massage: "Invalid Email ID"
                    });
                }
                else {
                    const validPassword = yield bcrypt_1.default.compare(password, data.password);
                    if (!validPassword) {
                        return res.status(401).json({
                            status: false,
                            massage: "Invalid Password !"
                        });
                    }
                    else {
                        return res.cookie("token", data.token, { httpOnly: true }).status(200).json({
                            status: true,
                            massage: "Login succesfully !",
                            data: {
                                token: data.token,
                                type: "Client",
                                userImage: data.userImage,
                                fristName: data.fristName,
                                lastName: data.lastName
                            }
                        });
                    }
                }
            })).catch(() => {
                return res.status(301).json({
                    status: false,
                    massage: "Server Error !"
                });
            });
        }
        else {
            const validPassword = yield bcrypt_1.default.compare(password, data.password);
            if (!validPassword) {
                return res.status(401).json({
                    status: false,
                    massage: "Invalid Password !"
                });
            }
            else {
                return res.status(200).json({
                    status: true,
                    massage: "Login succesfully !",
                    data: {
                        token: data.token,
                        type: "Admin",
                        userImage: data.userImage,
                        fristName: data.fristName,
                        lastName: data.lastName
                    }
                });
            }
        }
    })).catch(() => {
        // console.log("err", error)
        return res.status(301).json({
            status: false,
            massage: "Server Error !"
        });
    });
};
exports.ClientLogin = ClientLogin;
const ClientSignup = (req, res) => {
    try {
        const _id = new mongoose_1.default.Types.ObjectId();
        const token = createToken({ _id, userType: "client" });
        const secretKey = (0, uuid_1.v4)();
        const apiKey = createToken({ secretKey: secretKey });
        bcrypt_1.default.hash(req.body.password, 10).then((password) => {
            const dataSet = new ClientModel_1.default(Object.assign(Object.assign({}, req.body), { userName: secretKey, _id, token, password, apiKey, secretKey }));
            dataSet.save()
                .then((data) => __awaiter(void 0, void 0, void 0, function* () {
                // console.log(data)
                const persentageDataset = {
                    clientID: _id
                };
                yield new ClientAftlitePersentage_1.default(persentageDataset).save();
                yield Wallet_1.default.create({ userID: _id });
                const customerID = yield Stripe_1.default.createCustomer(req.body.email, `${req.body.fristName} ${req.body.lastName}`);
                data.addCustomerID(customerID);
                res.status(200).json({
                    status: true,
                    massage: "client signup succesfully!",
                    data: {
                        token: data.token,
                        userImage: data.userImage,
                        fristName: data.fristName,
                        lastName: data.lastName
                    }
                });
            }))
                .catch((error) => {
                console.log(error);
                return res.status(500).json({
                    status: false,
                    error,
                    massage: error.message
                });
            });
        }).catch((error) => {
            return res.status(301).json({
                status: false,
                error,
                massage: "Server error. Please try again."
            });
        });
    }
    catch (error) {
        res.status(301).json({
            status: false,
            error,
            massage: "Server error. Please try again. error"
        });
    }
};
exports.ClientSignup = ClientSignup;
const getProfile = (req, res) => {
    var _a;
    ClientModel_1.default.aggregate([
        {
            $match: {
                _id: new mongoose_1.default.Types.ObjectId((_a = req.user) === null || _a === void 0 ? void 0 : _a._id)
            }
        },
        {
            $project: {
                email: 1,
                fristName: 1,
                lastName: 1,
                mobileNumber: 1,
                userImage: 1,
                subcriptionPlanID: 1
            }
        }
    ]).then((data) => {
        return res.status(200).json({
            status: true,
            massage: "Get data succesfully !",
            data: data[0]
        });
    }).catch((error) => {
        return res.status(301).json({
            status: false,
            massage: "Server error ! Data not found !",
            error
        });
    });
};
exports.getProfile = getProfile;
const updateProfile = (req, res) => {
    var _a;
    ClientModel_1.default.findByIdAndUpdate((_a = req.user) === null || _a === void 0 ? void 0 : _a._id, {
        $set: Object.assign(Object.assign({}, req.body), { updatedOn: new Date() })
    })
        .then(() => {
        return res.status(200).json({
            status: true,
            massage: "upadated data succesfully !"
        });
    }).catch((error) => {
        return res.status(500).json({
            status: false,
            massage: "Server error ! Data not found !",
            error
        });
    });
};
exports.updateProfile = updateProfile;
const getApiKeys = (req, res) => {
    var _a;
    try {
        ClientModel_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id, { _id: 1, apiKey: 1, secretKey: 1 })
            .then(result => {
            res.status(responseCode_1.errorCode.SUCCESS).json({
                status: true,
                massage: "Api Key Fetched Successfully.",
                data: result
            });
        })
            .catch(error => {
            res.status(responseCode_1.errorCode.NOT_FOUND_ERROR).json({
                status: false,
                massage: "Invalid Data..!",
                error
            });
        });
    }
    catch (error) {
        res.status(responseCode_1.errorCode.SERVER_ERROR).json({
            status: false,
            massage: "server Error..!",
            error
        });
    }
};
exports.getApiKeys = getApiKeys;
