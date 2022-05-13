/**
 * @category Terminal
 */
export var ConnectionStatus
;(function (ConnectionStatus) {
  /**
   * The SDK is not connected to a reader.
   */
  ConnectionStatus[(ConnectionStatus['NotConnected'] = 0)] = 'NotConnected'
  /**
   * The SDK is connected to a reader.
   */
  ConnectionStatus[(ConnectionStatus['Connected'] = 1)] = 'Connected'
  /**
   * The SDK is currently connecting to a reader.
   */
  ConnectionStatus[(ConnectionStatus['Connecting'] = 2)] = 'Connecting'
})(ConnectionStatus || (ConnectionStatus = {}))
/**
 * The possible payment statuses for the SDK.
 */
export var PaymentStatus
;(function (PaymentStatus) {
  /**
   * The SDK is not ready to start a payment. It may be busy with another command, or a reader may not be connected.
   */
  PaymentStatus[(PaymentStatus['NotReady'] = 0)] = 'NotReady'
  /**
   * The SDK is ready to start a payment.
   */
  PaymentStatus[(PaymentStatus['Ready'] = 1)] = 'Ready'
  /**
   * The SDK is waiting for input from the customer (e.g., for a card to be presented to the reader)
   */
  PaymentStatus[(PaymentStatus['WaitingForInput'] = 2)] = 'WaitingForInput'
  /**
   * The SDK is processing a payment.
   */
  PaymentStatus[(PaymentStatus['Processing'] = 3)] = 'Processing'
})(PaymentStatus || (PaymentStatus = {}))
/**
 * The possible device types for a reader.
 *
 * @category Reader
 * @see https://stripe.com/docs/terminal/readers
 */
export var DeviceType
;(function (DeviceType) {
  /**
   * The BBPOS Chipper 2X BT mobile reader.
   *
   * @see https://stripe.com/docs/terminal/readers/bbpos-chipper2xbt
   */
  DeviceType[(DeviceType['Chipper2X'] = 0)] = 'Chipper2X'
  /**
   * The Verifone P400 countertop reader.
   *
   * @see https://stripe.com/docs/terminal/readers/verifone-p400
   */
  DeviceType[(DeviceType['VerifoneP400'] = 1)] = 'VerifoneP400'
  /**
   * The BBPOS WisePad 3 mobile reader.
   *
   * Support for this reader is currently in beta.
   *
   * @see https://stripe.com/docs/terminal/readers/bbpos-wisepad3
   */
  DeviceType[(DeviceType['WisePad3'] = 2)] = 'WisePad3'
  /**
   * The Stripe Reader M2 mobile reader.
   *
   * Support for this reader is currently in beta.
   */
  DeviceType[(DeviceType['StripeM2'] = 3)] = 'StripeM2'
  /**
   * The BBPOS WisePOS E countertop reader.
   *
   * Support for this reader is currently in beta.
   *
   * @see https://stripe.com/docs/terminal/readers/bbpos-wisepos-e
   */
  DeviceType[(DeviceType['WisePosE'] = 4)] = 'WisePosE'
  DeviceType[(DeviceType['Unknown'] = 5)] = 'Unknown'
})(DeviceType || (DeviceType = {}))
/**
 * The possible methods for discovering a reader.
 *
 * @category Reader
 * @see https://stripe.com/docs/terminal/readers/connecting
 */
