"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const postLikeSchema = new mongoose_1.Schema({
    customerID: {
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
exports.default = (0, mongoose_1.model)("client-post-like", postLikeSchema);
