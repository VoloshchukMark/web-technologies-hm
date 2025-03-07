function findMaxAndMin(arr){
    let max = arr[0];
    let min = arr[0];

    for(let i = 1; i < arr.length; i++){
        if (arr[i] > max){
            max = arr[i];
        }
        if (arr[i] < min){
            min = arr[i]
        }
    }
    return [max, min];
}

function compareObjects(obj1, obj2){
    return JSON.stringify(obj1) ===  JSON.stringify(obj2)
}

let arr = [1, 2, 3, 4, 5, 6];
let maxMin = findMaxAndMin(arr);
let max = maxMin[0];
let min = maxMin[1];
console.log("Max value: " +  max + ", Min value: " + min);

console.log("\n");

const obj1 = {name: 'Mark', age:19};
const obj2 = {name: 'Mark', age:19};
const obj3 = {name: 'Serhiy', age:19};
console.log(compareObjects(obj1, obj2));
console.log(compareObjects(obj1, obj3));