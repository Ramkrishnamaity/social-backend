import { Document, Schema, model } from "mongoose"
import type { ClientModels } from "../../lib/DataSet/ClientAuth"

const ClientSchema = new Schema<ClientModels & Document["_id"]>({
	customerID: {
		type: String
	},
	userName: {
		type: String
	},
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
	status: {
		type: Boolean,
		default: true
	},
	apiKey: {
		type: String,
		required: true,
		unique: true
	},
	secretKey: {
		type: String,
		required: true,
		unique: true
	},
	subcriptionPlanID: {
		type: Schema.Types.ObjectId
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

})

ClientSchema.methods.addCustomerID = function (customerID: string): void {
	this.customerID = customerID
	this.save()
}

const ClientModel = model<ClientModels & Document["_id"]>("Client", ClientSchema)
export default ClientModel
