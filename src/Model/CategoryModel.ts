import { Schema, model } from "mongoose"
import { type CategoryDataSet } from "../lib/DataSet/Category"
import ClientCategoryModel from "./Client/ClientCategory"

const CategorySchema = new Schema<CategoryDataSet>({
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

})

CategorySchema.methods.unLinkUser = async function (userID: string): Promise<void> {
	await ClientCategoryModel.updateOne(
		{
			userID
		},
		{
			$pull: {
				categories: this._id
			}
		},
		{ upsert: true }
	)
}

CategorySchema.methods.linkUser = async function (userID: string): Promise<void> {
	await ClientCategoryModel.updateOne(
		{
			userID
		},
		{
			$push: {
				categories: this._id
			}
		},
		{ upsert: true }
	)
}

// ClientSchema.methods.comparePassword = function (candidatePassword) {
//     return passwordHash.verify(candidatePassword, this.password);
// };

const AdminModel = model<CategoryDataSet>("category", CategorySchema)
export default AdminModel