export var DiscoveryMethod
;(function (DiscoveryMethod) {
  /**
   * When discovering a reader using this method, the `discoverReaders` Observable will be called multiple times as the Bluetooth scan proceeds.
   */
  DiscoveryMethod[(DiscoveryMethod['BluetoothScan'] = 0)] = 'BluetoothScan'
  /**
   * If your app will be used in a busy environment with multiple iOS devices pairing to multiple available readers at the same time, we recommend using this discovery method.
   *
   * After a reader has been discovered using this method, the LEDs located above the reader's power button will start flashing multiple colors. After discovering the reader, your app should prompt the user to confirm that the reader is flashing, and require a user action (e.g. tapping a button) to connect to the reader.
   *
   * When discovering a reader using this method, the `discoverReaders` Observable will be called twice. It will be called for the first time when the reader is initially discovered. The reader's LEDs will begin flashing. After a short delay, `discoverReaders` will be called a second time with an updated reader object, populated with additional info about the device, like its battery level.
   *
   * _The Bluetooth Proximity discovery method can only discovery Chipper 2X BT readers._
   */
  DiscoveryMethod[(DiscoveryMethod['BluetoothProximity'] = 1)] =
    'BluetoothProximity'
  /**
   * The Internet discovery method searches for internet-connected readers, such as the Verifone P400 or the BBPOS WisePOS E.
   *
   * When discovering a reader with this method, the `discoverReaders` Observable will only be called once with a list of readers from `/v1/terminal/readers`. Note that this will include readers that are both online and offline.
   *
   * Because the discovery process continues if connecting to a discovered reader fails, the SDK will refresh the list of `Readers` and call your subscriber with the results.
   *
   * @see https://stripe.com/docs/api/terminal/readers/list
   */
  DiscoveryMethod[(DiscoveryMethod['Internet'] = 2)] = 'Internet'
  DiscoveryMethod[(DiscoveryMethod['USB'] = 3)] = 'USB'
  /**
   * Use both BluetoothScan and Internet discovery methods
   *
   * This mode is custom to the `capacitor-stripe-terminal` plugin and uses the native SDK for the BluetoothScan method while simultaneously using the JS SDK for the Internet method.
   */
  DiscoveryMethod[(DiscoveryMethod['Both'] = 4)] = 'Both'
})(DiscoveryMethod || (DiscoveryMethod = {}))
/**
 * The possible networking statuses of a reader.
 *
 * @category Reader
 * @see https://stripe.com/docs/api/terminal/readers/object
 */
export var ReaderNetworkStatus
;(function (ReaderNetworkStatus) {
  /**
   * The reader is offline. Note that Chipper 2x and WisePad 3 will always report `offline`.
   */
  ReaderNetworkStatus[(ReaderNetworkStatus['Offline'] = 0)] = 'Offline'
  /**
   * The reader is online.
   */
  ReaderNetworkStatus[(ReaderNetworkStatus['Online'] = 1)] = 'Online'
})(ReaderNetworkStatus || (ReaderNetworkStatus = {}))
/**
 * A categorization of a reader’s battery charge level.
 *
 * @category Reader
 */
export var BatteryStatus
;(function (BatteryStatus) {
  /**
   * Battery state is not yet known or not available for the connected reader.
   */
  BatteryStatus[(BatteryStatus['Unknown'] = 0)] = 'Unknown'
  /**
   * The device’s battery is less than or equal to 5%.
   */
  BatteryStatus[(BatteryStatus['Critical'] = 1)] = 'Critical'
  /**
   * The device’s battery is between 5% and 20%.
   */
  BatteryStatus[(BatteryStatus['Low'] = 2)] = 'Low'
  /**
   * The device’s battery is greater than 20%.
   */
  BatteryStatus[(BatteryStatus['Nominal'] = 3)] = 'Nominal'
})(BatteryStatus || (BatteryStatus = {}))
/**
 * Represents the possible states of the location object for a discovered reader.
 *
 * @category Reader Discovery & Connection
 * @see https://stripe.com/docs/api/terminal/readers/object
 */
export var LocationStatus
;(function (LocationStatus) {
  /**
   * The location is not known. `location` will be null.
   *
   * A reader will only have a location status of `unknown` when a Bluetooth reader's full location information failed to fetch properly during discovery.
   */
  LocationStatus[(LocationStatus['Unknown'] = 0)] = 'Unknown'
  /**
   * The location was successfully set to a known location. `location` is a valid `Location`.
   */
  LocationStatus[(LocationStatus['Set'] = 1)] = 'Set'
  /**
   * This location is known to be not set. `location` will be null.
   */
  LocationStatus[(LocationStatus['NotSet'] = 2)] = 'NotSet'
})(LocationStatus || (LocationStatus = {}))
/**
 * The display messages that a reader may request be displayed by your app.
 *
 * @category Reader
 * @see https://stripe.dev/stripe-terminal-ios/docs/Enums/SCPReaderDisplayMessage
 */
