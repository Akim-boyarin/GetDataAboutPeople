export function generateId() {
    let idLength = 10;
    
    let digits = "0123456789";
    let letters = "abcdefghijklmnopqrstuvwxyx";
    let specialSymbol = "_";

    let generateForSpecialSymbols = true;

    let numbersOfSymbols = {
        digits: 0,
        letters: 0,
        specialSymbols: 0,
    };

    let positionsOfSymbols = {
        digits: [],
        letters: [],
        specialSymbols: [],
    };

    // количества различных символов
    numbersOfSymbols.digits = calculateNumberOfDigits(idLength);
    numbersOfSymbols.specialSymbols = calculateNumberOfSpecialSymbols(idLength);
    numbersOfSymbols.letters = idLength - (numbersOfSymbols.digits + numbersOfSymbols.specialSymbols);

    // позиции различных символов в id
    positionsOfSymbols.digits = getRandomSmallerNumbersList(idLength, numbersOfSymbols.digits);
    
    do {
        positionsOfSymbols.specialSymbols = getRandomSmallerNumbersList(idLength, numbersOfSymbols.specialSymbols, generateForSpecialSymbols);
    } while(isACommonMembersInLists(positionsOfSymbols.digits, positionsOfSymbols.specialSymbols) || areAdjacentNumbersInTheList(positionsOfSymbols.specialSymbols));

    let positionsOfDigitsAndSpecialSymbols = positionsOfSymbols.digits.concat(positionsOfSymbols.specialSymbols);
    positionsOfSymbols.letters = getPositiveIntegersBeforeAndCurrent(idLength).filter(position => !positionsOfDigitsAndSpecialSymbols.includes(position));

    let id = "";

    for (let i = 0; i < idLength; i++) {
        let symbol;

        let specialSymbolsPosition = positionsOfSymbols.specialSymbols.includes(i);
        let digitsPosition = positionsOfSymbols.digits.includes(i);
        let lettersPosition = positionsOfSymbols.letters.includes(i);

        if (specialSymbolsPosition) symbol = specialSymbol;
        if (digitsPosition) symbol = getRandomSymbol(digits);
        if (lettersPosition) {
            symbol = getRandomSymbol(letters);
            symbol = coinToss() ? symbol.toUpperCase() : symbol;
        }

        id += symbol;
    }

    return id;
}


function calculateNumberOfDigits(length) {
    return Math.ceil(length / 3.5);
}

function calculateNumberOfSpecialSymbols(length) {
    let specialSymbols;

    specialSymbols = 2;

    return specialSymbols;
}

function getRandomSmallerNumbersList(number, quantity, conditionOfSpecialSymbols) {
    if (quantity <= 0 || quantity >= number || quantity !== Math.floor(quantity)) return [];

    // специальные символы не будут находиться по краям id
    let currentNumber = conditionOfSpecialSymbols ? (number - 2) : number;

    let smallerNumbers = [];
    let counter = 0;
    
    while (counter < quantity) {
        let intermediateNumber = Math.random() * currentNumber;
        let smallerNumber = conditionOfSpecialSymbols ? Math.ceil(intermediateNumber) : Math.floor(intermediateNumber);
        
        if (!smallerNumbers.includes(smallerNumber)) {
            smallerNumbers.push(smallerNumber);
            counter++;
        }
    }

    return smallerNumbers;
}

function isACommonMembersInLists(firstList, secondList) {
    for (let i = 0; i < firstList.length; i++) {
        for (let j = 0; j < secondList.length; j++) {
            if (firstList[i] === secondList[j]) return true;
        }
    }

    return false;
}

function areAdjacentNumbersInTheList(numbers) {
    let currentList = numbers.sort((a, b) => a - b);

    for (let i = 0; i < currentList.length; i++) {
        if (currentList[i] === currentList[i + 1] - 1) return true;
    }
    return false;
}

function getPositiveIntegersBeforeAndCurrent(number) {
    if (number !== Math.floor(number) || number <= 0) return [];

    let listOfNumbers = [];
    for (let i = 0; i < number; i++) listOfNumbers.push(i);
    return listOfNumbers;
}

function getRandomSymbol(source) {
    return source[Math.floor(Math.random() * source.length)];
}

function coinToss() {
    return (Math.floor(Math.random() * 2) === 0);
}
