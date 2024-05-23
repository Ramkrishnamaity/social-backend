import { Schema, model } from "mongoose"
import { type postLikeDataSet } from "../lib/DataSet/postLike"

const postLikeSchema = new Schema<postLikeDataSet>({
	customerID: {
		type: Schema.Types.ObjectId,
		require: true
	},
	postID: {
		type: Schema.Types.ObjectId,
		require: true
	},
	createdOn: {
		type: Date,
		default: Date.now
	}
})

export default model<postLikeDataSet>("client-post-like", postLikeSchema)
