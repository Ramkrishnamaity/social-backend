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
const mongoose_1 = __importDefault(require("mongoose"));
const PostShare_1 = __importDefault(require("../../Model/Customer/PostShare"));
const ClientAftlitePersentage_1 = __importDefault(require("../../Model/ClientAftlitePersentage"));
const Wallet_1 = __importDefault(require("../../Model/Common/Wallet"));
const distributeRefferalBonus = (orderID, vendorID, clientID, postID, productID, userID, price, paymentMode) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        PostShare_1.default.aggregate([
            {
                $match: {
                    postID: new mongoose_1.default.Types.ObjectId(postID),
                    $expr: {
                        $in: [new mongoose_1.default.Types.ObjectId(userID), "$refferedUserID"]
                    }
                }
            }
        ])
            .then((result) => __awaiter(void 0, void 0, void 0, function* () {
            console.log(result);
            const vendorWallet = yield Wallet_1.default.findOne({
                userID: vendorID
            });
            let copyPrice = price;
            if (result.length !== 0) {
                yield ClientAftlitePersentage_1.default.findOne({ clientID })
                    .then((client) => __awaiter(void 0, void 0, void 0, function* () {
                    const index = result[0].refferedUserID.findIndex((id) => id.equals(userID));
                    const usersToBeAwareded = [clientID];
                    let count = 0;
                    if (index === 0) {
                        usersToBeAwareded.push(result[0].reffererID.toString());
                    }
                    else {
                        for (let i = index - 1; i >= 0; i--) {
                            if (count === 24) {
                                usersToBeAwareded.push(result[0].refferedUserID[i].toString());
                                count++;
                                break;
                            }
                            usersToBeAwareded.push(result[0].refferedUserID[i].toString());
                            count++;
                        }
                        if (count !== 25) {
                            usersToBeAwareded.push(result[0].reffererID.toString());
                        }
                    }
                    console.log(usersToBeAwareded);
                    const affiliateAmount = price * (Number(client === null || client === void 0 ? void 0 : client.affiliatedPersentage) / 100);
                    const clientAmount = price * (Number(client === null || client === void 0 ? void 0 : client.ownPersentage) / 100);
                    // distribute money
                    for (let i = 0; i < usersToBeAwareded.length; i++) {
                        const wallet = yield Wallet_1.default.findOne({
                            userID: usersToBeAwareded[i]
                        });
                        if (i === 0) {
                            wallet === null || wallet === void 0 ? void 0 : wallet.credit(clientAmount, "Product Sell", orderID, productID);
                        }
                        else {
                            wallet === null || wallet === void 0 ? void 0 : wallet.credit((affiliateAmount / (usersToBeAwareded.length - 1)), "Affiliate", orderID, productID);
                        }
                    }
                    console.log("client", clientAmount);
                    console.log("Affiliate", affiliateAmount);
                    copyPrice = copyPrice - clientAmount - affiliateAmount;
                    yield PostShare_1.default.findByIdAndDelete(result[0]._id);
                    console.log("Refferal Bonus Given Successfully.");
                }))
                    .catch(error => {
                    console.log(error);
                });
            }
            else {
                yield ClientAftlitePersentage_1.default.findOne({ clientID })
                    .then((client) => __awaiter(void 0, void 0, void 0, function* () {
                    const wallet = yield Wallet_1.default.findOne({
                        userID: clientID
                    });
                    const clientAmount = price * (Number(client === null || client === void 0 ? void 0 : client.ownPersentage) / 100);
                    wallet === null || wallet === void 0 ? void 0 : wallet.credit(clientAmount, "Product Sell", orderID, productID);
                    console.log("client", clientAmount);
                    copyPrice = copyPrice - clientAmount;
                }))
                    .catch(error => {
                    console.log(error);
                });
            }
            // sent the rest money to Vendor
            if (paymentMode === "Wallet") {
                vendorWallet === null || vendorWallet === void 0 ? void 0 : vendorWallet.credit(copyPrice, "Product Sell", orderID, productID);
            }
        }))
            .catch(error => {
            console.log(error);
        });
    }
    catch (error) {
        console.log(error.message);
    }
});
exports.default = distributeRefferalBonus;
