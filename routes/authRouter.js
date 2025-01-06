const { Router } = require("express")
const prisma = require("../prisma/prisma")
const verifyToken = require("../verifyToken")
const authRouter = Router()
var jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const { v4: uuidv4 } = require("uuid")

// authRouter.post("/signup", async (req, res, next) => {
//     try {
//         const { firstName, lastName, username, password } = req.body

//         const foundUsername = await prisma.user.findUnique({
//             where: {
//                 username: username,
//             },
//         })

//         if (foundUsername) {
//             res.status(400).send("Username already exists")
//         }

//         bcrypt.hash(password, 10, async (err, hashedPassword) => {
//             if (err) return next(err)

//             const user = await prisma.user.create({
//                 data: {
//                     id: uuidv4(),
//                     firstName: firstName,
//                     lastName: lastName,
//                     username: username,
//                     password: hashedPassword,
//                 },
//             })
//             res.json({ user, message: "Successfuly signed up" })
//         })
//     } catch (error) {
//         next(error)
//     }
// })

authRouter.post("/login", async (req, res, next) => {
    try {
        console.log("login")
        const { username, password } = req.body

        const retreivedUser = await prisma.user.findUnique({
            where: {
                username: username,
            },
        })
        if (!retreivedUser) {
            return res.status(400).json({ message: "Invalid username" })
        }

        const match = await bcrypt.compare(password, retreivedUser.password)
        if (!match) {
            return res.status(400).json({ message: "Invalid password" })
        }

        const token = generateAccessToken(retreivedUser)
        const refreshToken = generateRefreshToken(retreivedUser)

        // console.log("token:", token)

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 15 * 24 * 60 * 60 * 1000,
        })

        res.json({ token, message: "successful login" })
    } catch (error) {
        next(error)
    }
})

authRouter.post("/refresh", async (req, res, next) => {
    try {
        console.log("/refresh")
        const refreshToken = req.cookies.refreshToken
        if (!refreshToken) {
            res.status(401).json({ message: "No refresh token found" })
        }

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, function (err, decoded) {
            if (err) {
                return res.status(401).json({ message: "Unable to verify refresh token" })
            }

            const token = generateAccessToken(decoded)

            res.json({ token, message: "New token generated" })
        })
    } catch (error) {
        next(error)
    }
})

function generateAccessToken(user) {
    return jwt.sign({ id: user.id, username: user.username }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "15m",
    })
}

function generateRefreshToken(user) {
    return jwt.sign({ id: user.id, username: user.username }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "15d",
    })
}

module.exports = authRouter
