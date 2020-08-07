const game = deepJS()

const modeSelect = document.querySelector('.quote-select')
const gameToggle = document.querySelector('.btn-start').addEventListener('click', game.setupGame)


function deepJS() {
    const publicAPI = { setupGame , gameMode }
    
    let freshQuote
    let ind = 0
    let countdown;
    let currLetterIndex = 0
    let gameBegins = false
    let state = {}

    const finish = gameOver()
    const quotes = 'https://quote-garden.herokuapp.com/api/v2/quotes/random';
    const displayAuthor = document.querySelector('.quote-author')
    const displayText = document.querySelector('.quote-text')
    const addressing = document.querySelector('.addressing')
    const typeArea = document.querySelector('.type-area') 
    const timer = document.querySelector('.timer')
    const quoteBody = displayText.childNodes[2]
    const completedWord = document.querySelector('.complete')
    const highlightedLetter = document.querySelector('.highlight')
    const showWPM = document.querySelector('.user-wpm')
    const progress = document.querySelector('.progress-bar')

    const sesAverage = document.querySelector('.session-average')


return publicAPI /* ---------------------------------------------------------------------------------- */

    function gameMode() {
        const modes = [normalMode, narutoMode]
        state = {['mode'] : modeSelect.selectedIndex}
        console.log(state)
        if(state.mode == 0) {
            return modes[Math.floor(Math.random() * modes.length)]
        }
        return modes[state.mode - 1]
    }

    function setupGame() {
        clearInterval(countdown)
        gameBegins = false
        typeArea.disabled = true
        quoteBody.textContent = 'Fetching quote...'
        typeArea.value = ''
        typeArea.placeholder = ''
        completedWord.textContent = ''
        highlightedLetter.textContent = ''
        showWPM.textContent = "Begin a game to calculate."
        progress.style.width = '0%'
        progress.textContent = ''

        currLetterIndex = 0
        ind = 0
        const mode = gameMode()
        mode == narutoMode ? setTimeout(narutoMode, Math.floor(Math.random() * 1000)) : mode() //I want to delay lol
    }

    function narutoMode() {
        fetch('https://raw.githubusercontent.com/Sanj-sanj/DoYouEvenType/master/scripts/naruto_passages.json')
        .then(res => {
            // console.log(res)
            return res.json()
        })
        .then((list) => {
            // console.log(list)
            const rngCharacter = list[Math.floor(Math.random() * list.length)]
            const rngQuote = rngCharacter[Math.floor(Math.random() * rngCharacter.length)]
            // console.log(rngQuote.quoteText)
            freshQuote = rngQuote
            const check = /([^\w\d\s.\\"&,.;:'/()|!?-])/.test(rngQuote.quoteText)
            if(check) {
                console.log(`found one: ${freshQuote.quoteAuthor} ${freshQuote.id}`)
                return setupGame()
            }
            displayToScreen()
            typeArea.addEventListener('input', typeChecker)
            gameCountdown(5000)

        })
    }

    function normalMode() {
        fetch(quotes)
        .then((res) => {
            return res.json()
        })
        .then(resp => {
            // console.log(resp)
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
            gameCountdown(5000)
        })
    }

    function displayToScreen() {
        displayAuthor.textContent = `${freshQuote.quoteAuthor}: ${freshQuote.addressing == null ? '' : freshQuote.addressing }`
        quoteBody.textContent = freshQuote.quoteText
        // addressing.textContent = freshQuote.addressing
    }
            
    function typeChecker(e) {
        let wordsToTypeArr = freshQuote.quoteText.split(' ')
        let typedWordLength = wordsToTypeArr[ind].length;
        //deletes entire typed entry only if the input is fully cleaned

        if(e.inputType == 'deleteWordBackward' ) {
            currLetterIndex = e.target.value.length;
            const removed = highlightedLetter.textContent.substring(currLetterIndex, highlightedLetter.length)
            //if the user typed extra words this prevents the func from adding in duplicates of highlighted word.
            if(!removed == '') {
                quoteBody.textContent = removed.concat(quoteBody.textContent)
                highlightedLetter.textContent = e.target.value
            }
        }
        //handle backspace
        if(e.inputType == 'deleteContentBackward' && !currLetterIndex == 0) {
            currLetterIndex--
            let removedLetter = highlightedLetter.textContent.substring(currLetterIndex)
            let remainingLetter = highlightedLetter.textContent.substring(currLetterIndex, - 1)
            quoteBody.textContent = removedLetter.concat(quoteBody.textContent) 
            highlightedLetter.textContent = remainingLetter       
        }
        //handle recognition of the rest of the word
        if(e.target.value[currLetterIndex] == wordsToTypeArr[ind][currLetterIndex] && e.target.value[currLetterIndex] != undefined) {
            highlightedLetter.textContent += e.target.value[currLetterIndex]
            quoteBody.textContent = quoteBody.textContent.slice(1)
            currLetterIndex++
        }
        //handle successful completion of word being typed
        if(e.target.value === wordsToTypeArr[ind].padEnd(typedWordLength + 1)) {
            completedWord.insertAdjacentText('beforeend', wordsToTypeArr[ind].padEnd(typedWordLength + 1)) 
            quoteBody.textContent = quoteBody.textContent.trim() 
            highlightedLetter.textContent = ''
            currLetterIndex = 0
            ind++
            typeArea.value = ''
            // updateProg(wordsToTypeArr)

        }
        //handles player successfully competing the final word of the quote.
        if(wordsToTypeArr.length == ind + 1 && e.target.value == wordsToTypeArr[ind]) {
            completedWord.insertAdjacentText('beforeend', wordsToTypeArr[ind].padEnd(typedWordLength + 1)) 
            highlightedLetter.textContent = ''
            quoteBody.textContent = ''
            typeArea.value = ''
            clearInterval(countdown)
            updateProg(wordsToTypeArr.length)
            //short buffer before the end to keepup with user keystrokes
            setTimeout(finish, 300, { cleared: true }) 
        }
    }

    function gameCountdown(timeTillStart) {
        // clearInterval(countdown)
        displayTime(timeTillStart / 1000)
        const now = Date.now();
        const then = now + timeTillStart
        countdown = setInterval(() => {
            const secondsLeft = Math.round((then - Date.now()) / 1000 )
            if(gameBegins) {
                calcWPM(Math.abs(secondsLeft))
                if(Math.abs(secondsLeft) == 180) {
                    clearInterval(countdown)
                    setTimeout(finish, 100, {cleared: false})
                }
            }
            if(secondsLeft == 0) {
                timer.textContent = 'Time: 00:00' //sets the timer to 0 manually so it doesnt get stuck at :01
                typeArea.disabled = false
                typeArea.focus()
                gameBegins = true
                // dont clear timeout here, we use the negatives to count upwards
            }
            displayTime(secondsLeft)
        }, 1000)
    }

    function displayTime(seconds) {
        const secondsElapsed = Math.abs(seconds)
        const minutes = Math.floor(secondsElapsed / 60)
        const postiveSeconds = Math.abs(secondsElapsed) % 60
        if(seconds < 0) {
            timer.textContent = `Time: ${secondsElapsed < 60 ? '00' : minutes < 10 ? '0' + minutes : minutes }:${postiveSeconds < 10 ?  '0' : ''}${postiveSeconds}`
        }
        // time till start
        else {
            timer.textContent = `Time: 00:${seconds < 10 ? '0' : ''}${seconds}`
        }
    }

    function calcWPM(seconds) {
        const quoteLength = freshQuote.quoteText.split(' ').length
        const timeElapsed = seconds / 60
        const wpm = quoteLength / timeElapsed
        showWPM.textContent = `WPM: ${wpm.toFixed()}.`
        finish(wpm)
        updateProg(quoteLength)
    }

    function updateProg(quoteLen) {
        // quoteLen = quoteLen.length
        const wordsDone = completedWord.textContent.split(' ').length - 1
        const progPercent = wordsDone / quoteLen * 100
        progress.textContent = `${progPercent.toFixed()}%`
        progress.style.width = `${progPercent}%`
        
        if(progress.style.width <= '004%' || wordsDone == 0) {
            progress.style.justifyContent = 'start'
        } else {
            progress.style.justifyContent = 'center'
        }
    }

    function gameOver() {
        let sessionCount = 0
        let finalWPM 
        let scores = []

        function theEnd(res) {
            if(typeof res == 'number') {
                finalWPM = res
                // scores.push(finalWPM)
                console.log(finalWPM)
                return;
            }
            if(res.cleared == false) {
                return alert('Sorry you took a hell of a lot of time!');
            }
            if(res.cleared == true) {
                scores.push(finalWPM)
                sessionCount++
                const sessionTally = scores.reduce((acc, curr) => {
                    console.log(typeof acc ,typeof curr)
                    acc += curr
                    return acc
                })
                console.log(sessionCount, scores, sessionTally)
                sesAverage.textContent = `${(sessionTally / sessionCount).toFixed()} WPM`
                return alert(`Congratulations your Words per Minute is: ${finalWPM}. You completed a total of ${sessionCount} times this session!`);
            }
            typeArea.placeholder = 'Play again?'
        }
        return theEnd;
    }
}