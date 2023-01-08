//! TODO: (IMPORANT): check if the values is already (0) in each step (m21,m31,m32).
//! TODO: (IMPORANT): rearrange rows (if this will help to not divide by (0) when calculating (m21,m31,m32))
//TODO: device orientation fix -> https://developer.mozilla.org/en-US/docs/Web/API/Detecting_device_orientation

//!====================== MathJax configuration ======================!//
window.MathJax = {
  loader: { load: ['input/asciimath', 'output/svg'] },
  asciimath: {
    delimiters: [
      ['$$', '$$'],
      ['`', '`'],
    ],
  },
}

//
//==>  Load MathJax:
//

var script = document.createElement('script')
script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3.0.0/es5/startup.js'
script.setAttribute('id', 'MathJax-script')
document.head.appendChild(script)

//!===================================================================!//

//!====================== Used DOM Elements ======================!//
//===> "Choose a method card" components:
let selectedMethod = 'bisection-method' //(default = bisection)(changed by user later)
const simpleFixedPointId = 'simple-fixed-point-method'
const bisectionId = 'bisection-method'
const falsePositionId = 'false-position-method'
const newtonID = 'newton-method'
const gaussID = 'gauss-method'
const luID = 'lu-method'
const cramerID = 'cramer-method'

//===>load animation cycle between the two cards:
let loadingPageAnimation

//===> "equation card" components:
let equationCard
let rootOfPolynomialsDiv //? input for rootOfPolynomials methods.
let linearAlgebraicEquationsDiv //? input for linearAlgebraicEquation methods.
let calcBtn
let mathInput //f(x)
let mathPreview
let diffInput = $('.diff-input') // f'(x)
let diffPreview = $('.diff-preview')
let err //for all rootOfPolynomials methods
let maxIter //for all rootOfPolynomials methods.
let xl // for bisection & false position
let xu // for bisection & false position
let xr // for bisection & false position
let x0 //for simple fixed point & newton.

//===> "results card" components:
let resultsCard
let resultsProgressBar
let rootOfPolynomialsResultsDiv //? contains rootOfPolynomials results and used to make slide animation work
let isRootOfPolynomialsMethod = true //? flag to determine if the method is in Root Of Polynomials. (used for validation in checkAllInputFields()) & get changed in switchToRootOfPolynomialsDiv() & switchToLinearAlgebraicEquationsDiv().
let linearAlgebraicEquationsResultsDiv //? contains linearAlgebraicEquations results and used to make slide animation work
let rootOfPolynomialsResultsTable //results table
let rootOfPolynomialsResultsTableHead
let rootOfPolynomialsResultsTableBody
let resultsBtnContainer
let pcDownloadBtn

//====> mobile buttons:
const isMobile = isMobileBrowser()
let mobBMenuBtn //main Button for mobiles only (inserted after the 'results' table)
let mobRotateBtn //part of menu btn
let mobDownloadBtn //part of menu btn
let mobLandscapeDownloadBtn //used instead of menu btn if mobile is in landscape mode
//!===================================================================!//

//!========================== Main Functions ==========================!//

$(document).ready(function () {
  loadDomElements() //==> load DOM Elements
  $('#choose-a-method-form').delegate('input', 'change', function (event) {
    selectedMethod = event.target.id //change method global var.
    changeEquationCardForm()
  })
})

$(window).on('load', function () {
  loadingPageAnimation.hide(0) //==> hide website is loading cycle
  equationCard.slideDown(700) //==> To fix "equation shows before MathJax rendering"
  determineWebsiteStyle() //==>if mobile then add its
  loadEventListeners() //==> Load Event Listeners

  checkAllInputFields() //==> check if all input fields are filled:  if true --> make calculate button clickable.
})
//!===================================================================!//

//!==================== helper functions (called when needed) ====================!//
//==> load all event Listeners:
function loadEventListeners() {
  mathInput.bind('keyup change', equationValidation) //on change or keyup
  diffInput.bind('keyup change', diffValidation) //on change or keyup
  err.bind('keyup change', validErrRange) //on change or keyup
  maxIter.bind('keyup change', validIterations)

  calcBtn.on('click', (error) => {
    error.preventDefault()
    //make sure that there is no rows in the results table body:
    rootOfPolynomialsResultsTableBody.html('')
    linearAlgebraicEquationsResultsDiv.html('')
    //!==> actual calculation:
    //values =  bisectionId - falsePositionId - simpleFixedPointId - newtonID - gaussID - luID - cramerID
    switch (selectedMethod) {
      case bisectionId:
      case falsePositionId:
        calcBisectionAndFalsePos(xl.val(), xu.val(), err.val(), mathInput.val(), maxIter.val())
        break
      case simpleFixedPointId:
        calcSimplePoint(x0.val(), err.val(), mathInput.val(), maxIter.val())
        break
      case newtonID:
        calcNewton(mathInput.val(), x0.val(), err.val(), mathInput.val(), maxIter.val(), diffInput.val())
        break
      case gaussID:
        if (isValidSystem()) {
          gauss()
        }
        // gauss();
        break
      case luID:
        if (isValidSystem()) {
          lu()
        }
        break
      case cramerID:
        if (isValidSystem()) {
          cramer()
        }
        break
    }
  })

  //==> Event listeners for mobile only:
  if (isMobile) {
    $(window).on('orientationchange', changeMobResultsStylingOnOrientation)
    mobRotateBtn.on('click', rotateScreenUsingBtn)
  }
}

