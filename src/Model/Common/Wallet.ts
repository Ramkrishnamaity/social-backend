import mongoose, { Document, Schema } from "mongoose"
import { WalletModelType } from "../../lib/DataSet/Common/Model"
import TransactionModel from "./Transaction"


const WalletSchema = new Schema<WalletModelType<Document>>({
	userID: {
		type: mongoose.Schema.Types.ObjectId,
		required: true
	},
	balance: {
		type: Number,
		default: 0
	}
})

WalletSchema.methods.debit = async function (amount: number, tag: string, transactionID?: string, productID?: string): Promise<void> {
	this.balance -= amount
	this.save()
	const transactionData: any = {
		userID: this.userID,
		amount,
		type: "Debit",
		tag
	}
	if (transactionID) {
		transactionData.transactionID = transactionID
	}
	if( productID ) {
		transactionData.productID = productID
	}
	await TransactionModel.create(transactionData)
}

WalletSchema.methods.credit = async function (amount: number, tag: string, transactionID?: string, productID?: string): Promise<void> {
	this.balance += amount
	this.save()
	const transactionData: any = {
		userID: this.userID,
		amount,
		type: "Credit",
		tag
	}
	if (transactionID) {
		transactionData.transactionID = transactionID
	}
	if( productID ) {
		transactionData.productID = productID
	}
	await TransactionModel.create(transactionData)
}

const WalletModel = mongoose.model<WalletModelType<Document>>("Wallet", WalletSchema)

export default WalletModel