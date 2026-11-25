const STORAGE_KEY = "kamilaFiszkiStateV2";
const HARD_STORAGE_KEY = "kamilaFiszkiHardWordsV2";

let studyWords = [];
let currentIndex = 0;

let selectedDeckId = null;
let selectedMode = "en-pl";
let selectedSet = "all";

let knownCount = 0;
let sessionHardWords = [];

let currentDirection = "en-pl";
let cardFlipped = false;

let manualFinish = false;


// ====================
// POMOCNICZE
// ====================

function shuffle(array) {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(
      Math.random() * (i + 1)
    );

    [copy[i], copy[j]] = [
      copy[j],
      copy[i]
    ];
  }

  return copy;
}


function sameWord(a, b) {
  if (
    a.en !== b.en ||
    a.pl !== b.pl
  ) {
    return false;
  }

  if (
    a.deckId &&
    b.deckId
  ) {
    return (
      a.deckId === b.deckId
    );
  }

  return true;
}


function containsWord(array, word) {
  return array.some(item =>
    sameWord(item, word)
  );
}


// ====================
// DZIAŁY / FOLDERY
// ====================

function getDeckById(id) {
  return decks.find(
    deck =>
      deck.id === id
  );
}


function getWordsFromSelectedDeck() {

  // WSZYSTKIE DZIAŁY

  if (
    selectedDeckId ===
    "all-decks"
  ) {

    return decks.flatMap(
      deck =>
        deck.words.map(
          word => ({
            ...word,
            deckId: deck.id
          })
        )
    );
  }


  // JEDEN DZIAŁ

  const deck =
    getDeckById(
      selectedDeckId
    );


  if (!deck) {
    return [];
  }


  return deck.words.map(
    word => ({
      ...word,
      deckId: deck.id
    })
  );
}


function getSelectedDeckName() {

  if (
    selectedDeckId ===
    "all-decks"
  ) {
    return "🌸 Wszystkie kartkówki";
  }


  const deck =
    getDeckById(
      selectedDeckId
    );


  return deck
    ? deck.name
    : "";
}


function renderDecks() {

  const container =
    document.getElementById(
      "deck-list"
    );


  container.innerHTML = "";


  decks.forEach(deck => {

    const button =
      document.createElement(
        "button"
      );


    button.className =
      "deck-btn";


    button.innerHTML = `
      <span class="deck-name">
        ${deck.name}
      </span>

      <span class="deck-description">
        Zakres do kartkówki
      </span>

      <span class="deck-count">
        ${deck.words.length} słówek
      </span>
    `;


    button.addEventListener(
      "click",
      () => {

        selectedDeckId =
          deck.id;

        showStartScreen();

      }
    );


    container.appendChild(
      button
    );
  });


  // ====================
  // WSZYSTKIE KARTKÓWKI
  // ====================

  if (
    decks.length > 1
  ) {

    const allButton =
      document.createElement(
        "button"
      );


    const totalWords =
      decks.reduce(
        (sum, deck) =>
          sum +
          deck.words.length,
        0
      );


    allButton.className =
      "deck-btn all-decks";


    allButton.innerHTML = `
      <span class="deck-name">
        🌸 Wszystkie kartkówki
      </span>

      <span class="deck-description">
        Wszystkie słówka razem
      </span>

      <span class="deck-count">
        ${totalWords} słówek
      </span>
    `;


    allButton.addEventListener(
      "click",
      () => {

        selectedDeckId =
          "all-decks";

        showStartScreen();

      }
    );


    container.appendChild(
      allButton
    );
  }
}


// ====================
// TRUDNE SŁÓWKA
// ====================

function loadHardWords() {

  const raw =
    localStorage.getItem(
      HARD_STORAGE_KEY
    );


  if (!raw) {
    return [];
  }


  try {

    const saved =
      JSON.parse(raw);


    return Array.isArray(saved)
      ? saved
      : [];

  } catch {

    return [];
  }
}


function saveHardWords(array) {

  localStorage.setItem(
    HARD_STORAGE_KEY,
    JSON.stringify(array)
  );
}


function addHardWord(word) {

  const hardWords =
    loadHardWords();


  if (
    !containsWord(
      hardWords,
      word
    )
  ) {

    hardWords.push({
      en: word.en,
      pl: word.pl,
      deckId: word.deckId
    });


    saveHardWords(
      hardWords
    );
  }
}


function removeHardWord(word) {

  const hardWords =
    loadHardWords()
      .filter(
        item =>
          !sameWord(
            item,
            word
          )
      );


  saveHardWords(
    hardWords
  );
}


// ====================
// ZAPIS SESJI
// ====================

