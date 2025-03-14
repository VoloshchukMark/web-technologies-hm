function findMaxAndMin(arr){
    let maxValue = arr[0];
    let minValue = arr[0];

    for(let i = 1; i < arr.length; i++){
        if (arr[i] > maxValue){
            maxValue = arr[i];
        }
        if (arr[i] < minValue){
            minValue = arr[i]
        }
    }
    return [maxValue, minValue];
}

function compareTwoObjects(obj1, obj2){
    return JSON.stringify(obj1) ===  JSON.stringify(obj2)
}

let array = [4, 2, 3, 4, 1, 6];
let maxAndMinValues = findMaxAndMin(array);
let maxValue = maxAndMinValues[0];
let minValue = maxAndMinValues[1];
console.log("Max value: " +  maxValue + ", Min value: " + minValue);

console.log();

const obj1 = {name: 'Mark', age:19};
const obj2 = {name: 'Mark', age:19};
const obj3 = {name: 'Serhiy', age:19};
console.log(compareTwoObjects(obj1, obj2));
console.log(compareTwoObjects(obj1, obj3));