
export const infixToPostfix =(expression, associativity, operators) =>{
    let stack = [];
    let output = [];
    // foreach in js 
    for (const token of expression) {
        if (token in operators) {
            while (stack.length
                &&
                stack[stack.length - 1] in operators
                &&
                (
                    (associativity[token] === "LTR" &&
                        operators[token] <= operators[stack[stack.length - 1]]
                    )
                    ||
                    (associativity[token] === "RTL" &&
                        operators[token] < operators[stack[stack.length - 1]]
                    )
                )
            ) {
                output.push(stack.pop());
            }
            stack.push(token);

        } else if (token === "(") {
            stack.push(token);
        } else if (token === ")") {
            while (stack.length && stack[stack.length - 1] !== "(") {
                output.push(stack.pop());
            }
            stack.pop();
        } else if (token !== " ") {
            output.push(parseFloat(token));
        }
    }
    while (stack.length) {
        output.push(stack.pop());
    }
    return output;
}
export const performOperation = (operator, firstOperand, secondOperand) => {
    switch (operator) {
        case "+":
            return firstOperand + secondOperand;
        case "-":
            return firstOperand - secondOperand;
        case "*":
            return firstOperand * secondOperand;
        case "/":
            return firstOperand / secondOperand;
        case "^":
            return Math.pow(firstOperand, secondOperand);
        case "%":
            return firstOperand % secondOperand;
        default:
            throw new Error("Invalid operator");
    }
}

export const evaluatePostfix = (expression, operators) => {
    let stack = [];
    let secondOperand, firstOperand, result;
    for (const token of expression) {
        if (token in operators) {
            // operator
            secondOperand = stack.pop();
            firstOperand = stack.pop();
            result = performOperation(token, firstOperand, secondOperand);
            stack.push(result);
        } else if (token != ' ') {
            // operand
            stack.push(parseFloat(token));
        }
    }
    return stack[0];
}
