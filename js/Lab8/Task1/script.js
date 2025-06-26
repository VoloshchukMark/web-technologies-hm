document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.querySelector('.memory-game');
    const settingsContainer = document.querySelector('.settings');
    const gameInfoContainer = document.querySelector('.game-info');
    const gameOverMessage = document.getElementById('game-over-message');
    const finalStats = document.getElementById('final-stats');
    const timerDisplay = document.getElementById('timer');
    const movesDisplay = document.getElementById('moves');

    const startGameBtn = document.getElementById('start-game-btn');
    const resetSettingsBtn = document.getElementById('reset-settings-btn');
    const restartGameBtn = document.getElementById('restart-game-btn');

    const rowsInput = document.getElementById('rows');
    const colsInput = document.getElementById('cols');
    const difficultySelect = document.getElementById('difficulty');

    const EMOJIS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓'];

    let hasFlippedCard = false;
    let lockBoard = false;
    let firstCard, secondCard;
    let moves = 0;
    let matchedPairs = 0;
    let totalPairs = 0;
    let timerInterval;

    const difficultyTimes = {
        easy: 180,
        normal: 120,
        hard: 60,
    };

    function shuffle(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    function startGame() {
        const rows = parseInt(rowsInput.value);
        const cols = parseInt(colsInput.value);
        
        if ((rows * cols) % 2 !== 0) {
            alert("The amount of cards (rows * columns) should be odd!");
            return;
        }

        totalPairs = (rows * cols) / 2;

        if (totalPairs > EMOJIS.length) {
            alert(`The maximum amount of cards: ${EMOJIS.length}. You need to lower the field size!`);
            return;
        }
        
        const selectedEmojis = shuffle(EMOJIS).slice(0, totalPairs);
        let cards = shuffle([...selectedEmojis, ...selectedEmojis]);
        
        createBoard(rows, cols, cards);
        resetGameState();
        startTimer(difficultyTimes[difficultySelect.value]);

        settingsContainer.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        gameInfoContainer.style.display = 'flex';
    }

    function createBoard(rows, cols, cards) {
        gameContainer.innerHTML = '';
        gameContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        gameContainer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

        cards.forEach(value => {
            const card = document.createElement('div');
            card.classList.add('memory-card');
            card.dataset.value = value;
            card.innerHTML = `
                <div class="front-face">${value}</div>
                <div class="back-face"></div>
            `;
            card.addEventListener('click', flipCard);
            gameContainer.appendChild(card);
        });
    }

    function resetGameState() {
        moves = 0;
        matchedPairs = 0;
        movesDisplay.textContent = moves;
        lockBoard = false;
        hasFlippedCard = false;
        [firstCard, secondCard] = [null, null];
        gameOverMessage.classList.add('hidden');
    }

    function flipCard() {
        if (lockBoard || this === firstCard || this.classList.contains('flip')) return;
        
        this.classList.add('flip');

        if (!hasFlippedCard) {
            hasFlippedCard = true;
            firstCard = this;
            return;
        }

        secondCard = this;
        incrementMoveCounter();
        checkForMatch();
    }

    function checkForMatch() {
        const isMatch = firstCard.dataset.value === secondCard.dataset.value;
        isMatch ? disableCards() : unflipCards();
    }

    function disableCards() {
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);
        
        matchedPairs++;
        resetTurn();

        if (matchedPairs === totalPairs) {
            endGame(true);
        }
    }

    function unflipCards() {
        lockBoard = true;
        setTimeout(() => {
            firstCard.classList.remove('flip');
            secondCard.classList.remove('flip');
            resetTurn();
        }, 1200);
    }

    function resetTurn() {
        [hasFlippedCard, lockBoard] = [false, false];
        [firstCard, secondCard] = [null, null];
    }

    function incrementMoveCounter() {
        moves++;
        movesDisplay.textContent = moves;
    }

    function startTimer(duration) {
        clearInterval(timerInterval);
        let timeLeft = duration;
        
        const updateTimerDisplay = () => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        };

        updateTimerDisplay(); // Initial display
        
        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            
            if (timeLeft < 0) {
                endGame(false);
            }
        }, 1000);
    }

    function endGame(isWin) {
        clearInterval(timerInterval);
        lockBoard = true;
        
        const timeRemaining = (parseInt(timerDisplay.textContent.split(':')[0]) * 60 + parseInt(timerDisplay.textContent.split(':')[1]));
        const timeSpent = difficultyTimes[difficultySelect.value] - timeRemaining;
        const minutes = Math.floor(timeSpent / 60);
        const seconds = timeSpent % 60;
        
        if (isWin) {
            finalStats.textContent = `You won! Time spent: ${minutes} min ${seconds} sec. Moves made: ${moves}.`;
        } else {
            finalStats.textContent = `Time's up! You lost. Moves made: ${moves}.`;
        }
        
        gameOverMessage.classList.remove('hidden');
    }

    function resetSettings() {
        rowsInput.value = 4;
        colsInput.value = 4;
        difficultySelect.value = 'easy';
    }

    function restartGame() {
        gameOverMessage.classList.add('hidden');
        settingsContainer.classList.remove('hidden');
        gameContainer.classList.add('hidden');
        gameInfoContainer.style.display = 'none';
        
        clearInterval(timerInterval);
        timerDisplay.textContent = "00:00";
        movesDisplay.textContent = "0";
    }

    startGameBtn.addEventListener('click', startGame);
    resetSettingsBtn.addEventListener('click', resetSettings);
    restartGameBtn.addEventListener('click', restartGame);

    gameContainer.classList.add('hidden');
    gameInfoContainer.style.display = 'none';
});