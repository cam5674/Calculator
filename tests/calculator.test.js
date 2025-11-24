

const { fireEvent } = require("@testing-library/dom");
const fs = require("fs");
const path = require("path");



let display;


beforeEach(()=>{
    // load html into jsdom environment (recreates webpage)
    const html = fs.readFileSync(path.resolve(__dirname, "../index.html"), "utf8");
    document.documentElement.innerHTML = html;

   // Shim innerText for jsdom so handler sees button text
    Object.defineProperty(HTMLElement.prototype, "innerText", {
    configurable: true,
    get() { return this.textContent; },
    set(value) { this.textContent = value; }
  });

    // clear script.js for each test
    jest.resetModules();
    require("../script.js")

    display = document.getElementById("display");
});

// heler for clicking a sequence of buttons
function clickButtons(...ids) {
    ids.forEach(id => fireEvent.click(document.getElementById(id)));
}

test("display for a three digit number", () => {

    clickButtons("7", "1", "3");
   
    expect(display.value).toBe("713");
});


test("simple addition operation", () => {
    clickButtons("7", "1", "3", "add", "3", "4", "equal")
  
    expect(display.value).toBe("747");
});


test("two operations", () => {
    clickButtons("1", "2", "add", "7", "minus")
  
    expect(display.value).toBe("19");
});

test("long operation sequence", () => {
    clickButtons("1", "2", "add", "7", "minus", "1", "equal")
  
    expect(display.value).toBe("18");
});

test("multiplication precedence", () => {
    clickButtons("2", "multiply", "3", "add", "3", "2", "equal");
    expect(display.value).toBe("38");

});

test("new calculation after result", () => {
    clickButtons("2", "multiply", "4", "0", "equal", "8", "minus", "4", "equal");
    expect(display.value).toBe("4");

});

test("repeated equal sign continues calculation with previous operand and operator", () => {
    clickButtons("7", "multiply", "3", "equal", "equal", "equal", "equal");
    expect(display.value).toBe("567");

});

test("floats", () => {
    clickButtons("7", ".", "2", "add", "6", ".", "2", "3", "8", "5", "equal");
    expect(display.value).toBe("13.4385");

});

test("clear function", () => {
    clickButtons("2", "multiply", "3", "add", "3", "2", "clear");
    expect(display.value).toBe("");

});


// Edge Cases

test("equal sign first", () => {
    clickButtons("equal");
    expect(display.value).toBe("");

});

test("operator last", () => {
    clickButtons("6", "9", "add");
    expect(display.value).toBe("69");

});



test("divide by 0", () => {
    clickButtons("6", "divide", "0", "equal");
    expect(display.value).toBe("ERROR");

});


