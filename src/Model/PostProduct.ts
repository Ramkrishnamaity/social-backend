import { Schema, model } from "mongoose"
import { type MediaDataset, type ProductDataset } from "../lib/DataSet/PostProduct"

const medeaSchema = new Schema<MediaDataset>({
	url: {
		type: String
	},
	mediaType: {
		type: String
	}
})

const productSchema = new Schema<ProductDataset>({
	customerID: {
		type: Schema.Types.ObjectId,
		require: true
	},
	productName: {
		type: String,
		required: true
	},
	categoryID: {
		type: Schema.Types.ObjectId,
		required: true
	},
	subCategoryID: {
		type: Schema.Types.ObjectId,
		required: true
	},
	description: {
		type: String,
		required: true
	},
	price: {
		type: String,
		required: true
	},
	media: {
		type: [medeaSchema],
		default: []
	},
	sellerAddress: {
		type: Object,
		default: false
	},
	createdOn: {
		type: Date
	},
	modifiedOn: {
		type: Date,
		default: Date.now
	},
	isDeleted: {
		type: Boolean,
		default: false
	},
	enableStatus: {
		type: Boolean,
		default: true
	}

})

export default model<ProductDataset>("product", productSchema)
