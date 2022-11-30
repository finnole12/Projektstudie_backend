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

    const foundData = searchDB(longitude, latitude, searchTerm, radius, limit, offset, sortBy)
    res.send(foundData)
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
    if (!["distance", "rating", "relevancy"].includes(sortBy)) res.status(400).send({
        status: 400,
        message: "Wrong Value: sortBy must be distance, rating or relevancy"
    })
    if (offset < 0) res.status(400).send({
        status: 400,
        message: "Wrong Value: offset must be positive"
    })
}

function searchDB(longitude, latitude, searchTerm, radius, limit, offset, sortBy) {
    let selection = filterDistance(data, longitude, latitude, radius)

    if(searchTerm !== '') selection = filterMenu(selection, searchTerm)

    selection = sortSelectionBy(selection, sortBy)

    selection = limitSelection(selection, limit, offset)

    return selection
}

function filterDistance(data, longitude, latitude, radius) {
    var legitSpots = data.reduce((filtered, entry) => {
        let inRadius = true
        var a = Math.abs(entry.latitude - latitude)
        inRadius = a <= radius
        if (inRadius) {
            var b = Math.abs(entry.longitude - longitude)
            inRadius = b <= radius

            if (inRadius) {
                entry.distance = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2))
                inRadius = entry.distance <= radius
            }
        }

        if (inRadius) {
           filtered.push(entry);
        }
        return filtered;
      }, []);

    return legitSpots
}

function filterMenu(data, searchTerm) {
    const legitSpots = data.filter((entry) => {
        return !!entry.menu.find(item => item.name.toLowerCase() === searchTerm)
    })
    return legitSpots
}

function sortSelectionBy(data, sortBy) {
    var cmprFunction
    switch (sortBy) {
        case 'distance':
            cmprFunction = (a, b) => a.distance - b.distance
            break;
        case 'rating':
            break;
        case 'relevancy':
            break;
        default:
          console.log(`Sorry, we are out of ${expr}.`);
    }

    return data.sort(cmprFunction)
}