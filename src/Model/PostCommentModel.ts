import { Schema, model } from "mongoose"
import { type postCommentDataSet } from "../lib/DataSet/postComment"

const postCommmentSchema = new Schema<postCommentDataSet>({
	customerID: {
		type: Schema.Types.ObjectId,
		require: true
	},
	postID: {
		type: Schema.Types.ObjectId,
		require: true
	},
	comment: {
		type: String,
		require: true
	},
	createdOn: {
		type: Date,
		default: Date.now
	},
	status: {
		type: Boolean,
		default: true
	}
})

export default model<postCommentDataSet>("client-post-comment", postCommmentSchema)
