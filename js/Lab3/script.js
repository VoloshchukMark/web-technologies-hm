function findSumOf50Integers(){
    let i = 1;
    let result = 0;
    while(i <= 50){
        result += i++;
    }
    return result;
}

function findFactorial(num){
    if(num == 0) {return 1;}
    for(let i = num - 1; i > 0; i--){
        num *= i;
    }
    return num;
}

function displayMonth(num){
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

function findSumOfOddNumbers(arr){
    let sum = 0;
    for (const num of arr){
        if (num % 2 == 0){
            sum += num;
        }
    }
    return sum;
}

let vowelsCheck = (stringValue) => {
    let lowerCaseStringValue = stringValue.toLowerCase()
    let amountOfVowels = 0;
    for (let i = 0; i < lowerCaseStringValue.length; i++){
        if(['a', 'e', 'u', 'i', 'o'].includes(lowerCaseStringValue[i])){
            amountOfVowels++;
        }
    }
    return amountOfVowels;
}

function findDegree(number, degree){
    let result = 1;
    if(degree == 0){ return 1; }
    while(degree != 0){
        result *= number;
        degree--;
    }
    return result;
}


console.log("1. " + findSumOf50Integers());
console.log("2. " + findFactorial(5));
console.log("3. " + displayMonth(5));
console.log("4. " + findSumOfOddNumbers([1, 2, 3, 4, 5, 6, 7, 8]));
console.log("5. " + vowelsCheck('Alphabet'));
console.log("6. " + findDegree(5, 3));
