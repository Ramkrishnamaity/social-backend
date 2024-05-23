import { Document, Schema, model } from "mongoose"
import { PlanModelType } from "../../lib/DataSet/Common/Subscription"

const Planschema = new Schema<PlanModelType & Document["_id"]>({
	planID: {
		type: String,
	},
	productID: {
		type: String,
	},
	name: {
		type: String,
		required: true,
		unique: true
	},
	description: {
		type: String
	},
	image: {
		type: String,
		default: "https://foodserviceip.com/wp-content/uploads/2022/02/Subscription-image.jpg"
	},
	price: {
		type: Number
	},
	currency: {
		type: String
	},
	interval: {
		type: String
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

Planschema.methods.addPlanIDProductID = function (planID: string, productID: string): void {
	this.planID = planID
	this.productID = productID
	this.save()
}

// ClientSchema.methods.comparePassword = function (candidatePassword) {
//     return passwordHash.verify(candidatePassword, this.password);
// };

const PlanModel = model<PlanModelType & Document["_id"]>("Plan", Planschema)

export default PlanModel
