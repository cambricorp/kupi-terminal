import { observable, action, computed } from 'mobx'
import axios from 'axios'
import _ from 'lodash'
import uuidv1 from 'uuid/v1'

// import DashboardsStore from './DashboardsStore'
import SettingsStore from './SettingsStore'
import KeysStore from './KeysStore'

class StocksStore {
  constructor(){
    this.fetchStocks()
    setInterval(async () => {
      await this.fetchStocks()
    }, 1000)
  }

  @computed get serverBackend() {return SettingsStore.serverBackend.value }
  @computed get accounts() {return KeysStore.accounts }

  hash = ''
  @observable stocks = []
  @observable stocksFilter = ''

  @action setStocksFilter(_stock) {
    this.stocksFilter = _stock
  }

  @computed get stocksComputed() {
    var _stocks = []
    var stocks = _.clone(this.stocks)
    stocks = stocks.filter((stock) => {
      return stock.name.toLowerCase().indexOf( this.stocksFilter.toLowerCase() ) !== -1
    })
    stocks.map((stock)=>{
      _stocks.push({
        id: `${stock.name}`,
        name: stock.name,
      })
      for (let account of Object.values(this.accounts)) {
        if (account.stock.toUpperCase() === stock.name) {
          _stocks.push({
            id: `${stock.name}--${account.id}`,
            name: stock.name,
            accountId: account.id,
            accountName: account.name
          })
        }
      }
    })
    return _stocks
  }

  // @action setStock(stock) {
  //   this.stock = stock
  //   // DashboardsStore.dashboards[ DashboardsStore.dashboardActiveId ].stock = stock
  //   DashboardsStore.setWidgetsData('stock', stock)
  //   // var widgets = DashboardsStore.dashboards[ DashboardsStore.dashboardActiveId ].widgets
  //   // console.log(widgets)
  //   // _.forEach(widgets, (widget)=>{
  //   //   // console.log(widget)
  //   //   widget.stock = stock
  //   // })
  // }

  @action async fetchStocks() {
    // create empty vars
    var ccxtStocks = []
    var kupiStocks = []
    // fetch ccxt stocks from terminal server
    try {
      var ccxtResponse = await axios.get(`/user-api/ccxt/stocks`)
      ccxtStocks = _.toArray(ccxtResponse.data)
    } catch(err) { console.log(err) }
    // fetch ccxt stocks from kupi server
    try {
      var kupiResponse = await axios.get(`${this.serverBackend}/stocks`)
      kupiStocks = _.toArray(kupiResponse.data)
      kupiStocks = kupiStocks.map((stock)=>{
        stock.kupi = true
        return stock
      })
    } catch(err) { console.log(err) }
    // compare hash
    if (this.hash === JSON.stringify(ccxtStocks) + JSON.stringify(kupiStocks)) {
      return true
    }
    this.hash = JSON.stringify(ccxtStocks) + JSON.stringify(kupiStocks)
    // combine lists
    this.stocks = _.uniqBy([...kupiStocks, ...ccxtStocks], 'name')
  }

  counter = 0
  @action count(n) {
    this.counter += n
  }
}

const store = window.StocksStore = new StocksStore()

export default store
