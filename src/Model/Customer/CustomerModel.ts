import mongoose, { Schema, model } from "mongoose"
import { type CustomerModels } from "../../lib/DataSet/CustomerAuth"

const CustomeSchema = new Schema<CustomerModels>({
	clientID: {
		type: mongoose.Schema.Types.ObjectId
	},
	fristName:{
		type: String,	
	},
	lastName:{
		type: String,
	},
	email: {
		type: String,
		required: true,
		unique: true
	},
	image: {
		type: String,
		default: null
	},
	createdOn: {
		type: Date,
		default: Date.now
	},
	updatedOn: {
		type: Date,
		default: Date.now
	},
	status: {
		type: Boolean,
		default: true
	},
	isDeleted: {
		type: Boolean,
		default: false
	}
})

const CustomerModel = model<CustomerModels>("customer", CustomeSchema)
export default CustomerModel
