const { Router } = require("express")
const prisma = require("../prisma/prisma")
const verifyToken = require("../verifyToken")
const jobsRouter = Router()
var jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const { v4: uuidv4 } = require("uuid")

jobsRouter.post("/", verifyToken, async (req, res, next) => {
    try {
        const { title, location, company, link, status } = req.body
        const userId = req.user.id

        const job = await prisma.job.create({
            data: {
                id: uuidv4(),
                title: title,
                location: location,
                company: company,
                link: link,
                status: status,
                userId: userId,
            },
        })

        res.json({ job, message: "job created successfuly" })
    } catch (error) {
        next(error)
    }
})

module.exports = jobsRouter
