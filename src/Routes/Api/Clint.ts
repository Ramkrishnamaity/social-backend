import { Router } from "express"
import { changeStatus } from "../../Controlar/Client/Customer"
import { changeCommentStatus, changePostStatus, changeProductStatus, deletePostComment, getPost, getPostComment, getPostLike, getPostReport, getReportPost, getUserProduct } from "../../Controlar/Client/Post"
import { updateAffititedPersentage, viewPersentage } from "../../Controlar/Client/AffilitedPersentage"
import { create, deleteCategory, updateCategory, viewCategory } from "../../Controlar/Admin/category"
import { createSubCategory, deleteSubCategory, updateSubCategory, viewSubCategory } from "../../Controlar/Admin/subCategory"
import CustomerController from "../../Controlar/Customer/Auth"
import { getProfile, getApiKeys, updateProfile } from "../../Controlar/Client/Auth"
import ClientWalletController from "../../Controlar/Client/Wallet"
import ProductController from "../../Controlar/Customer/Product"
import ClientTransactionController from "../../Controlar/Client/Transaction"
import { buySubcription, viewSubcriptionPlan } from "../../Controlar/Admin/Subcription"

const ApiRouter = Router()


/** Profile */
ApiRouter.get("/profile", getProfile)
ApiRouter.put("/profile", updateProfile)
ApiRouter.get("/apikey", getApiKeys)

/** Wallet */
ApiRouter.get("/wallet", ClientWalletController.getBalance)

/** Category */
ApiRouter.post("/category", create)
ApiRouter.get("/category/:page", viewCategory)
ApiRouter.put("/category/:id", updateCategory)
ApiRouter.delete("/category/:id", deleteCategory)

/** Sub Category */
ApiRouter.post("/sub-category", createSubCategory)
ApiRouter.get("/sub-category/:page", viewSubCategory)
ApiRouter.put("/sub-category/:id", updateSubCategory)
ApiRouter.delete("/sub-category/:id", deleteSubCategory)


/** Customer */
ApiRouter.get("/customer", CustomerController.getCustomers)

ApiRouter.get("/customer/refferal/:id", CustomerController.customerWalletHistory)

// ApiRouter.get("/customer/page/:page", getCustomr)
ApiRouter.put("/customer/status/:id", changeStatus)
ApiRouter.get("/post/page/:page", getPost)
// ApiRouter.get("/post", PostController.getPosts)
ApiRouter.get("/product", ProductController.getProducts)
ApiRouter.get("/top-product", ProductController.getTopProducts)
ApiRouter.get("/post/comment/:postID/:page", getPostComment)
ApiRouter.put("/post/status/:id", changePostStatus)
ApiRouter.get("/post/like/:postID/:page", getPostLike) 
ApiRouter.put("/post/comment/status/:id", changeCommentStatus)
ApiRouter.put("/post/comment/delete/:id", deletePostComment)
ApiRouter.get("/post/report/:postID/:page", getPostReport)
ApiRouter.get("/post/report-post/page/:page", getReportPost)
ApiRouter.get("/post/product/:id/:page", getUserProduct)
ApiRouter.put("/post/update-persentage", updateAffititedPersentage)
ApiRouter.get("/post/get-persentage", viewPersentage)
// ApiRouter.get("/post/all-product/page/:page", getAllProduct)
ApiRouter.put("/post/product/status/:id", changeProductStatus)   


ApiRouter.get("/post/:id", CustomerController.getCustomerPost)
ApiRouter.get("/product/customer/:id", CustomerController.getCustomerProduct)
ApiRouter.get("/product/:id", ProductController.getSpecificProduct)

ApiRouter.get("/weekly-transaction", ClientTransactionController.weeklyGraph)
ApiRouter.get("/monthly-transaction", ClientTransactionController.monthlyGraph)
ApiRouter.get("/recent-transaction", ClientTransactionController.lastTransaction)


// subscription
ApiRouter.get("/subcription", viewSubcriptionPlan)
ApiRouter.get("/subcription/:id", buySubcription)



export default ApiRouter

