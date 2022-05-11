import { PluginListenerHandle } from '@capacitor/core'
import { Observable } from 'rxjs'
import {
  StripeTerminalConfig,
  DiscoveryConfiguration,
  InternetConnectionConfiguration,
  BluetoothConnectionConfiguration,
  UsbConnectionConfiguration,
  Reader,
  ConnectionStatus,
  PaymentStatus,
  ReaderDisplayMessage,
  ReaderInputOptions,
  PaymentIntent,
  Cart,
  ListLocationsParameters,
  SimulatorConfiguration,
  DeviceType,
  DeviceStyle,
  PermissionStatus,
  ReaderSoftwareUpdate
} from './definitions'
export declare class StripeTerminalPlugin {
  isInitialized: boolean
  private stripeTerminalWeb?
  private _fetchConnectionToken
  private _onUnexpectedReaderDisconnect
  private isDiscovering
  private listeners
  private simulatedCardType
  private selectedSdkType
  private get activeSdkType()
  private get sdk()
  /**
   * **_DO NOT USE THIS CONSTRUCTOR DIRECTLY._**
   *
   * Use the [[StripeTerminalPlugin.create]] method instead.
   * @hidden
   * @param options `StripeTerminalPlugin` options.
   */
  constructor(options: StripeTerminalConfig)
  private isNative
  private requestConnectionToken
  private init
  private translateConnectionStatus
  private _listenerToObservable
  private ensureInitialized
  /**
   * Ensure that an object exists and is not empty
   * @param object Object to check
   * @returns
   */
  private objectExists
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
  static create(options: StripeTerminalConfig): Promise<StripeTerminalPlugin>
  cancelDiscoverReaders(): Promise<void>
  private normalizeReader
  discoverReaders(options: DiscoveryConfiguration): Observable<Reader[]>
  connectBluetoothReader(
    reader: Reader,
    config: BluetoothConnectionConfiguration
  ): Promise<Reader>
  connectUsbReader(
    reader: Reader,
    config: UsbConnectionConfiguration
  ): Promise<Reader>
  connectInternetReader(
    reader: Reader,
    config?: InternetConnectionConfiguration
  ): Promise<Reader>
  /**
   * This is only here for backwards compatibility
   * @param reader
   * @returns Reader
   *
   * @deprecated
   */
  connectReader(reader: Reader): Promise<Reader>
  getConnectedReader(): Promise<Reader>
  getConnectionStatus(): Promise<ConnectionStatus>
  getPaymentStatus(): Promise<PaymentStatus>
  disconnectReader(): Promise<void>
  connectionStatus(): Observable<ConnectionStatus>
  installAvailableUpdate(): Promise<void>
  cancelInstallUpdate(): Promise<void>
  didRequestReaderInput(): Observable<ReaderInputOptions>
  didRequestReaderDisplayMessage(): Observable<ReaderDisplayMessage>
  didReportAvailableUpdate(): Observable<ReaderSoftwareUpdate>
  didStartInstallingUpdate(): Observable<ReaderSoftwareUpdate>
  didReportReaderSoftwareUpdateProgress(): Observable<number>
  didFinishInstallingUpdate(): Observable<{
    update?: ReaderSoftwareUpdate
    error?: string
  }>
  retrievePaymentIntent(clientSecret: string): Promise<PaymentIntent>
  collectPaymentMethod(): Promise<PaymentIntent>
  cancelCollectPaymentMethod(): Promise<void>
  processPayment(): Promise<PaymentIntent>
  clearCachedCredentials(): Promise<void>
  setReaderDisplay(cart: Cart): Promise<void>
  clearReaderDisplay(): Promise<void>
  listLocations(options?: ListLocationsParameters): Promise<{
    locations?: import('./definitions').Location[]
    hasMore?: boolean
  }>
  private simulatedCardTypeStringToEnum
  getSimulatorConfiguration(): Promise<SimulatorConfiguration>
  setSimulatorConfiguration(
    config: SimulatorConfiguration
  ): Promise<SimulatorConfiguration>
  getDeviceStyleFromDeviceType(type: DeviceType): DeviceStyle
  /**
   * @deprecated use requestPermissions and checkPermissions instead
   */
  static getPermissions(): Promise<PermissionStatus>
  static checkPermissions(): Promise<PermissionStatus>
  static requestPermissions(): Promise<PermissionStatus>
  /**
   * This should not be used directly. It will not behave correctly when using `Internet` and `Both` discovery methods
   *
   * @deprecated This should not be used directly. It will not behave correctly when using `Internet` and `Both` discovery methods
   */
  addListener(
    eventName: string,
    listenerFunc: Function
  ): Promise<PluginListenerHandle>
}
