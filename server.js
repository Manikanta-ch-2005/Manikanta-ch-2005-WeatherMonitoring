require("dotenv").config()

const cookieParser = require("cookie-parser")
const socketIO = require("socket.io")
const express = require("express")
const tarkine = require("tarkine")
const http = require("http")

const app = express()
const server = http.createServer(app)
const io = new socketIO.Server(server)

const PORT = process.env.PORT || 6589

global.IO = io

app.set("view engine", "html")
app.engine("html", tarkine.renderFile)

app.use(cookieParser())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(__dirname + "/public"))
app.use(express.json())

app.use("/", require("./router"))

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`)
})