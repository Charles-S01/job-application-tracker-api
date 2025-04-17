const { Router } = require("express")
const prisma = require("../prisma/prisma")
const verifyToken = require("../verifyToken")
const jobsRouter = Router()
var jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const { v4: uuidv4 } = require("uuid")
const axios = require("axios")
// import axios from "axios"

jobsRouter.post("/", verifyToken, async (req, res, next) => {
    try {
        const { title, location, company, description, link, dateApplied, status } = req.body
        const userId = req.user.id
        // console.log({ title, location, company, link, dateApplied, status, userId })
        const job = await prisma.job.create({
            data: {
                id: uuidv4(),
                title: title,
                description: description,
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

jobsRouter.get("/job/:jobId?", verifyToken, async (req, res, next) => {
    try {
        console.log("get jobs")
        const userId = req.user.id
        const { jobId } = req.params
        const { status, searchInput, sortBy } = req.query
        // console.log("status:", status)
        // console.log("searchInput:", searchInput)

        let job = null
        let jobs = null
        if (jobId) {
            job = await prisma.job.findUnique({
                where: {
                    userId: userId,
                    id: jobId,
                },
            })
        } else {
            jobs = await prisma.job.findMany({
                where: {
                    userId: userId,
                    // ...(jobId && { id: jobId }),
                    ...(status && { status: status }),
                    ...(searchInput && {
                        OR: [
                            {
                                title: {
                                    contains: searchInput,
                                    mode: "insensitive",
                                },
                            },
                            {
                                company: {
                                    contains: searchInput,
                                    mode: "insensitive",
                                },
                            },
                            {
                                location: {
                                    contains: searchInput,
                                    mode: "insensitive",
                                },
                            },
                        ],
                    }),
                },
                orderBy: {
                    ...(sortBy === "dateApplied" && { dateApplied: "desc" }),
                    ...(sortBy === "title" && { title: "asc" }),
                    ...(sortBy === "company" && { company: "asc" }),
                    ...(sortBy === "location" && { location: "asc" }),
                },
            })
        }

        res.json({ jobs: job || jobs })
    } catch (error) {
        next(error)
    }
})

jobsRouter.get("/job-posting", verifyToken, async (req, res, next) => {
    console.log("get job posting")
    try {
        console.log("req.query:", req.query)
        const { link } = req.query
        const options = {
            method: "GET",
            url: "https://fresh-linkedin-profile-data.p.rapidapi.com/get-job-details",
            params: {
                job_url: link,
                include_skills: "false",
                include_hiring_team: "false",
            },
            headers: {
                "x-rapidapi-key": process.env.X_RAPIDAPI_KEY,
                "x-rapidapi-host": "fresh-linkedin-profile-data.p.rapidapi.com",
            },
        }

        try {
            const response = await axios.request(options)
            // console.log("LinkedIn posting:", response.data)
            const data = response.data.data
            const details = {
                title: data.job_title,
                company: data.company_name,
                location: data.job_location,
                description: data.job_description,
            }
            // console.log("details:", details)
            res.json({ details })
        } catch (error) {
            next(error)
        }
    } catch (error) {
        next(error)
    }
})

jobsRouter.put("/:jobId", verifyToken, async (req, res, next) => {
    try {
        const userId = req.user.id
        const { jobId } = req.params
        const { title, location, company, description, link, dateApplied, status } = req.body

        const job = await prisma.job.update({
            where: {
                id: jobId,
                userId: userId,
            },
            data: {
                title: title,
                description: description,
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

jobsRouter.delete("/:jobId", verifyToken, async (req, res, next) => {
    try {
        const { jobId } = req.params
        const userId = req.user.id
        const job = await prisma.job.delete({
            where: {
                userId: userId,
                id: jobId,
            },
        })
        res.json({ job, message: "job deleted" })
    } catch (error) {
        next(error)
    }
})

module.exports = jobsRouter
