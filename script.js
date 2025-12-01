
// TODO: Add +- button to calculator and maybe % or backspace button
// 4 x 5 display 
function add(a,b) {
    return a + b;

}

function subtract(a,b) {
    return a - b;
}

function multiply(a,b) {
    return a * b;
}


function divide(a,b) {
    if (b === 0){return NaN;}
    return a / b;
}

function exponent(a,b) {
    return Math.pow(a,b);
}
function operate (a,b,c) {
    if (c == "+"){
        return add(a,b);
    } else if (c == "-"){
        return (subtract(a,b));
    } else if (c == "*"){
        return multiply(a,b)
    } else if (c == "/"){
        return divide(a,b);
    } else if(c == "^"){
        return exponent(a,b);
    }
    else
        return "OPERATION ERROR";

}


// formats the display by rounding to 12 decimal places and using
// toExponential if the number is too long.
function formatDisplay(num) {
    if (!Number.isFinite(num)) {
        return "ERROR";
    }
    const maxLength = 12;

    // round to 12 decimals
    let str = num.toFixed(12).replace(/\.?0+$/, "");
    if (str === "-0") str = "0";

    // if number is too large, use exponential
    if (str.length > maxLength){
        str = num.toExponential(6).replace(/\.?0+e/, "e");
    }

    return str;   
}
// store values in cal object
const cal = {
    precedence: {"+": 1, "-": 1, "*": 2, "/": 2, "^": 3 },
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

// toggles sign off/on

function toggleSign() {
    // leave the current token in place; just mark we're back in entry mode
    if (cal.resultDisplayed) {
        cal.resultDisplayed = false;
    }
    // if nothing yet, start from 0 so +/- shows -0 => 0
    if (cal.token === "") {
        cal.token = "0";
    }

    cal.token = cal.token.startsWith("-") ? cal.token.slice(1) : "-" + cal.token;
    display.value = cal.token;
}

const operations = ["+", "-", "/", "*", "^"]
const buttons = document.querySelectorAll('button')
const display = document.getElementById("display");

buttons.forEach(button => {
    button.addEventListener("click", (event) =>{

        
        const numberButton = event.target.innerText;
        const text = numberButton.trim();


        // get input from user
        let op = null
        if (operations.includes(text)) {op = text;}
        let digit = (/^\d$|^\.$/.test(text));
        let equal = text === "=";
        let clear = text === "clear";
        let toggle = text === "+/-";
        console.log(toggle)

        

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

        // handle +/- sign
        if (toggle) {
            toggleSign();
            display.value = cal.token;
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

            // get incoming operator and compare it to the top of the stack
            // check precedence and complete computation until the stack is empty
            while (cal.operators.length > 0) {
                const incomingPrec = cal.precedence[op];
                const topOp = cal.operators.at(-1);
                const topPrec = cal.precedence[topOp];
                const rightAssociative = op === "^";

                // For power (^), only collapse when the stack top has strictly higher precedence.
                // For other operators, collapse on higher or equal precedence.
                // allows chained exponents such as 2^3^2
                const shouldCollapse =
                    topPrec > incomingPrec || (topPrec === incomingPrec && !rightAssociative);
                if (!shouldCollapse) break;

                // get sign, right and left operand
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
                cal.operands.push(result)
                display.value = formatDisplay(result);
            }
            cal.operators.push(op)

        }
        
        if (equal) {
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
                display.value = formatDisplay(result);
                cal.resultDisplayed = true;
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
                cal.token = String(result);
                display.value = formatDisplay(result);
                cal.resultDisplayed = true;

                // record operand and operator in prev
                cal.prev.op = sign;
                cal.prev.number = b;
            }
            cal.operands.length = 0;

        }
        
    });

});
