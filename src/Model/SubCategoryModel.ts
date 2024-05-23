import mongoose, { Schema, model } from "mongoose"
import { type SubCategoryDataSet } from "../lib/DataSet/SubCategory"
import ClientCategoryModel from "./Client/ClientCategory"

const SUbCategorySchema = new Schema<SubCategoryDataSet>({
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
		type: mongoose.Schema.Types.ObjectId
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

})

SUbCategorySchema.methods.unLinkUser = async function (userID: string): Promise<void> {
	await ClientCategoryModel.updateOne(
		{
			userID
		},
		{
			$pull: {
				subcategories: this._id
			}
		},
		{ upsert: true }
	)
}

SUbCategorySchema.methods.linkUser = async function (userID: string): Promise<void> {
	await ClientCategoryModel.updateOne(
		{
			userID
		},
		{
			$push: {
				subcategories: this._id
			}
		},
		{ upsert: true }
	)
}

// ClientSchema.methods.comparePassword = function (candidatePassword) {
//     return passwordHash.verify(candidatePassword, this.password);
// };

const AdminModel = model<SubCategoryDataSet>("subcategory", SUbCategorySchema)
export default AdminModel
