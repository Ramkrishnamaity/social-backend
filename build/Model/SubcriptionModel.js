"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const SubcriptionSchema = new mongoose_1.Schema({
    clientID: {
        type: mongoose_1.Schema.Types.ObjectId,
        require: true
    },
    planID: {
        type: mongoose_1.Schema.Types.ObjectId,
        require: true
    },
    status: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
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
SubcriptionSchema.methods.addsubscriptionID = function (subsID) {
    this.subscriptionID = subsID;
    this.save();
};
// ClientSchema.methods.comparePassword = function (candidatePassword) {
//     return passwordHash.verify(candidatePassword, this.password);
// };
const AdminModel = (0, mongoose_1.model)("Subcription", SubcriptionSchema);
exports.default = AdminModel;
