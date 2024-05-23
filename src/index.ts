import express from "express"
import ConnectDB from "./lib/db"
import { configDotenv } from "dotenv"
import ApiRouter from "./Routes/Api"
import cookieParser from "cookie-parser"
import logger from "morgan"
import cors from "cors"
import path from "path"

// import fs from 'fs'
// import YAML from 'yaml'
// import swaggerUi from 'swagger-ui'
// import pathToSwaggerUi from 'swagger-ui-dist'

// swaggerUi({
//   dom_id: '#myDomId'
// })

configDotenv()

const app = express()
const port = process.env.PORT ?? 3000
app.use(cors())

app.use(logger("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())


ConnectDB()
// app.use(express.static(path.join(__dirname, "../build")))
app.use(express.static(path.join(__dirname, "../views/deeplink.html")))

app.use("/api", ApiRouter)


// views
app.get("/deeplink", function (req, res) {
	res.sendFile(path.join(__dirname, "../views/deeplink.html"))
})


// const file = fs.readFileSync('./swager.yml', 'utf8')
// const swaggerDocument = YAML.parse(file)
// app.use('/doc', swaggerUi.bind(swaggerDocument))
// var pathToSwaggerUi: any = pathToSwaggerUi.absolutePath()
// app.use(express.static(pathToSwaggerUi))


app.use(function (req, res) {
	res.sendFile(path.join(__dirname, "../build", "index.html"))
	// next(createError(404));
})

app.listen(port, () => {
	console.log(`Server is running on port http://127.0.0.1:${port}`)
})