function saveSession() {

  if (
    studyWords.length === 0
  ) {
    return;
  }


  const state = {
    studyWords,
    currentIndex,
    selectedDeckId,
    selectedMode,
    selectedSet,
    knownCount,
    sessionHardWords,
    savedAt: Date.now()
  };


  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(state)
  );
}


function loadSession() {

  const raw =
    localStorage.getItem(
      STORAGE_KEY
    );


  if (!raw) {
    return null;
  }


  try {

    const state =
      JSON.parse(raw);


    if (
      !state ||
      !Array.isArray(
        state.studyWords
      ) ||
      state.studyWords.length === 0
    ) {
      return null;
    }


    return state;

  } catch {

    return null;
  }
}


function clearSession() {

  localStorage.removeItem(
    STORAGE_KEY
  );
}


// ====================
// WYBÓR ZESTAWU
// ====================

function getStudySet() {

  const deckWords =
    getWordsFromSelectedDeck();


  // TYLKO TRUDNE

  if (
    selectedSet === "hard"
  ) {

    const hardWords =
      loadHardWords();


    const filtered =
      hardWords.filter(
        hardWord =>
          deckWords.some(
            word =>
              sameWord(
                word,
                hardWord
              )
          )
      );


    return shuffle(
      filtered
    );
  }


  // NORMALNY ZESTAW

  const shuffled =
    shuffle(
      deckWords
    );


  if (
    selectedSet === "20"
  ) {

    return shuffled.slice(
      0,
      20
    );
  }


  if (
    selectedSet === "50"
  ) {

    return shuffled.slice(
      0,
      50
    );
  }


  return shuffled;
}


// ====================
// START
// ====================

function startStudy() {

  if (!selectedDeckId) {

    showDeckScreen();

    return;
  }


  const newSet =
    getStudySet();


  if (
    selectedSet === "hard" &&
    newSet.length === 0
  ) {

    alert(
      "Nie masz jeszcze żadnych trudnych słówek w tym dziale ❤️"
    );

    return;
  }


  if (
    newSet.length === 0
  ) {

    alert(
      "Ten dział nie ma jeszcze żadnych słówek."
    );

    return;
  }


  clearSession();


  studyWords =
    newSet;

  currentIndex = 0;

  knownCount = 0;

  sessionHardWords = [];

  cardFlipped = false;

  manualFinish = false;


  hideAllScreens();


  document
    .getElementById(
      "flashcard-screen"
    )
    .classList.remove(
      "hidden"
    );


  saveSession();

  showFlashcard();
}


// ====================
// WZNOWIENIE
// ====================

function resumeStudy() {

  const state =
    loadSession();


  if (!state) {

    showDeckScreen();

    return;
  }


  studyWords =
    state.studyWords;


  currentIndex =
    state.currentIndex || 0;


  selectedDeckId =
    state.selectedDeckId ||
    decks[0].id;


  selectedMode =
    state.selectedMode ||
    "en-pl";


  selectedSet =
    state.selectedSet ||
    "all";


  knownCount =
    state.knownCount || 0;


  sessionHardWords =
    state.sessionHardWords ||
    [];


  cardFlipped = false;

  manualFinish = false;


  hideAllScreens();


  document
    .getElementById(
      "flashcard-screen"
    )
    .classList.remove(
      "hidden"
    );


  showFlashcard();
}


function discardSession() {

  clearSession();

  showDeckScreen();
}


// ====================
// KIERUNEK FISZKI
// ====================

function getDirection() {

  if (
    selectedMode === "en-pl"
  ) {
    return "en-pl";
  }


  if (
    selectedMode === "pl-en"
  ) {
    return "pl-en";
  }


  return (
    Math.random() < 0.5
      ? "en-pl"
      : "pl-en"
  );
}


// ====================
// WYŚWIETLANIE FISZKI
// ====================

function showFlashcard() {

  if (
    currentIndex >=
    studyWords.length
  ) {

    showFinalScreen();

    return;
  }


  const word =
    studyWords[currentIndex];


  currentDirection =
    getDirection();


  cardFlipped = false;


  const flashcard =
    document.getElementById(
      "flashcard"
    );


  flashcard.classList.remove(
    "flipped"
  );


  const frontWord =
    document.getElementById(
      "front-word"
    );


  const backWord =
    document.getElementById(
      "back-word"
    );


  if (
    currentDirection ===
    "en-pl"
  ) {

    frontWord.textContent =
      word.en;


    backWord.textContent =
      word.pl;


    document.getElementById(
      "direction-label"
    ).textContent =
      "Angielski → Polski";

  } else {

    frontWord.textContent =
      word.pl;


    backWord.textContent =
      word.en;


    document.getElementById(
      "direction-label"
    ).textContent =
      "Polski → Angielski";
  }


  setActionButtons(false);

  updateProgress();
}


// ====================
// OBRACANIE FISZKI
// ====================

