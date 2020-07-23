let freshQuote
let ind = 0
let countdown;
let currLetterIndex = 0

const quotes = 'https://quote-garden.herokuapp.com/api/v2/quotes/random';
const displayAuthor = document.querySelector('.quote-author')
const displayText = document.querySelector('.quote-text')
const typeArea = document.querySelector('.type-area') 
const gameToggle = document.querySelector('.btn-start').addEventListener('click', startGame)
const timer = document.querySelector('.timer')
const quoteBody = displayText.childNodes[2]
const completedWord = document.querySelector('.complete')
const highlightedLetter = document.querySelector('.highlight')

function startGame() {
    typeArea.disabled = true
    quoteBody.textContent = 'Fetching quote...'
    typeArea.placeholder = ''
    completedWord.textContent = ''
    highlightedLetter.textContent = ''
    
    currLetterIndex = 0
    ind = 0
    fetch(quotes)
    .then((res) => {
        return res.json()
    })
    .then(resp => {
        if (resp.quote.quoteText.split(' ').length < 19) {
            console.log('short one')
        }
        else if (resp.quote.quoteText.split(' ').length >= 19) {
            console.log('long one')
        }
        freshQuote = resp.quote
        displayToScreen()
        //start a timer tracking the start of game till the user finishes.
        typeArea.addEventListener('input', typeChecker)
        // typeArea.addEventListener('input', currLetterHighlight)
        gameCountdown(4000)
    })
}

function displayToScreen() {
    displayAuthor.textContent = freshQuote.quoteAuthor + ' -'
    quoteBody.textContent = freshQuote.quoteText
}
        
function typeChecker(e) {
    let wordsToTypeArr = freshQuote.quoteText.split(' ')
    let typedWordLength = wordsToTypeArr[ind].length;
    //deletes entire typed entry only if the input is fully cleaned
    if(e.inputType =='deleteWordBackward' && e.target.value == '') {
        currLetterIndex = 0;
        quoteBody.textContent = highlightedLetter.textContent.concat(quoteBody.textContent)
        highlightedLetter.textContent = ''
    }
    //handle backspace
    if(e.inputType == 'deleteContentBackward' && !currLetterIndex <= 0) {
        currLetterIndex--
        let removedLetter = highlightedLetter.textContent.substring(currLetterIndex)
        let remainingLetter = highlightedLetter.textContent.substring(currLetterIndex, -1)
        quoteBody.textContent = removedLetter.concat(quoteBody.textContent) 
        highlightedLetter.textContent = remainingLetter       
    }
    //handles recognition of the first charcter of the curr word to highlight
    //deletecontentbackwards is necessary to prevent duplicating first character and wrecking shit
    if(e.target.value == wordsToTypeArr[ind][0] && e.inputType != 'deleteContentBackward') {
        highlightedLetter.textContent += e.target.value[0]
        quoteBody.textContent = quoteBody.textContent.slice(1)
        currLetterIndex++        
    } 
    //handle recognition of the rest of the word
    if(e.target.value[currLetterIndex] == wordsToTypeArr[ind][currLetterIndex] && e.target.value[currLetterIndex] != undefined) {
        highlightedLetter.textContent += e.target.value[currLetterIndex]
        quoteBody.textContent = quoteBody.textContent.slice(1)
        currLetterIndex++
    }
    //handle successful completion of word being typed
    if(e.target.value === wordsToTypeArr[ind].padEnd(typedWordLength + 1)) {
        completedWord.insertAdjacentText('beforeend', wordsToTypeArr[ind].padEnd(typedWordLength + 1) ) 
        quoteBody.textContent = quoteBody.textContent.trim() 
        highlightedLetter.textContent = ''
        currLetterIndex = 0
        ind++
        typeArea.value = ''
    }
    //handles player successfully competing the final word of the quote.
    if(wordsToTypeArr.length == ind + 1 && e.target.value == wordsToTypeArr[ind]) {
        completedWord.insertAdjacentText('beforeend', wordsToTypeArr[ind].padEnd(typedWordLength + 1) ) 
        highlightedLetter.textContent = ''
        quoteBody.textContent = ''
        typeArea.value = ''
        clearInterval(countdown)
        setTimeout(endGame, 300, {cleared: true}) //short buffer before the end to keepup with user keystrokes
    }
}

function gameCountdown(timeTillStart) {
    clearInterval(countdown)
    const now = Date.now();
    const then = now + timeTillStart
    countdown = setInterval(() => {
        const secondsLeft = Math.round((then - Date.now()) / 1000 )
        if(secondsLeft <= 0) {
            timer.textContent = '00:00' //sets the timer to 0 manually so it doesnt get stuck at :01
            typeArea.disabled = false
            typeArea.focus()
            // dont clear timeout here, we use the negatives to count upwards
        }
        displayTime(secondsLeft)
    }, 100)
}

function displayTime(seconds) {
    const secondsElapsed = Math.abs(seconds)
    const minutes = Math.floor(secondsElapsed / 60)
    const postiveSeconds = Math.abs(secondsElapsed) % 60
    if(secondsElapsed >= 120) {
        clearInterval(countdown)
        setTimeout(endGame, 100, {cleared: false})
    }
    if(seconds < 0) {
        calcWPM(secondsElapsed)
        timer.textContent = `${secondsElapsed < 60 ? '00' : minutes < 10 ? '0' + minutes : minutes }:${postiveSeconds < 10 ?  '0' : ''}${postiveSeconds}`
    }
    // time till start
    else {
        timer.textContent = `00:${seconds < 10 ? '0' : ''}${seconds}`
    }
}

function calcWPM(seconds) {
    const showWPM = document.querySelector('.user-wpm')
    const quoteLength = freshQuote.quoteText.split(' ').length
    const timeElapsed = seconds / 60
    const wpm = quoteLength / timeElapsed
    showWPM.textContent = `WPM: ${wpm.toFixed()}.`
}

function endGame(res) {
    console.log(res)
    typeArea.placeholder = 'Play again?'
    if(res.cleared == false) {
        alert('bruh')
        return;
    }
    if(res.cleared == true) {
        alert('Congrats!')
        return;
    }
}