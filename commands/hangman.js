const { cmd, parseJid, getAdmin, tlang } = require("../lib/");

let rooms = {}; // Initialize rooms as an empty object

//----------------------
const words = require('../lib/words.js'); // array of words to pick from

cmd({
  pattern: 'hangman',
  desc: 'Start a game of hangman',
  category: 'Games'
}, async (Void, citel) => {

  let roomId = 'hangman-' + Date.now();
  let word = randomWord(words); 
  let maskedWord = maskWord(word);
  let remainingGuesses = 6;

  citel.reply(`Starting hangman in room ${roomId}`);
  citel.reply(maskedWord);

  rooms[roomId] = {
    id: roomId, 
    word,
    maskedWord,
    remaining: remainingGuesses,
    player: citel.sender
  };

});

cmd({
  on: 'text',
  priority: 1
}, async (Void, citel, text) => {

  let room = Object.values(rooms).find(room => 
    room.player === citel.sender && 
    room.id.startsWith('hangman')
  );

  if (!room || typeof text !== 'string' || text.length === 0) return;

  let guess = text.toLowerCase()[0];

  if (room.word.includes(guess)) {
    room.maskedWord = fillInLetter(room.maskedWord, room.word, guess); 
    if (!room.maskedWord.includes('_')) {
      citel.reply(`You guessed the word: ${room.word}`);
      delete rooms[room.id];
      return; 
    }
  } else {
    room.remaining--;
  }

  if (room.remaining === 0) {
    citel.reply(`You lost! The word was ${room.word}`);
    delete rooms[room.id];       
    return;
  }

  citel.reply(`Guess: ${guess}, Remaining: ${room.remaining}`);
  citel.reply(room.maskedWord);

})

// helper functions 

function randomWord(words) {
  return words[Math.floor(Math.random() * words.length)];
}

function maskWord(word) {
  return word.replace(/./g, '_');
} 

function fillInLetter(masked, word, letter) {
  let idx = word.indexOf(letter);
  while (idx !== -1) {
    masked = masked.substring(0,idx) + letter + masked.substring(idx+1); 
    idx = word.indexOf(letter, idx + 1);
  }
  return masked;
}
