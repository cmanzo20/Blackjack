let totalCash = 1000;   //starting cash value $1000
let playerSum = 0;  //player card total
let dealerSum = 0;  //dealer card total
let deck = buildDeck();  //deck of cards

//when window loads...
window.onload = function(){
    shuffle(deck);
    updateMaxBet();
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

function updateMaxBet(){    //updates max bet value to remaining balance
    var maxBet = document.getElementById('betAmount');
    maxBet.setAttribute("max", totalCash);  //max bet amount is what balance remains
}

function subtractBet(){ //deduct bet from total cash
    betAmount = document.getElementById("betAmount").value;
    totalCash -= betAmount;
}

function displayCard(card, displayLocation){    //display card on webpage
    let CardDisplayLocation = document.getElementById(displayLocation);
    let img = document.createElement('img');
    img.src = '/Cards/'+ card+'.png';
    console.log(card);
    console.log(img.src);
    displayLocation.append(img);
}


function Gamble(event){
    event.preventDefault(); //prevent page reload
    subtractBet();  
    dealerSum += getCardValue(deck[deck.length-1]); //deal 1st card to dealer
    displayCard(deck[deck.length-1], DealerCards);
    deck.pop();
    playerSum+= getCardValue(deck[deck.length-1]);  //deal 1st card to player
    displayCard(deck[deck.length-1], PlayerCards);
    deck.pop();
    dealerSum += getCardValue(deck[deck.length-1]); //deal 2nd card to dealer
    displayCard(deck[deck.length-1], DealerCards);
    deck.pop();
    playerSum+= getCardValue(deck[deck.length-1]);  //deal 2nd card to player
    displayCard(deck[deck.length-1], PlayerCards);
    deck.pop();
    while(playerSum <21){
        if (playerSum == 21){
            alert("Blackjack!");
            break;
        }
        else if(playerSum > 21){
            alert("BUST");
            break;
        }
        else{
            alert("hit or stand?");
            break;
        }
    }
}