const express = require('express')
const app = express()
const port = 3000
const data = require('./data/locations.json')

app.get('/getRestaurants', (req, res) => {
    console.log(req)
    const latitude = req.query.latitude
    const longitude = req.query.longitude
    const searchTerm = req.query.searchTerm
    const size = req.query.size
    const offset = req.query.offset
    const radius = req.query.radius

    if (!checkInput(latitude, longitude, searchTerm)) res.status(400).send({
        status: 400,
        message: "input missing" 
    })

    res.send(searchDB())
})

app.listen(port, () => {
    console.log("now listening")
})

function checkInput(latitude, longitude) {
    return latitude && longitude
}

function searchDB(latitude, longitude, searchTerm = "all", radius = 1000) {
    return data
}