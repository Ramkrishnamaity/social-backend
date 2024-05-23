"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Auth_1 = __importDefault(require("../../Controlar/Customer/Auth"));
const middleware_1 = __importDefault(require("../../lib/service/middleware"));
const Post_1 = __importDefault(require("../../Controlar/Customer/Post"));
const Product_1 = __importDefault(require("../../Controlar/Customer/Product"));
const Wallet_1 = __importDefault(require("../../Controlar/Customer/Wallet"));
const category_1 = require("../../Controlar/Admin/category");
const subCategory_1 = require("../../Controlar/Admin/subCategory");
const Address_1 = __importDefault(require("../../Controlar/Customer/Address"));
const Order_1 = __importDefault(require("../../Controlar/Customer/Order"));
const ApiRouter = (0, express_1.Router)();
ApiRouter.use(middleware_1.default.CustomerMiddleware);
/** Customer */
ApiRouter.post("/", Auth_1.default.addCustomer);
ApiRouter.put("/:id", Auth_1.default.updateCustomer);
ApiRouter.delete("/:id", Auth_1.default.deleteCustomer);
ApiRouter.get("/profile/:id", Auth_1.default.getProfile);
ApiRouter.put("/profile/:id", Auth_1.default.updateProfile);
/** Wallet */
ApiRouter.get("/wallet", Wallet_1.default.getBalance);
ApiRouter.post("/withdraw", Wallet_1.default.moneyWithdraw);
/** post */
ApiRouter.get("/post", Post_1.default.getPosts);
ApiRouter.get("/searchedpost", Post_1.default.getSearchPosts);
ApiRouter.post("/post", Post_1.default.createPost);
ApiRouter.put("/post/:id", Post_1.default.updatePost);
ApiRouter.delete("/post/:id", Post_1.default.deletePost);
ApiRouter.get("/post/:id", Post_1.default.getSinglePost);
/** Post's Like & Comment */
ApiRouter.post("/post/like/:id", Post_1.default.likePost);
ApiRouter.post("/comment", Post_1.default.addComment);
ApiRouter.get("/comment/:id", Post_1.default.getComment);
ApiRouter.put("/comment/:id", Post_1.default.updateComment);
ApiRouter.delete("/comment/:id", Post_1.default.deleteComment);
/** Address */
ApiRouter.get("/address/:id", Address_1.default.getAddress);
ApiRouter.post("/address", Address_1.default.addAddress);
ApiRouter.put("/address/:id", Address_1.default.updateAddress);
ApiRouter.delete("/address/:id", Address_1.default.removeAddress);
/** Category And Sub Category */
ApiRouter.get("/category", category_1.viewCategory);
ApiRouter.get("/sub-category/:id", subCategory_1.viewCatSubCat);
/** product */
ApiRouter.get("/product", Product_1.default.getProducts);
ApiRouter.get("/product/:id", Product_1.default.getSingleProduct);
ApiRouter.post("/product", Product_1.default.createProduct);
ApiRouter.put("/product/:id", Product_1.default.updateProduct);
ApiRouter.put("/product/discount/:id", Product_1.default.addDiscount);
ApiRouter.delete("/product/:id", Product_1.default.deleteProduct);
ApiRouter.post("/product/wishList/:id", Product_1.default.addWishList);
ApiRouter.post("/report", Post_1.default.addReport);
/** My Order */
ApiRouter.get("/wishlist/:id", Auth_1.default.mywishList);
ApiRouter.get("/myorder/:id", Order_1.default.myOrder);
ApiRouter.get("/myproductorder/:id", Order_1.default.myProductOrder);
ApiRouter.get("/order/:id", Order_1.default.specificOrder);
ApiRouter.put("/order/:id", Order_1.default.changeStatus);
/** Post Share */
ApiRouter.get("/share/:postID/:userID", Post_1.default.doShare);
/** Product CheckOut */
ApiRouter.post("/checkout", Product_1.default.productCheckout);
exports.default = ApiRouter;
