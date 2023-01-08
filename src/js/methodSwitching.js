import $ from 'jquery'
const methods = {
  //? export to use in app.js
  bisection: true, //default selected method (will be changed in run time)
  simpleFixed: false,
  falsePosition: false,
  newton: false,
  gauss: false,
  lu: false,
  crammer: false,
  golden: false,
  hessian: false,
}
const inputMethod = {
  equation: true,
  matrix: false,
}
$(window).on('load', () => {
  //?== Animation divs ==?//
  const equInputDiv = $('.equation-input-div') //for animation (slideUp,Down)
  const matrixInputDiv = $('.matrix-input-div') //for animation (slideUp,Down)
  const resultsCard = $('#results-card') //to hide results when method is changed
  const equPreview = $('#math-preview') //to be cleared when  method is changed
  const diffPreview = $('#diff-preview') //to be cleared when method is changed

  //?== Optional fields ==?//
  const equationCard = $('#equation-card')
  const err = $('#err') //to allow optional fields to be empty
  const maxIter = $('#maxIter') //to allow optional fields to be empty
  const diffInput = $('#diff-input') //to allow optional fields to be empty
  const calcBtn = $('.calc-btn') // to be disabled when the  required input fields aren't filled
  const precision = $('#precision')
  const rounding = $('#rounding')
  // resultsCard.hide()
  //?== calcBtn validation (first Run) ==?//
  checkAllInputFields()

  $('#choose-a-method-form').delegate('input', 'change', (event) => {
    //==> remove all data in input fields for equations:
    equationCard.find('input[type!=submit]').val('').removeClass('valid')
    // ==>remove any data preview:
    equPreview.html('')
    diffPreview.html('')
    // ==> if results of a previous equation are displayed--> hide it:
    resultsCard.hide()

    // Change Active method to the selected one:
    for (const method in methods) {
      if (method != event.target.id) methods[method] = false
      else methods[method] = true
    }

    // globally set the input method to be used:
    if (methods.crammer || methods.lu || methods.gauss) {
      inputMethod.matrix = true
      inputMethod.equation = false
    } else {
      inputMethod.equation = true
      inputMethod.matrix = false
    }

    determineStyle().done(checkAllInputFields)
  })

  function determineStyle() {
    //!======================= clean this shit ======================! //

    const r = $.Deferred()

    // if any method except newton ==> hide diff input:
    if (!methods.newton) {
      $('.diff-input').slideUp()
      $('.diff-preview').slideUp()
    }

    /*
      -if any  method that requires input as a matrix ==> show matrixInputDiv and hide equInputDiv.
      -else if any  method that requires input as a equation ==> show equInputDiv and hide matrixInputDiv.
    */
    if (inputMethod.matrix) {
      equationCard.find('span.card-title').html('Enter the Augmented Matrix')
      if (equInputDiv.is(':visible')) equInputDiv.slideUp(700, () => matrixInputDiv.slideDown(600, () => r.resolve())) // slide up and down
    } else if (matrixInputDiv.is(':visible')) matrixInputDiv.slideUp(700, () => equInputDiv.slideDown(600, () => r.resolve())) // slide up and down

    //==> change visible inputs based on selected method:
    if (methods.bisection || methods.falsePosition || methods.golden) {
      $('.x0-div').hide(500)
      $('.x-div').hide(500)
      $('.y-div').hide(500)
      $('.xl-div').show(500)
      $('.xu-div').show(500)
      $('.max-iter-div').show(500)

      // for golden
      if (methods.golden) $('.err-div').hide(500)
      else $('.err-div').show(500)
      equationCard.find('span.card-title').html('Enter a Function ')
      equationCard.find('label[for="math-input"]').html('`f(x)=`')

      //TODO: Find better way (resolve one time)
      r.resolve()
    } else if (methods.simpleFixed || methods.newton) {
      // common in both:
      $('.xl-div').hide(500)
      $('.xu-div').hide(500)
      $('.x-div').hide(500)
      $('.y-div').hide(500)
      $('.x0-div').show(500)
      $('.err-div').show(500)
      $('.max-iter-div').show(500)
      // unique:
      if (methods.simpleFixed) {
        equationCard.find('span.card-title').html('Enter a function in the form: `x=g(x)`')
        equationCard.find('label[for="math-input"]').html('`x=`')
      } else if (methods.newton) {
        equationCard.find('span.card-title').html('Enter a Function')
        equationCard.find('label[for="math-input"]').html('`f(x)=`')
        $('.diff-input').slideDown()
        $('.diff-preview').slideDown()
      }
      //TODO: Find better way (resolve one time)
      r.resolve()
    } else if (methods.hessian) {
      $('.xl-div').hide(500)
      $('.xu-div').hide(500)
      $('.x0-div').hide(500)
      $('.err-div').hide(500)
      $('.max-iter-div').hide(500)
      $('.x-div').show(500)
      $('.y-div').show(500)
      equationCard.find('span.card-title').html('Enter a Function')
      equationCard.find('label[for="math-input"]').html('`f(x,y)=`')
      //TODO: Find better way (resolve one time)
      r.resolve()
    }

    MathJax.typesetClear()
    MathJax.typeset()
    return r
  }

  //!========================= Helper Functions =========================!//
  //!==> check if all input fields are filled:  if true --> make calculate button clickable:
  function checkAllInputFields() {
    //run for the first time (run on method change [without change in equation input]):
    if (isAllValid()) calcBtn.prop('disabled', false)
    else calcBtn.prop('disabled', true)

    // bind it:
    equationCard.find('input[type!=submit]:visible').bind('keyup change', () => {
      if (isAllValid()) calcBtn.prop('disabled', false)
      else calcBtn.prop('disabled', true)
    })
  }

  function isAllValid() {
    //find each input field in the "equation card" that:
    //1. visible to the user (don't count input fields that are hidden [only showed when the user change the Numerical method]).
    //2. not a submit button (to don't count the calculate button).
    // console.log("isAllValid");

    let allFieldsValid = true
    //check if any of those input fields have empty value or have "invalid" class:
    //! don't use arrow functions ("this" will reference to different element)
    equationCard.find('input[type!=submit]:visible').each(function () {
      //==> if any field that isn't (maxIter) or (err) or (derivative in newton func) is empty then return false:
      if (
        $(this).val() == '' &&
        !$(this).is(maxIter) &&
        !$(this).is(err) &&
        !$(this).is(diffInput) &&
        !$(this).is(rounding) &&
        !$(this).is(precision)
      )
        allFieldsValid = false
      //==> if both maxIter and err are empty empty then return false: //!(inputMethod.equation) is important here
      else if (err.val() == '' && maxIter.val() == '' && inputMethod.equation && !methods.hessian) allFieldsValid = false
      // if any field has invalid value, disable calcBtn
      else if ($(this).hasClass('invalid')) allFieldsValid = false
    })
    console.log('allFieldsValid:', allFieldsValid)
    return allFieldsValid
  }

  //!==========================================================================!//
})