//===> Puts DOM elements in variables
function loadDomElements() {
  //==> "choose a method card" components:

  //==> the loading cycle between the two cards
  loadingPageAnimation = $('.pageLoadAnimation')

  //===> "equation card" components:
  equationCard = $('#equation-card')
  rootOfPolynomialsDiv = $('.root-of-polynomials-div')
  linearAlgebraicEquationsDiv = $('.linear-algebraic-equations-div')
  mathInput = $('#math-input')
  mathPreview = $('#math-preview')
  diffInput = $('#diff-input')
  diffPreview = $('#diff-preview')
  calcBtn = $('.calc-btn')
  err = $('#err') //for all rootOfPolynomials methods.
  maxIter = $('#maxIter') // for all rootOfPolynomials methods.
  xl = $('#xl') // for bisection & false position
  xu = $('#xu') // for bisection & false position
  xr = $('#xr') // for bisection & false position
  x0 = $('#x0') //for simple fixed point.

  //===> "results card" components:
  resultsCard = $('#results-card') // the results card
  resultsProgressBar = $('.results-progress-bar')
  rootOfPolynomialsResultsDiv = $('.root-of-polynomials-results-div') //? used to make slide animation work --> see: https://stackoverflow.com/questions/6917248/jquery-slideup-slidedown-functions-not-animating/31114133
  linearAlgebraicEquationsResultsDiv = $('.linear-algebraic-equations-results-div')
  rootOfPolynomialsResultsTable = $('.root-of-polynomials-results-table') //results table
  rootOfPolynomialsResultsTableHead = $('.root-of-polynomials-results-table-header')
  rootOfPolynomialsResultsTableBody = $('.root-of-polynomials-results-table-body')
  resultsBtnContainer = $('.results-buttons-container')
  pcDownloadBtn = $(
    '<div class="col s12 center-align pc-download-btn"> <a class="waves-effect waves-light btn"><i class="material-icons right">file_download</i>Download</a> </div>'
  )

  //?====> mobile buttons:
  mobBMenuBtn = $(
    '<div class="menu-btn-div fixed-action-btn" style="position: absolute; right: 24px;"> <a class="menu-btn btn-floating btn-large lighten-2 pulse"> <i class="large material-icons">menu</i> </a> <ul> <li> <a class="download-btn btn-floating light-blue darken-2"><i class="material-icons">file_download</i></a> </li><li> <a class="rotate-btn btn-floating deep-orange lighten-1 pulse"><i class="material-icons">screen_rotation</i></a> </li></ul> </div>'
  ) //main Button for mobiles only (inserted after the 'results' table)
  mobRotateBtn = $('.rotate-btn') //part of menu btn
  mobDownloadBtn = $('.download-btn') //part of menu btn
  mobLandscapeDownloadBtn = $(
    '<a style="display: none;" class="download-btn btn-floating btn-large lighten-2"><i class="material-icons">file_download</i></a>'
  ) //used instead of menu btn if mobile is in landscape mode
}

//===> check if device is mobile:
function isMobileBrowser() {
  window.mobilecheck = function () {
    var check = false
      ; (function (a) {
        if (
          /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
            a
          ) ||
          /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
            a.substr(0, 4)
          )
        )
          check = true
      })(navigator.userAgent || navigator.vendor || window.opera)
    return check
  }
  return window.mobilecheck()
}

