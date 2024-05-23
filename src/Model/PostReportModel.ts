import { Schema, model } from "mongoose"
import { type postReportDataset } from "../lib/DataSet/PostRepost"

const postReportSchema = new Schema<postReportDataset>({
	customerID: {
		type: Schema.Types.ObjectId,
		require: true
	},
	postID: {
		type: Schema.Types.ObjectId,
		require: true
	},
	title: {
		type: String
	},
	note: {
		type: String
	},
	createdOn: {
		type: Date,
		default: Date.now
	}
})

export default model<postReportDataset>("client-post-report", postReportSchema)
