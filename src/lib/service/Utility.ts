import mongoose, { Types } from "mongoose"
import PostShareModel from "../../Model/Customer/PostShare"
import ClientAfflitedPersentageModel from "../../Model/ClientAftlitePersentage"
import WalletModel from "../../Model/Common/Wallet"

const distributeRefferalBonus = async (orderID: string, vendorID: string, clientID: string, postID: string, productID: string, userID: string, price: number, paymentMode: string): Promise<void> => {
	try{

		PostShareModel.aggregate([
			{
				$match: {
					postID: new mongoose.Types.ObjectId(postID),
					$expr: {
						$in: [new mongoose.Types.ObjectId(userID), "$refferedUserID"]
					}
				}
			}
		])
			.then(async result => {
				
				console.log(result)
				const vendorWallet = await WalletModel.findOne(
					{
						userID: vendorID
					}
				)
				let copyPrice = price

				if(result.length !== 0){
					await ClientAfflitedPersentageModel.findOne({clientID})
						.then(async client => {
							const index = result[0].refferedUserID.findIndex((id: Types.ObjectId) => id.equals(userID))
							const usersToBeAwareded = [clientID]
							let count = 0
							if(index === 0){
								usersToBeAwareded.push(result[0].reffererID.toString())
							} else{

								for(let i = index-1; i >= 0; i--){
									if(count === 24){
										usersToBeAwareded.push(result[0].refferedUserID[i].toString())
										count++
										break
									}
									usersToBeAwareded.push(result[0].refferedUserID[i].toString())
									count++
								}
								if(count !== 25){
									usersToBeAwareded.push(result[0].reffererID.toString())
								}
							}
	
							console.log(usersToBeAwareded)

							const affiliateAmount = price * ( Number(client?.affiliatedPersentage) / 100 )
							const clientAmount = price * ( Number(client?.ownPersentage) / 100 )
	
							// distribute money
							for(let i = 0; i < usersToBeAwareded.length; i++){
							
								const wallet = await WalletModel.findOne(
									{
										userID: usersToBeAwareded[i]
									}
								)
								if(i === 0){
									wallet?.credit(clientAmount, "Product Sell", orderID, productID)
								} else{
									wallet?.credit((affiliateAmount/(usersToBeAwareded.length - 1)), "Affiliate", orderID, productID)
								}
							}
							console.log("client", clientAmount )
							console.log("Affiliate", affiliateAmount)

							copyPrice = copyPrice - clientAmount - affiliateAmount
							
							await PostShareModel.findByIdAndDelete(result[0]._id)
							
							console.log("Refferal Bonus Given Successfully.")
						})
						.catch(error => {
							console.log(error)
						})
				} else{
					await ClientAfflitedPersentageModel.findOne({clientID})
						.then(async client => {
							const wallet = await WalletModel.findOne(
								{
									userID: clientID
								}
							)
							const clientAmount = price * ( Number(client?.ownPersentage) / 100 )
							wallet?.credit(clientAmount, "Product Sell", orderID, productID)
							console.log("client", clientAmount )

							copyPrice = copyPrice - clientAmount
						})
						.catch(error => {
							console.log(error)
						})
				}

				// sent the rest money to Vendor
				if(paymentMode === "Wallet") {
					vendorWallet?.credit(copyPrice, "Product Sell", orderID, productID)
				}

			})
			.catch(error => {
				console.log(error)
			})

	} catch(error: any){
		console.log(error.message)
	}
}

export default distributeRefferalBonus