function determineWebsiteStyle() {
  if (isMobile) {
    //!===> 1. append mobile buttons & make table responsive:
    let orn = getOrientation()
    if (orn == 'portrait-primary' || 'portrait-secondary') {
      rootOfPolynomialsResultsTable.addClass('responsive-table') //make table responsive
      mobBMenuBtn.appendTo(resultsBtnContainer) //add change menu btn (contain 'pdf download' and 'screen rotation')
      mobLandscapeDownloadBtn.appendTo(resultsBtnContainer) //(hidden) (take menu btn place in landscape mode)

      mobRotateBtn = $('.rotate-btn')
      mobBMenuBtn.show(0)
    }

    //!====> 2. init floating btn (materialize):
    var elems = document.querySelectorAll('.fixed-action-btn')
    var instances = M.FloatingActionButton.init(elems, {
      direction: 'left',
      hoverEnabled: false,
    })

    $('.fixed-action-btn').on('click', function () {
      if ($('.menu-btn').hasClass('pulse')) {
        $('.menu-btn').removeClass('pulse')
      } else {
        $('.menu-btn').addClass('pulse')
      }
    })

    //!====> 3. device orientation auto handling (requires https)   //TODO: make it work
    if (window.DeviceOrientationEvent) {
      window.addEventListener(
        'deviceorientation',
        function (event) {
          // alpha: rotation around z-axis
          var rotateDegrees = event.alpha
          // gamma: left to right
          var leftToRight = event.gamma
          // beta: front back motion
          var frontToBack = event.beta

          handleOrientationEvent(frontToBack, leftToRight, rotateDegrees)
        },
        true
      )
    }
    var handleOrientationEvent = function (frontToBack, leftToRight, rotateDegrees) { }
  } else {
    pcDownloadBtn.appendTo(resultsBtnContainer)
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

//===> check if an HTML element is hidden
function isHidden(elementTarget) {
  if (elementTarget.is(':hidden')) {
    return true
  }
}

//==> calculate the results using bisection And false pos methods //?(combined together because the only diff is how we calc xr):
function calcBisectionAndFalsePos(xl, xu, targetErr, maxIter) {
  //?==> note: nerdamer has the input function from the validation phase (in 'equationValidation' function).
  //?==> note: f() is a function to shorten the syntax of nerdamer default evaluate function.

  let iter = 0,
    currentErr = 100,
    xr = 0,
    xrOld = 0

  if (f(xl) * f(xu) < 0) {
    //!==> calc the results and append it to the result table:
    //add the table header:
    rootOfPolynomialsResultsTableHead.html(`
      <tr>
        <th>i</th>
        <th>\`X_{ l }\`</th>
        <th>\`f(X_{ l })\`</th>
        <th>\`X_{ u }\`</th>
        <th>\`f(X_{ u })\`</th>
        <th>\`X_{ r }\`</th>
        <th>\`f(X_{ r })\`</th>
        <th>\`\ varepsilon_e\`</th>
      </tr>
    `)
    //render the dynamically added math:
    MathJax.typesetClear()
    MathJax.typeset()

    do {
      xrOld = xr

      if (selectedMethod == bisectionId) {
        xr = (xl + xu) / 2
      } else if (selectedMethod == falsePositionId) {
        xr = xu - (f(xu) * (xl - xu)) / (f(xl) - f(xu))
      }

      currentErr = Math.abs((xr - xrOld) / xr) * 100

      //append every result to the result table:
      rootOfPolynomialsResultsTableBody.append(`
        <tr>
          <td>${iter}</td>
          <td>${+parseFloat(xl).toFixed(3)}</td>
          <td>${f(xl)}</td>
          <td>${+parseFloat(xu).toFixed(3)}</td>
          <td>${f(xu)}</td>
          <td>${+parseFloat(xr).toFixed(3)}</td>
          <td>${f(xr)}</td>
          <td>${iter == 0 ? '----' : +parseFloat(currentErr).toFixed(3)}</td>
        </tr>
      `)
      if (f(xl) * f(xr) == 0) {
        //!==> animation:
        calcBtnAnimation(event)
        return xr
      } else if (f(xl) * f(xr) > 0) {
        xl = xr
      } else if (f(xl) * f(xr) < 0) {
        xu = xr
      }
      iter++
    } while ((targetErr == '' ? true : currentErr >= targetErr) && (maxIter == '' ? true : iter < maxIter))
    //!==> animation:
    calcBtnAnimation(event)
  } else {
    Swal.fire({
      icon: 'error',
      title: "Root isn't in the interval",
      text: 'Please try different `x_{l}` and `x_{u}` values',
      footer: 'Note: result of &nbsp; `(x_{l} * x_{u})` &nbsp; should be negative. ',
      confirmButtonColor: '#26a69a',
    })
    MathJax.typesetClear()
    MathJax.typeset()
  }
}

//==> calculate the results using simple fixed point method:
function calcSimplePoint(x0, targetErr, maxIter) {
  //TODO: automatically convert from f(x)=0 to x=g(x) see for start:
  //! https://www.mathworks.com/matlabcentral/answers/420945-how-can-i-rearrange-an-equation-with-only-one-variable
  //https://www.youtube.com/watch?v=ioIKsn3jE6E
  //!https://www.mathworks.com/matlabcentral/answers/44153-rearrange-variables-in-an-equation

  let iter = 0,
    currentErr,
    xi = 0,
    xiOld = 0

  //add the table header:
  rootOfPolynomialsResultsTableHead.html(`
      <tr>
        <th>i</th>
        <th>\`X_{ i }\`</th>
        <th>\`f(X_{ i })\`</th>
        <th>\`\ varepsilon_e\`</th>
      </tr>
    `)
  //render the dynamically added math:
  MathJax.typesetClear()
  MathJax.typeset()

  //make sure that there is no rows in the results table body:
  rootOfPolynomialsResultsTableBody.html('')

  xi = x0 //start with x0 (initial point by the user)
  do {
    currentErr = Math.abs((xi - xiOld) / xi) * 100
    //append every result to the result table:
    rootOfPolynomialsResultsTableBody.append(`
        <tr>
          <td>${iter}</td>
          <td>${+parseFloat(xi).toFixed(3)}</td>
          <td>${f(xi)}</td>
          <td>${iter == 0 ? '----' : +parseFloat(currentErr).toFixed(3)}</td>
        </tr>
      `)
    xiOld = xi
    xi = f(xi)
    iter++
  } while ((targetErr == '' ? true : currentErr >= targetErr) && (maxIter == '' ? true : iter < maxIter))

  calcBtnAnimation(event)
}

function calcNewton(expression, x0, targetErr, maxIter, diff) {
  let iter = 0,
    currentErr = 0,
    xi,
    xiOld,
    fx,
    fxDash,
    derivative

  //add the table header:
  rootOfPolynomialsResultsTableHead.html(`
      <tr>
        <th>i</th>
        <th>\`X_{ i }\`</th>
        <th>\`f(X_{ i })\`</th>
        <th>\`f'(X_{ i })\`</th>
        <th>\`\ varepsilon_e\`</th>
      </tr>
    `)
  //render the dynamically added math:
  MathJax.typesetClear()
  MathJax.typeset()

  //make sure that there is no rows in the results table body:
  rootOfPolynomialsResultsTableBody.html('')

  // determine the derivative:
  if (diff == '') {
    derivative = nerdamer.diff(expression).toString() //f'(x)
  } else {
    derivative = diff
  }

  xi = x0 //initial point by user.
  do {
    xiOld = xi
    nerdamer.setFunction('f', ['x'], expression)
    fx = f(xi)
    nerdamer.setFunction('f', ['x'], derivative)
    fxDash = f(xi)

    //append every result to the result table:
    rootOfPolynomialsResultsTableBody.append(
      `
        <tr>
          <td>${iter}</td>
          <td>${+parseFloat(xi).toFixed(3)}</td>
          <td>${+parseFloat(fx).toFixed(3)}</td>
          <td>${+parseFloat(fxDash).toFixed(3)}</td>
          <td>${iter == 0 ? '----' : +parseFloat(currentErr).toFixed(3)}</td>
        </tr>
      `
    )
    xi = xi - fx / fxDash
    currentErr = Math.abs((xi - xiOld) / xi) * 100
    iter++
  } while ((targetErr == '' ? true : currentErr >= targetErr) && (maxIter == '' ? true : iter <= maxIter))

  calcBtnAnimation(event)
}

//!===========> Functions called by Event Listeners:
//====> full animation of results calculation =====!//
function calcBtnAnimation(event) {
  event.preventDefault() //prevent page from submitting and refresh
  if (isRootOfPolynomialsMethod) {
    if (isHidden(resultsCard)) {
      //?==> if calcBTN is clicked for the first time, do:
      resultsCard.slideDown() //animate card to slide

      // scroll to the result:
      scrollToTopOf(resultsCard)

      // setTimeout: wait for 2000ms then execute function:
      setTimeout(function () {
        resultsProgressBar.hide(0) // 0 ms animation time
        rootOfPolynomialsResultsDiv.slideDown()
        resultsBtnContainer.slideDown()
        scrollToTopOf(resultsCard)
      }, 2000)
    } else {
      //?==> if the user pressed the button before:
      resultsBtnContainer.slideUp()
      //slide up then scroll:
      rootOfPolynomialsResultsDiv.slideUp(400, function () {
        scrollToTopOf(resultsCard)
      })
      resultsProgressBar.show(0)

      setTimeout(function () {
        resultsProgressBar.hide(0)
        rootOfPolynomialsResultsDiv.slideDown()
        resultsBtnContainer.slideDown()
        scrollToTopOf(resultsCard)
      }, 2300)
    }
  } else {
    if (isHidden(resultsCard)) {
      //?==> if calcBTN is clicked for the first time, do:
      resultsCard.slideDown() //animate card to slide

      // scroll to the result:
      scrollToTopOf(resultsCard)

      // setTimeout: wait for 2000ms then execute function:
      setTimeout(function () {
        resultsProgressBar.hide(0) // 0 ms animation time
        linearAlgebraicEquationsResultsDiv.slideDown()
        resultsBtnContainer.slideDown()
        scrollToTopOf(resultsCard)
      }, 2000)
    } else {
      //?==> if the user pressed the button before:
      resultsBtnContainer.slideUp()
      //slide up then scroll:
      linearAlgebraicEquationsResultsDiv.slideUp(400, function () {
        scrollToTopOf(resultsCard)
      })
      resultsProgressBar.show(0)

      setTimeout(function () {
        resultsProgressBar.hide(0)
        linearAlgebraicEquationsResultsDiv.slideDown()
        resultsBtnContainer.slideDown()
        scrollToTopOf(resultsCard)
      }, 2300)
    }
  }
}

//==> rotate the mobile screen using the 'rotateBTN':
function rotateScreenUsingBtn() {
  let orientation = getOrientation()
  //!==> document.fullscreenElement ->return true if fullscreen, if not then return null.
  if (orientation == ('portrait-primary' || 'portrait-secondary') && document.fullscreenElement === null) {
    if (document.fullscreenEnabled) {
      fullScreen()
      screen.orientation.lock('landscape-primary')
    } else {
      Swal.fire({
        icon: 'info',
        title: 'Oops...',
        text:
          "Your browser version doesn't support screen rotation using this button. for better experience, please rotate your device manually.",
        confirmButtonColor: '#26a69a',
      })
    }
  }
  //==> if in fullscreen (locked to landscape) --> return to portrait then exit fullscreen
  if (document.fullscreenElement != null) {
    screen.orientation.lock('portrait-primary')
    smolScreen()
  }

  //==> scroll to results section:
  scrollToTopOf(resultsCard)
}

//==> check if f(x)  is valid:
function equationValidation() {
  let equation = mathInput.val().toLowerCase()
  try {
    //!======================= Validation =======================//
    //?==> if true (nerdamer returns a value that isn't a 'decimal num'), it will throw 'Invalid Equation' error
    nerdamer.setFunction('f', ['x'], equation)
    if (isNaN(nerdamer('f(1)').evaluate().toDecimal())) {
      throw new Error('Invalid Equation')
    }

    //?====> if equ is valid, change style to:
    mathPreview.css('visibility', 'visible')
    mathInput.removeClass('invalid')
    mathInput.addClass('valid')
    mathPreview.html('`' + equation + '`')
  } catch (err) {
    //?====> if equ isn't valid, change style to:
    mathInput.removeClass('valid')
    mathInput.addClass('invalid')
    console.log(err.message)
    mathPreview.css('visibility', 'hidden')
  }
  //!==========================================================//
  //===> tell MathJax to look for unprocessed mathematics on the page and typeset it:
  MathJax.typesetClear()
  MathJax.typeset()
}
//==> check if  f'(x) is valid:
function diffValidation() {
  let equation = diffInput.val().toLowerCase()
  try {
    //!======================= Validation =======================//
    //?==> if true (nerdamer returns a value that isn't a 'decimal num'), it will throw 'Invalid Equation' error
    nerdamer.setFunction('f', ['x'], equation)
    if (isNaN(nerdamer('f(1)').evaluate().toDecimal())) {
      throw new Error('Invalid Equation')
    }

    //?====> if equ is valid, change style to:
    diffPreview.css('visibility', 'visible')
    diffInput.removeClass('invalid')
    diffInput.addClass('valid')

    diffPreview.html('`' + equation + '`')
  } catch (err) {
    //?====> if equ isn't valid, change style to:
    diffInput.removeClass('valid')
    diffInput.addClass('invalid')
    console.log(err.message)
    diffPreview.css('visibility', 'hidden')
  }
  //!==========================================================//
  //===> tell MathJax to look for unprocessed mathematics on the page and typeset it:
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

//check if the augmented matrix equation system is valid:
function isValidSystem() {
  //? want explanation? ==> watch: https://www.youtube.com/watch?v=iwoNmfLtoy8
  //? ==> input matrix values:
  // row1:
  // augMat[0][0] = document.getElementById('a1').value;
  // augMat[0][1] = document.getElementById('a2').value;
  // augMat[0][2] = document.getElementById('a3').value;
  // augMat[0][3] = document.getElementById('x1').value;

  // row 2:
  // augMat[1][0] = document.getElementById('b1').value;
  // augMat[1][1] = document.getElementById('b2').value;
  // augMat[1][2] = document.getElementById('b3').value;
  // augMat[1][3] = document.getElementById('x2').value;
  // row 3:

  // augMat[2][0] = document.getElementById('c1').value;
  // augMat[2][1] = document.getElementById('c2').value;
  // augMat[2][2] = document.getElementById('c3').value;
  // augMat[2][3] = document.getElementById('x3').value;
  let augMat = getMatrix()
  const hasNoSol = () =>
    (augMat[0][0] == 0 && augMat[0][1] == 0 && augMat[0][2] == 0 && augMat[0][3] != 0) ||
    (augMat[1][0] == 0 && augMat[1][1] == 0 && augMat[1][2] == 0 && augMat[1][3] != 0) ||
    (augMat[2][0] == 0 && augMat[2][1] == 0 && augMat[2][2] == 0 && augMat[2][3] != 0)

  //!==> case of 0 sol:
  if (hasNoSol()) {
    Swal.fire({
      icon: 'error',
      title: 'The System has no Solution',
      text: 'Please try different values',
      confirmButtonColor: '#26a69a',
    })
    return false
  }

  //!==> case of 1 sol:
  if (
    augMat[0][0] != 0 &&
    augMat[0][1] == 0 &&
    augMat[0][2] == 0 &&
    augMat[1][0] == 0 &&
    augMat[1][1] != 0 &&
    augMat[1][2] == 0 &&
    augMat[2][0] == 0 &&
    augMat[2][1] == 0 &&
    augMat[2][2] != 0
  ) {
    linearAlgebraicEquationsResultsDiv.append(
      `
      <p style="margin-top:2px; margin-bottom: 2px; font-size:120%; font-weight:bold;">
        The Matrix is already in the in a simple Form and the system has 1 solution:
      </p>
      `
    )

    //==> get x1,x2,x3
    let x1 = augMat[0][3] / augMat[0][0]
    let x2 = augMat[1][3] / augMat[1][1]
    let x3 = augMat[2][3] / augMat[2][2]

    //display x1,x2,x3:
    linearAlgebraicEquationsResultsDiv.append(
      `
      <p style="margin-top:2px; margin-bottom: 2px; font-size:120%; font-weight:bold;">\`x_{1}=${+parseFloat(x1).toFixed(2)}\`</p>
      <p style="margin-top:2px; margin-bottom: 2px; font-size:120%; font-weight:bold;">\`x_{2}=${+parseFloat(x2).toFixed(2)}\`</p>
      <p style="margin-top:2px; margin-bottom: 2px; font-size:120%; font-weight:bold;">\`x_{3}=${+parseFloat(x3).toFixed(2)}\`</p>
    `
    )
    MathJax.typesetClear()
    MathJax.typeset()
    calcBtnAnimation(event)
    return false
  }

  //!==> case of  0 sol:
  // calc m31 (the augmented matrix after the third zero):
  let m21 = augMat[1][0] / augMat[0][0]
  for (i = 0; i < 4; i++) {
    augMat[1][i] -= m21 * augMat[0][i]
  }
  // calc m31 (the augmented matrix after the third zero):
  let m31 = augMat[2][0] / augMat[0][0]
  for (i = 0; i < 4; i++) {
    augMat[2][i] -= m31 * augMat[0][i]
  }
  // calc m31 (the augmented matrix after the third zero):
  let m32 = augMat[2][1] / augMat[1][1]
  for (i = 0; i < 4; i++) {
    augMat[2][i] -= m32 * augMat[1][i]
  }
  //!==> case of 0 sol (AGAIN :[ ):
  if (hasNoSol()) {
    Swal.fire({
      icon: 'error',
      title: 'The System has no Solution',
      text: 'Please try different values',
      confirmButtonColor: '#26a69a',
    })
    return false
  }

  // TODO: think how to handle it properly:
  //!==> case of  infinite sol:
  // if (true) {
  //   Swal.fire({
  //     icon: 'error',
  //     title: 'The System has infinite Solution',
  //     text: 'Please try different values',
  //     confirmButtonColor: '#26a69a',
  //   });
  // }
  return true
}

//==> check if all input fields are filled:  if true --> make calculate button clickable:
function checkAllInputFields() {
  //find each input field in the "equation card" that:
  //1. visible to the user (don't count input fields that are hidden [only showed when the user change the Numerical method]).
  //2. not a submit button (to don't count the calculate button).
  function isAllValid() {
    let allFieldsValid = true
    //check if any of those input fields have empty value or have "invalid" class:
    equationCard.find('input[type!=submit]:visible').each(function () {
      //==> !$(this).is(maxIter) to leave max iteration variable as optional.
      // if (($(this).val() == '' && !$(this).is(maxIter)) || $(this).hasClass('invalid')) {
      //   allFieldsValid = false;
      // }

      //==> if any field that isn't (maxIter) or (err) or (derivative in newton func) is empty then return false:
      if ($(this).val() == '' && !$(this).is(maxIter) && !$(this).is(err) && !$(this).is(diffInput)) {
        allFieldsValid = false
      }
      //==> if both maxIter and err are empty empty then return false:
      else if (err.val() == '' && maxIter.val() == '' && isRootOfPolynomialsMethod) {
        allFieldsValid = false
      } else if ($(this).hasClass('invalid')) {
        allFieldsValid = false
      }
    })

    if (allFieldsValid) {
      // calcBtn.removeClass('disabled');
      calcBtn.prop('disabled', false)
    } else {
      // calcBtn.addClass('disabled');
      calcBtn.prop('disabled', true)
    }
  }

  isAllValid() //run for the first time (run on method change [without change in equation input])
  equationCard.find('input[type!=submit]:visible').bind('keyup change', isAllValid) //check for input changes then run it.
}

//==> change requested form inputs (with animation and reset values):
function changeEquationCardForm() {
  //==> remove math preview:
  mathPreview.html('')

  //==> remove all data in input fields for equations (and leave matrices default values):
  rootOfPolynomialsDiv.find('input[type!=submit]:visible').val('').removeClass('valid')

  //==>hide input fields that isn't required for the chosen method:
  switch (selectedMethod) {
    case falsePositionId:
    case bisectionId:
      $('.x0-div').hide(500)
      $('.xl-div').show(500)
      $('.xu-div').show(500)
      // calcBtn.addClass('disabled');
      calcBtn.prop('disabled', true)
      switchToRootOfPolynomialsDiv()
      break

    case simpleFixedPointId:
      $('.xl-div').hide(500)
      $('.xu-div').hide(500)
      $('.x0-div').show(500)
      // calcBtn.addClass('disabled');
      calcBtn.prop('disabled', true)
      switchToRootOfPolynomialsDiv()
      break

    case newtonID:
      $('.xl-div').hide(500)
      $('.xu-div').hide(500)
      $('.x0-div').show(500)
      switchToRootOfPolynomialsDiv()
      break
    case gaussID:
      switchToLinearAlgebraicEquationsDiv()
      break
    case luID:
      switchToLinearAlgebraicEquationsDiv()
      break
    case cramerID:
      switchToLinearAlgebraicEquationsDiv()
      break
  }
  // ==> if results of a previous equation are displayed--> hide it:
  resultsCard.hide() //! TODO: ask the doctor for her opinion

  //==> check validation of all visible input fields: //! must come after the switch method (hide and show input fields)
  checkAllInputFields()
}

//==> shorten nerdamer expression that evaluates f(x):
function f(x) {
  return +parseFloat(nerdamer(`f(${x})`).evaluate().toDecimal()).toFixed(3)
}

//==> Switch to RootOfPolynomialsDiv:
function switchToRootOfPolynomialsDiv() {
  hideResultCard()
  $('.diff-input').slideUp()
  $('.diff-preview').slideUp()
  switch (selectedMethod) {
    case bisectionId:
    case falsePositionId:
      isRootOfPolynomialsMethod = true
      equationCard.find('span.card-title').html('Enter a Function')
      equationCard.find('label[for="math-input"]').html('`f(x)=`')
      MathJax.typesetClear()
      MathJax.typeset()

      break
    case newtonID:
      isRootOfPolynomialsMethod = true
      equationCard.find('span.card-title').html('Enter a Function')
      equationCard.find('label[for="math-input"]').html('`f(x)=`')
      $('.diff-input').slideDown()
      $('.diff-preview').slideDown()
      MathJax.typesetClear()
      MathJax.typeset()
      break
    case simpleFixedPointId:
      isRootOfPolynomialsMethod = true
      equationCard.find('span.card-title').html('Enter a function in the form: `x=g(x)`')
      equationCard.find('label[for="math-input"]').html('`x=`')
      MathJax.typesetClear()
      MathJax.typeset()

      break
  }
  linearAlgebraicEquationsDiv.slideUp(700, function () {
    rootOfPolynomialsDiv.slideDown(600)
    checkAllInputFields()
  })
}

//==> Switch to RootOfPolynomialsDiv:
function switchToLinearAlgebraicEquationsDiv() {
  hideResultCard()
  isRootOfPolynomialsMethod = false
  equationCard.find('span.card-title').html('Enter the Augmented Matrix')
  rootOfPolynomialsDiv.slideUp(700, function () {
    linearAlgebraicEquationsDiv.slideDown(600, function () {
      checkAllInputFields()
    })
  })
}

//==> used in switchToLinearAlgebraicEquationsDiv &switchToRootOfPolynomialsDiv
function hideResultCard() {
  resultsCard.hide()
  resultsBtnContainer.hide()
  resultsProgressBar.show()
  rootOfPolynomialsResultsDiv.hide()
  linearAlgebraicEquationsResultsDiv.hide()
}

//!===========> Mobile only Functions
//===> if mobile is portrait-> use responsive table, if landscape-> stick with desktop version)
function changeMobResultsStylingOnOrientation() {
  orn = getOrientation()
  switch (orn) {
    case 'portrait-primary':
    case 'portrait-secondary':
      rootOfPolynomialsResultsTable.addClass('responsive-table')
      mobLandscapeDownloadBtn.hide(0)
      mobBMenuBtn.show(0)
      break
    case 'landscape-primary':
    case 'landscape-secondary':
      rootOfPolynomialsResultsTable.removeClass('responsive-table')

      //if not fullscreen:
      if (document.fullscreenElement === null) {
        mobBMenuBtn.hide(0)
        mobLandscapeDownloadBtn.show(0)
      }
      break
  }
}

//===> check device orientation:
function getOrientation() {
  let _orn = screen.msOrientation || (screen.orientation || screen.mozOrientation).type
  return _orn
}

//===> enter fullscreen mode:
function fullScreen() {
  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen()
  } else if (document.documentElement.mozRequestFullScreen) {
    document.documentElement.mozRequestFullScreen()
  } else if (document.documentElement.webkitRequestFullscreen) {
    document.documentElement.webkitRequestFullscreen()
  } else if (document.documentElement.msRequestFullscreen) {
    document.documentElement.msRequestFullscreen()
  }
}

//===> exit fullscreen mode:
function smolScreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen()
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen()
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen()
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen()
  }
}
//!================================================================================!//

