import mongoose, { Schema, model } from "mongoose"
import { type mediaDataSet } from "../../lib/DataSet/Post"
import { ProductModelType } from "../../lib/DataSet/Customer/Model"
import { CommonModelType } from "../../lib/DataSet/Common"

const mediaSchema = new Schema<mediaDataSet>({
	url: {
		type: String
	},
	mediaType: {
		type: String
	}
})

const productSchema = new Schema<ProductModelType<CommonModelType>>({
	categoryID: {
		type: mongoose.Schema.Types.ObjectId,
		required: true
	},
	subcategoryID: {
		type: mongoose.Schema.Types.ObjectId,
		required: true
	},
	customerID: {
		type: mongoose.Schema.Types.ObjectId,
		require: true
	},
	clientID: {
		type: mongoose.Schema.Types.ObjectId
	},
	productName: {
		type: String,
		require: true
	},
	productDesc: {
		type: String,
		require: true
	},
	productMedia: {
		type: [mediaSchema]
	},
	price: {
		type: Number,
		required: true
	},
	sellerAddress: [
		{
			lat: String,
			long: String
		}
	],
	discount: {
		percentage: Number,
		startDate: Date,
		endDate: Date
	},
	stock: {
		type: Number,
		default: 0
	},
	createdOn: {
		type: Date,
		default: Date.now
	},
	updatedOn: {
		type: Date,
		default: Date.now
	},
	isDeleted: {
		type: Boolean,
		default: false
	},
	status: {
		type: Boolean,
		default: true
	}

})

productSchema.methods.updateStock = function(isAdd: boolean, quantity: number): void{
	isAdd ? (
		this.stock += quantity
	): (
		this.stock -= quantity
	)

	this.save()
}

const ProductModel = model<ProductModelType<CommonModelType>>("client-product", productSchema)

export default ProductModel
