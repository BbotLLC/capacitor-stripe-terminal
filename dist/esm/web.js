import { Subject } from 'rxjs'
import { WebPlugin } from '@capacitor/core'
import {
  ConnectionStatus,
  PaymentIntentStatus,
  PaymentStatus,
  DeviceType,
  ReaderNetworkStatus,
  BatteryStatus,
  LocationStatus,
  SimulatedCardType
} from './definitions'
import { loadStripeTerminal } from '@stripe/terminal-js'
/**
 * @ignore
 */
const deviceTypes = {
  ['chipper_2X']: DeviceType.Chipper2X,
  ['verifone_P400']: DeviceType.VerifoneP400,
  ['bbpos_wisepos_e']: DeviceType.WisePosE
}
/**
 * @ignore
 */
const readerStatuses = {
  online: ReaderNetworkStatus.Online,
  offline: ReaderNetworkStatus.Offline
}
/**
 * @ignore
 */
const connectionStatus = {
  connecting: ConnectionStatus.Connecting,
  connected: ConnectionStatus.Connected,
  not_connected: ConnectionStatus.NotConnected
}
/**
 * @ignore
 */
const testPaymentMethodMap = {
  visa: SimulatedCardType.Visa,
  visa_debit: SimulatedCardType.VisaDebit,
  mastercard: SimulatedCardType.Mastercard,
  mastercard_debit: SimulatedCardType.MasterDebit,
  mastercard_prepaid: SimulatedCardType.MastercardPrepaid,
  amex: SimulatedCardType.Amex,
  amex2: SimulatedCardType.Amex2,
  discover: SimulatedCardType.Discover,
  discover2: SimulatedCardType.Discover2,
  diners: SimulatedCardType.Diners,
  diners_14digits: SimulatedCardType.Diners14Digit,
  jcb: SimulatedCardType.Jcb,
  unionpay: SimulatedCardType.UnionPay,
  interac: SimulatedCardType.Interac,
  charge_declined: SimulatedCardType.ChargeDeclined,
  charge_declined_insufficient_funds:
    SimulatedCardType.ChargeDeclinedInsufficientFunds,
  charge_declined_lost_card: SimulatedCardType.ChargeDeclinedLostCard,
  charge_declined_stolen_card: SimulatedCardType.ChargeDeclinedStolenCard,
  charge_declined_expired_card: SimulatedCardType.ChargeDeclinedExpiredCard,
  charge_declined_processing_error:
    SimulatedCardType.ChargeDeclinedProcessingError,
  refund_fail: SimulatedCardType.RefundFailed
}
/**
 * @ignore
 */
const paymentIntentStatus = {
  requires_payment_method: PaymentIntentStatus.RequiresPaymentMethod,
  requires_confirmation: PaymentIntentStatus.RequiresConfirmation,
  requires_capture: PaymentIntentStatus.RequiresCapture,
  processing: PaymentIntentStatus.Processing,
  canceled: PaymentIntentStatus.Canceled,
  succeeded: PaymentIntentStatus.Succeeded
}
/**
 * @ignore
 */
const paymentStatus = {
  not_ready: PaymentStatus.NotReady,
  ready: PaymentStatus.Ready,
  waiting_for_input: PaymentStatus.WaitingForInput,
  processing: PaymentStatus.Processing
}
/**
 * @ignore
 */
