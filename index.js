const express = require('express')
const app = express()
const port = 3000
const data = require('./data/locations.json')

app.get('/getRestaurants', (req, res) => {
    const latitude = req.query.latitude
    const longitude = req.query.longitude
    const searchTerm = req.query.searchTerm ? req.query.searchTerm.toLowerCase() : ""
    const radius = req.query.radius ? req.query.radius : 1000
    const limit = req.query.limit ? req.query.limit : 20
    const offset = req.query.offset ? req.query.offset : 0
    const sortBy = req.query.sortBy ? req.query.sortBy.toLowerCase() : "distance"

    rejectBadInput(res, longitude, latitude, radius, limit, offset, sortBy)

    res.send(searchDB(latitude, longitude))
})

app.listen(port, () => {
    console.log("now listening")
})

function rejectBadInput(res, longitude, latitude, radius, limit, offset, sortBy) {

    // Missing Input
    if (!longitude || !latitude) res.status(400).send({
        status: 400,
        message: "Missing Input: longitude and latitude are required" 
    })

    // Wrong Type
    if (isNaN(longitude) || isNaN(latitude)) res.status(400).send({
        status: 400,
        message: "Wrong Type: longitude and latitude must be numbers" 
    })
    if (isNaN(radius)) res.status(400).send({
        status: 400,
        message: "Wrong Type: radius must be a number" 
    })
    if (isNaN(limit)) res.status(400).send({
        status: 400,
        message: "Wrong Type: limit must be a number" 
    })
    if (isNaN(offset)) res.status(400).send({
        status: 400,
        message: "Wrong Type: offset must be a number" 
    })

    // Wrong Values
    if (limit < 0 || limit > 50) res.status(400).send({
        status: 400,
        message: "Wrong Value: limit must be in range 0..50"
    })
    if (radius < 0) res.status(400).send({
        status: 400,
        message: "Wrong Value: radius must be positive"
    })
    if (!["distance", "rating", "relevancy"].includes(sortBy.toLowerCase())) res.status(400).send({
        status: 400,
        message: "Wrong Value: sortBy must be distance, rating or relevancy"
    })
    if (offset < 0) res.status(400).send({
        status: 400,
        message: "Wrong Value: offset must be positive"
    })
}

function searchDB(latitude, longitude, searchTerm = "all", radius = 1000) {
    // checken nach latitude longitude simple
    var fistBatch = data.filter((entry) => {
        return Math.abs(entry.latitude - latitude) <= 1000 && Math.abs(entry.longitude - longitude) <= 1000
    })

    var legitSpots = fistBatch.filter((entry) => {
        var a = Math.abs(entry.latitude - latitude)
        var b = Math.abs(entry.longitude - longitude)
        var c = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2))
        return c <= 1000
    })
    return legitSpots
}