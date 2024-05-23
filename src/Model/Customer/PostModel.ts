import mongoose, { Schema } from "mongoose"
import { type mediaDataSet, type postDataSet } from "../../lib/DataSet/Post"

const mediaSchema = new Schema<mediaDataSet>({
	url: {
		type: String
	},
	mediaType: {
		type: String
	}
})

const postSchema = new Schema<postDataSet>({
	customerID: {
		type:  mongoose.Schema.Types.ObjectId,
		require: true
	},
	clientID: {
		type: mongoose.Schema.Types.ObjectId
	},
	postTitle: {
		type: String,
		require: true
	},
	postMedia: {
		type: [mediaSchema]
	},
	products: {
		type: [mongoose.Types.ObjectId]
	},
	visibility: {
		type: String,
		enum: ["onlyMe", "public"],
		default: "public"
	},
	createdOn: {
		type: Date,
		default: Date.now
	},
	updatedOn: {
		type: Date,
		default: Date.now
	},
	isDeleted:{
		type: Boolean,
		default: false
	},
	status: {
		type: Boolean,
		default: true
	}

})

export default mongoose.model<postDataSet>("client-post", postSchema)
