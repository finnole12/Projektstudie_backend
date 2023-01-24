const mathjs = require("mathjs")

var data = []

// data 
// 10km around fh wedel
const maxLong = 9.9
const minLong = 9.56
const maxLat = 53.68
const minLat = 53.48

const logoURLs = [
    "https://cdn-icons-png.flaticon.com/256/8124/8124851.png",
    "https://images.vexels.com/media/users/3/128437/isolated/lists/2dd809b7c15968cb7cc577b2cb49c84f-pizza-food-restaurant-logo.png",
    "https://cdn-icons-png.flaticon.com/256/7207/7207389.png",
    "https://d3jmn01ri1fzgl.cloudfront.net/photoadking/webp_thumbnail/6108e9f1c5f9f_json_image_1627974129.webp",
    "https://d3jmn01ri1fzgl.cloudfront.net/photoadking/webp_thumbnail/610bc8e1a4bee_json_image_1628162273.webp",
    "https://d3jmn01ri1fzgl.cloudfront.net/photoadking/webp_thumbnail/5f0948733248d_template_image_1594443891.webp",
    "https://cdn-icons-png.flaticon.com/256/7207/7207387.png",
    "https://cdn-icons-png.flaticon.com/256/7207/7207386.png",
    "https://i.pinimg.com/474x/59/69/a9/5969a97e1f7773da34bfb30c47a52c2b.jpg",
    "https://lh3.googleusercontent.com/dxxKrSVewk0fpqIrruFplEdaNtC6e7VMXPqC3Vu9oDkR_mpTyWkRF_JvgWOWXWwNIc7M6iw8ZO4IizpMmRBDZ2qRvo8=w256-rw",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlFdW6420U5NXLKqDOVY9OfBImWUq-C8AgGw&usqp=CAU",
]

const imageURLs = [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Restaurant_N%C3%A4sinneula.jpg/1200px-Restaurant_N%C3%A4sinneula.jpg",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmziKfGuCX3JWOETJSuiDSGIC5Hb6nd18ItQ&usqp=CAU",
    "https://muehlensteinwedel.de/wp-content/uploads/2019/06/2019-06-11-Restaurant-M%C3%BChlenstein-Wedel-Burger-Pizza-Brunch-Mittagstisch-Biggest-Burger-Wedel.jpg",
    "https://lh5.googleusercontent.com/p/AF1QipMKjTjPyx08HtAH97dlxr9TVvCSDVWrLn4ZCZMQ=w408-h306-k-no",
    "https://lh5.googleusercontent.com/p/AF1QipOxKTCDaRxsDAM_S-qfnqDnLXBsG-SFZuEx2NGP=w408-h271-k-no",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQG5ucdZ3zelEkM5TO1jKW2XjKFTKN1LGYZyA&usqp=CAU",
    "https://restaurantfriedrich.de/wp-content/uploads/2017/11/friedrich_header_startseite_1-1200x677.jpg",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsiW1jRyCHuhOGpIh0Vt9d8ULoZCrARhhq0A&usqp=CAU",
    "https://www.europapark.de/sites/default/files/import/gastronomy/715/harborside_bell_rock_01.jpg",
    "https://roots-halle.de/wp-content/uploads/2022/12/restaurant-roots-halle-saale-moderne-kueche",
    "https://media-cdn.tripadvisor.com/media/photo-s/22/33/a4/94/caption.jpg",
    "https://www.restaurant-filterhaus.de/wp-content/uploads/2019/09/Restaurant-Filterhaus-Terrasse-Abend2-1900x1021.jpg",
    "https://assets-v2.porsche.com/-/media/Project/PCOM/SharedSite/PorscheMuseum/06Gastronomie/13-5_Christophorus_001-Hero_Christophorus.jpg?rev=f5cfde738a584a28aa3bb5befaae7f1d&w=1299"
]

const foods = [
    "currywurst",
    "fritten",
    "burger",
    "pizza",
    "brot",
    "sushi",
    "nudeln",
    "ketchup",
    "senf",
    "labskaus",
    "suppe",
    "möhren",
    "croque",
    "getränk",
    "döner",
    "reis",
    "bier",
    "wein",
    "braten",
    "hähnchen",
    "rind",
    "bockwurst",
    "bratwurst",
    "salat",
    "bowl",
    "gemüse",
    "fisch",
    "lachs",
    "Brötchen",
    "fishbrötchen",
    "lasagne",
    "bagel",
    "donut",
    "kuchen",
    "franzbrötchen",
    "baguette",
    "essig",
    "croissant",
    "thai",
    "schnitzel",
    "ente"
]
const maxPrice = 20
const minPrice = 3

