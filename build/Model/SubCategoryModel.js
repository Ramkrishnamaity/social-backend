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
const mongoose_1 = __importStar(require("mongoose"));
const ClientCategory_1 = __importDefault(require("./Client/ClientCategory"));
const SUbCategorySchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    image: {
        type: String,
        default: "https://e7.pngegg.com/pngimages/867/694/png-clipart-user-profile-default-computer-icons-network-video-recorder-avatar-cartoon-maker-blue-text.png"
    },
    categoryID: {
        type: mongoose_1.default.Schema.Types.ObjectId
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
SUbCategorySchema.methods.unLinkUser = function (userID) {
    return __awaiter(this, void 0, void 0, function* () {
        yield ClientCategory_1.default.updateOne({
            userID
        }, {
            $pull: {
                subcategories: this._id
            }
        }, { upsert: true });
    });
};
SUbCategorySchema.methods.linkUser = function (userID) {
    return __awaiter(this, void 0, void 0, function* () {
        yield ClientCategory_1.default.updateOne({
            userID
        }, {
            $push: {
                subcategories: this._id
            }
        }, { upsert: true });
    });
};
// ClientSchema.methods.comparePassword = function (candidatePassword) {
//     return passwordHash.verify(candidatePassword, this.password);
// };
const AdminModel = (0, mongoose_1.model)("subcategory", SUbCategorySchema);
exports.default = AdminModel;
