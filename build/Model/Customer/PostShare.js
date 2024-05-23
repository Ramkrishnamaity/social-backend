"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const PostShareSchema = new mongoose_1.Schema({
    postID: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true
    },
    reffererID: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true
    },
    refferedUserID: {
        type: [mongoose_1.default.Schema.Types.ObjectId],
        required: true
    }
});
// PostShareSchema.methods.shallowCopy = async function(refferedUserID: Types.ObjectId): Promise<void>{
// 	await PostShareModel.create({
// 		postID: this.postID,
// 		reffererID: this.reffererID,
// 		refferedUserID: [refferedUserID]
// 	})
// }
// PostShareSchema.methods.endPush = function(refferedUserID: Types.ObjectId): void {
// 	this.refferedUserID.push(refferedUserID)
// 	this.save()
// }
// PostShareSchema.methods.deepCopy = async function(refferedUserID: Types.ObjectId, index: number): Promise<void>{
// 	const updatedRefferedUserID = this.refferedUserID.slice(0, index).push(refferedUserID)
// 	await PostShareModel.create({
// 		postID: this.postID,
// 		reffererID: this.reffererID,
// 		refferedUserID: updatedRefferedUserID
// 	})
// }
const PostShareModel = mongoose_1.default.model("PostShare", PostShareSchema);
exports.default = PostShareModel;
