export const isNotEmptyObj = (obj: any) => {
  if (!obj) return false;
  const target = (typeof obj === 'object' && obj !== null && 'value' in obj) ? obj.value : obj;
  if (!target || typeof target !== 'object') return false;
  return Object.keys(target).length !== 0;
}

export const displayStock = (stock: number, hidden: boolean) => {
  if (!hidden) { return stock }
  if (stock == 0) {
    return '0'
  }
  return '>=1'
}

export const paymentName = (name: string) => {
  if (['card', 'onramp'].includes(name)) {
    return 'Visa/Mastercard'
  }
  if (['credits', 'crypto', 'alipay', 'wxpay', 'hiicash'].includes(name)) {
    const translate = useNuxtApp().$i18n.t
    return translate('platform_payment_' + name)
  }
  return name
}