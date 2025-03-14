function getGrade(grade){
    if (grade >= 0 && grade <= 3){
        console.log("Bad!");
    }else if (grade <= 6){
        console.log("Acceptable");
    }else if (grade <= 9){
        console.log("Good");
    }else if (grade <= 12){
        console.log("Great!");
    }else{
        console.log("Cheating, huh?");
    }
    return;
}

function getGradeLogging(grade){
    grade >= 0 && grade <= 3 ? console.log("Bad!") :
    grade <= 6 ? console.log("Acceptable") :
    grade <= 9 ? console.log("Good") :
    grade <= 12 ? console.log("Great!") :
    console.log("Cheating, huh?");
}


function displaySeason(num){
    if (num == 12 || num >= 1 && num <= 2){
        console.log("Winter!");
    }else if (num >= 3 && num <= 5){
        console.log("Spring!")
    }else if (num >= 6 && num <= 8){
        console.log("Summer!")
    }else if (num >= 9 && num <= 11){
        console.log("Fall!")
    }else {
        console.log("Wrong insertion!");
    }
    return;
}

function displayMonthInStringValue_operatorQuestionMark(num){
    num == 12 || num >= 1 && num <= 2 ? console.log("Winter!") :
    num >= 3 && num <= 5 ? console.log("Spring!") :
    num >= 6 && num <= 8 ? console.log("Summer!") :
    num >= 9 && num <= 11 ? console.log("Fall!") :
    console.log("Wrong insertion!");
    return;
}


rateTheGrade_operatorIfElse(13);
rateTheGrade_operatorQuestionMark(8);

displayMonthInStringValue_operatorIfElse(5);
displayMonthInStringValue_operatorQuestionMark(-1);