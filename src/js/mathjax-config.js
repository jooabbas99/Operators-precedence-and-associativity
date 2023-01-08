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
