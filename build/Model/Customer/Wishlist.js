"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const WishlistSchema = new mongoose_1.Schema({
    customerID: {
        type: mongoose_1.Schema.Types.ObjectId,
        require: true
    },
    productID: {
        type: mongoose_1.Schema.Types.ObjectId,
        require: true
    },
    postID: {
        type: mongoose_1.Schema.Types.ObjectId,
        require: true
    },
    createdOn: {
        type: Date,
        default: Date.now
    }
});
const WishlistModel = (0, mongoose_1.model)("Wishlist", WishlistSchema);
exports.default = WishlistModel;