function flipCard() {

  const flashcard =
    document.getElementById(
      "flashcard"
    );


  cardFlipped =
    !cardFlipped;


  flashcard.classList.toggle(
    "flipped",
    cardFlipped
  );


  setActionButtons(true);
}


function setActionButtons(enabled) {

  document.getElementById(
    "repeat-btn"
  ).disabled =
    !enabled;


  document.getElementById(
    "know-btn"
  ).disabled =
    !enabled;
}


// ====================
// UMIEM
// ====================

function markKnown() {

  if (!cardFlipped) {
    return;
  }


  const word =
    studyWords[currentIndex];


  knownCount++;


  removeHardWord(
    word
  );


  sessionHardWords =
    sessionHardWords.filter(
      item =>
        !sameWord(
          item,
          word
        )
    );


  nextCard();
}


// ====================
// POWTÓRZ
// ====================

function markRepeat() {

  if (!cardFlipped) {
    return;
  }


  const word =
    studyWords[currentIndex];


  if (
    !containsWord(
      sessionHardWords,
      word
    )
  ) {

    sessionHardWords.push(
      word
    );
  }


  addHardWord(
    word
  );


  nextCard();
}


// ====================
// KOLEJNA FISZKA
// ====================

function nextCard() {

  currentIndex++;


  saveSession();


  showFlashcard();
}


// ====================
// POSTĘP
// ====================

function updateProgress() {

  const total =
    studyWords.length;


  const completed =
    Math.min(
      currentIndex,
      total
    );


  document.getElementById(
    "progress-text"
  ).textContent =
    `${completed} / ${total}`;


  document.getElementById(
    "progress"
  ).style.width =
    `${
      total
        ? (
            completed /
            total
          ) * 100
        : 0
    }%`;


  document.getElementById(
    "hard-count"
  ).textContent =
    `🔁 ${sessionHardWords.length}`;
}


// ====================
// ZAKOŃCZENIE RĘCZNE
// ====================

function askToFinish() {

  hideAllScreens();


  document
    .getElementById(
      "finish-confirm-screen"
    )
    .classList.remove(
      "hidden"
    );
}


function cancelFinish() {

  hideAllScreens();


  document
    .getElementById(
      "flashcard-screen"
    )
    .classList.remove(
      "hidden"
    );
}


function confirmFinish() {

  manualFinish = true;


  clearSession();


  showFinalScreen();
}


// ====================
// KONIEC NAUKI
// ====================

function showFinalScreen() {

  clearSession();


  hideAllScreens();


  document
    .getElementById(
      "final-screen"
    )
    .classList.remove(
      "hidden"
    );


  const completed =
    manualFinish
      ? currentIndex
      : studyWords.length;


  document.getElementById(
    "final-score"
  ).textContent =
    `${knownCount} / ${completed}`;


  let message;


  if (
    completed === 0
  ) {

    message =
      "Nic się nie stało ❤️ Wrócisz do tego później.";

  } else {

    const percent =
      knownCount /
      completed;


    if (
      percent === 1
    ) {

      message =
        "Cudownie, dobra robota! ❤️";

    } else if (
      percent >= 0.75
    ) {

      message =
        "Jest super! ❤️";

    } else if (
      percent >= 0.5
    ) {

      message =
        "Dobrze idzie, nie zniechęcaj się księżniczko! ❤️";

    } else {

      message =
        "Oj trzeba powtórzyć misiaku! ❤️";
    }
  }


  document.getElementById(
    "final-message"
  ).textContent =
    message;


  renderHardSummary();
}


// ====================
// PODSUMOWANIE TRUDNYCH
// ====================

function renderHardSummary() {

  const summary =
    document.getElementById(
      "hard-summary"
    );


  const list =
    document.getElementById(
      "hard-list"
    );


  list.innerHTML = "";


  if (
    sessionHardWords.length === 0
  ) {

    summary.classList.add(
      "hidden"
    );

    return;
  }


  summary.classList.remove(
    "hidden"
  );


  document.getElementById(
    "final-hard-count"
  ).textContent =
    `Do powtórki: ${sessionHardWords.length}`;


  sessionHardWords.forEach(
    word => {

      const item =
        document.createElement(
          "div"
        );


      item.className =
        "hard-item";


      const english =
        document.createElement(
          "span"
        );


      english.className =
        "hard-en";


      english.textContent =
        word.en;


      const separator =
        document.createElement(
          "span"
        );


      separator.className =
        "hard-separator";


      separator.textContent =
        "—";


      const polish =
        document.createElement(
          "span"
        );


      polish.className =
        "hard-pl";


      polish.textContent =
        word.pl;


      item.appendChild(
        english
      );


      item.appendChild(
        separator
      );


      item.appendChild(
        polish
      );


      list.appendChild(
        item
      );
    }
  );
}


