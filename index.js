const express = require('express')
const fetch = require('node-fetch')
const app = express()
const port = 3000
const data = require('./data/locations.json')
const relevantSuperSynsets = ["Essen", "Gericht", "Mahlzeit", "Speise", "Sättigungsbeilage", "Backware"]

app.get('/getRestaurants', async (req, res) => {
    const latitude = req.query.latitude
    const longitude = req.query.longitude
    const searchTerm = req.query.searchTerm ? req.query.searchTerm.toLowerCase() : ""
    const radius = req.query.radius ? req.query.radius : 1000
    const limit = req.query.limit ? req.query.limit : 20
    const offset = req.query.offset ? req.query.offset : 0
    const sortBy = req.query.sortBy ? req.query.sortBy.toLowerCase() : "distance"

    rejectBadInput(res, longitude, latitude, radius, limit, offset, sortBy)

    const synonymSets = await buildSynonymList(searchTerm.split(','))

    const foundData = searchDB(longitude, latitude, synonymSets, radius, limit, offset, sortBy)
    res.send(foundData)
})

async function buildSynonymList(searchTerms) {
    const synonymSets = []
    if (searchTerms.length !== 0) {
        for (const term of searchTerms) {
            const synonymSet = new Set()
            const response = await fetch(`https://www.openthesaurus.de/synonyme/search?q=${term}&format=application/json&supersynsets=true`, {
                method: "GET"
            })
            const json = await response.json()

            const filtered = json.synsets.filter(synset => {
                const res1 = synset.supersynsets.find(supersynsetArr => {
                    res2 = supersynsetArr.find(entry => relevantSuperSynsets.includes(entry.term))
                    return res2
                })
                return res1
            })
            filtered.forEach(synset => {
                synset.terms.forEach(term => {
                    synonymSet.add(term.term.toLowerCase())
                })
            })
            synonymSet.add(term.toLowerCase())
            synonymSets.push(synonymSet)
        }
    }
    return synonymSets
}

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

function searchDB(longitude, latitude, searchTerms, radius, limit, offset, sortBy) {
    let selection = filterDistance(data, longitude, latitude, radius)

    let menuSelection = []
    let highlightMap = new Map()
    searchTerms.forEach((categorySet, setIndex) => {
        categorySet.forEach(term => {
            let termSelection = []
            if(term !== '') termSelection = filterMenu(selection, term)
            const newItems = termSelection.filter(selection => {
                let newItem = true
                let indexList = [setIndex]
                if (highlightMap.has(selection.id)) {
                    indexList.push(...highlightMap.get(selection.id))
                    newItem = false
                }
                highlightMap.set(selection.id, indexList)
                return newItem
            })
            menuSelection.push(...newItems)
        })
    })
    menuSelection.forEach(selection => {
        selection.highlight = highlightMap.has(selection.id) && highlightMap.get(selection.id).length === searchTerms.length
    })

    menuSelection = sortSelectionBy(menuSelection, sortBy)

    menuSelection = limitSelection(menuSelection, limit, offset)

    return menuSelection
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

function limitSelection(data, limit, offset) {
    const start = offset * limit
    const legitSpots = data.slice(start, start + limit)
    return legitSpots
}