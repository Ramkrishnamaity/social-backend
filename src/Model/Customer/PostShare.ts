import mongoose, { Document, Schema } from "mongoose"
import { PostShareModelType } from "../../lib/DataSet/Customer/Model"


const PostShareSchema = new Schema<PostShareModelType<Document>>({
	postID: {
		type: mongoose.Schema.Types.ObjectId,
		required: true
	},
	reffererID: {
		type: mongoose.Schema.Types.ObjectId,
		required: true
	},
	refferedUserID: {
		type: [mongoose.Schema.Types.ObjectId],
		required: true
	}
})

// PostShareSchema.methods.shallowCopy = async function(refferedUserID: Types.ObjectId): Promise<void>{
// 	await PostShareModel.create({
// 		postID: this.postID,
// 		reffererID: this.reffererID,
// 		refferedUserID: [refferedUserID]
// 	})
// }

// PostShareSchema.methods.endPush = function(refferedUserID: Types.ObjectId): void {
// 	this.refferedUserID.push(refferedUserID)
// 	this.save()
// }

// PostShareSchema.methods.deepCopy = async function(refferedUserID: Types.ObjectId, index: number): Promise<void>{

// 	const updatedRefferedUserID = this.refferedUserID.slice(0, index).push(refferedUserID)
// 	await PostShareModel.create({
// 		postID: this.postID,
// 		reffererID: this.reffererID,
// 		refferedUserID: updatedRefferedUserID
// 	})

// }


const PostShareModel = mongoose.model<PostShareModelType<Document>>("PostShare", PostShareSchema)

export default PostShareModel