//!==> matrix I/O:
// create a 2D array
function a(rows, cols) {
  var array = new Array(rows)
  for (var i = 0; i < array.length; i++) {
    array[i] = new Array(cols)
  }
  return array
}

//get matrix user Input
function getMatrix() {
  var in_matrix = a(3, 4) //3 rows, 4 cols
  // row 1:
  in_matrix[0][0] = document.getElementById('a1').value
  in_matrix[0][1] = document.getElementById('a2').value
  in_matrix[0][2] = document.getElementById('a3').value
  in_matrix[0][3] = document.getElementById('x1').value
  // row 2:
  in_matrix[1][0] = document.getElementById('b1').value
  in_matrix[1][1] = document.getElementById('b2').value
  in_matrix[1][2] = document.getElementById('b3').value
  in_matrix[1][3] = document.getElementById('x2').value
  // row 3:
  in_matrix[2][0] = document.getElementById('c1').value
  in_matrix[2][1] = document.getElementById('c2').value
  in_matrix[2][2] = document.getElementById('c3').value
  in_matrix[2][3] = document.getElementById('x3').value

  return in_matrix
}

//*=> displayStyle values:'augmented', 'parentheses', 'determinant', 'augmentedWithParentheses'
function generatePrintableMatrix(matrix, displayStyle, specificRows = null, specificCols = null) {
  let matDisplayStyles = ['augmented', 'parentheses', 'determinant', 'augmentedWithParentheses', 'default']
  /**
   * specifRows & specifCols used if we want to remove some rows and cols from the printed matrix
   * (used in cramer() function to print the determinant)
   */

  console.log(specificCols)
  console.log(specificRows)
  if (specificCols === null) {
    cols = matrix[0].length
    rows = matrix.length
  } else {
    cols = specificCols
    rows = specificRows
  }

  //create table:
  let outMatrix = document.createElement('table')
  outMatrix.className = 'matrix browser-default' //browser-default to remove 'materialize.css' styling
  //create table body:
  let matrixBody = document.createElement('tbody')
  matrixBody.className = 'browser-default'

  //TODO: find better way:
  //determine the display style and add it's corresponding class:
  switch (displayStyle) {
    //case of augmented:
    case matDisplayStyles[0]:
      outMatrix.classList.add('augmented-matrix')
      break
    //case of parentheses:
    case matDisplayStyles[1]:
      outMatrix.className = 'matrix browser-default'
      outMatrix.classList.add('parentheses')
      break
    //case of determinant:
    case matDisplayStyles[2]:
      outMatrix.classList.add('determinant')
      break
    //case of augmentedWithParentheses:
    case matDisplayStyles[3]:
      outMatrix.classList.add('augmented-matrix', 'parentheses')
      break
    case matDisplayStyles[4]:
      outMatrix.className = 'matrix browser-default'
      break
  }

  //outer loop to create rows and append it to tbody:
  for (let i = 0; i < rows; i++) {
    let row = document.createElement('tr')
    row.className = 'browser-default'

    //inner loop to create row cells:
    for (let j = 0; j < cols; j++) {
      let cell = document.createElement('td')
      cell.className = 'browser-default'
      let cellText = document.createTextNode(matrix[i][j])
      cell.appendChild(cellText)
      row.appendChild(cell)
    }
    // add the row to the end of the table body
    matrixBody.appendChild(row)
  }
  // add tbody to the table:
  outMatrix.appendChild(matrixBody)

  return outMatrix
}

