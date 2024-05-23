import mongoose, { Document, Schema } from "mongoose"
import { OrdreModelType } from "../../lib/DataSet/Customer/Model"
import ProductModel from "./Product"
import distributeRefferalBonus from "../../lib/service/Utility"



const OrderSchema = new Schema<OrdreModelType<Document>>({
	orderID: {
		type: String,
		required: true
	},
	customerID: {
		type: mongoose.Schema.Types.ObjectId,
		required: true
	},
	vendorID: {
		type: mongoose.Schema.Types.ObjectId,
		required: true
	},
	postID: {
		type: mongoose.Schema.Types.ObjectId,
		required: true
	},
	product: {
		_id: mongoose.Schema.Types.ObjectId,
		price: Number,
		purchasePrice: Number,
		discount: Number,
		quantity: Number
	},
	address: {
		name: String,
		mobileNo: String,
		address: String,
		landmark: String,
		pincode: String,
		addressType: String,
		city: String,
		state: String,
		country: String
	},
	orderStatus: [
		{
			status: {
				type: String,
				enum: ["Pending", "Confirmed", "Canceled", "Delivered", "Out for Delivery"]
			},
			date: {
				type: Date,
				default: Date.now
			}
		}
	],
	paymentMode: {
		type: String,
		enum: ["Online", "COD", "Wallet"]
	},
	transactionID: {
		type: String
	},
	createdOn: {
		type: Date,
		default: Date.now
	}
})

OrderSchema.methods.changeStatus = async function (statusName: string, isVendor: boolean): Promise<boolean> {

	let flag = true
	const product = await ProductModel.findById(this.product._id)

	if (this.orderStatus[this.orderStatus.length - 1].status === "Pending" && !isVendor && statusName === "Confirmed") {
		
		this.orderStatus.push({
			status: statusName
		})
		this.save()
		product?.updateStock(false, this.product.quantity)
		return true

	} else {
		if (isVendor) {

			const status = ["Pending", "Canceled", "Delivered"]  // if not include in last
			if (status.includes(this.orderStatus[this.orderStatus.length - 1].status)) {
				flag = false
			} else {
				this.orderStatus.push({
					status: statusName
				})
				this.save()
			}

		} else {
			const status = ["Pending", "Canceled", "Delivered", "Out for Delivery"]  // if not include in last
			if (status.includes(this.orderStatus[this.orderStatus.length - 1].status)) {
				flag = false
			} else {
				this.orderStatus.push({
					status: statusName
				})
				this.save()
			}

		}

		
		if (statusName === "Canceled" && flag) {
			// update stock
			product?.updateStock(true, this.product.quantity)

		} else if(statusName === "Delivered" && flag){
			// distribute money
			await distributeRefferalBonus(
				this.orderID,
				this.vendorID.toString(),
				product?.clientID.toString() ?? "",
				this.postID.toString(), 
				this.product._id.toString(), 
				this.customerID.toString(), 
				(this.product.purchasePrice * this.product.quantity),
				this.paymentMode
			)
		}

		return flag
	}

}


const OrderModel = mongoose.model<OrdreModelType<Document>>("Order", OrderSchema)

export default OrderModel