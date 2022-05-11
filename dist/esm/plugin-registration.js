import { registerPlugin } from '@capacitor/core'
/**
 * This should NOT be used directly.
 * @ignore
 */
export const StripeTerminal = registerPlugin('StripeTerminal', {
  web: () => import('./web').then(m => new m.StripeTerminalWeb())
})
//# sourceMappingURL=plugin-registration.js.map
