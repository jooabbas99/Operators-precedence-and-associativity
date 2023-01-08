import $ from 'jquery'
// const isMobile = require('./isMobileBrowser')()

//===>load animation cycle between the two cards:
let loadingPageAnimation

//===> "equation card" components:
let equationCard

//===> "results card" components:
let resultsCard

let resultsDiv //results table
let resultsBtnContainer
let pcDownloadBtn


$(window).on('load', function () {
  loadDomElements() //==> load DOM Elements
  // determineWebsiteStyle() //==>if mobile then add its elements and custom style
  loadingPageAnimation.hide(0) //==> hide website is loading cycle
  equationCard.slideDown(700) //==> To fix "equation shows before MathJax rendering"
})

//===> Puts DOM elements in variables
function loadDomElements() {
  //==> the loading cycle between the two cards
  loadingPageAnimation = $('.pageLoadAnimation')

  //===> "equation card" components:
  equationCard = $('#equation-card')
  resultsDiv = $('results-div')

  //===> "results card" components:
  resultsCard = $('#results-card') // the results card

  resultsBtnContainer = $('.results-buttons-container')

  //?====> mobile buttons:

}

//==> check device orientation:
function getOrientation() {
  let _orn = screen.msOrientation || (screen.orientation || screen.mozOrientation).type
  return _orn
}

//==> enter fullscreen mode:
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

//==> exit fullscreen mode:
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