//!==> Matrix calc methods:
// Gauss Elimination:
function gauss() {
  let augMat = getMatrix()
  //!=====================(step 1)=====================!//
  //==>Get m21:
  let m21 = augMat[1][0] / augMat[0][0]
  let m21Display = `
      <p style="margin-top:2px; margin-bottom: 2px; font-size:120%; font-weight:bold;">
        \`m_{21} = ${augMat[1][0]}/${augMat[0][0]} = ${m21}\`
      </p>
  `

  //==> display m21:
  linearAlgebraicEquationsResultsDiv.append(m21Display)
  //==> display what to do to get rid of  the first zero:
  linearAlgebraicEquationsResultsDiv.append(
    `
      <p style="margin-top:2px; margin-bottom: 2px; font-size:120%; font-weight:bold;">
        \`R_{2} - (m_{21})R_{1} -> R_{2}\`
      </p>
    `
  )

  //==> calc the augmented matrix after the first zero:
  for (i = 0; i < 4; i++) {
    augMat[1][i] -= m21 * augMat[0][i]
  }
  //==> print augmented matrix after the 1 zero:
  linearAlgebraicEquationsResultsDiv.append(generatePrintableMatrix(augMat, 'augmented'))

  //!=====================(step 2)=====================!//
  //==>Get m31:
  let m31 = augMat[2][0] / augMat[0][0]
  let m31Display = `
      <p style="margin-top:2px; margin-bottom: 2px; font-size:120%; font-weight:bold;">
        \`m_{31} = ${augMat[2][0]}/${augMat[0][0]} = ${m31}\`
      </p>
  `

  //==> display m31:
  linearAlgebraicEquationsResultsDiv.append(m31Display)

  //==> display what to do to get rid of  the second zero:
  linearAlgebraicEquationsResultsDiv.append(
    `
      <p style="margin-top:2px; margin-bottom: 2px; font-size:120%; font-weight:bold;">
        \`R_{3} - (m_{31})R_{1} -> R_{3}\`
      </p>
    `
  )

  //==> calc (the augmented matrix after the second zero):
  for (i = 0; i < 4; i++) {
    augMat[2][i] -= m31 * augMat[0][i]
  }
  //==> print augmented matrix after the 2 zeroes:
  linearAlgebraicEquationsResultsDiv.append(generatePrintableMatrix(augMat, 'augmented'))

  //!=====================(step 3)=====================!//s
  //==>Get m31:
  let m32 = augMat[2][1] / augMat[1][1]
  let m32Display = `
      <p style="margin-top:2px; margin-bottom: 2px; font-size:120%; font-weight:bold;">
        \`m_{32} = ${augMat[2][1]}/${augMat[1][1]} = ${m32}\`
      </p>
     `
  linearAlgebraicEquationsResultsDiv.append(m32Display)
  //==> display what to do to get rid of  the third zero:
  linearAlgebraicEquationsResultsDiv.append(
    `
      <p style="margin-top:2px; margin-bottom: 2px; font-size:120%; font-weight:bold;">
        \`R_{3} - (m_{32})R_{1} -> R_{3}\`
      </p>
    `
  )
  //==> calc m31 (the augmented matrix after the third zero):
  for (i = 0; i < 4; i++) {
    augMat[2][i] -= m32 * augMat[1][i]
  }

  //==> print augmented matrix after the 3 zeroes:
  linearAlgebraicEquationsResultsDiv.append(generatePrintableMatrix(augMat, 'augmented'))

  //!=====================(step 4)=====================!//
  //==> get x1,x2,x3
  let x3 = augMat[2][3] / augMat[2][2]
  let x2 = (augMat[1][3] - augMat[1][2] * x3) / augMat[1][1]
  let x1 = (augMat[0][3] - augMat[0][2] * x3 - augMat[0][1] * x2) / augMat[0][0]

  //display x1,x2,x3:
  linearAlgebraicEquationsResultsDiv.append(
    `
      <p style="margin-top:2px; margin-bottom: 2px; font-size:120%; font-weight:bold;">\`x_{1}=${+parseFloat(x1).toFixed(2)}\`</p>
      <p style="margin-top:2px; margin-bottom: 2px; font-size:120%; font-weight:bold;">\`x_{2}=${+parseFloat(x2).toFixed(2)}\`</p>
      <p style="margin-top:2px; margin-bottom: 2px; font-size:120%; font-weight:bold;">\`x_{3}=${+parseFloat(x3).toFixed(2)}\`</p>
    `
  )
  MathJax.typesetClear()
  MathJax.typeset()
  calcBtnAnimation(event)
}

