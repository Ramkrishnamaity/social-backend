import { Schema, model } from "mongoose"
import { type AdminModels } from "../lib/DataSet/AdminAuth"

const AdminSchema = new Schema<AdminModels>({
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
	createdOn: {
		type: Date,
		default: Date.now
	},
	updatedOn: {
		type: Date,
		default: Date.now
	}

})

// ClientSchema.methods.comparePassword = function (candidatePassword) {
//     return passwordHash.verify(candidatePassword, this.password);
// };

const AdminModel = model<AdminModels>("Admin", AdminSchema)
export default AdminModel
