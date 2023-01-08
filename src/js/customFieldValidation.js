import $ from 'jquery'
import { validateExpr } from './newMath'


$(window).on('load', () => {
  // equ & diff input:
  const equInput = $('#math-input')
  const equPreview = $('#math-preview')
  const diffInput = $('#diff-input')
  const diffPreview = $('#diff-preview')
  const err = $('#err') //not in hessian
  const maxIter = $('#maxIter')
  const precision = $('#precision')
  const equationinput = $('#equation-input')

  // equation & diff validation:
  equInput.bind('keyup change', () => showValidEqu(equInput, equPreview))
  diffInput.bind('keyup change', () => showValidEqu(diffInput, diffPreview))
  err.bind('keyup change', validErrRange)
  maxIter.bind('keyup change', validIterations)
  precision.bind('keyup change', validDecimals)
  equationinput.find('input-field.number').each.bind('keyup change', temp) //! TODO:fixit
  // validate User Equation Input:
  function showValidEqu(expression, expPreview) {
    const isValid = validateExpr(expression.val())
    if (isValid) {
      expPreview.css('visibility', 'visible')
      expression.removeClass('invalid')
      expression.addClass('valid')
      expPreview.html('`' + expression.val() + '`')
    } else {
      expression.removeClass('valid')
      expression.addClass('invalid')
      expPreview.css('visibility', 'hidden')
    }
    MathJax.typesetClear()
    MathJax.typeset()
  }

  //==> check if (0 < err < 100):
  function validErrRange() {
    let input = parseFloat(err.val())
    if (input <= 0 || input >= 100) {
      err.addClass('invalid')
      err.removeClass('valid')
    } else {
      err.removeClass('invalid')
      err.addClass('valid')
    }

    if (err.val() == '') {
      err.removeClass('valid')
    }
  }

  //check if (0 < max iterations )
  function validIterations() {
    let input = parseFloat(maxIter.val())
    if (input <= 0) {
      maxIter.addClass('invalid')
      maxIter.removeClass('valid')
    } else {
      maxIter.removeClass('invalid')
      maxIter.addClass('valid')
    }

    if (maxIter.val() == '') {
      maxIter.removeClass('valid')
    }
  }

  //check if (0 < max iterations )
  function validDecimals() {
    let input = parseFloat(precision.val())
    if (input < 0) {
      precision.addClass('invalid')
      precision.removeClass('valid')
    } else {
      precision.removeClass('invalid')
      precision.addClass('valid')
    }

    if (precision.val() == '') {
      precision.removeClass('valid')
    }
  }
  function temp() {
    console.log("flag temp");

    if (eval($(this))) {
      $(this).addClass('valid')
      $(this).removeClass('invalid')
    } else {
      $(this).removeClass('valid')
      $(this).addClass('invalid')
    }
  }
})

