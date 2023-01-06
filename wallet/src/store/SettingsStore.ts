import { proxy } from 'valtio'

/**
 * Types
 */
interface State {
  account: number
  kadenaAddress: string
  relayerRegionURL: string
}

/**
 * State
 */
const state = proxy<State>({
  account: 0,
  kadenaAddress: '',
  relayerRegionURL: ''
})

/**
 * Store / Actions
 */
const SettingsStore = {
  state,

  setAccount(value: number) {
    state.account = value
  },

  setKadenaAddress(kadenaAddress: string) {
    state.kadenaAddress = kadenaAddress
  },
  setRelayerRegionURL(relayerRegionURL: string) {
    state.relayerRegionURL = relayerRegionURL
  }
}

export default SettingsStore
