var jwt = require("jsonwebtoken")

function verifyToken(req, res, next) {
    try {
        const bearerHeader = req.headers["authorization"]
        if (!bearerHeader) {
            return res.status(404).json({
                message: "No bearer header found. Could not read access token",
            })
        }
        const token = bearerHeader.split(" ")[1]
        if (!token) {
            return res.status(404).json({ message: "Could not read access token" })
        }

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decodedPayload) => {
            if (err) {
                return res.status(401).json({ message: "Unauthorized" })
            }
            console.log("verifyToken decoded:", decodedPayload)

            req.user = decodedPayload
            next()
        })
    } catch (error) {
        next(error)
    }
}

module.exports = verifyToken
