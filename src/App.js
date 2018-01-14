
const path = require('path')
const _ = require('lodash')
const { app, Menu, MenuItem, Tray, shell } = require('electron')
const BxUpdater = require('./BxUpdater')
const MenuHelper = require('./MenuHelper')
const Store = require('electron-store');

const ICON_PATH = path.join(__dirname, '..', 'images', 'bx.png')

class App {
  constructor() {
    this.updater = undefined
    this.tray = undefined
    this.iconPath = ICON_PATH
    
    this.store = new Store()
    this.selectedParingIds = this.store.get('selectedParingIds', [])
  }

  initialize() {
    this.tray = new Tray(this.iconPath)
    this.updater = new BxUpdater()
    this._setupMenu(this.updater._latestTickers, this.updater._lastUpdateDate)

    this.updater.startUpdating()
    this.unsubscribe = this.updater.subscribe((tickers, lastUpdateDate) => {

      this._setupMenu(tickers, lastUpdateDate)
      this._refreshTitle(tickers)
    })


    app.on('window-all-closed', function () {
      // On OS X it is common for applications and their menu bar
      // to stay active until the user quits explicitly with Cmd + Q
      if (process.platform !== 'darwin') {
        this.updater.stopUpdating()
        this.unsubscribe()
        this.tray.destroy()
        app.quit()
      }
    })
  }
  
  _refreshTitle(tickers) {
    const ticketIdMap = _.keyBy(tickers, 'pairingId')
    const title = this.selectedParingIds.map(id => {
      const ticker = ticketIdMap[id]
      if (!ticker) return undefined
      return `${ticker.getTitleDisplay()}`
    })
    .filter(text => text !== undefined)
    .join(' : ')
  
    this.tray.setTitle(title || '-') 
  }

  toggleSelection(menuItem, browserWindow, event) {
    const id = menuItem.id
    const index = this.selectedParingIds.indexOf(id)
    if (menuItem.checked) {
      if (index < 0) {
        this.selectedParingIds.push(id)
      }
    } else {
      if (index > -1) {
        this.selectedParingIds.splice(index, 1);
      }
    }

    this.store.set('selectedParingIds', this.selectedParingIds)
    this._refreshTitle(this.updater._latestTickers)
  }

  _setupMenu(tickers, lastUpdateDate) {
    let template = [].concat(
      MenuHelper.createBXMenuTemplate(),
      MenuHelper.createUpdateTimeMenuTemplate(lastUpdateDate),
      MenuHelper.createTickerMenuTemplate(_.sortBy(tickers, 'secondaryCurrency'), this.selectedParingIds, this.toggleSelection.bind(this)),
      MenuHelper.createRefreshIntervalTemplate(this.updater._updateInterval, (newInterval) => {
        this.updater.setUpdateInterval(newInterval)
      }),
      MenuHelper.createCreditMenuTemplate(),
      MenuHelper.createExitMenuTemplate(() => {
        this.updater.stopUpdating()
        this.unsubscribe()
        this.tray.destroy()
        app.quit()
      })
    )
    const menu = Menu.buildFromTemplate(template)
    this.tray.setContextMenu(menu)
  }
}

module.exports = new App()
