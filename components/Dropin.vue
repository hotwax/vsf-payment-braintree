<template>
  <div class="braintree" id="braintree" />
</template>

<script>
import { currentStoreView } from '@vue-storefront/core/lib/multistore'

export default {
  name: 'BraintreeDropin',
  data () {
    const storeView = currentStoreView()
    return {
      loader: false,
      commit: true,
      nonce: '',
      currency: storeView.i18n.currencyCode,
      locale: storeView.i18n.defaultLocale.replace('-', '_') // Convert to PayPal format of locale
    }
  },
  mounted () {
    this.configureBraintree()
  },
  computed: {
    grandTotal () {
      let cartTotals = this.$store.getters['cart/getTotals']
      return cartTotals.find(seg => seg.code === 'grand_total').value
    }
  },
  methods: {
    configureBraintree () {
      var self = this
      this.$store.dispatch('braintree/generateToken').then((resp) => {
        var dropin = require('braintree-web-drop-in')
        console.debug('Code for braintree:' + resp)
        var button = document.querySelector('.place-order-btn')
        dropin.create({
          authorization: resp,
          container: '#braintree',
          paypal: {
            flow: 'checkout',
            amount: this.getTransactions().amount.total,
            currency: this.getTransactions().amount.currency
          }
        }, (err, dropinInstance) => {
          if (err) {
            console.error(err)
            return;
          }
          dropinInstance.on('paymentOptionSelected', function(event) {
            button.removeAttribute('disabled')
          })
          button.addEventListener('click', () => {
            dropinInstance.requestPaymentMethod((err, payload) => {
              if (!err) {
                console.debug(payload)
                // Submit payload.nonce to your server
                self.nonce = payload.nonce
                console.error('success')
                // when payment made through 'paypal through braintree' update payment method to 'braintree_paypal'
                if (payload.type === 'PayPalAccount') {
                  self.$store.state.checkout.paymentDetails.paymentMethod = 'braintree_paypal'
                } else {
                  self.$store.state.checkout.paymentDetails.paymentMethod = 'braintree'
                }
                this.$emit('sendDataToCheckout')
              } else {
                console.error(err)
              }
            })
          })
        })
      })
    },
    getTransactions () {
      return { amount: { total: this.grandTotal, currency: this.currency } }
    },
    getNonce () {
      return { nonce: this.nonce, total: this.grandTotal, currency: this.currency }
    },
    doPayment (data, actions) {
      return this.$store.dispatch('braintree/doPayment', this.getNonce())
    },
    onAuthorize (data, actions) {
      return true
    },
    onCancel (data) {
      this.$emit('payment-braintree-cancelled', data)
    }
  }
}
</script>
