

function add(a,b) {
    return a + b

}

function subtract(a,b) {
    return a - b
}

function multiply(a,b) {
    return a * b
}


function divide(a,b) {
    return a / b
}


function operate (a,b,c) {
    if (c == "+"){
        return add(a,b)
    } else if (c == "-"){
        return (subtract(a,b))
    } else if (c == "*"){
        return multiply(a,b)
    } else if (c == "/"){
        return divide(a,b)
    } else
        return "OPERATION ERROR"

}

// store values in cal object
const cal = {
    left: undefined,
    right: undefined,
    operation: undefined
}
const operations = ["+", "-", "/", "*"]
const buttons = document.querySelectorAll('button')
const display = document.getElementById("display");

buttons.forEach(button => {
    button.addEventListener("click", (event) =>{

  
        const numberButton = event.target.innerText;
        display.value = numberButton;
        const text = numberButton.trim()
        // stack??
        if (operations.includes(text)){
            cal.operation = text
            // check if a decmial
        } else if (/^d\$/.test(text)){

         if (cal.right !== undefined && cal.operation !== undefined){
            cal.left = Number(text);
        }
        else if (cal.operation === undefined){
            // get right key value and append if already exist
            cal.right = (cal.right === undefined) ? Number(text) : Number(String(cal.right) + text);

        } else {
            cal.right = (cal.right === undefined) ? Number(text) : Number(String(cal.right) + text);
        }
    }
    

        console.log(cal)
        /* Add logic to store numbers until user preses =*/

    });

});

/* Example: User preses 3 + 3: You will store three variables - 3, +, 3

   Call operate when user clicks = 
    
    */