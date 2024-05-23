"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Customer_1 = require("../../Controlar/Client/Customer");
const Post_1 = require("../../Controlar/Client/Post");
const AffilitedPersentage_1 = require("../../Controlar/Client/AffilitedPersentage");
const category_1 = require("../../Controlar/Admin/category");
const subCategory_1 = require("../../Controlar/Admin/subCategory");
const Auth_1 = __importDefault(require("../../Controlar/Customer/Auth"));
const Auth_2 = require("../../Controlar/Client/Auth");
const Wallet_1 = __importDefault(require("../../Controlar/Client/Wallet"));
const Product_1 = __importDefault(require("../../Controlar/Customer/Product"));
const Transaction_1 = __importDefault(require("../../Controlar/Client/Transaction"));
const Subcription_1 = require("../../Controlar/Admin/Subcription");
const ApiRouter = (0, express_1.Router)();
/** Profile */
ApiRouter.get("/profile", Auth_2.getProfile);
ApiRouter.put("/profile", Auth_2.updateProfile);
ApiRouter.get("/apikey", Auth_2.getApiKeys);
/** Wallet */
ApiRouter.get("/wallet", Wallet_1.default.getBalance);
/** Category */
ApiRouter.post("/category", category_1.create);
ApiRouter.get("/category/:page", category_1.viewCategory);
ApiRouter.put("/category/:id", category_1.updateCategory);
ApiRouter.delete("/category/:id", category_1.deleteCategory);
/** Sub Category */
ApiRouter.post("/sub-category", subCategory_1.createSubCategory);
ApiRouter.get("/sub-category/:page", subCategory_1.viewSubCategory);
ApiRouter.put("/sub-category/:id", subCategory_1.updateSubCategory);
ApiRouter.delete("/sub-category/:id", subCategory_1.deleteSubCategory);
/** Customer */
ApiRouter.get("/customer", Auth_1.default.getCustomers);
ApiRouter.get("/customer/refferal/:id", Auth_1.default.customerWalletHistory);
// ApiRouter.get("/customer/page/:page", getCustomr)
ApiRouter.put("/customer/status/:id", Customer_1.changeStatus);
ApiRouter.get("/post/page/:page", Post_1.getPost);
// ApiRouter.get("/post", PostController.getPosts)
ApiRouter.get("/product", Product_1.default.getProducts);
ApiRouter.get("/top-product", Product_1.default.getTopProducts);
ApiRouter.get("/post/comment/:postID/:page", Post_1.getPostComment);
ApiRouter.put("/post/status/:id", Post_1.changePostStatus);
ApiRouter.get("/post/like/:postID/:page", Post_1.getPostLike);
ApiRouter.put("/post/comment/status/:id", Post_1.changeCommentStatus);
ApiRouter.put("/post/comment/delete/:id", Post_1.deletePostComment);
ApiRouter.get("/post/report/:postID/:page", Post_1.getPostReport);
ApiRouter.get("/post/report-post/page/:page", Post_1.getReportPost);
ApiRouter.get("/post/product/:id/:page", Post_1.getUserProduct);
ApiRouter.put("/post/update-persentage", AffilitedPersentage_1.updateAffititedPersentage);
ApiRouter.get("/post/get-persentage", AffilitedPersentage_1.viewPersentage);
// ApiRouter.get("/post/all-product/page/:page", getAllProduct)
ApiRouter.put("/post/product/status/:id", Post_1.changeProductStatus);
ApiRouter.get("/post/:id", Auth_1.default.getCustomerPost);
ApiRouter.get("/product/customer/:id", Auth_1.default.getCustomerProduct);
ApiRouter.get("/product/:id", Product_1.default.getSpecificProduct);
ApiRouter.get("/weekly-transaction", Transaction_1.default.weeklyGraph);
ApiRouter.get("/monthly-transaction", Transaction_1.default.monthlyGraph);
ApiRouter.get("/recent-transaction", Transaction_1.default.lastTransaction);
// subscription
ApiRouter.get("/subcription", Subcription_1.viewSubcriptionPlan);
ApiRouter.get("/subcription/:id", Subcription_1.buySubcription);
exports.default = ApiRouter;
