import { StorefrontModule } from '@vue-storefront/core/lib/modules';
import { module } from './store'
import { coreHooks } from '@vue-storefront/core/hooks';

export const Braintree: StorefrontModule = function ({ app, store }) {
  store.registerModule('braintree', module);

  coreHooks.afterAppInit(() => {
    const CURRENT_METHOD_CODE = 'braintree'

    store.dispatch('checkout/addPaymentMethod', {
      'title': 'Braintree',
      'code': CURRENT_METHOD_CODE,
      'cost': 0,
      'costInclTax': 0,
      'default': true,
      'offline': false
    })
  })
}
