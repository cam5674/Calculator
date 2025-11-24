
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
    if (b === 0){return NaN;}
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
    precedence: {"+": 1, "-": 1, "*": 2, "/": 2},
    operands:[],
    operators:[],
    token: "",
    prev: {op: null, number: null},
    resultDisplayed: false
}

// clears cal object
function clearCal () {
    cal.operands.length = 0;
    cal.operators.length = 0;
    cal.token = "";
    cal.prev.op = null;
    cal.prev.number = null;
    cal.resultDisplayed = false;
}

const operations = ["+", "-", "/", "*"]
const buttons = document.querySelectorAll('button')
const display = document.getElementById("display");

buttons.forEach(button => {
    button.addEventListener("click", (event) =>{

        
        const numberButton = event.target.innerText;
        const text = numberButton.trim();
        console.log(text)


        // get input from user
        let op = null
        if (operations.includes(text)) {op = text;}
        let digit = (/^\d$|^\.$/.test(text));
        let equal = text === "=";
        let clear = text === "clear";
        

        // check if digit and then append to the token string
        if (digit) {
            if (cal.resultDisplayed && cal.operators.length == 0) {
                clearCal();
                display.value = "";
            }
            if (text === "." && cal.token.includes("." )) return;
            cal.token += text;
            display.value = cal.token
            cal.resultDisplayed = false;
            return;
        }
        // wipes out existing data
        if (clear) {
            display.value = ""
            clearCal();
            return;
        }


        // if operator was pressed
        if (op) {

            // guard against the user clicking an operator first
            if (cal.operands.length === 0 && cal.token === ""){
                return;
            }
            // guard against the user clicking the same operator twice
            if (cal.token === ""){
                return;
            }

            // push token to operands if token is not empty
            if (cal.token !== "") {
            cal.operands.push(Number(cal.token))
            cal.token = "";
            }
            console.log(cal)

            // get incoming operator and compare it to the top of the stack
            // check precedence and complete computation until the stack is empty
            while (cal.operators.length > 0 && cal.precedence[cal.operators.at(-1)] >= cal.precedence[op]){
                
                // get sign, right and left operand
                console.log(cal)
                const sign = cal.operators.pop();
                const b = cal.operands.pop();
                const a = cal.operands.pop();

                // guard: if missing operands
                if (a === undefined || b === undefined) {
                    break;
                }

                // get result and push result to operands
                const result = operate(a,b,sign);
                if (Number.isNaN(result)){
                    display.value = "NaN";
                    clearCal();
                    return;
                }
                console.log(`After while loop ${cal}`)
                console.log(cal)
                cal.operands.push(result)
                display.value = parseFloat(result.toFixed(12)).toString();
            }
            cal.operators.push(op)

        }
        
        if (equal) {
            console.log("ENTERING = logic")
             // guard against the user clicking an operator first
            if (cal.operands.length === 0 && cal.token === ""){
                return;
            }

            // check for double equal sign
            if (
                cal.operands.length === 0 && 
                cal.operators.length === 0 && 
                cal.token !== "" &&
                cal.prev.op !== null &&
                cal.prev.number !== null
            ){
                
                const result = operate(Number(cal.token), cal.prev.number, cal.prev.op);
                // clear token before adding result
                cal.token = "";
                cal.token += String(result);
                display.value = parseFloat(result.toFixed(12)).toString();
                cal.resultDisplayed = true;
                console.log(cal)
                return;

            }

            // push token to operands if token is not empty
            if (cal.token !== "") {
            cal.operands.push(Number(cal.token))
            cal.token = "";
            }

            // guard for "5 + ="
            if (cal.operators.length > 0 && cal.operands.length == 1) {
                cal.operands.push(cal.operands[0])
            }

            // clear the stack and append the result to operands
            while (cal.operators.length > 0) {

                 // get sign, right and left operand
                console.log(cal)
                const sign = cal.operators.pop();
                const b = cal.operands.pop();
                const a = cal.operands.pop();

                // guard: if missing operands
                if (a == undefined || b == undefined) {
                    break;
                }
                // get result and push result to operands
                const result = operate(a,b,sign);

                // divide by 0 guard
                 if (Number.isNaN(result)){
                    display.value = "ERROR";
                    clearCal();
                    return;
                }
                cal.operands.push(result)
                console.log(`After while loop ${cal}`)
                console.log(cal)
                cal.token = String(result);
                display.value = parseFloat(result.toFixed(12)).toString();
                cal.resultDisplayed = true;

                // record operand and operator in prev
                cal.prev.op = sign;
                cal.prev.number = b;
            }
            cal.operands.length = 0;

        }
        
    });

});
