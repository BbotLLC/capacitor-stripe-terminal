import { WebPlugin } from '@capacitor/core'
import {
  StripeTerminalInterface,
  DiscoveryConfiguration,
  Reader,
  ConnectionStatus,
  PaymentIntent,
  PaymentStatus,
  ListLocationsParameters,
  Location,
  SimulatorConfiguration,
  PermissionStatus,
  Cart
} from './definitions'
/**
 * @ignore
 */
export declare class StripeTerminalWeb
  extends WebPlugin
  implements StripeTerminalInterface
{
  private STRIPE_API_BASE
  private instance
  private simulated
  private currentClientSecret
  private currentPaymentIntent
  private currentConnectionToken
  private connectionTokenCompletionSubject
  constructor()
  getPermissions(): Promise<PermissionStatus>
  checkPermissions(): Promise<PermissionStatus>
  requestPermissions(): Promise<PermissionStatus>
  setConnectionToken(
    options: {
      token?: string
    },
    errorMessage?: string
  ): Promise<void>
  initialize(): Promise<void>
  private isInstanceOfLocation
  private translateReader
  discoverReaders(options: DiscoveryConfiguration): Promise<void>
  cancelDiscoverReaders(): Promise<void>
  connectInternetReader(reader: Reader): Promise<{
    reader: Reader
  }>
  connectBluetoothReader(_config: {
    serialNumber: string
    locationId: string
  }): Promise<{
    reader: Reader
  }>
  connectUsbReader(_config: {
    serialNumber: string
    locationId: string
  }): Promise<{
    reader: Reader
  }>
  getConnectedReader(): Promise<{
    reader: Reader
  }>
  getConnectionStatus(): Promise<{
    status: ConnectionStatus
  }>
  getPaymentStatus(): Promise<{
    status: PaymentStatus
  }>
  disconnectReader(): Promise<void>
  installAvailableUpdate(): Promise<void>
  cancelInstallUpdate(): Promise<void>
  retrievePaymentIntent(options: { clientSecret: string }): Promise<{
    intent: PaymentIntent
  }>
  collectPaymentMethod(): Promise<{
    intent: PaymentIntent
  }>
  cancelCollectPaymentMethod(): Promise<void>
  processPayment(): Promise<{
    intent: PaymentIntent
  }>
  clearCachedCredentials(): Promise<void>
  setReaderDisplay(cart: Cart): Promise<void>
  clearReaderDisplay(): Promise<void>
  listLocations(options?: ListLocationsParameters): Promise<{
    locations?: Location[]
    hasMore?: boolean
  }>
  getSimulatorConfiguration(): Promise<SimulatorConfiguration>
  setSimulatorConfiguration(
    config: SimulatorConfiguration
  ): Promise<SimulatorConfiguration>
}
