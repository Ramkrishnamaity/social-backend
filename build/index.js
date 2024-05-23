"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("./lib/db"));
const dotenv_1 = require("dotenv");
const Api_1 = __importDefault(require("./Routes/Api"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
// import fs from 'fs'
// import YAML from 'yaml'
// import swaggerUi from 'swagger-ui'
// import pathToSwaggerUi from 'swagger-ui-dist'
// swaggerUi({
//   dom_id: '#myDomId'
// })
(0, dotenv_1.configDotenv)();
const app = (0, express_1.default)();
const port = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 3000;
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cookie_parser_1.default)());
(0, db_1.default)();
// app.use(express.static(path.join(__dirname, "../build")))
app.use(express_1.default.static(path_1.default.join(__dirname, "../views/deeplink.html")));
app.use("/api", Api_1.default);
// views
app.get("/deeplink", function (req, res) {
    res.sendFile(path_1.default.join(__dirname, "../views/deeplink.html"));
});
// const file = fs.readFileSync('./swager.yml', 'utf8')
// const swaggerDocument = YAML.parse(file)
// app.use('/doc', swaggerUi.bind(swaggerDocument))
// var pathToSwaggerUi: any = pathToSwaggerUi.absolutePath()
// app.use(express.static(pathToSwaggerUi))
app.use(function (req, res) {
    res.sendFile(path_1.default.join(__dirname, "../build", "index.html"));
    // next(createError(404));
});
app.listen(port, () => {
    console.log(`Server is running on port http://127.0.0.1:${port}`);
});
