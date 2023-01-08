import { compile, evaluate, derivative, matrix, rationalize, det, simplify } from 'mathjs'
import { parse, Equation } from 'algebra.js'

export const createExpr = (expr) => compile(`f(x) = ${expr}`)

//! tested (working):
export const validateExpr = (expr) => {
  try {
    const expression = compile(expr)
    // TODO: fix validation for (x only)
    if (!isNaN(expression.evaluate({ x: 1, y: 1 }))) return true
    else return false
  } catch (err) {
    console.log(err)
    return false
  }
}

//? to help
const a = (rows, cols) => {
  var array = new Array(rows)
  for (var i = 0; i < array.length; i++) {
    array[i] = new Array(cols)
  }
  return array
}