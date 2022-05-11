import { Capacitor } from '@capacitor/core'
import { Observable } from 'rxjs'
import {
  DiscoveryMethod,
  ConnectionStatus,
  SimulatedCardType,
  DeviceType,
  DeviceStyle
} from './definitions'
import { StripeTerminal } from './plugin-registration'
import { StripeTerminalWeb } from './web'
/**
 * The Android connection status enum is different from iOS, this maps Android to iOS
 * @ignore
 */
const AndroidConnectionStatusMap = {
  0: ConnectionStatus.NotConnected,
  1: ConnectionStatus.Connecting,
  2: ConnectionStatus.Connected
}
export class StripeTerminalPlugin {
  /**
   * **_DO NOT USE THIS CONSTRUCTOR DIRECTLY._**
   *
   * Use the [[StripeTerminalPlugin.create]] method instead.
   * @hidden
   * @param options `StripeTerminalPlugin` options.
   */
  constructor(options) {
    this.isInitialized = false
    this._fetchConnectionToken = () =>
      Promise.reject('You must initialize StripeTerminalPlugin first.')
    this._onUnexpectedReaderDisconnect = () => {
      // reset the sdk type
      this.selectedSdkType = 'native'
      return Promise.reject('You must initialize StripeTerminalPlugin first.')
    }
    this.isDiscovering = false
    this.listeners = {}
    this.selectedSdkType = 'native'
    this._fetchConnectionToken = options.fetchConnectionToken
    this._onUnexpectedReaderDisconnect = options.onUnexpectedReaderDisconnect
  }
  get activeSdkType() {
    if (
      this.selectedSdkType === 'js' &&
      this.stripeTerminalWeb &&
      this.isNative()
    ) {
      // only actually use the js sdk if its selected, initialized, and the app is running in a native environment
      return 'js'
    } else {
      return 'native'
    }
  }
  get sdk() {
    if (this.activeSdkType === 'js') {
      return this.stripeTerminalWeb
    } else {
      return StripeTerminal
    }
  }
  isNative() {
    return (
      Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android'
    )
  }
  requestConnectionToken(sdkType) {
    const sdk = sdkType === 'native' ? StripeTerminal : this.stripeTerminalWeb
    if (!sdk) {
      return
    }
    this._fetchConnectionToken()
      .then(token => {
        if (token) {
          sdk.setConnectionToken({ token }, null)
        } else {
          throw new Error(
            'User-supplied `fetchConnectionToken` resolved successfully, but no token was returned.'
          )
        }
      })
      .catch(err => {
        sdk.setConnectionToken(
          null,
          err.message || 'Error in user-supplied `fetchConnectionToken`.'
        )
      })
  }
  async init() {
    var _a, _b, _c
    if (this.isNative()) {
      // if on native android or ios, initialize the js sdk as well
      this.stripeTerminalWeb = new StripeTerminalWeb()
    }
    this.listeners['connectionTokenListenerNative'] =
      await StripeTerminal.addListener('requestConnectionToken', () =>
        this.requestConnectionToken('native')
      )
    this.listeners['connectionTokenListenerJs'] = await ((_a =
      this.stripeTerminalWeb) === null || _a === void 0
      ? void 0
      : _a.addListener('requestConnectionToken', () =>
          this.requestConnectionToken('js')
        ))
    this.listeners['unexpectedReaderDisconnectListenerNative'] =
      await StripeTerminal.addListener(
        'didReportUnexpectedReaderDisconnect',
        () => {
          this._onUnexpectedReaderDisconnect()
        }
      )
    this.listeners['unexpectedReaderDisconnectListenerJs'] = await ((_b =
      this.stripeTerminalWeb) === null || _b === void 0
      ? void 0
      : _b.addListener('didReportUnexpectedReaderDisconnect', () => {
          this._onUnexpectedReaderDisconnect()
        }))
    await Promise.all([
      StripeTerminal.initialize(),
      (_c = this.stripeTerminalWeb) === null || _c === void 0
        ? void 0
        : _c.initialize()
    ])
    this.isInitialized = true
  }
  translateConnectionStatus(data) {
    let status = data.status
    if (data.isAndroid) {
      // the connection status on android is different than on iOS so we have to translate it
      status = AndroidConnectionStatusMap[data.status]
    }
    return status
  }
  _listenerToObservable(name, transformFunc) {
    return new Observable(subscriber => {
      let listenerNative
      let listenerJs
      StripeTerminal.addListener(name, data => {
        // only send the event if the native sdk is in use
        if (this.activeSdkType === 'native') {
          if (transformFunc) {
            return subscriber.next(transformFunc(data))
          }
          return subscriber.next(data)
        }
      }).then(l => {
        listenerNative = l
      })
      if (this.stripeTerminalWeb) {
        this.stripeTerminalWeb
          .addListener(name, data => {
            // only send the event if the js sdk is in use
            if (this.activeSdkType === 'js') {
              if (transformFunc) {
                return subscriber.next(transformFunc(data))
              }
              return subscriber.next(data)
            }
          })
          .then(l => {
            listenerJs = l
          })
      }
      return {
        unsubscribe: () => {
          listenerNative === null || listenerNative === void 0
            ? void 0
            : listenerNative.remove()
          listenerJs === null || listenerJs === void 0
            ? void 0
            : listenerJs.remove()
        }
      }
    })
  }
  ensureInitialized() {
    if (!this.isInitialized) {
      throw new Error(
        'StripeTerminalPlugin must be initialized before you can use any methods.'
      )
    }
  }
  /**
   * Ensure that an object exists and is not empty
   * @param object Object to check
   * @returns
   */
  objectExists(object) {
    if (
      Object.keys(object !== null && object !== void 0 ? object : {}).length
    ) {
      return object
    }
    return null
  }
  /**
   * Creates an instance of [[StripeTerminalPlugin]] with the given options.
   *
   * ```typescript
   * const terminal = await StripeTerminalPlugin.create({
   *   fetchConnectionToken: async () => {
   *     const resp = await fetch('https://your-backend.dev/token', {
   *       method: 'POST'
   *     })
   *     const data = await resp.json()
   *
   *     return data.secret
   *   },
   *   onUnexpectedReaderDisconnect: () => {
   *     // handle reader disconnect
   *   }
   * })
   * ```
   *
   * @param options [[StripeTerminalPlugin]] options.
   */
  static async create(options) {
    const terminal = new StripeTerminalPlugin(options)
    await terminal.init()
    return terminal
  }
  async cancelDiscoverReaders() {
    var _a, _b, _c
    try {
      ;(_a = this.listeners['readersDiscoveredNative']) === null ||
      _a === void 0
        ? void 0
        : _a.remove()
      ;(_b = this.listeners['readersDiscoveredJs']) === null || _b === void 0
        ? void 0
        : _b.remove()
      if (!this.isDiscovering) {
        return
      }
      await Promise.all([
        StripeTerminal.cancelDiscoverReaders(),
        (_c = this.stripeTerminalWeb) === null || _c === void 0
          ? void 0
          : _c.cancelDiscoverReaders()
      ])
      this.isDiscovering = false
    } catch (err) {
      // eat errors
    }
  }
  normalizeReader(reader) {
    if (reader.batteryLevel === 0) {
      // the only time that the battery level should be 0 is while scanning on Android and the level is unknown, so change it to null for consistency with iOS
      reader.batteryLevel = null
    }
    if (reader.deviceSoftwareVersion === 'unknown') {
      // replace unknown with null to make Android consistent with iOS
      reader.deviceSoftwareVersion = null
    }
    return reader
  }
  discoverReaders(options) {
    this.ensureInitialized()
    return new Observable(subscriber => {
      let nativeReaderList = []
      let jsReaderList = []
      // reset the sdk type
      this.selectedSdkType = 'native'
      if (options.discoveryMethod === DiscoveryMethod.Internet) {
        this.selectedSdkType = 'js'
      }
      this.sdk
        .addListener('readersDiscovered', event => {
          var _a
          const readers =
            ((_a =
              event === null || event === void 0 ? void 0 : event.readers) ===
              null || _a === void 0
              ? void 0
              : _a.map(this.normalizeReader)) || []
          nativeReaderList = readers
          // combine the reader list with the latest reader list from the js sdk
          subscriber.next([...nativeReaderList, ...jsReaderList])
        })
        .then(l => {
          this.listeners['readersDiscoveredNative'] = l
        })
      const nativeOptions = Object.assign(Object.assign({}, options), {
        discoveryMethod:
          options.discoveryMethod === DiscoveryMethod.Both
            ? DiscoveryMethod.BluetoothScan
            : options.discoveryMethod
      })
      if (nativeOptions.discoveryMethod !== DiscoveryMethod.Internet) {
        // remove locationId if the native discovery method is not internet
        nativeOptions.locationId = null
      }
      // start discovery
      this.isDiscovering = true
      this.sdk
        .discoverReaders(nativeOptions)
        .then(() => {
          this.isDiscovering = false
          subscriber.complete()
        })
        .catch(err => {
          this.isDiscovering = false
          subscriber.error(err)
        })
      // if using the both method, search with the js sdk as well
      if (
        options.discoveryMethod === DiscoveryMethod.Both &&
        this.stripeTerminalWeb
      ) {
        this.stripeTerminalWeb
          .addListener('readersDiscovered', event => {
            var _a
            const readers =
              ((_a =
                event === null || event === void 0 ? void 0 : event.readers) ===
                null || _a === void 0
                ? void 0
                : _a.map(this.normalizeReader)) || []
            jsReaderList = readers
            // combine the reader list with the latest reader list from the native sdk
            subscriber.next([...nativeReaderList, ...jsReaderList])
          })
          .then(l => {
            this.listeners['readersDiscoveredJs'] = l
          })
        const jsOptions = Object.assign(Object.assign({}, options), {
          discoveryMethod: DiscoveryMethod.Internet // discovery method is always going to be internet for the js sdk, although, it really doesn't matter because it will be ignored anyway
        })
        // TODO: figure out what to do with errors and completion on this method. maybe just ignore them?
        this.stripeTerminalWeb.discoverReaders(jsOptions)
      }
      return {
        unsubscribe: () => {
          this.cancelDiscoverReaders()
        }
      }
    })
  }
  async connectBluetoothReader(reader, config) {
    this.ensureInitialized()
    // if connecting to an Bluetooth reader, make sure to switch to the native SDK
    this.selectedSdkType = 'native'
    const data = await this.sdk.connectBluetoothReader({
      serialNumber: reader.serialNumber,
      locationId: config.locationId
    })
    return this.objectExists(
      data === null || data === void 0 ? void 0 : data.reader
    )
  }
  async connectUsbReader(reader, config) {
    this.ensureInitialized()
    // if connecting to an Bluetooth reader, make sure to switch to the native SDK
    this.selectedSdkType = 'native'
    const data = await this.sdk.connectUsbReader({
      serialNumber: reader.serialNumber,
      locationId: config.locationId
    })
    return this.objectExists(
      data === null || data === void 0 ? void 0 : data.reader
    )
  }
  async connectInternetReader(reader, config) {
    this.ensureInitialized()
    // if connecting to an internet reader, make sure to switch to the JS SDK
    this.selectedSdkType = 'js'
    const data = await this.sdk.connectInternetReader(
      Object.assign(
        {
          serialNumber: reader.serialNumber,
          ipAddress: reader.ipAddress,
          stripeId: reader.stripeId
        },
        config
      )
    )
    return this.objectExists(
      data === null || data === void 0 ? void 0 : data.reader
    )
  }
  /**
   * This is only here for backwards compatibility
   * @param reader
   * @returns Reader
   *
   * @deprecated
   */
  async connectReader(reader) {
    return await this.connectInternetReader(reader)
  }
  async getConnectedReader() {
    this.ensureInitialized()
    const data = await this.sdk.getConnectedReader()
    return this.objectExists(
      data === null || data === void 0 ? void 0 : data.reader
    )
  }
  async getConnectionStatus() {
    this.ensureInitialized()
    const data = await this.sdk.getConnectionStatus()
    return this.translateConnectionStatus(data)
  }
  async getPaymentStatus() {
    this.ensureInitialized()
    const data = await this.sdk.getPaymentStatus()
    return data === null || data === void 0 ? void 0 : data.status
  }
  async disconnectReader() {
    this.ensureInitialized()
    return await this.sdk.disconnectReader()
  }
  connectionStatus() {
    this.ensureInitialized()
    return new Observable(subscriber => {
      var _a
      let hasSentEvent = false
      // get current value
      this.sdk
        .getConnectionStatus()
        .then(status => {
          // only send the initial value if the event listener hasn't already
          if (!hasSentEvent) {
            subscriber.next(this.translateConnectionStatus(status))
          }
        })
        .catch(err => {
          subscriber.error(err)
        })
      let listenerNative
      let listenerJs
      // then listen for changes
      StripeTerminal.addListener('didChangeConnectionStatus', status => {
        // only send an event if we are currently on this sdk type
        if (this.activeSdkType === 'native') {
          hasSentEvent = true
          subscriber.next(this.translateConnectionStatus(status))
        }
      }).then(l => {
        listenerNative = l
      })
      // then listen for js changes
      ;(_a = this.stripeTerminalWeb) === null || _a === void 0
        ? void 0
        : _a
            .addListener('didChangeConnectionStatus', status => {
              // only send an event if we are currently on this sdk type
              if (this.activeSdkType === 'js') {
                hasSentEvent = true
                subscriber.next(this.translateConnectionStatus(status))
              }
            })
            .then(l => {
              listenerJs = l
            })
      return {
        unsubscribe: () => {
          listenerNative === null || listenerNative === void 0
            ? void 0
            : listenerNative.remove()
          listenerJs === null || listenerJs === void 0
            ? void 0
            : listenerJs.remove()
        }
      }
    })
  }
  async installAvailableUpdate() {
    this.ensureInitialized()
    return await this.sdk.installAvailableUpdate()
  }
  async cancelInstallUpdate() {
    this.ensureInitialized()
    return await this.sdk.cancelInstallUpdate()
  }
  didRequestReaderInput() {
    return this._listenerToObservable('didRequestReaderInput', data => {
      if (data.isAndroid) {
        return data.value
      }
      return parseFloat(data.value)
    })
  }
  didRequestReaderDisplayMessage() {
    return this._listenerToObservable(
      'didRequestReaderDisplayMessage',
      data => {
        return parseFloat(data.value)
      }
    )
  }
  didReportAvailableUpdate() {
    return this._listenerToObservable('didReportAvailableUpdate', data => {
      return this.objectExists(
        data === null || data === void 0 ? void 0 : data.update
      )
    })
  }
  didStartInstallingUpdate() {
    return this._listenerToObservable('didStartInstallingUpdate', data => {
      return this.objectExists(
        data === null || data === void 0 ? void 0 : data.update
      )
    })
  }
  didReportReaderSoftwareUpdateProgress() {
    return this._listenerToObservable(
      'didReportReaderSoftwareUpdateProgress',
      data => {
        return parseFloat(data.progress)
      }
    )
  }
  didFinishInstallingUpdate() {
    return this._listenerToObservable('didFinishInstallingUpdate', data => {
      return this.objectExists(data)
    })
  }
  async retrievePaymentIntent(clientSecret) {
    this.ensureInitialized()
    const data = await this.sdk.retrievePaymentIntent({ clientSecret })
    return this.objectExists(
      data === null || data === void 0 ? void 0 : data.intent
    )
  }
  async collectPaymentMethod() {
    this.ensureInitialized()
    const data = await this.sdk.collectPaymentMethod()
    return this.objectExists(
      data === null || data === void 0 ? void 0 : data.intent
    )
  }
  async cancelCollectPaymentMethod() {
    this.ensureInitialized()
    return await this.sdk.cancelCollectPaymentMethod()
  }
  async processPayment() {
    this.ensureInitialized()
    const data = await this.sdk.processPayment()
    return this.objectExists(
      data === null || data === void 0 ? void 0 : data.intent
    )
  }
  async clearCachedCredentials() {
    this.ensureInitialized()
    return await this.sdk.clearCachedCredentials()
  }
  async setReaderDisplay(cart) {
    this.ensureInitialized()
    return await this.sdk.setReaderDisplay(cart)
  }
  async clearReaderDisplay() {
    this.ensureInitialized()
    return await this.sdk.clearReaderDisplay()
  }
  async listLocations(options) {
    this.ensureInitialized()
    return await this.sdk.listLocations(options)
  }
  simulatedCardTypeStringToEnum(cardType) {
    // the simulated card type comes back as a string of the enum name so that needs to be converted back to an enum
    const enumSimulatedCard = SimulatedCardType[cardType]
    return enumSimulatedCard
  }
  async getSimulatorConfiguration() {
    this.ensureInitialized()
    const config = await this.sdk.getSimulatorConfiguration()
    if (
      (config === null || config === void 0 ? void 0 : config.simulatedCard) !==
        null &&
      (config === null || config === void 0 ? void 0 : config.simulatedCard) !==
        undefined
    ) {
      // the simulated card type comes back as a string of the enum name so that needs to be converted back to an enum
      config.simulatedCard = this.simulatedCardTypeStringToEnum(
        config.simulatedCard
      )
      this.simulatedCardType = config.simulatedCard
    } else {
      // use the stored simulated card type if it doesn't exist, probably because we are on android where you can't get it
      config.simulatedCard = this.simulatedCardType
    }
    return this.objectExists(config)
  }
  async setSimulatorConfiguration(config) {
    this.ensureInitialized()
    const newConfig = await this.sdk.setSimulatorConfiguration(config)
    if (config === null || config === void 0 ? void 0 : config.simulatedCard) {
      // store the simulated card type because we can't get it from android
      this.simulatedCardType = config.simulatedCard
    }
    if (
      (newConfig === null || newConfig === void 0
        ? void 0
        : newConfig.simulatedCard) !== null &&
      (newConfig === null || newConfig === void 0
        ? void 0
        : newConfig.simulatedCard) !== undefined
    ) {
      // the simulated card type comes back as a string of the enum name so that needs to be converted back to an enum
      newConfig.simulatedCard = this.simulatedCardTypeStringToEnum(
        newConfig.simulatedCard
      )
    } else if (this.objectExists(newConfig)) {
      newConfig.simulatedCard = config.simulatedCard
    }
    return this.objectExists(newConfig)
  }
  getDeviceStyleFromDeviceType(type) {
    if (
      type === DeviceType.Chipper2X ||
      type === DeviceType.StripeM2 ||
      type === DeviceType.WisePad3
    ) {
      return DeviceStyle.Bluetooth
    } else if (
      type === DeviceType.WisePosE ||
      type === DeviceType.VerifoneP400
    ) {
      return DeviceStyle.Internet
    }
    return DeviceStyle.Internet
  }
  /**
   * @deprecated use requestPermissions and checkPermissions instead
   */
  static async getPermissions() {
    return await this.requestPermissions()
  }
  static async checkPermissions() {
    return await StripeTerminal.checkPermissions()
  }
  static async requestPermissions() {
    return await StripeTerminal.requestPermissions()
  }
  /**
   * This should not be used directly. It will not behave correctly when using `Internet` and `Both` discovery methods
   *
   * @deprecated This should not be used directly. It will not behave correctly when using `Internet` and `Both` discovery methods
   */
  async addListener(eventName, listenerFunc) {
    return await this.sdk.addListener(eventName, listenerFunc)
  }
}
//# sourceMappingURL=plugin.js.map
