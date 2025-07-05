let playerName = "defaultName";
let totalCash = 1000;   //starting cash value $1000
let playerSum = 0;  //player card total
let dealerSum = 0;  //dealer card total
let betAmount = 0;
let playerAceCount = 0;
let dealerAceCount = 0;
let deck = buildDeck();  //deck of cards
let hiddenCard = 0;
let isMyTurn = true;
let cardDealTime = 1000;
const cardSoundEffect = new Audio("CardDealtSound.mp3");

//when window loads...
window.onload = function(){
    shuffle(deck);
    updateMaxBet();
    updateCashDisplay();
    fetchLeaderboard();
    playerName = prompt("Enter your name for the leaderboard:");
}

function buildDeck() {  //returns deck of cards
    let values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
    let suit = ["C", "D", "H", "S"];    //club, diamond, heart, spade
    let deck = [];  //empty deck array

    for(let i = 0; i < suit.length; i++){
        for(let j = 0; j < values.length; j++){
            deck.push(values[j] + "-" + suit[i]);   //appends "SUIT-VALUE"
        }
    }

    return deck;    //returns fully built deck of cards
}

function shuffle(deck){
    for(let i = 0; i<deck.length; i++){
        let randomIndex = Math.floor(Math.random()*deck.length);
        let temp = deck[i];
        deck[i] = deck[randomIndex];
        deck[randomIndex] = temp;
    }
}

function getCardValue(card){    //returns cards numerical value
    let value_PNG = card.split("-");
    if(isNaN(value_PNG[0])){  //face card
        if(value_PNG[0]== 'A')
            return 11;
        else    //non Ace face card
            return 10;
    }
    return(parseInt(value_PNG[0]));
}

function removeButton(){
    const gambleButton = document.getElementById("GambleButton");
    gambleButton.style.display= "none";
}

function returnButton(){
    const gambleButton = document.getElementById("GambleButton");
    gambleButton.style.display= "block";
}

function resetGame(){
    deck = buildDeck(); //rebuilds deck every time FOR NOW
    shuffle(deck);  
    playerSum = 0;
    dealerSum = 0;
    playerAceCount = 0;
    dealerAceCount = 0;
    subtractBet();  
    removeCards();
    isMyTurn = true;
}

function updateMaxBet(){    //updates max bet value to remaining balance
    let maxBet = document.getElementById('betAmount');
    maxBet.setAttribute("max", totalCash);  //max bet amount is what balance remains
}

function updateCashDisplay(){
    document.getElementById("currentCash").textContent = totalCash;
}

function subtractBet(){ //deduct bet from total cash
    betAmount = parseFloat(document.getElementById("betAmount").value);
    totalCash -= betAmount;
    updateCashDisplay();
}

function removeCards(){ //removes cards from screen
    let DealerCards = document.getElementById("DealerCards");
    let PlayerCards = document.getElementById("PlayerCards");
    DealerCards.textContent = "";
    PlayerCards.textContent = "";
}

function displayCard(card, displayLocation){    //display card on webpage
    let CardDisplayLocation = document.getElementById(displayLocation);
    let img = document.createElement('img');
    img.src = '/Client/Cards/'+ card+'.png';
    displayLocation.appendChild(img);
}

function dealPlayerCard(){
    let card = deck.pop();
    playerSum += getCardValue(card);
    if(getCardValue(card) == 11)   //if ace
        playerAceCount+=1;
    displayCard(card, PlayerCards);
    cardSoundEffect.play();
}

function dealDealerCard(){
    let card = deck.pop();
    dealerSum += getCardValue(card); //deal 2nd card to dealer
    if(getCardValue(card) == 11)   //if ace
        dealerAceCount+=1;
    displayCard(card, DealerCards);
    cardSoundEffect.play();
}

