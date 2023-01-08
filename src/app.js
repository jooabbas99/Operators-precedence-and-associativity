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

  })
})

