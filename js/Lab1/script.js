let paragraph = document.querySelector("p")
let button = document.getElementById("button")

function showAlert(){
    const name = 'Mark'
   paragraph.innerHTML=name
};

button.addEventListener("dblclick", showAlert)