function dealCards(){
    hiddenCard = deck.pop();   //save hidden card
    dealerSum += getCardValue(hiddenCard); //deal 1st card to dealer
    if(getCardValue(hiddenCard) == 11)   //if ace
        dealerAceCount+=1;
    displayCard("BACK", DealerCards);   //Does not display first card
    dealPlayerCard();
    setTimeout(dealDealerCard, cardDealTime);
    setTimeout(dealPlayerCard, 2*cardDealTime);
    if (playerSum == 21) {
        alert("Blackjack!");
        handleStand();
    }
}

function flipHiddenCard(newCard) {
    const hidden = document.querySelector("#DealerCards img:first-of-type");
    hidden.src = "/Cards/"+newCard+".png";
}

function sleep(ms){ //sleep func for delay between alert
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function handleHit(){
    if(isMyTurn){
        if (playerSum < 21) {
            dealPlayerCard();
            if (playerSum == 21) {
                await sleep(cardDealTime);
                alert("Blackjack!");
                handleStand();
            }
            else if (playerSum > 21){
                if(playerAceCount > 0){
                    playerAceCount-=1;
                    playerSum -=10;
                }
                else{
                    await sleep(cardDealTime);
                    alert("BUST- YOU LOSE");
                    updateMaxBet();
                    returnButton();
                    isMyTurn = false;
                }
            }
        }
    }
}

async function handleStand(){
    if(isMyTurn){
        isMyTurn = false;
        flipHiddenCard(hiddenCard);
        while(dealerSum < 17){   //dealer draws until 17+
            await sleep(cardDealTime);
            dealDealerCard();
            if(dealerSum>21)
                if(dealerAceCount>0){
                    dealerSum-=10;
                    dealerAceCount-=1;
                }
            //maybe add sleep function to display cards slowly/1 at a time
        }
        await sleep(cardDealTime);
        if(dealerSum<playerSum || dealerSum >21){
            totalCash+= 2*betAmount;
            postScore(playerName, totalCash); //only post score when it increases (a hand is won)
            alert("you win!");
        }
        else if (dealerSum==playerSum){
            totalCash+= betAmount;
            alert("tie");
        }
        else
            alert("You lose");
            updateMaxBet();
        updateCashDisplay();
        returnButton();
    }
}

function Gamble(event){
    event.preventDefault(); //prevent page reload
    const betInput = document.getElementById("betAmount");
    betAmount = parseFloat(betInput.value);
    // Validation: Check for invalid, missing, or out-of-range bet
    if (isNaN(betAmount)) { //if bet is not a number
        alert("Please enter a valid bet amount between $1 and $" + totalCash);
        return; // Stop game start
    }
    resetGame();
    dealCards();
    removeButton();

    let hit = document.getElementById("Hit");
    let stand = document.getElementById("Stand");
      
    hit.addEventListener('click', handleHit); 
    stand.addEventListener('click', handleStand); 
}

//BELOW ARE FUNCTIONS FOR FETCHING FROM BACKEND
const backendUrl = 'https://blackjack-u3hu.onrender.com/'; // change to your deployed backend URL later

// Fetch leaderboard from backend and display it
async function fetchLeaderboard() {
  try {
    const response = await fetch(`${backendUrl}/leaderboard`);
    if (!response.ok) throw new Error('Failed to fetch leaderboard');
    const leaderboard = await response.json();

    const list = document.getElementById('leaderboardList');
    list.innerHTML = ''; // clear current list

    leaderboard.forEach(entry => {
      const li = document.createElement('li');
      li.textContent = `${entry.name}: ${entry.score}`;
      list.appendChild(li);
    });
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
  }
}

// Post new score to backend
async function postScore(name, score) {
  try {
    const response = await fetch(`${backendUrl}/leaderboard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, score })
    });
    if (!response.ok) throw new Error('Failed to post score');

    // Refresh leaderboard after posting
    fetchLeaderboard();
  } catch (err) {
    console.error('Error posting score:', err);
  }
}
