require('isomorphic-fetch')

function fetchTicker() {
  return fetch('https://bx.in.th/api/').then(resp => resp.json())
}

module.exports = {
  fetchTicker
}
