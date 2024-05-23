import { Router } from "express"
import CustomerController from "../../Controlar/Customer/Auth"
import authZ from "../../lib/service/middleware"
import PostController from "../../Controlar/Customer/Post"
import ProductController from "../../Controlar/Customer/Product"
import CustomerWalletController from "../../Controlar/Customer/Wallet"
import { viewCategory } from "../../Controlar/Admin/category"
import { viewCatSubCat } from "../../Controlar/Admin/subCategory"
import AddressController from "../../Controlar/Customer/Address"
import OrderController from "../../Controlar/Customer/Order"

const ApiRouter = Router()


ApiRouter.use(authZ.CustomerMiddleware)

/** Customer */
ApiRouter.post("/", CustomerController.addCustomer)
ApiRouter.put("/:id", CustomerController.updateCustomer)
ApiRouter.delete("/:id", CustomerController.deleteCustomer)
ApiRouter.get("/profile/:id", CustomerController.getProfile)
ApiRouter.put("/profile/:id", CustomerController.updateProfile)

/** Wallet */
ApiRouter.get("/wallet", CustomerWalletController.getBalance)
ApiRouter.post("/withdraw", CustomerWalletController.moneyWithdraw)

/** post */
ApiRouter.get("/post", PostController.getPosts)
ApiRouter.get("/searchedpost", PostController.getSearchPosts)
ApiRouter.post("/post", PostController.createPost)
ApiRouter.put("/post/:id", PostController.updatePost)
ApiRouter.delete("/post/:id", PostController.deletePost)
ApiRouter.get("/post/:id", PostController.getSinglePost)

/** Post's Like & Comment */
ApiRouter.post("/post/like/:id", PostController.likePost)
ApiRouter.post("/comment", PostController.addComment)
ApiRouter.get("/comment/:id", PostController.getComment)
ApiRouter.put("/comment/:id", PostController.updateComment)
ApiRouter.delete("/comment/:id", PostController.deleteComment)

/** Address */
ApiRouter.get("/address/:id", AddressController.getAddress)
ApiRouter.post("/address", AddressController.addAddress)
ApiRouter.put("/address/:id", AddressController.updateAddress)
ApiRouter.delete("/address/:id", AddressController.removeAddress)

/** Category And Sub Category */
ApiRouter.get("/category", viewCategory)
ApiRouter.get("/sub-category/:id", viewCatSubCat)

/** product */
ApiRouter.get("/product", ProductController.getProducts)
ApiRouter.get("/product/:id", ProductController.getSingleProduct)
ApiRouter.post("/product", ProductController.createProduct)
ApiRouter.put("/product/:id", ProductController.updateProduct)
ApiRouter.put("/product/discount/:id", ProductController.addDiscount)
ApiRouter.delete("/product/:id", ProductController.deleteProduct)

ApiRouter.post("/product/wishList/:id", ProductController.addWishList)
ApiRouter.post("/report", PostController.addReport)

/** My Order */
ApiRouter.get("/wishlist/:id", CustomerController.mywishList)
ApiRouter.get("/myorder/:id", OrderController.myOrder)
ApiRouter.get("/myproductorder/:id", OrderController.myProductOrder)

ApiRouter.get("/order/:id", OrderController.specificOrder)
ApiRouter.put("/order/:id", OrderController.changeStatus)

/** Post Share */
ApiRouter.get("/share/:postID/:userID", PostController.doShare)


/** Product CheckOut */
ApiRouter.post("/checkout", ProductController.productCheckout)


export default ApiRouter
