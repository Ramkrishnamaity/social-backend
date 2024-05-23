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
exports.AdminLogin = exports.AdminSignup = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const AdminModel_1 = __importDefault(require("../../Model/AdminModel"));
function createToken(data) {
    return jsonwebtoken_1.default.sign(data, "admintoken");
}
const AdminSignup = (req, res) => {
    const _id = new mongoose_1.default.Types.ObjectId();
    const token = createToken({ _id, userType: "admin" });
    bcrypt_1.default.hash(req.body.password, 10).then((password) => {
        const dataSet = new AdminModel_1.default(Object.assign(Object.assign({}, req.body), { _id, token, password }));
        dataSet.save().then((data) => {
            res.status(200).json({
                status: true,
                massage: "client signup succesfull",
                data: {
                    token: data.token,
                    userImage: data.userImage,
                    fristName: data.fristName,
                    lastName: data.lastName
                }
            });
        })
            .catch((error) => {
            return res.status(301).json({
                status: false,
                error,
                massage: "Server error. Please try again."
            });
        });
    }).catch((error) => {
        return res.status(301).json({
            status: false,
            error,
            massage: "Server error. Please try again."
        });
    });
};
exports.AdminSignup = AdminSignup;
const AdminLogin = (req, res) => {
    const { email, password } = req.body;
    AdminModel_1.default.findOne({ email })
        .then((data) => __awaiter(void 0, void 0, void 0, function* () {
        console.log("data", data);
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
                return res.status(200).json({
                    status: true,
                    massage: "Login succesfully !",
                    data: {
                        token: data.token,
                        userImage: data.userImage,
                        fristName: data.fristName,
                        lastName: data.lastName
                    }
                });
            }
        }
    })).catch((error) => {
        console.log("err", error);
    });
};
exports.AdminLogin = AdminLogin;
