const express = require('express')
const fetch = require('node-fetch')
const haversine = require('haversine-distance')

const app = express()
const port = 3000
const data = require('./data/locations.json')
const sortMethods = ["distance", "rating", "price", "popularity"]
const relevantSuperSynsets = ["Essen", "Gericht", "Mahlzeit", "Speise", "Sättigungsbeilage", "Backware", "Sauce", "Dip"]

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

    try {
        const foundData = searchDB(longitude, latitude, synonymSets, radius, limit, offset, sortBy)
        res.send(foundData)
    } catch (e) {
        console.log(e.message)
    }
})

async function buildSynonymList(searchTerms) {
    const synonymSets = []
    for (const term of searchTerms) {
        if (term !== "") {
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
    if (limit < 0 || limit > 100) res.status(400).send({
        status: 400,
        message: "Wrong Value: limit must be in range 0..100"
    })
    if (radius < 0) res.status(400).send({
        status: 400,
        message: "Wrong Value: radius must be positive"
    })
    if (!sortMethods.includes(sortBy)) res.status(400).send({
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

    let menuSelection = filterSearchTerm(selection, searchTerms)

    menuSelection = sortSelectionBy(menuSelection, sortBy)

    menuSelection = limitSelection(menuSelection, limit, offset)

    return menuSelection
}

function filterSearchTerm(selection, searchTerms) {
    let menuSelection = []
    let highlightMap = new Map()
    
    if (searchTerms.length !== 0) {
        searchTerms.forEach((categorySet, setIndex) => {
            categorySet.forEach(term => {
                let termSelection = []
                termSelection = term !== '' ? filterMenu(selection, term) : selection
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
    } else {
        menuSelection = selection
    }
    
    // set highlight and avg_rating
    menuSelection.forEach(selection => {
        selection.highlight = highlightMap.has(selection.id) && highlightMap.get(selection.id).length === searchTerms.length
        selection.avg_rating = selection.ratings.reduce((sum, current) => {
            return sum + current.rating
        }, 0) / selection.ratings.length
    })

    return menuSelection
}

function filterDistance(data, longitude, latitude, radius) {
    var legitSpots = data.reduce((filtered, entry) => {

        var pOrigin = {lat: latitude, lng: longitude}
        var pLocation = {lat: entry.latitude, lng: entry.longitude}
        var distance = haversine(pOrigin, pLocation) / 1000

        if (distance > radius) return filtered

        entry.distance = distance
        filtered.push(entry);
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
    var specificCompFunc
    const cmprFunction = (a, b) => {
        const higlightCmpr = Number(b.highlight) - Number(a.highlight)
        if (higlightCmpr !== 0) return higlightCmpr
        return specificCompFunc(a, b)
    }
    switch (sortBy) {
        case 'distance':
            specificCompFunc = (a, b) => a.distance - b.distance
            break;
        case 'rating':
            specificCompFunc = (a, b) => b.avg_rating - a.avg_rating
            break;
        case 'popularity':
            specificCompFunc = (a, b) => b.ratings.length - a.ratings.length
            break;
        case 'price':
            specificCompFunc = (a, b) => a.price_range - b.price_range
            break;
        default:
          throw "failed to validate sort method"
    }
    return data.sort(cmprFunction)
}

function limitSelection(data, limit, offset) {
    const start = offset * limit
    const legitSpots = data.slice(start, start + limit)
    return legitSpots
}