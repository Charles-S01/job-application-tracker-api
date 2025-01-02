const { Router } = require("express")
const prisma = require("../prisma/prisma")
const verifyToken = require("../verifyToken")
const jobsRouter = Router()
var jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const { v4: uuidv4 } = require("uuid")

jobsRouter.post("/", verifyToken, async (req, res, next) => {
    try {
        const { title, location, company, link, dateApplied, status } = req.body
        const userId = req.user.id
        console.log({ title, location, company, link, dateApplied, status, userId })
        const job = await prisma.job.create({
            data: {
                id: uuidv4(),
                title: title,
                location: location,
                company: company,
                link: link,
                dateApplied: dateApplied,
                status: status,
                userId: userId,
            },
        })

        res.json({ job, message: "job created successfuly" })
    } catch (error) {
        next(error)
    }
})

jobsRouter.get("/:jobId?", verifyToken, async (req, res, next) => {
    try {
        console.log("get jobs")
        const userId = req.user.id
        const { jobId } = req.params
        const { status } = req.query
        console.log("status:", status)

        const jobs = await prisma.job.findMany({
            where: {
                userId: userId,
                ...(jobId && { id: jobId }),
                ...(status && { status: status }),
            },
            orderBy: {
                dateApplied: "desc",
            },
        })
        // console.log("jobs:", jobs)

        res.json({ jobs })
    } catch (error) {
        next(error)
    }
})

jobsRouter.put("/:jobId", verifyToken, async (req, res, next) => {
    try {
        const userId = req.user.id
        const { jobId } = req.params
        const { title, location, company, link, dateApplied, status } = req.body

        const job = await prisma.job.update({
            where: {
                id: jobId,
                userId: userId,
            },
            data: {
                title: title,
                location: location,
                company: company,
                link: link,
                dateApplied: dateApplied,
                status: status,
            },
        })

        res.json({ job })
    } catch (error) {
        next(error)
    }
})

module.exports = jobsRouter
