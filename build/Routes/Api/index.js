"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Auth_1 = require("../../Controlar/Client/Auth");
const middleware_1 = __importDefault(require("../../lib/service/middleware"));
const Clint_1 = __importDefault(require("./Clint"));
const Admin_1 = __importDefault(require("./Admin"));
const Customer_1 = __importDefault(require("./Customer"));
const Auth_2 = require("../../Controlar/Admin/Auth");
const Client_1 = __importDefault(require("../../Controlar/Client"));
const Subcription_1 = require("../../Controlar/Admin/Subcription");
const ApiRouter = (0, express_1.Router)();
ApiRouter.post("/client/signup", Auth_1.ClientSignup);
ApiRouter.post("/client/signin", Auth_1.ClientLogin);
ApiRouter.post("/admin/signup", Auth_2.AdminSignup);
ApiRouter.post("/admin/signin", Auth_2.AdminLogin);
ApiRouter.get("/subscription-success/:planID/:cusID", Subcription_1.confirmSubscription);
ApiRouter.put("/client/customer/wallet/:id", middleware_1.default.CheckSecret, Client_1.default.customerWallet); // ---------------------
ApiRouter.put("/client/customer/order/:id", middleware_1.default.CheckSecret, Client_1.default.confirmStatus); // ---------------------
ApiRouter.use("/customer", Customer_1.default);
ApiRouter.use(middleware_1.default.middleware);
ApiRouter.use("/client", Clint_1.default);
ApiRouter.use("/admin", Admin_1.default);
// module.exports = router;
exports.default = ApiRouter;
