const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

let charList = ["Naruto_Uzumaki","Sasuke_Uchiha", "Kakashi_Hatake", "Sakura_Haruno", "Jiraiya", "Ebisu", "Gaara", "Iruka_Umino", "Hinata_Hyuga", "Rock_Lee", "Minato_Namikaze", "Kushina_Uzumaki", "Orochimaru", "Zabuza_Momochi", "Haku", "Nagato", "Hidan", "Deidara", "Kabuto_Yakushi", "Kisame_Hoshigaki", "Itachi_Uchiha", "Black_Zetsu", "White_Zetsu", "Danzo_Shimura", "Obito_Uchiha", "Sasori"]
const ultimatArray= []

async function fetchData (url) {
    const result = await axios.get(url)
    return cheerio.load(result.data)
}

async function getResult(url, name) {
    const $ =  await fetchData(url)
    let thisone
    let pulledData = []
    $('#Quotes').each((i, el) => {
        thisone = el.parent
        pulledData.push($(thisone).nextAll('ul').text()) //needs to be nextAll to work 
    })
   formatForReadability(pulledData, name)
}

function formatForReadability(textBody, name) {
    //splits the giant array blob by locating the '[' character then returns a useable array to format
    const quoteAuthor = name.replace('_', ' ')
    let quoteText = ''
    let addressing = ''
    let passages = []
    //this regex needs to be fixed see sakura id 6
    const addressingRegex = /^[(].+?[)] /g
    const excessQuotesRegex = /(["|\s]+$)|(^[\W]+)/gm
    textBody[0].split('[').forEach(function formating(line, i) {
        //this function splits the usable array to multiple lines, if theres more than one line,
        //remove the [0] index (which is just usually something like 323]\n) then join them back together.
        const splitPassage = line.split('\n')
        const _id = i.toString()

        if(splitPassage.length > 1) {
            splitPassage.splice(0,1)
            splitPassage.join('\n')
            quoteText = splitPassage[0].trim()
            quoteText = regexTime(quoteText)
        } else {
            //If it's just one line its still an array at this point, join makes it go from an array to a string.
            splitPassage.join('\n')
            quoteText = splitPassage[0].trim()
            quoteText = regexTime(quoteText)
        }
        if(quoteText == null) {
            return
        }
        passages.push({ quoteAuthor, addressing, quoteText, _id })

    })
    ultimatArray.push(passages)

    function regexTime(quote) {
        if(quote.startsWith("(")) {
            quote = quote.replace(addressingRegex, function addressedTo(cutOut) {
                addressing = cutOut //The bit that was cut out gets saved into the addressing variable
                return ''
            })
        }
        if(quote.includes("…") || quote.includes("’") || quote.includes("ō") || quote.includes("—")) {
            console.log({quote})
            quote = quote.replace(/(…)/g, "...")
            quote = quote.replace(/(’)/g, "'")
            quote = quote.replace(/(ō)/g, "o")
            quote = quote.replace(/(—)/g, "-")
        }
        quote = quote.replace(excessQuotesRegex, "")
        if(quote.length == 0) {
            return;
        }
        return quote;
    }
}

function writeToFile(arr) {
    try {
        fs.writeFileSync('naruto_passages2.json', JSON.stringify(arr, null, 2))
    } catch (err) {
        console.log(err)
    }
}

async function formulatePassages() {
    for(const name of charList) {
        const newURL = `https://naruto.fandom.com/wiki/${name}`;
        await getResult(newURL, name)
    }
    writeToFile(ultimatArray)
}

formulatePassages()