// LU Decomposition:
function lu() {
  var augMat = getMatrix()

  var b = [augMat[0][3], augMat[1][3], augMat[2][3]]
  // write gauss elimination code statements again instead of calling the function

  var m21 = augMat[1][0] / augMat[0][0]
  var m31 = augMat[2][0] / augMat[0][0]

  for (i = 0; i < 4; i++) {
    augMat[1][i] -= m21 * augMat[0][i]
    augMat[2][i] -= m31 * augMat[0][i]
  }

  var m32 = augMat[2][1] / augMat[1][1]
  for (i = 0; i < 4; i++) {
    augMat[2][i] -= m32 * augMat[1][i]
  }

  var x3 = augMat[2][3] / augMat[2][2]
  var x2 = (augMat[1][3] - augMat[1][2] * x3) / augMat[1][1]
  var x1 = (augMat[0][3] - augMat[0][2] * x3 - augMat[0][1] * x2) / augMat[0][0]

  // end of Gauss Elimination code

  var U = a(3, 3)
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      U[i][j] = augMat[i][j]
    }
  }

  U[1][0] = U[2][0] = U[2][1] = 0
  var L = a(3, 3)
  L = [
    [1, 0, 0],
    [m21, 1, 0],
    [m31, m32, 1],
  ]

  //print L Matrix:
  linearAlgebraicEquationsResultsDiv.append(
    `
      <p style="margin-top:2px; margin-bottom: 2px; font-size:120%; font-weight:bold;">
        \`L= \`
      </p>
    `
  )

  linearAlgebraicEquationsResultsDiv.append(generatePrintableMatrix(L, 'default'))

  // U Matrix
  linearAlgebraicEquationsResultsDiv.append(
    `
      <p style="margin-top:2px; margin-bottom: 2px; font-size:120%; font-weight:bold;">
        \`U= \`
      </p>
    `
  )
  linearAlgebraicEquationsResultsDiv.append(generatePrintableMatrix(U, 'default'))

  var C = [[augMat[0][3]], [augMat[1][3]], [augMat[2][3]]]
  x3 = C[2] / U[2][2]
  x2 = (C[1] - U[1][2] * x3) / U[1][1]
  x1 = (C[0] - U[0][1] * x2 - U[0][2] * x3) / U[0][0]
  linearAlgebraicEquationsResultsDiv.append(
    `
      <p style="margin-top:2px; margin-bottom: 2px; font-size:120%; font-weight:bold;">
        \`C= \`
      </p>
    `
  )
  linearAlgebraicEquationsResultsDiv.append(generatePrintableMatrix(C, 'default'))

  //display x1,x2,x3:
  linearAlgebraicEquationsResultsDiv.append(
    `
      <p style="margin-top:2px; margin-bottom: 2px; font-size:120%; font-weight:bold;">\`x_{1}=${+parseFloat(x1).toFixed(2)}\`</p>
      <p style="margin-top:2px; margin-bottom: 2px; font-size:120%; font-weight:bold;">\`x_{2}=${+parseFloat(x2).toFixed(2)}\`</p>
      <p style="margin-top:2px; margin-bottom: 2px; font-size:120%; font-weight:bold;">\`x_{3}=${+parseFloat(x3).toFixed(2)}\`</p>
    `
  )
  MathJax.typesetClear()
  MathJax.typeset()
  calcBtnAnimation(event)
}
// ---------------------------------------------------

