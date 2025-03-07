function sumOf50Int(){
    let i = 1;
    let result = 0;
    while(i <= 50){
        result += i++;
    }
    return result;
}

function factorial(num){
    if(num == 0) {return 1;}
    for(let i = num - 1; i > 0; i--){
        num *= i;
    }
    return num;
}

function monthDisplay(num){
    switch(num){
        case 1:
            return 'January';
        case 2:
            return 'February';
        case 3:
            return 'March';
        case 4:
            return 'April';
        case 5:
            return 'May';
        case 6:
            return 'June';
        case 7:
            return 'July';
        case 8:
            return 'August';
        case 9:
            return 'September';
        case 10:
            return 'October';
        case 11:
            return 'November';
        case 12:
            return 'December';
        default:
            return 'Wrong insertion!';
    }
}

function oddNumbers(arr){
    let sum = 0;
    for (const num of arr){
        if (num % 2 == 0){
            sum += num;
        }
    }
    return sum;
}

let vowelsCheck = (stringValue) => {
    let amount = 0;
    for (let i = 0; i < stringValue.length; i++){
        if(['a', 'e', 'u', 'i', 'o'].includes(stringValue[i])){
            amount++;
        }
    }
    return amount;
}

function degreeOfANumber(base, exponent){
    let result = 1;
    if(exponent == 0){ return 1; }
    while(exponent != 0){
        result *= base;
        exponent--;
    }
    return result;
}


console.log("1. " + sumOf50Int());
console.log("2. " + factorial(5));
console.log("3. " + monthDisplay(5));
console.log("4. " + oddNumbers([1, 2, 3, 4, 5, 6, 7, 8]));
console.log("5. " + vowelsCheck('MakaPopka'));
console.log("6 " + degreeOfANumber(5, 3));
