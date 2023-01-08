require('./js/determineInitialStyle')
require('./js/mathjax-config')
require('./js/methodSwitching')

require('./js/customFieldValidation')
require('./js/calculator')
import $ from 'jquery'

import {
  infixToPostfix,
  evaluatePostfix
} from './js/calculator'

function calcBtnAnimation(event) {
  console.log('flag1')

  event.preventDefault() //prevent page from submitting and refresh

  if (isHidden(resultsCard)) {
    //?==> if calcBTN is clicked for the first time, do:
    resultsCard.slideDown() //animate card to slide

    // scroll to the result:
    scrollToTopOf(resultsCard)

    // setTimeout: wait for 2000ms then execute function:
    setTimeout(function () {
      resultsDiv.slideDown()
      // resultsBtnContainer.slideDown()
      scrollToTopOf(resultsCard)
    }, 200)
  } else {
    //?==> if the user pressed the button before:
    // resultsBtnContainer.slideUp()
    //slide up then scroll:
    resultsDiv.slideUp(400, function () {
      scrollToTopOf(resultsCard)
    })
    resultsProgressBar.show(0)

    setTimeout(function () {
      resultsDiv.slideDown()
      scrollToTopOf(resultsCard)
    }, 200)
  }
}
function scrollToTopOf(elementTarget, animationTime = 600) {
  $('body, html').animate(
    {
      scrollTop: $(elementTarget).offset().top,
    },
    animationTime
  )
}

function isHidden(elementTarget) {
  if (elementTarget.is(':hidden')) {
    return true
  }
}
// equ & diff input:
const equInput = $('#math-input')
const plus = $('#plus')
const sub = $('#sub')
const mul = $('#mul')
const div = $('#div')
const mod = $('#pow')
const pow = $('#mod')

const asso_plus = $('#asso-plus')
const asso_sub = $('#asso-sub')
const asso_mul = $('#asso-mul')
const asso_div = $('#asso-div')
const asso_mod = $('#asso-pow')
const asso_pow = $('#asso-mod')

const resultsCard = $('#results-card')
const resultsProgressBar = $('#results-progress-bar')
// const diffInput = $('#diff-input')

// bisection & falsePos only & golden section :

const resultsDiv = $('.results-div')
const calcBtn = $('.calc-btn')

// JavaScript code

// Get a reference to the canvas element
const canvas = document.getElementById("tree-canvas");

// Get a 2D drawing context for the canvas
const ctx = canvas.getContext("2d");

// Define a Node class to represent nodes in the parse tree
class Node {
  constructor(value, x, y) {
    this.value = value;
    this.x = x;
    this.y = y;
    this.left = null;
    this.right = null;
  }
}

// Define a function to draw a line between two nodes
function drawLine(fromNode, toNode) {
  ctx.beginPath();
  ctx.moveTo(fromNode.x, fromNode.y);
  ctx.lineTo(toNode.x, toNode.y);
  ctx.stroke();
}

function drawTree(root) {
  // Base case: if the root node is null, do nothing
  if (root === null) return;

  // Draw the left and right subtrees
  drawTree(root.left);
  drawTree(root.right);

  // If the root node has both a left and right child, draw a line connecting them
  if (root.left && root.right) {
    drawLine(root, root.left);
    drawLine(root, root.right);
  }

  // Draw the label for the root node
  ctx.font = "16px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(root.value, root.x, root.y - 15);
}


// Define a function to build a parse tree from a postfix expression
function buildTree(expression) {
  // Create an empty stack to hold the nodes of the parse tree
  const stack = [];

  // Iterate through the characters in the expression
  for (const char of expression) {
    // If the character is an operand, create a new node for it and push it onto the stack
    if (!isNaN(char)) {
      const node = new Node(char, 0, 0); // (x, y) coordinates will be set later
      stack.push(node);
    }
    // If the character is an operator, create a new node for it and pop the top two nodes from the stack
    else {
      const right = stack.pop();
      const left = stack.pop();
      const node = new Node(char, 0, 0); // (x, y) coordinates will be set later
      node.left = left;
      node.right = right;
      stack.push(node);
    }
  }

  // The stack should now contain a single node which is the root of the parse tree
  return stack.pop();
}

function layoutTree(root) {
  // Create a queue to hold the nodes in the tree
  const queue = [];
  root.x = canvas.width / 2; // Set the root node's x-coordinate to the center of the canvas
  root.y = 20; // Set the root node's y-coordinate to a small value
  queue.push(root);

  // Perform a "breadth-first" traversal of the tree
  while (queue.length > 0) {
    const node = queue.shift();

    // Set the x-coordinate of the left child to be a small value less than the parent's x-coordinate
    if (node.left) {
      node.left.x = node.x - 50;
      node.left.y = node.y + 50;
      queue.push(node.left);
    }

    // Set the x-coordinate of the right child to be a small value greater than the parent's x-coordinate
    if (node.right) {
      node.right.x = node.x + 50;
      node.right.y = node.y + 50;
      queue.push(node.right);
    }
  }
}

$(window).on('load', () => {
  calcBtn.on('click', (event) => {
    event.preventDefault()
    calcBtnAnimation(event)
    // making sure that result div is empty:

    // resultsDiv.html('')

    let OPERATORS = {
      "+": plus.val() || 0,
      "-": sub.val() || 0,
      "*": mul.val() || 1,
      "/": div.val() || 1,
      "^": pow.val() || 2,
      "%": mod.val() || 1,
    };
    let ASSOCIATIVITY = {
      "+": asso_plus.val() || "LTR",
      "-": asso_sub.val() || "LTR",
      "*": asso_mul.val() || "LTR",
      "/": asso_div.val() || "LTR",
      "^": asso_pow.val() || "RTL",
      "%": asso_mod.val() || "LTR",


    };
    const equ = equInput.val();
    const postfix = infixToPostfix(equ, ASSOCIATIVITY, OPERATORS);
    console.log(postfix);
    const result = evaluatePostfix(postfix, OPERATORS);
    //let result = performOperation("+", 2, 3)


    resultsDiv.html(`
    <div class="col s12 center-align">
                <span style="font-weight: 600;">Postfix :</span> <span> ${postfix.join().replaceAll(",", " ") }</span>  
              </div>
              <div class="col s12 center-align">
                <span style="font-weight: 600;">Result :</span> <span> ${equ} =  ${result} </span>
              </div>
    `)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const root = buildTree(postfix.join().replaceAll(",", ""));
    // Layout the nodes of the parse tree
    layoutTree(root);
    // Draw the parse tree on the canvas
    drawTree(root);

  })
})

