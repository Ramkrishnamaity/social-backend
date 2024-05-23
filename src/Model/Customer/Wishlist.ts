import { Document, Schema, model } from "mongoose"
import { WishlistModelType } from "../../lib/DataSet/Customer/Model"

const WishlistSchema = new Schema<WishlistModelType<Document>>({
	customerID: {
		type: Schema.Types.ObjectId,
		require: true
	},
	productID: {
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

const WishlistModel = model<WishlistModelType<Document>>("Wishlist", WishlistSchema)

export default WishlistModel

