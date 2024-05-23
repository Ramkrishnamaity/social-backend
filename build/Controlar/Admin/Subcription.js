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
exports.confirmSubscription = exports.buySubcription = exports.deleteSubcriptionPlan = exports.updateSubcriptionPlan = exports.viewSubcriptionPlan = exports.createSubcriptionPlan = void 0;
const SubcriptionModel_1 = __importDefault(require("./../../Model/SubcriptionModel"));
const Stripe_1 = __importDefault(require("../../lib/service/Stripe"));
const responseCode_1 = require("../../lib/service/responseCode");
const Plan_1 = __importDefault(require("../../Model/Common/Plan"));
const ClientModel_1 = __importDefault(require("../../Model/Client/ClientModel"));
const viewSubcriptionPlan = (req, res) => {
    try {
        Plan_1.default.aggregate([
            {
                $match: {
                    isDeleted: false
                }
            },
            {
                $sort: { _id: -1 }
            }
        ])
            .then((result) => __awaiter(void 0, void 0, void 0, function* () {
            res.status(responseCode_1.errorCode.SUCCESS).json({
                status: true,
                massage: "Plan Fetched Successfully.",
                data: result
            });
        }))
            .catch(error => {
            res.status(responseCode_1.errorCode.SERVER_ERROR).json({
                status: false,
                massage: "Server Error..!",
                error
            });
        });
    }
    catch (error) {
        res.status(responseCode_1.errorCode.SERVER_ERROR).json({
            status: false,
            massage: "Server Error..!",
            error
        });
    }
};
exports.viewSubcriptionPlan = viewSubcriptionPlan;
const updateSubcriptionPlan = (req, res) => {
    Plan_1.default.findByIdAndUpdate(req.params.id, {
        $set: Object.assign({}, req.body)
    }, {
        new: true
    }).then((result) => __awaiter(void 0, void 0, void 0, function* () {
        if (!result) {
            res.status(404).json({
                status: false,
                massage: "Invalid data. !"
            });
        }
        else {
            //update on stripe
            yield Stripe_1.default.updateProduct(result.productID, req.body.PRODUCT_NAME);
            yield Stripe_1.default.upadtePlan(result.planID, req.body.PLAN_NICKNAME);
            res.status(200).json({
                status: true,
                massage: "Update subcription data succesfully !"
            });
        }
    })).catch((error) => {
        return res.status(301).json({
            status: false,
            massage: "Server error ! Data not found !",
            error
        });
    });
};
exports.updateSubcriptionPlan = updateSubcriptionPlan;
const createSubcriptionPlan = (req, res) => {
    try {
        const { PRODUCT_NAME, PLAN_NICKNAME, PLAN_INTERVAL, PLAN_PRICE, CURRENCY } = req.body;
        Plan_1.default.create({
            name: PRODUCT_NAME,
            description: PLAN_NICKNAME,
            price: PLAN_PRICE,
            currency: CURRENCY,
            interval: PLAN_INTERVAL
        })
            .then((plan) => __awaiter(void 0, void 0, void 0, function* () {
            const productID = yield Stripe_1.default.createProduct(req.body.PRODUCT_NAME);
            const planID = yield Stripe_1.default.createPlan(productID, req.body.PLAN_NICKNAME, req.body.CURRENCY, req.body.PLAN_INTERVAL, req.body.PLAN_PRICE);
            plan.addPlanIDProductID(planID, productID);
            res.status(responseCode_1.errorCode.SUCCESS).json({
                status: true,
                massage: "Plan added Successfully."
            });
        }))
            .catch(error => {
            res.status(responseCode_1.errorCode.SERVER_ERROR).json({
                status: false,
                massage: "Server Error..!",
                error
            });
        });
    }
    catch (error) {
        res.status(responseCode_1.errorCode.SERVER_ERROR).json({
            status: false,
            massage: "Server Error..!",
            error
        });
    }
};
exports.createSubcriptionPlan = createSubcriptionPlan;
const deleteSubcriptionPlan = (req, res) => {
    Plan_1.default.findByIdAndDelete(req.params.id).then((result) => __awaiter(void 0, void 0, void 0, function* () {
        if (!result) {
            res.status(404).json({
                status: false,
                massage: "Invalid data. !"
            });
        }
        else {
            //update on stripe
            yield Stripe_1.default.deletePlanProduct(result.planID, result.productID);
            res.status(200).json({
                status: true,
                massage: "Delete subcription succesfully !"
            });
        }
    })).catch((error) => {
        return res.status(301).json({
            status: false,
            massage: "Server error ! Data not found !",
            error
        });
    });
};
exports.deleteSubcriptionPlan = deleteSubcriptionPlan;
const buySubcription = (req, res) => {
    var _a;
    try {
        ClientModel_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id)
            .then((result) => __awaiter(void 0, void 0, void 0, function* () {
            const subscription = yield Stripe_1.default.subscribeCustomerToPlan(result.customerID, req.params.id);
            res.status(responseCode_1.errorCode.SUCCESS).json({
                status: true,
                massage: "Payment Url .",
                data: subscription
            });
        }))
            .catch(error => {
            res.status(responseCode_1.errorCode.SERVER_ERROR).json({
                status: false,
                massage: "Server Error..!",
                error
            });
        });
    }
    catch (error) {
        res.status(responseCode_1.errorCode.SERVER_ERROR).json({
            status: false,
            massage: "Server Error..!",
            error
        });
    }
};
exports.buySubcription = buySubcription;
const confirmSubscription = (req, res) => {
    try {
        ClientModel_1.default.findOne({
            customerID: req.params.cusID
        })
            .then((client) => __awaiter(void 0, void 0, void 0, function* () {
            const plan = yield Plan_1.default.findOne({
                planID: req.params.planID
            });
            yield SubcriptionModel_1.default.create({
                customerID: req.params.cusID,
                clientID: client._id,
                planID: plan._id
            });
            res.redirect("http://localhost:8000/");
        }))
            .catch(error => {
            console.log(error);
            res.redirect("https://www.google.com/");
        });
    }
    catch (error) {
        console.log(error);
        res.redirect("https://www.google.com/");
    }
};
exports.confirmSubscription = confirmSubscription;