export class StripeTerminalWeb extends WebPlugin {
  constructor() {
    super()
    this.STRIPE_API_BASE = 'https://api.stripe.com'
    this.currentClientSecret = null
    this.currentPaymentIntent = null
    this.currentConnectionToken = null
    this.connectionTokenCompletionSubject = new Subject()
  }
  async getPermissions() {
    return this.requestPermissions()
  }
  async checkPermissions() {
    // location permission isn't actually needed for the web version
    throw this.unimplemented('Permissions are not required on web.')
  }
  async requestPermissions() {
    // location permission isn't actually needed for the web version
    throw this.unimplemented('Permissions are not required on web.')
  }
  async setConnectionToken(options, errorMessage) {
    this.currentConnectionToken = options.token
    this.connectionTokenCompletionSubject.next({
      token: options.token,
      errorMessage
    })
  }
  async initialize() {
    const ST = await loadStripeTerminal()
    this.instance = ST.create({
      onFetchConnectionToken: async () => {
        return new Promise((resolve, reject) => {
          this.notifyListeners('requestConnectionToken', null)
          const sub = this.connectionTokenCompletionSubject.subscribe(
            ({ token, errorMessage }) => {
              if (errorMessage) {
                sub.unsubscribe()
                return reject(new Error(errorMessage))
              }
              sub.unsubscribe()
              return resolve(token)
            }
          )
        })
      },
      onUnexpectedReaderDisconnect: async () => {
        this.notifyListeners('didReportUnexpectedReaderDisconnect', {
          reader: null
        })
      },
      onConnectionStatusChange: async event => {
        this.notifyListeners('didChangeConnectionStatus', {
          status: connectionStatus[event.status]
        })
      },
      onPaymentStatusChange: async event => {
        this.notifyListeners('didChangePaymentStatus', {
          status: event.status
        })
      }
    })
  }
  isInstanceOfLocation(object) {
    return typeof object === 'object' && 'id' in object
  }
  translateReader(sdkReader) {
    return {
      stripeId: sdkReader.id,
      deviceType: deviceTypes[sdkReader.device_type],
      status: readerStatuses[sdkReader.status],
      serialNumber: sdkReader.serial_number,
      ipAddress: sdkReader.ip_address,
      locationId: this.isInstanceOfLocation(sdkReader.location)
        ? sdkReader.location.id
        : sdkReader.location,
      label: sdkReader.label,
      deviceSoftwareVersion: sdkReader.device_sw_version,
      batteryStatus: BatteryStatus.Unknown,
      locationStatus: LocationStatus.Unknown,
      livemode: sdkReader.livemode,
      simulated: this.simulated
    }
  }
  async discoverReaders(options) {
    var _a
    this.simulated = !!options.simulated
    const discoveryConfig = {
      simulated: options.simulated,
      location: options.locationId
    }
    const discoverResult = await this.instance.discoverReaders(discoveryConfig)
    if (discoverResult.discoveredReaders) {
      const discover = discoverResult
      const readers =
        (_a =
          discover === null || discover === void 0
            ? void 0
            : discover.discoveredReaders) === null || _a === void 0
          ? void 0
          : _a.map(this.translateReader.bind(this))
      this.notifyListeners('readersDiscovered', {
        readers
      })
    } else {
      const error = discoverResult
      throw error.error
    }
  }
  async cancelDiscoverReaders() {}
  async connectInternetReader(reader) {
    const readerOpts = {
      id: reader.stripeId,
      object: 'terminal.reader',
      device_type:
        reader.deviceType === DeviceType.WisePosE
          ? 'bbpos_wisepos_e'
          : 'verifone_P400',
      ip_address: reader.ipAddress,
      serial_number: reader.serialNumber,
      device_sw_version: reader.deviceSoftwareVersion,
      label: reader.label,
      livemode: reader.livemode,
      location: reader.locationId,
      metadata: {},
      status:
        reader.status === ReaderNetworkStatus.Offline ? 'offline' : 'online'
    }
    const connectResult = await this.instance.connectReader(readerOpts)
    if (connectResult.reader) {
      const result = connectResult
      const translatedReader = this.translateReader(result.reader)
      return { reader: translatedReader }
    } else {
      const error = connectResult
      throw error.error
    }
  }
  async connectBluetoothReader(_config) {
    // no equivalent
    console.warn(
      'connectBluetoothReader is only available for on iOS and Android.'
    )
    return { reader: null }
  }
  async connectUsbReader(_config) {
    // no equivalent
    console.warn('connectUsbReader is only available for on iOS and Android.')
    return { reader: null }
  }
  async getConnectedReader() {
    const reader = this.instance.getConnectedReader()
    if (!reader) {
      return { reader: null }
    }
    const translatedReader = this.translateReader(reader)
    return { reader: translatedReader }
  }
  async getConnectionStatus() {
    const status = this.instance.getConnectionStatus()
    return {
      status: connectionStatus[status]
    }
  }
  async getPaymentStatus() {
    const status = this.instance.getPaymentStatus()
    return {
      status: paymentStatus[status]
    }
  }
  async disconnectReader() {
    await this.instance.disconnectReader()
  }
  async installAvailableUpdate() {
    // no equivalent
    console.warn('installUpdate is only available for Bluetooth readers.')
  }
  async cancelInstallUpdate() {
    // no equivalent
    console.warn('cancelInstallUpdate is only available for Bluetooth readers.')
  }
  async retrievePaymentIntent(options) {
    this.currentClientSecret = options.clientSecret
    // make sure fetch is supported
    const isFetchSupported = 'fetch' in window
    if (!isFetchSupported) {
      return {
        intent: null
      }
    }
    // parse the paymentIntentId out of the clientSecret
    const paymentIntentId = options.clientSecret
      ? options.clientSecret.split('_secret')[0]
      : null
    const stripeUrl = new URL(
      `/v1/payment_intents/${paymentIntentId}`,
      this.STRIPE_API_BASE
    )
    stripeUrl.searchParams.append('client_secret', options.clientSecret)
    const response = await fetch(stripeUrl.href, {
      headers: {
        Authorization: `Bearer ${this.currentConnectionToken}`
      }
    })
    const json = await response.json()
    if (!response.ok) {
      throw new Error(json)
    }
    return {
      intent: {
        stripeId: json.id,
        created: json.created,
        status: paymentIntentStatus[json.status],
        amount: json.amount,
        currency: json.currency
      }
    }
  }
  async collectPaymentMethod() {
    const result = await this.instance.collectPaymentMethod(
      this.currentClientSecret
    )
    if (result.paymentIntent) {
      const res = result
      this.currentPaymentIntent = res.paymentIntent
      return {
        intent: {
          stripeId: this.currentPaymentIntent.id,
          created: this.currentPaymentIntent.created,
          status: paymentIntentStatus[this.currentPaymentIntent.status],
          amount: this.currentPaymentIntent.amount,
          currency: this.currentPaymentIntent.currency
        }
      }
    } else {
      const error = result
      throw error.error
    }
  }
  async cancelCollectPaymentMethod() {
    await this.instance.cancelCollectPaymentMethod()
  }
  async processPayment() {
    const result = await this.instance.processPayment(this.currentPaymentIntent)
    if (result.paymentIntent) {
      const res = result
      return {
        intent: {
          stripeId: res.paymentIntent.id,
          created: res.paymentIntent.created,
          status: paymentIntentStatus[res.paymentIntent.status],
          amount: res.paymentIntent.amount,
          currency: res.paymentIntent.currency
        }
      }
    } else {
      const error = result
      throw error === null || error === void 0 ? void 0 : error.error
    }
  }
  async clearCachedCredentials() {
    await this.instance.clearCachedCredentials()
  }
  async setReaderDisplay(cart) {
    const readerDisplay = {
      cart: {
        line_items: cart.lineItems.map(li => ({
          amount: li.amount,
          description: li.displayName,
          quantity: li.quantity
        })),
        currency: cart.currency,
        tax: cart.tax,
        total: cart.total
      },
      type: 'cart'
    }
    await this.instance.setReaderDisplay(readerDisplay)
  }
  async clearReaderDisplay() {
    await this.instance.clearReaderDisplay()
  }
  async listLocations(options) {
    // make sure fetch is supported
    const isFetchSupported = 'fetch' in window
    if (!isFetchSupported) {
      throw new Error('fetch is not supported by this browser.')
    }
    const stripeUrl = new URL(`/v1/terminal/locations`, this.STRIPE_API_BASE)
    if (options === null || options === void 0 ? void 0 : options.limit) {
      stripeUrl.searchParams.append('limit', options.limit.toString())
    }
    if (
      options === null || options === void 0 ? void 0 : options.endingBefore
    ) {
      stripeUrl.searchParams.append('ending_before', options.endingBefore)
    }
    if (
      options === null || options === void 0 ? void 0 : options.startingAfter
    ) {
      stripeUrl.searchParams.append('starting_after', options.startingAfter)
    }
    const response = await fetch(stripeUrl.href, {
      headers: {
        Authorization: `Bearer ${this.currentConnectionToken}`
      }
    })
    const json = await response.json()
    if (!response.ok) {
      throw new Error(json)
    }
    const locations = json.data.map(l => {
      var _a, _b, _c, _d, _e, _f
      return {
        stripeId: l.id,
        displayName: l.display_name,
        livemode: l.livemode,
        address: {
          city: (_a = l.address) === null || _a === void 0 ? void 0 : _a.city,
          country:
            (_b = l.address) === null || _b === void 0 ? void 0 : _b.country,
          line1: (_c = l.address) === null || _c === void 0 ? void 0 : _c.line1,
          line2: (_d = l.address) === null || _d === void 0 ? void 0 : _d.line2,
          postalCode:
            (_e = l.address) === null || _e === void 0
              ? void 0
              : _e.postal_code,
          state: (_f = l.address) === null || _f === void 0 ? void 0 : _f.state
        }
      }
    })
    return {
      locations,
      hasMore: json.has_more
    }
  }
  async getSimulatorConfiguration() {
    const config = this.instance.getSimulatorConfiguration()
    return {
      simulatedCard: testPaymentMethodMap[config.testPaymentMethod]
    }
  }
  async setSimulatorConfiguration(config) {
    let testPaymentMethod
    for (const key in testPaymentMethodMap) {
      if (Object.prototype.hasOwnProperty.call(testPaymentMethodMap, key)) {
        const method = testPaymentMethodMap[key]
        if (method === config.simulatedCard) {
          testPaymentMethod = key
        }
      }
    }
    this.instance.setSimulatorConfiguration({
      testPaymentMethod
    })
    return {
      simulatedCard: config.simulatedCard
    }
  }
}
//# sourceMappingURL=web.js.map
