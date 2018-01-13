const moment = require('moment')

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
    enabled: false,
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



module.exports = {
  createBXMenuTemplate,
  createUpdateTimeMenuTemplate,
  createTickerMenuTemplate,
  createCreditMenuTemplate,
  createExitMenuTemplate
}
