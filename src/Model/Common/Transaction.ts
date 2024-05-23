import mongoose, { Document, Schema } from "mongoose"
import { TransactionModelType } from "../../lib/DataSet/Common/Model"


const TransactionSchema = new Schema<TransactionModelType<Document>>({
	userID: {
		type: mongoose.Schema.Types.ObjectId,
		required: true
	},
	amount: {
		type: Number,
		required: true
	},
	type: {
		type: String,
		enum: ["Debit", "Credit"],
		required: true
	},
	tag: {
		type: String,
		enum: ["Affiliate", "Product Buy", "Product Sell", "Add Balance", "Withdraw Balance"]
	},
	productID: {
		type: mongoose.Schema.Types.ObjectId,
	},
	transactionID: {
		type: String,
	},
	date: {
		type: Date,
		default: Date.now
	}
})


const TransactionModel = mongoose.model<TransactionModelType<Document>>("Transaction", TransactionSchema)

export default TransactionModel