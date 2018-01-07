
const path = require('path')
const { app, Menu, MenuItem, Tray, ipc, nativeImage, shell } = require('electron')
const moment = require('moment');
const Store = require('electron-store');
const store = new Store();

const { fetchTicker } = require('./Api')

//
// Variables
//
let appTray = undefined
let menu = undefined
let cacheMenuItem = {}
let latestTickers = store.get('latestTickers') || {}
let selectedParingIds = store.get('selectedParingIds') || []
let lastUpdate = store.get('lastUpdate')


function refreshTitle() {
  const title = selectedParingIds.map(id => {
    const ticker = latestTickers[id]
    if (!ticker) return undefined
    return `${ticker.secondary_currency}${ticker.last_price}`
  })
  .filter(text => text !== undefined)
  .join(' : ')

  appTray.setTitle(title || '-') 
}

function createTickerMenuItem(ticker) {
  return {
    type: 'checkbox',
    label: `${ticker.secondary_currency} - ${ticker.last_price}`,
    id: ticker.pairing_id,
    checked: selectedParingIds.indexOf(ticker.pairing_id) > -1,
    click: toggleSelection
  }
}

function createBXMenuItme() {
  return [{
    type: 'normal',
    label: 'Open bx.in.th',
    click: () => {
      shell.openExternal('https://bx.in.th')
    }
  }, {
    type: 'separator',
  }]
}

function createTimeMenuTemplate() {
  return [{
    type: 'normal',
    enabled: false,
    label: 'Last update: ' + moment(lastUpdate).format('h:mm:ss a')
  }, {
    type: 'separator',
  }]
}

function createExitMenuTemplate() {
  return [ {
    type: 'separator',
  },{
    type: 'normal',
    label: 'Quit',
    click: () => {
      clearInterval(intervalId)
      appTray.destroy()
      app.quit()
    }
  }]
}

function createCreditMenu() {
  return [{
    type: 'separator',
  },{
    type: 'normal',
    enabled: false,
    label: 'Bx the Moon '
  },{
    type: 'normal',
    enabled: false,
    label: '- Jirat Ki. (@n3tr)'
  },{
    type: 'separator',
  }, {
    type: 'normal',
    label: 'Bug report',
    click: () => {
      shell.openExternal('https://github.com/n3tr/bx-price-tracker/issues')
    }
  }]
}

function configMenu(json) {
  const tickers = Object.values(json)
  const menuTemplate = createBXMenuItme()
  .concat(createTimeMenuTemplate())
  .concat(tickers.map(createTickerMenuItem))
  .concat(createCreditMenu())
  .concat(createExitMenuTemplate())

  const menu = Menu.buildFromTemplate(menuTemplate)
  appTray.setContextMenu(menu)
}

function toggleSelection(menuItem, browserWindow, event) {
  const id = menuItem.id
  const index = selectedParingIds.indexOf(id)
  if (menuItem.checked) {
    if (index < 0) {
      selectedParingIds.push(id)
    }
  } else {
    if (index > -1) {
      selectedParingIds.splice(index, 1);
    }
  }

  store.set('selectedParingIds', selectedParingIds)
  refreshTitle()
}

function refreshData() {
  fetchTicker().then((json) => {
    lastUpdate = new Date()
    store.set('lastUpdate', lastUpdate)
    latestTickers = json
    store.set('latestTickers', latestTickers)
    configMenu(latestTickers)
    refreshTitle()
  })
}

let intervalId = undefined
function scheduleUpdate() {
  if (intervalId) {
    clearInterval(intervalId)
  }

  intervalId = setInterval(refreshData, 10000)
}

function createTray() {
  appTray = new Tray(path.join(__dirname, 'images', 'bx.png'))

  if (!menu) {
    menu = new Menu()
  }

  configMenu(latestTickers)
  refreshTitle()

  refreshData()
  scheduleUpdate()
}

function quit() {
  clearInterval(intervalId)
  appTray.destroy()
  app.quit()
}

app.on('window-all-closed', () => {
  quit()
})


module.exports = {
  createTray,
  quit
}


