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

function formatForReadability(textBody, quoteAuthor) {
    //splits the giant array blob by locating the '[' character then returns a useable array to format
    let quoteText = ''
    let addressing = ''
    let passages = []
    textBody[0].split('[').forEach(function formating(line, i) {
        //this function splits the usable array to multiple lines, if theres more than one line,
        //remove the [0] index (which is just usually something like 323]\n) then join them back together.
        const regex = /^[(].+[)]\s/g
        const splitPassage = line.split('\n')
        const id = i.toString()
        
        if(splitPassage.length > 1) {
            splitPassage.splice(0,1)
            splitPassage.join('\n')
            quoteText = splitPassage[0].trim()
            //perhaps handle regex on the frontend to simplify this function. might be easier to manipulate that way too.
            if(quoteText.startsWith('(')) {
                quoteText = quoteText.replace(regex, function addressedTo(cutOut) {
                    addressing = cutOut
                    return ''
                })
            }
            if(quoteText.length == 0) {
                return;
            }
            return  passages.push({ quoteAuthor, addressing, quoteText, id })
        }
        
        splitPassage.join('\n')
        quoteText = splitPassage[0].trim() 
        if(quoteText.startsWith('(')) {
            quoteText = quoteText.replace(regex, function addressedTo(cutOut) {
                //if there is a (Xchar to yChar) text cut it out and replace it with and empty string. assign the cutOut to addressing variable.
                addressing = cutOut
                return ''
            })
        }
        if(quoteText.length == 0) {
            return;
        }
        return passages.push({ quoteAuthor, addressing, quoteText, id })
    })
    ultimatArray.push(passages)
}

function writeToFile(arr) {
    try {
        fs.writeFileSync('naruto_passages.json', JSON.stringify(arr, null, 2))
    } catch (err) {
        console.log(err)
    }
}

async function formulatePassages() {
    for (const name of charList) {
        const newURL = `https://naruto.fandom.com/wiki/${name}`;
        await getResult(newURL, name)
    }
    writeToFile(ultimatArray)
}

formulatePassages()