export var ReaderDisplayMessage
;(function (ReaderDisplayMessage) {
  /**
   * Retry the presented card.
   */
  ReaderDisplayMessage[(ReaderDisplayMessage['RetryCard'] = 0)] = 'RetryCard'
  /**
   * Insert the presented card.
   */
  ReaderDisplayMessage[(ReaderDisplayMessage['InsertCard'] = 1)] = 'InsertCard'
  /**
   * Insert or swipe the presented card.
   */
  ReaderDisplayMessage[(ReaderDisplayMessage['InsertOrSwipeCard'] = 2)] =
    'InsertOrSwipeCard'
  /**
   * Swipe the presented card.
   */
  ReaderDisplayMessage[(ReaderDisplayMessage['SwipeCard'] = 3)] = 'SwipeCard'
  /**
   * Remove the presented card.
   */
  ReaderDisplayMessage[(ReaderDisplayMessage['RemoveCard'] = 4)] = 'RemoveCard'
  /**
   * The reader detected multiple contactless cards. Make sure only one contactless card or NFC device is near the reader.
   */
  ReaderDisplayMessage[
    (ReaderDisplayMessage['MultipleContactlessCardsDetected'] = 5)
  ] = 'MultipleContactlessCardsDetected'
  /**
   * The card could not be read. Try another read method on the same card, or use a different card.
   */
  ReaderDisplayMessage[(ReaderDisplayMessage['TryAnotherReadMethod'] = 6)] =
    'TryAnotherReadMethod'
  /**
   * The card is invalid. Try another card.
   */
  ReaderDisplayMessage[(ReaderDisplayMessage['TryAnotherCard'] = 7)] =
    'TryAnotherCard'
})(ReaderDisplayMessage || (ReaderDisplayMessage = {}))
/**
 * This represents all of the input methods available to your user when the reader begins waiting for input.
 *
 * @category Reader
 * @see https://stripe.dev/stripe-terminal-ios/docs/Enums/SCPReaderInputOptions
 */
export var ReaderInputOptions
;(function (ReaderInputOptions) {
  /**
   * No input options are available on the reader.
   */
  ReaderInputOptions[(ReaderInputOptions['None'] = 0)] = 'None'
  /**
   * Swipe a magstripe card.
   */
  ReaderInputOptions[(ReaderInputOptions['SwipeCard'] = 1)] = 'SwipeCard'
  /**
   * Insert a chip card.
   */
  ReaderInputOptions[(ReaderInputOptions['InsertCard'] = 2)] = 'InsertCard'
  /**
   * Tap a contactless card.
   */
  ReaderInputOptions[(ReaderInputOptions['TapCard'] = 4)] = 'TapCard'
})(ReaderInputOptions || (ReaderInputOptions = {}))
/**
 * The possible statuses for a PaymentIntent.
 *
 * @category Payment
 * @see https://stripe.com/docs/api/payment_intents/object#payment_intent_object-status
 */
export var PaymentIntentStatus
;(function (PaymentIntentStatus) {
  /**
   * Next step: collect a payment method by calling `collectPaymentMethod`.
   */
  PaymentIntentStatus[(PaymentIntentStatus['RequiresPaymentMethod'] = 0)] =
    'RequiresPaymentMethod'
  /**
   * Next step: process the payment by calling `processPayment`.
   */
  PaymentIntentStatus[(PaymentIntentStatus['RequiresConfirmation'] = 1)] =
    'RequiresConfirmation'
  /**
   * Next step: capture the PaymentIntent on your backend via the Stripe API.
   */
  PaymentIntentStatus[(PaymentIntentStatus['RequiresCapture'] = 2)] =
    'RequiresCapture'
  /**
   * The PaymentIntent is in the middle of full EMV processing.
   */
  PaymentIntentStatus[(PaymentIntentStatus['Processing'] = 3)] = 'Processing'
  /**
   * The PaymentIntent was canceled.
   */
  PaymentIntentStatus[(PaymentIntentStatus['Canceled'] = 4)] = 'Canceled'
  /**
   * The PaymentIntent succeeded.
   */
  PaymentIntentStatus[(PaymentIntentStatus['Succeeded'] = 5)] = 'Succeeded'
})(PaymentIntentStatus || (PaymentIntentStatus = {}))
/**
 * Enum used to simulate various types of cards and error cases.
 * @see https://stripe.com/docs/terminal/testing#simulated-test-cards
 */
