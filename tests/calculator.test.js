const { fireEvent } = require("@testing-library/dom");
const fs = require("fs");
const path = require("path");

let display;

beforeEach(() => {
  // load html into jsdom environment (recreates webpage)
  const html = fs.readFileSync(path.resolve(__dirname, "../index.html"), "utf8");
  document.documentElement.innerHTML = html;

  // Shim innerText for jsdom so handler sees button text
  Object.defineProperty(HTMLElement.prototype, "innerText", {
    configurable: true,
    get() {
      return this.textContent;
    },
    set(value) {
      this.textContent = value;
    },
  });

  // clear script.js for each test
  jest.resetModules();
  require("../script.js");

  display = document.getElementById("display");
});

// helper for clicking a sequence of buttons
function clickButtons(...ids) {
  ids.forEach((id) => fireEvent.click(document.getElementById(id)));
}

describe("Input/Display", () => {
  test("display for a three digit number", () => {
    clickButtons("7", "1", "3");
    expect(display.value).toBe("713");
  });

  test("floats", () => {
    clickButtons("7", ".", "2", "add", "6", ".", "2", "3", "8", "5", "equal");
    expect(display.value).toBe("13.4385");
  });

  test("duplicate decimal is ignored", () => {
    clickButtons("0", ".", ".", "5");
    expect(display.value).toBe("0.5");
  });

  test("incomplete decimal equal uses current number safely", () => {
    clickButtons("2", ".", "equal");
    // Current behavior keeps the trailing decimal; main goal is no crash and a stable value
    expect(display.value).toBe("2.");
  });

  test("operator last keeps current number", () => {
    clickButtons("6", "9", "add");
    expect(display.value).toBe("69");
  });

  test("operator last with power keeps current number", () => {
    clickButtons("6", "9", "power");
    expect(display.value).toBe("69");
  });
});

describe("Binary Ops & Precedence", () => {
  test("simple addition operation", () => {
    clickButtons("7", "1", "3", "add", "3", "4", "equal");
    expect(display.value).toBe("747");
  });

  test("two operations", () => {
    clickButtons("1", "2", "add", "7", "minus");
    expect(display.value).toBe("19");
  });

  test("long operation sequence", () => {
    clickButtons("1", "2", "add", "7", "minus", "1", "equal");
    expect(display.value).toBe("18");
  });

  test("multiplication precedence", () => {
    clickButtons("2", "multiply", "3", "add", "3", "2", "equal");
    expect(display.value).toBe("38");
  });

  test("exponent has higher precedence than multiply", () => {
    clickButtons("2", "multiply", "3", "power", "2", "equal");
    expect(display.value).toBe("18");
  });

  test("exponent has higher precedence than addition", () => {
    clickButtons("2", "add", "3", "power", "2", "equal");
    expect(display.value).toBe("11");
  });

  test("exponent still outranks division", () => {
    clickButtons("8", "divide", "2", "power", "3", "equal");
    expect(display.value).toBe("1");
  });

  test("right-associativity for chained exponents", () => {
    clickButtons("2", "power", "3", "power", "2", "equal");
    expect(display.value).toBe("512");
  });

  test("simple exponent", () => {
    clickButtons("2", "power", "3", "equal");
    expect(display.value).toBe("8");
  });

  test("zero exponent", () => {
    clickButtons("7", "power", "0", "equal");
    expect(display.value).toBe("1");
  });

  test("zero base, positive exponent", () => {
    clickButtons("0", "power", "5", "equal");
    expect(display.value).toBe("0");
  });

  test("power of 1 returns base", () => {
    clickButtons("9", "power", "1", "equal");
    expect(display.value).toBe("9");
  });

  test("mixed precedence chain with power and multiply", () => {
    clickButtons("2", "add", "3", "power", "2", "multiply", "4", "equal");
    expect(display.value).toBe("38");
  });

  test("long sequence mixing power and other operators", () => {
    clickButtons("3", "power", "2", "equal", "multiply", "2", "equal", "minus", "4", "equal");
    expect(display.value).toBe("14");
  });
});

describe("Execution & Equals", () => {
  test("equal sign first", () => {
    clickButtons("equal");
    expect(display.value).toBe("");
  });

  test("new calculation after result", () => {
    clickButtons("2", "multiply", "4", "0", "equal", "8", "minus", "4", "equal");
    expect(display.value).toBe("4");
  });

  test("repeated equal sign continues calculation with previous operand and operator", () => {
    clickButtons("7", "multiply", "3", "equal", "equal", "equal", "equal");
    expect(display.value).toBe("567");
  });

  test("repeated equals continues exponent with previous operand and operator", () => {
    clickButtons("2", "power", "3", "equal", "equal");
    expect(display.value).toBe("512");
  });

  test("repeated equals works for division", () => {
    clickButtons("8", "divide", "2", "equal", "equal", "equal");
    expect(display.value).toBe("1");
  });

  test("repeated equals works for addition", () => {
    clickButtons("2", "add", "3", "equal", "equal", "equal");
    expect(display.value).toBe("11");
  });

  test("repeated equals works for subtraction", () => {
    clickButtons("1", "0", "minus", "3", "equal", "equal", "equal");
    expect(display.value).toBe("1");
  });

  test("repeated equals after power then new operator", () => {
    clickButtons("2", "power", "3", "equal", "equal", "add", "2", "equal");
    expect(display.value).toBe("514");
  });

  test("new calculation after power result", () => {
    clickButtons("2", "power", "3", "equal", "add", "1", "equal");
    expect(display.value).toBe("9");
  });

  test("clear resets repeat-equals memory", () => {
    clickButtons("2", "add", "3", "equal");
    clickButtons("clear", "equal");
    expect(display.value).toBe("");
  });
});

describe("Error & Recovery", () => {
  test("divide by 0", () => {
    clickButtons("6", "divide", "0", "equal");
    expect(display.value).toBe("ERROR");
  });

  test("recover cleanly after divide by zero", () => {
    clickButtons("6", "divide", "0", "equal");
    clickButtons("2", "add", "2", "equal");
    expect(display.value).toBe("4");
  });
});

describe("State & Controls", () => {
  test("clear function", () => {
    clickButtons("2", "multiply", "3", "add", "3", "2", "clear");
    expect(display.value).toBe("");
  });

  test("clear during power entry", () => {
    clickButtons("2", "power", "3", "clear");
    expect(display.value).toBe("");
  });

  test("double power press keeps single operator", () => {
    clickButtons("2", "power", "power", "3", "equal");
    expect(display.value).toBe("8");
  });
});

describe("Edge / Formatting", () => {
  test("fractional base exponent", () => {
    clickButtons("1", ".", "5", "power", "2", "equal");
    expect(display.value).toBe("2.25");
  });

  test("fractional exponent for square root", () => {
    clickButtons("4", "power", "0", ".", "5", "equal");
    expect(display.value).toBe("2");
  });

  test("larger exponent stays accurate", () => {
    clickButtons("2", "power", "1", "0", "equal");
    expect(display.value).toBe("1024");
  });
});
