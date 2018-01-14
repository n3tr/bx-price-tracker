const _ = require('lodash')
const numeral = require('numeral')

class Ticker {
  // {
  //   "pairing_id": 1,
  //   "primary_currency": "THB",
  //   "secondary_currency": "BTC",
  //   "change": 0.19,
  //   "last_price": 519000,
  //   "volume_24hours": 318.88276478,
  //   "orderbook": {
  //   "bids": {
  //   "total": 1198,
  //   "volume": 383.40761193,
  //   "highbid": 521020.01
  //   },
  //   "asks": {
  //     "total": 4807,
  //     "volume": 493.79912241,
  //     "highbid": 522198
  //     }
  //   }
  // }
  constructor(json) {
    this.pairingId = _.get(json, 'pairing_id', 0)
    this.primaryCurrency = _.get(json, 'primary_currency', '')
    this.secondaryCurrency = _.get(json, 'secondary_currency', '')
    this.change = _.get(json, 'change', 0)
    this.lastPrice = _.get(json, 'last_price', 0)
    this.volume24hours = _.get(json, 'volume_24hours', 0)
    this.orderbook = _.get(json, 'orderbook', {})
  }

  getMenuDisplay() {
    return `${this.secondaryCurrency} / ${this.primaryCurrency} - ${this.getPriceDisplay()}`
  }

  getTitleDisplay() {
    return `${this.secondaryCurrency}${this.getPriceDisplay()}`
  }

  getPriceDisplay() {
    // In case we got small decimal number like > 0.000001 (0.00000085)
    // when we convert it to small, will be 8.5e-7
    // then, we need custom converter
    if (this.lastPrice < 0.000001) {
      // convert 0.00000087 -> 8.5e-7 to ['8.5','7']
      const component = String(this.lastPrice).split('e-')

      // replace 8.5 to 85
      const restDecimal = component[0].replace('.', '')
      // number of zero char we need to append, for example we got 6
      const numberOfZero = Number(component[1]) - 1
      const zeroChar = Array(numberOfZero).join('0')

      // concat '000000' + '85
      let decimalDisplay = `${zeroChar}${restDecimal}`

      // satoshi unit has 8 decimal
      if (decimalDisplay.length < 8) {
        decimalDisplay += Array(8 - decimalDisplay.length).join('0')
      }

      return `0.${decimalDisplay}`
    } else {
      return numeral(this.lastPrice).format('0,0.[00000000]')
    }
  }
}


module.exports = Ticker
