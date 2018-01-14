const moment = require('moment')
const { shell } = require('electron')

function createBXMenuTemplate() {
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

function createUpdateTimeMenuTemplate(lastUpdateDate) {
  return [{
    type: 'normal',
    enabled: false,
    label: 'Last update: ' + moment(lastUpdateDate).format('h:mm:ss a')
  }, {
    type: 'separator',
  }]
}

function createTickerMenuTemplate(tickers, selectedParingIds, onClick) {
  return tickers.map((ticker) => {
    return  {
      type: 'checkbox',
      label: ticker.getMenuDisplay(),
      id: ticker.pairingId,
      checked: selectedParingIds.indexOf(ticker.pairingId) > -1,
      click: onClick
    }
  })
}

function createCreditMenuTemplate() {
  return [{
    type: 'separator',
  },{
    type: 'normal',
    enabled: false,
    label: 'Bx the Moon '
  },{
    type: 'normal',
    label: 'by Jirat Ki. (@n3tr)',
    click: () => {
      shell.openExternal('https://github.com/n3tr/')
    }
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

function createExitMenuTemplate(onClick) {
  return [ {
    type: 'separator',
  },{
    type: 'normal',
    label: 'Quit',
    click: onClick
  }]
}

function createRefreshIntervalTemplate(currentInterval, onChangeInterval) {
  const refreshIntervalMenu = [{
    type: 'radio',
    label: "10s",
    click: () => { 
      onChangeInterval(10000)
    },
    checked: currentInterval == 10000
  }, {
    type: 'radio',
    label: "30s",
    click: () => { 
      onChangeInterval(30000)
    },
    checked: currentInterval === 30000
  }, {
    type: 'radio',
    label: "1min",
    click: () => { 
      onChangeInterval(60000)
    },
    checked: currentInterval === 60000
  }, {
    type: 'radio',
    label: "5mins",
    click: () => { 
      onChangeInterval(300000)
    },
    checked: currentInterval === 300000
  },{
    type: 'radio',
    label: "10mins",
    click: () => { 
      onChangeInterval(600000)
    },
    checked: currentInterval === 600000
  }]
  
  return [{
    type: 'separator',
  },{
    type: 'submenu',
    label: 'Refresh interval',
    submenu: refreshIntervalMenu
  }]
}

module.exports = {
  createBXMenuTemplate,
  createUpdateTimeMenuTemplate,
  createTickerMenuTemplate,
  createCreditMenuTemplate,
  createExitMenuTemplate,
  createRefreshIntervalTemplate
}