// cramer:
function cramer() {
  function matrixDet() {
    return (
      in_matrix[0][0] * (in_matrix[1][1] * in_matrix[2][2] - in_matrix[2][1] * in_matrix[1][2]) -
      in_matrix[0][1] * (in_matrix[1][0] * in_matrix[2][2] - in_matrix[2][0] * in_matrix[1][2]) +
      in_matrix[0][2] * (in_matrix[1][0] * in_matrix[2][1] - in_matrix[2][0] * in_matrix[1][1])
    )
  }

  var X = getMatrix()
  var AA = a(3, 3)
  var in_matrix = a(3, 3)
  AA = in_matrix = X

  linearAlgebraicEquationsResultsDiv.append(
    `
      <p style="margin-top:2px; margin-bottom: 2px; font-size:120%; font-weight:bold;">
        \`|A| \`
      </p>
    `
  )

  linearAlgebraicEquationsResultsDiv.append(generatePrintableMatrix(AA, 'determinant', 3, 3))

  // Cramer's rule
  var Adet = matrixDet(AA)
  console.log('A = ' + Adet)

  for (let i = 0; i < 3; i++) {
    // swapping in javascript ==> [x, y] = [y, x];
    // [A/b]
    // swap A1 with b
    ;[AA[i][0], AA[i][3]] = [AA[i][3], AA[i][0]]
  }

  var A1det = matrixDet(AA)

  linearAlgebraicEquationsResultsDiv.append(
    `
      <p style="margin-top:2px; margin-bottom: 2px; font-size:120%; font-weight:bold;">
        \` |A1|=  ${A1det}\`
      </p>
    `
  )

  linearAlgebraicEquationsResultsDiv.append(generatePrintableMatrix(AA, 'determinant', 3, 3))
  console.log('A1 = ' + A1det)
  for (let i = 0; i < 3; i++) {
    ;[AA[i][0], AA[i][3]] = [AA[i][3], AA[i][0]]
      ;[AA[i][1], AA[i][3]] = [AA[i][3], AA[i][1]]
  }

  var A2det = matrixDet(AA)

  linearAlgebraicEquationsResultsDiv.append(
    `
      <p style="margin-top:2px; margin-bottom: 2px; font-size:120%; font-weight:bold;">
        \` |A2| =  ${A2det} \`
      </p>
    `
  )

  linearAlgebraicEquationsResultsDiv.append(generatePrintableMatrix(AA, 'determinant', 3, 3))

  for (let i = 0; i < 3; i++) {
    ;[AA[i][1], AA[i][3]] = [AA[i][3], AA[i][1]]
      ;[AA[i][2], AA[i][3]] = [AA[i][3], AA[i][2]]
  }

  var A3det = matrixDet(AA)

  linearAlgebraicEquationsResultsDiv.append(
    `
      <p style="margin-top:2px; margin-bottom: 2px; font-size:120%; font-weight:bold;">
        \` |A3| =  ${A3det} \`
      </p>
    `
  )
  linearAlgebraicEquationsResultsDiv.append(generatePrintableMatrix(AA, 'determinant', 3, 3))
  console.log('A3 = ' + A3det)

  var x1 = A1det / Adet
  var x2 = A2det / Adet
  var x3 = A3det / Adet

  //display x1,x2,x3:
  linearAlgebraicEquationsResultsDiv.append(
    `
      <p style="margin-top:2px; margin-bottom: 2px; font-size:120%; font-weight:bold;">\`x_{1}=${+parseFloat(x1).toFixed(2)}\`</p>
      <p style="margin-top:2px; margin-bottom: 2px; font-size:120%; font-weight:bold;">\`x_{2}=${+parseFloat(x2).toFixed(2)}\`</p>
      <p style="margin-top:2px; margin-bottom: 2px; font-size:120%; font-weight:bold;">\`x_{3}=${+parseFloat(x3).toFixed(2)}\`</p>
    `
  )
  MathJax.typesetClear()
  MathJax.typeset()
  calcBtnAnimation(event)
}
