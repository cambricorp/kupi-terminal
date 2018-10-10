import { observable, action, computed } from 'mobx'
import axios from 'axios'
import _ from 'lodash'
import DashboardsStore from './DashboardsStore'
import SettingsStore from './SettingsStore'

class StocksStore {
  constructor(){
    setInterval(async () => {
      await this.fetchStocks()
    }, 1000)
  }

  @computed get serverBackend() {return SettingsStore.serverBackend.value }

  @observable stocks = []
  @observable stocksFilter = ''

  @action setStocksFilter(_stock) {
    this.stocksFilter = _stock
  }

  @computed get stocksComputed() {
    return this.stocks.filter((stock) => {
      return stock.name.toLowerCase().indexOf( this.stocksFilter.toLowerCase() ) !== -1
    })
  }

  @action setStock(stock) {
    this.stock = stock
    DashboardsStore.dashboards[ DashboardsStore.dashboardActiveId ].stock = stock
  }

  @action async fetchStocks() {
    axios.get(`${this.serverBackend}/stocks`)
    .then((response) => {
      this.stocks = _.toArray(response.data)
    })
    .catch((error) => {
      this.stocks = []
      console.log(error)
    })
  }
}

const store = window.StocksStore = new StocksStore()

export default store