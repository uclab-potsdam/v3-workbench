import { createStore } from 'vuex'
import api from './api'
import data from './data'
import view from './view'
import device from './device'
import main from './main'
import config from './config'
import auth from './auth'
import dragdrop from './dragdrop'

export default createStore({
  modules: {
    main,
    api,
    data,
    view,
    device,
    config,
    auth,
    dragdrop
  }
})