export var SimulatedCardType
;(function (SimulatedCardType) {
  SimulatedCardType[(SimulatedCardType['Visa'] = 0)] = 'Visa'
  SimulatedCardType[(SimulatedCardType['VisaDebit'] = 1)] = 'VisaDebit'
  SimulatedCardType[(SimulatedCardType['Mastercard'] = 2)] = 'Mastercard'
  SimulatedCardType[(SimulatedCardType['MasterDebit'] = 3)] = 'MasterDebit'
  SimulatedCardType[(SimulatedCardType['MastercardPrepaid'] = 4)] =
    'MastercardPrepaid'
  SimulatedCardType[(SimulatedCardType['Amex'] = 5)] = 'Amex'
  SimulatedCardType[(SimulatedCardType['Amex2'] = 6)] = 'Amex2'
  SimulatedCardType[(SimulatedCardType['Discover'] = 7)] = 'Discover'
  SimulatedCardType[(SimulatedCardType['Discover2'] = 8)] = 'Discover2'
  SimulatedCardType[(SimulatedCardType['Diners'] = 9)] = 'Diners'
  SimulatedCardType[(SimulatedCardType['Diners14Digit'] = 10)] = 'Diners14Digit'
  SimulatedCardType[(SimulatedCardType['Jcb'] = 11)] = 'Jcb'
  SimulatedCardType[(SimulatedCardType['UnionPay'] = 12)] = 'UnionPay'
  SimulatedCardType[(SimulatedCardType['Interac'] = 13)] = 'Interac'
  SimulatedCardType[(SimulatedCardType['ChargeDeclined'] = 14)] =
    'ChargeDeclined'
  SimulatedCardType[
    (SimulatedCardType['ChargeDeclinedInsufficientFunds'] = 15)
  ] = 'ChargeDeclinedInsufficientFunds'
  SimulatedCardType[(SimulatedCardType['ChargeDeclinedLostCard'] = 16)] =
    'ChargeDeclinedLostCard'
  SimulatedCardType[(SimulatedCardType['ChargeDeclinedStolenCard'] = 17)] =
    'ChargeDeclinedStolenCard'
  SimulatedCardType[(SimulatedCardType['ChargeDeclinedExpiredCard'] = 18)] =
    'ChargeDeclinedExpiredCard'
  SimulatedCardType[(SimulatedCardType['ChargeDeclinedProcessingError'] = 19)] =
    'ChargeDeclinedProcessingError'
  SimulatedCardType[(SimulatedCardType['RefundFailed'] = 20)] = 'RefundFailed'
})(SimulatedCardType || (SimulatedCardType = {}))
export var SimulateReaderUpdate
;(function (SimulateReaderUpdate) {
  // Default: An update is available that is marked as needing to be installed within 7 days
  SimulateReaderUpdate[(SimulateReaderUpdate['Available'] = 0)] = 'Available'
  // No updates are available
  SimulateReaderUpdate[(SimulateReaderUpdate['None'] = 1)] = 'None'
  // A required full reader software update exists. Use this to simulate the auto-install of a required update that will be applied during connect. This simulated update will take 1 minute and progress will be provided.
  SimulateReaderUpdate[(SimulateReaderUpdate['Required'] = 2)] = 'Required'
  // A required update exists. When the SDK connects to the reader, the connection will fail because the reader's battery is too low for the update to begin.
  SimulateReaderUpdate[(SimulateReaderUpdate['LowBattery'] = 3)] = 'LowBattery'
  // Randomly picks a type of update for the reader to help exercise the various states.
  SimulateReaderUpdate[(SimulateReaderUpdate['Random'] = 4)] = 'Random'
})(SimulateReaderUpdate || (SimulateReaderUpdate = {}))
export var DeviceStyle
;(function (DeviceStyle) {
  DeviceStyle[(DeviceStyle['Internet'] = 0)] = 'Internet'
  DeviceStyle[(DeviceStyle['Bluetooth'] = 1)] = 'Bluetooth'
  DeviceStyle[(DeviceStyle['USB'] = 2)] = 'USB'
})(DeviceStyle || (DeviceStyle = {}))
//# sourceMappingURL=definitions.js.map
