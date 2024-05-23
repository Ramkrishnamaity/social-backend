import mongoose, { Schema, model } from "mongoose"
import { type ClientAfilitedPersentageDateset } from "../lib/DataSet/ClientAftlitePersentage"

const affiliatedPersentageSchema = new Schema<ClientAfilitedPersentageDateset>({
	clientID: {
		type: mongoose.Schema.Types.ObjectId,
		require: true
	},
	ownPersentage: {
		type: String,
		default: "0"
	},
	affiliatedPersentage: {
		type: String,
		default: "0"
	},
	status: {
		type: Boolean,
		default: true
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

export default model<ClientAfilitedPersentageDateset>("affiliated-persentage", affiliatedPersentageSchema)
