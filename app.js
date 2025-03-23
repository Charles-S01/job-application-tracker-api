const path = require("node:path")
require("dotenv").config()
const express = require("express")
const prisma = require("./prisma/prisma")
const routes = require("./routes")
const cors = require("cors")
const cookieParser = require("cookie-parser")

const app = express()

app.use(
    cors({
        origin: process.env.ORIGIN_URL,
        credentials: true,
    })
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use("/auth", routes.authRouter)
app.use("/user", routes.userRouter)
app.use("/jobs", routes.jobsRouter)
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send("Internal server error!")
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log("Server listening on port " + PORT)
})
