"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const postReportSchema = new mongoose_1.Schema({
    customerID: {
        type: mongoose_1.Schema.Types.ObjectId,
        require: true
    },
    postID: {
        type: mongoose_1.Schema.Types.ObjectId,
        require: true
    },
    title: {
        type: String
    },
    note: {
        type: String
    },
    createdOn: {
        type: Date,
        default: Date.now
    }
});
exports.default = (0, mongoose_1.model)("client-post-report", postReportSchema);
