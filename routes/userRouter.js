const { Router } = require("express")
const prisma = require("../prisma/prisma")
const verifyToken = require("../verifyToken")
const userRouter = Router()
var jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const { v4: uuidv4 } = require("uuid")

userRouter.post("/", async (req, res, next) => {
    try {
        const { firstName, lastName, username, password } = req.body

        const foundUsername = await prisma.user.findUnique({
            where: {
                username: username,
            },
        })

        if (foundUsername) {
            res.status(400).json({ message: "Username already exists" })
        }

        bcrypt.hash(password, 10, async (err, hashedPassword) => {
            if (err) return next(err)

            const user = await prisma.user.create({
                data: {
                    id: uuidv4(),
                    firstName: firstName,
                    lastName: lastName,
                    username: username,
                    password: hashedPassword,
                },
            })
            res.json({ user, message: "successfuly signed up" })
        })
    } catch (error) {
        next(error)
    }
})

userRouter.get("/", verifyToken, async (req, res, next) => {
    try {
        const userId = req.user.id
        // console.log("req.user.id =", userId)

        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            include: {
                _count: {
                    select: { jobs: { where: { status: "applied" } } },
                },
            },
        })
        if (!user) {
            return res.status(401).json({ message: "could not get user" })
        }
        // console.log("get /user user:", user)

        res.json({ user })
    } catch (error) {
        next(error)
    }
})

userRouter.put("/", verifyToken, async (req, res, next) => {
    try {
        const userId = req.user.id
        const { firstName, lastName } = req.body

        const user = await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                firstName: firstName,
                lastName: lastName,
            },
        })

        res.json({ user, message: "user updated" })
    } catch (error) {
        next(error)
    }
})

module.exports = userRouter