const ratingTexts = [
    "bester ketchup aber die luftfeuchtigkeit lag bei über 45% :(",
    "ok",
    "best",
    "nö",
    "nie werder",
    "super bester typ der koch",
    "lecker wie immer",
    "freundlichee behandelt hier",
    "schöne wanddeko und essen ist auch im rahmen",
    "personal geht gar nicht",
    "kein nutella !!!111!!11!1",
    ":)",
    ":(",
    "I am from the UK and visited the cafe with a friend two weeks ago. While the food and setting were lovely, the way we were treated by a member of staff ruined the whole experience. When we went inside to choose a cake, we were confronted with a leering, arrogant, obnoxious lady. She told us, in a very condescending manner, that we didn't need to wear masks. It should be noted that she was the ONLY member of staff not wearing one! We stated that out of consideration for others, we would prefer to wear them. For this she seems to have took an immediate dislike to us. When we complained that the coffee she served us was cold, she proceeded to make passive aggressive remarks and derogatory comments about us to other colleagues. These were overheard by my friend who is a lot more proficient in German than I am, and who understood every word. Sadly we felt uncomfortable the entire time and made an early exit.",
    "Absolut empfehlenswert. Bei einem Imbiss sind mir Sauberkeit und Qualität sehr wichtig, beides ist hier perfekt - und das Team ist sehr freundlich. Von Blankenese nach Altona kann es wegen eines Döners auch nicht immer sein, insofern bin ich froh, dass es hier so gut geschmeckt hat. Nächstes Mal probiere ich die Pizza, die soll auch sehr gut sein.",
    "Was kann man nich dazu sagen, vergammelte Borek!!!!! Nur für Gesundheits Inspektion",
    "Leider war der Mixteller richtig schlecht. Irgendwelche nicht definierbare Fleischstücke die tiefgefroren in die Fritteuse geworfen dadurch blubberte das Heiße Fett ordentlich und die Geräuschkulisse war extrem laut. Das Kebabfleisch war lauwarm nur die Pommes-frites waren heiß.. Das alleine reicht aber nicht um ein zweites Mal dort hinzugehen. SCHADE, aber wahrscheinlich üben die Besitzer noch..",
    "hat schlecht angefangen und dann noch stark abgelassen",
    "mit einem lächeln serviert",
    "foi realmente ótimo"
]

// fill data randomly
for (let i = 0; i < 100; i++) {
    const obj = {
        "id": i,
        "name": "testEntry" + i,
        "latitude": minLat + Math.random() * (maxLat - minLat),
        "longitude": minLong + Math.random() * (maxLong - minLong),
        "phonenumber": "+49 " + `${Math.floor(10000000 + Math.random() * 90000000)}`,
        "logo": logoURLs[mathjs.randomInt(logoURLs.length)],
        "picture": imageURLs[mathjs.randomInt(imageURLs.length)],
        "price_range": mathjs.randomInt(3) + 1,
        "menu": (() => {
            const menuArr = []
            for (let i2 = 0; i2 < (mathjs.randomInt(10) + 4); i2++) {
                menuArr.push({
                    name: foods[mathjs.randomInt(foods.length)],
                    price: (minPrice + Math.random() * (maxPrice - minPrice)).toFixed(2)
                })
            }
            return menuArr
        })(),
        "ratings": (() => {
            const ratingsArr = []
            for (let r = 0; r < (mathjs.randomInt(10) + 4); r++) {
                ratingsArr.push({
                    rating: mathjs.randomInt(5) + 1,
                    text: ratingTexts[mathjs.randomInt(ratingTexts.length)]
                })
            }
            return ratingsArr
        })()
    }
    data.push(obj)
}



// write data to file

var json = JSON.stringify(data)

var fs = require("fs")
fs.writeFile("newFile.json", json, 'utf8', function nothing(err, data) {})

//function getRandomInt(max) => {
//    return return Math.floor(Math.random() * max)
//}