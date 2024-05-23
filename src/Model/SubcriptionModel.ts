import { Document, Schema, model } from "mongoose"
import { SubscriptionModelType } from "../lib/DataSet/Common/Subscription"

const SubcriptionSchema = new Schema<SubscriptionModelType & Document["_id"]>({
	clientID: {
		type: Schema.Types.ObjectId,
		require: true
	},
	planID: {
		type: Schema.Types.ObjectId,
		require: true
	},
	status: {
		type: Boolean,
		default: true
	},
	isDeleted:{
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

SubcriptionSchema.methods.addsubscriptionID = function (subsID: string): void {
	this.subscriptionID = subsID
	this.save()
}

// ClientSchema.methods.comparePassword = function (candidatePassword) {
//     return passwordHash.verify(candidatePassword, this.password);
// };

const AdminModel = model<SubscriptionModelType & Document["_id"]>("Subcription", SubcriptionSchema)
export default AdminModel
