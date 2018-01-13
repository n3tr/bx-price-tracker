require('isomorphic-fetch')

function fetchTickers() {
  return fetch('https://bx.in.th/api/').then(resp => resp.json())
}

module.exports = {
  fetchTickers
}
