"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const AdminSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    fristName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    mobileNumber: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    userImage: {
        type: String,
        default: "https://e7.pngegg.com/pngimages/867/694/png-clipart-user-profile-default-computer-icons-network-video-recorder-avatar-cartoon-maker-blue-text.png"
    },
    token: {
        type: String,
        require: true,
        unique: true
    },
    createdOn: {
        type: Date,
        default: Date.now
    },
    updatedOn: {
        type: Date,
        default: Date.now
    }
});
// ClientSchema.methods.comparePassword = function (candidatePassword) {
//     return passwordHash.verify(candidatePassword, this.password);
// };
const AdminModel = (0, mongoose_1.model)("Admin", AdminSchema);
exports.default = AdminModel;
