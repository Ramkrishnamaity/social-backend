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
const mongoose_1 = require("mongoose");
const ClientCategory_1 = __importDefault(require("./Client/ClientCategory"));
const CategorySchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
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
CategorySchema.methods.unLinkUser = function (userID) {
    return __awaiter(this, void 0, void 0, function* () {
        yield ClientCategory_1.default.updateOne({
            userID
        }, {
            $pull: {
                categories: this._id
            }
        }, { upsert: true });
    });
};
CategorySchema.methods.linkUser = function (userID) {
    return __awaiter(this, void 0, void 0, function* () {
        yield ClientCategory_1.default.updateOne({
            userID
        }, {
            $push: {
                categories: this._id
            }
        }, { upsert: true });
    });
};
// ClientSchema.methods.comparePassword = function (candidatePassword) {
//     return passwordHash.verify(candidatePassword, this.password);
// };
const AdminModel = (0, mongoose_1.model)("category", CategorySchema);
exports.default = AdminModel;
