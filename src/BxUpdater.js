const { fetchTickers } = require('./Api')
const Ticker = require('./Ticker')
const Store = require('electron-store');



const STORE_KEYS = {
  UPDATE_INTERVAL_KEY: 'UPDATE_INTERVAL_KEY',
  LATEST_TICKERS_KEY: 'LATEST_TICKERS_KEY',
  LAST_UPDATE_DATE_KEY: 'LAST_UPDATE_DATE_KEY'
}

const DEFAULT_INTERVAL = 10000

class BxUpdater {
  constructor() {
    this.store = new Store()
    this._updateInterval = this.store.get(STORE_KEYS.UPDATE_INTERVAL_KEY, DEFAULT_INTERVAL)
    this._lastUpdateDate = this.store.get(STORE_KEYS.LAST_UPDATE_DATE_KEY)

    this._latestTickers = []

    const rawTickerData = this.store.get(STORE_KEYS.LATEST_TICKERS_KEY)
    if (rawTickerData && typeof rawTickerData === 'object') {
      this._latestTickers = Object.values(rawTickerData).map((ticker) => new Ticker(ticker))
    }
    this._intervalId = undefined
    this._subscribers = {}
    this._scheduling = false
  }

  startUpdating() {
    if (this._latestTickers && this._lastUpdateDate) {
      this._notifySubscribers()
    }
    this._scheduleFetch()
  }

  stopUpdating() {
    this._cancelSchedule()
  }

  /**
   * Subscribe update from updater.
   *
   * @param {Function} callback func.
   * @returns {Function} Returns func for unsubscribe.
   * @example
   *
   * const unsubscribe = updater.subscribe((tickers, updateData) => { })
   * 
   * // To unsubscribe call returned func
   * // => unsubscribe()
   */
  subscribe(callback) {
    if (typeof callback !== 'function') {
      return
    }

    const subscriberId = 'Id#' + Object.keys(this._subscribers).length
    this._subscribers[subscriberId] = callback
    
    // send latest data intermediate after subscribe
    if (this._latestTickers && this._lastUpdateDate) {
      callback(this._latestTickers, this._lastUpdateDate)
    }

    return () => {
      delete this._subscribers[subscriberId]
    }
  }

  setUpdateInterval(interval) {
    this._updateInterval = interval
    this.store.set(STORE_KEYS.UPDATE_INTERVAL_KEY, this._updateInterval)
    this._cancelSchedule()
    this._scheduleFetch()
  }

  _scheduleFetch() {
    if (this._scheduling) {
      return
    }
    this._scheduling = true
    this._cancelSchedule()

    // Doing first time fetch before interval
    this._fetchData()
    
    this._intervalId = setInterval(this._fetchData.bind(this), this._updateInterval)
  }

  _cancelSchedule() {
    this._scheduling = false
    if (this._intervalId) {
      clearInterval(this._intervalId)
      this._intervalId = undefined
    }
  }

  _fetchData() {
    fetchTickers().then(this._handleTickerData.bind(this)).catch(err => console.log(err))
  }

  _handleTickerData(json) {
    
    this._latestTickers = Object.values(json).map((ticker) => new Ticker(ticker))
    this._lastUpdateDate = new Date()

    this.store.set(STORE_KEYS.LATEST_TICKERS_KEY, json)
    this.store.set(STORE_KEYS.LAST_UPDATE_DATE_KEY, this._lastUpdateDate)
    
    this._notifySubscribers()
  }

  _notifySubscribers() {
    Object.values(this._subscribers).forEach(
      fn => fn(this._latestTickers, this._lastUpdateDate)
    )
  }
}

module.exports = BxUpdater
