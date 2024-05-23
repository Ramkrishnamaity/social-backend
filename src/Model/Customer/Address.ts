import mongoose, { Document, Schema } from "mongoose"
import { AddressModelType } from "../../lib/DataSet/Customer/Model"


const AddressSchema = new Schema<AddressModelType<Document>>({
	customerID: {
		type: mongoose.Schema.Types.ObjectId,
		required: true
	},
	name: {
		type: String,
		required: true
	},
	mobileNo: {
		type: String,
		required: true
	},
	address: {
		type: String,
		required: true
	},
	landmark: {
		type: String,
		required: true
	},
	city: {
		type: String,
		required: true
	},
	state: {
		type: String,
		required: true
	},
	country: {
		type: String,
		required: true
	},
	addressType: {
		type: String,
		enum: ["Office", "Home", "Other"],
		required: true
	},
	pincode: {
		type: String,
		required: true
	}
})

const AddressModel = mongoose.model<AddressModelType<Document>>("Address", AddressSchema)

export default AddressModel