// ====================
// POWTÓRKA TRUDNYCH
// ====================

function repeatHardWords() {

  if (
    sessionHardWords.length === 0
  ) {
    return;
  }


  studyWords =
    shuffle([
      ...sessionHardWords
    ]);


  currentIndex = 0;

  knownCount = 0;

  sessionHardWords = [];

  manualFinish = false;

  cardFlipped = false;


  hideAllScreens();


  document
    .getElementById(
      "flashcard-screen"
    )
    .classList.remove(
      "hidden"
    );


  saveSession();

  showFlashcard();
}


// ====================
// EKRANY
// ====================

function hideAllScreens() {

  [
    "resume-screen",
    "deck-screen",
    "start-screen",
    "flashcard-screen",
    "finish-confirm-screen",
    "final-screen"
  ].forEach(id => {

    document
      .getElementById(id)
      .classList.add(
        "hidden"
      );
  });
}


function showDeckScreen() {

  hideAllScreens();


  renderDecks();


  document
    .getElementById(
      "deck-screen"
    )
    .classList.remove(
      "hidden"
    );
}


function showStartScreen() {

  hideAllScreens();


  document
    .getElementById(
      "start-screen"
    )
    .classList.remove(
      "hidden"
    );


  document
    .getElementById(
      "selected-deck-name"
    )
    .textContent =
      getSelectedDeckName();
}


function showResumeScreen(state) {

  hideAllScreens();


  document
    .getElementById(
      "resume-screen"
    )
    .classList.remove(
      "hidden"
    );


  document.getElementById(
    "resume-progress"
  ).textContent =
    `Postęp: ${state.currentIndex} / ${state.studyWords.length}`;
}


function restartStudy() {

  clearSession();


  studyWords = [];

  currentIndex = 0;

  knownCount = 0;

  sessionHardWords = [];

  manualFinish = false;

  cardFlipped = false;

  selectedDeckId = null;


  showDeckScreen();
}


// ====================
// PRZYCISKI STARTOWE
// ====================

function setupChoiceButtons() {

  document
    .querySelectorAll(
      ".mode-btn"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          document
            .querySelectorAll(
              ".mode-btn"
            )
            .forEach(btn =>
              btn.classList.remove(
                "active"
              )
            );


          button.classList.add(
            "active"
          );


          selectedMode =
            button.dataset.mode;
        }
      );
    });


  document
    .querySelectorAll(
      ".set-btn"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          document
            .querySelectorAll(
              ".set-btn"
            )
            .forEach(btn =>
              btn.classList.remove(
                "active"
              )
            );


          button.classList.add(
            "active"
          );


          selectedSet =
            button.dataset.set;
        }
      );
    });
}


// ====================
// START APLIKACJI
// ====================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    setupChoiceButtons();


    document
      .getElementById(
        "start-study-btn"
      )
      .addEventListener(
        "click",
        startStudy
      );


    document
      .getElementById(
        "change-deck-btn"
      )
      .addEventListener(
        "click",
        showDeckScreen
      );


    document
      .getElementById(
        "flashcard"
      )
      .addEventListener(
        "click",
        flipCard
      );


    document
      .getElementById(
        "flashcard"
      )
      .addEventListener(
        "keydown",
        event => {

          if (
            event.key === "Enter" ||
            event.key === " "
          ) {

            event.preventDefault();

            flipCard();
          }
        }
      );


    document
      .getElementById(
        "know-btn"
      )
      .addEventListener(
        "click",
        markKnown
      );


    document
      .getElementById(
        "repeat-btn"
      )
      .addEventListener(
        "click",
        markRepeat
      );


    document
      .getElementById(
        "finish-study-btn"
      )
      .addEventListener(
        "click",
        askToFinish
      );


    document
      .getElementById(
        "confirm-finish-btn"
      )
      .addEventListener(
        "click",
        confirmFinish
      );


    document
      .getElementById(
        "cancel-finish-btn"
      )
      .addEventListener(
        "click",
        cancelFinish
      );


    document
      .getElementById(
        "resume-btn"
      )
      .addEventListener(
        "click",
        resumeStudy
      );


    document
      .getElementById(
        "discard-session-btn"
      )
      .addEventListener(
        "click",
        discardSession
      );


    document
      .getElementById(
        "repeat-hard-btn"
      )
      .addEventListener(
        "click",
        repeatHardWords
      );


    document
      .getElementById(
        "restart-btn"
      )
      .addEventListener(
        "click",
        restartStudy
      );


    const saved =
      loadSession();


    if (
      saved &&
      saved.currentIndex <
        saved.studyWords.length
    ) {

      showResumeScreen(
        saved
      );

    } else {

      clearSession();

      showDeckScreen();
    }
  }
);
