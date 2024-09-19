const letters = document.querySelectorAll('.scoreboard-letter')
const loadingDiv = document.querySelector('.info-bar')
const ANSWER_LENGTH = 5
const MAX_ROUNDS = 6

async function start() {
  let currentGuess = ''
  let currentRow = 0
  let isLoading = true

  const url = 'https://words.dev-apis.com/word-of-the-day?random=1'
  const res = await fetch(url)
  const resObj = await res.json()
  const word = resObj.word.toUpperCase()
  const wordParts = word.split('')
  let done = false
  setLoading(false)
  console.log(word, 'word')
  isLoading = false

  handleKeyPress()

  function handleKeyPress() {
    document.addEventListener('keydown', (event) => {
      if (done || isLoading) {
        // do nothing
        return
      }

      const action = event.key
      if (action === 'Enter') {
        commit()
      } else if (action === 'Backspace') {
        backspace()
      } else if (isLetter(action)) {
        addLetter(action.toUpperCase())
      } else {
        // do nothing
      }
    })
  }

  function addLetter(letter) {
    if (currentGuess.length < ANSWER_LENGTH) {
      // add letter to the end
      currentGuess += letter
    } else {
      // replace the last letter
      currentGuess = currentGuess.substring(0, currentGuess.length - 1) + letter
    }

    // append additional letters to last square in row
    const currentIndex = (ANSWER_LENGTH * currentRow) + currentGuess.length - 1
    if (letters[currentIndex]) {
      letters[currentIndex].innerText = letter
    }
  }

  async function commit() {
    const validateWordAPI = 'https://words.dev-apis.com/validate-word'

    if (currentGuess.length !== ANSWER_LENGTH) {
      // do nothing
      return
    }

    isLoading = true
    setLoading(true)

    const res = await fetch(validateWordAPI, {
      method: 'POST',
      body: JSON.stringify({ word: currentGuess })
    })

    const resObj = await res.json()
    const { validWord } = resObj
    isLoading = false
    setLoading(false)

    if (!validWord) {
      markInvalidWord()
      return
    }

    const guessParts = currentGuess.split('')
    const wordMap = makeMap(wordParts)

    for (let i = 0; i < ANSWER_LENGTH; i++) {
      // mark as correct
      if (guessParts[i] === wordParts[i]) {
        letters[currentRow * ANSWER_LENGTH + i].classList.add('correct')
        wordMap[guessParts[i]]--
      }
    }

    for (let i = 0; i < ANSWER_LENGTH; i++) {
      if (guessParts[i] === wordParts[i]) {
        // do nothing, we already did it
      } else if (wordParts.includes(guessParts[i]) && wordMap[guessParts[i]] > 0) {
        // mark as close
        letters[(currentRow * ANSWER_LENGTH) + i].classList.add('close')
        wordMap[guessParts[i]]--
      } else {
        letters[(currentRow * ANSWER_LENGTH) + i].classList.add('wrong')
      }
    }


    currentRow++
    if (currentGuess === word) {
      alert('you win!')
      document.querySelector('.brand').classList.toggle('winner', currentGuess === word)
      done = true
      return
    } else if (currentRow === MAX_ROUNDS) {
      alert(`You lose, the word was ${word}`)
      done = true
    }
    currentGuess = ''
  }

  function backspace() {
    const lastIndex = (ANSWER_LENGTH * currentRow) + currentGuess.length
    currentGuess = currentGuess.substring(0, currentGuess.length - 1)
    letters[lastIndex].innerText = ''
  }

  function markInvalidWord() {
    for (let i = 0; i < ANSWER_LENGTH; i++) {
      letters[(currentRow * ANSWER_LENGTH) + i].classList.remove('invalid')

      setTimeout(() => {
        letters[(currentRow * ANSWER_LENGTH) + i].classList.add('invalid')
      }, 10)
    }
  }
}

function isLetter(letter) {
  return /^[a-zA-Z]$/.test(letter)
}

function setLoading(isLoading) {
  loadingDiv.classList.toggle('show', isLoading)
}

function makeMap(array) {
  const obj = {}
  for (let i = 0; i < array.length; i++) {
    const letter = array[i]
    if (obj[letter]) {
      obj[letter]++
    } else {
      obj[letter] = 1
    }
  }
  return obj
}

window.addEventListener('DOMContentLoaded', () => {
  start()
})