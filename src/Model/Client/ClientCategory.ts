import mongoose, { Schema, model } from "mongoose"
import { type ClientCategoryDataSet } from "../../lib/DataSet/Category"

const ClientCategorySchema = new Schema<ClientCategoryDataSet>({
	userID: {
		type: mongoose.Schema.Types.ObjectId,
		required: true
	},
	categories: {
		type: [mongoose.Schema.Types.ObjectId],
		required: true
	},
	subcategories: {
		type: [mongoose.Schema.Types.ObjectId],
		required: true
	}
})

// ClientSchema.methods.comparePassword = function (candidatePassword) {
//     return passwordHash.verify(candidatePassword, this.password);
// };

const ClientCategoryModel = model<ClientCategoryDataSet>("client-category", ClientCategorySchema)
export default ClientCategoryModel
