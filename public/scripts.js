const Mask = {
  apply(input, funcName) {
    setTimeout(() => {
      input.value = Mask[funcName](input.value)
    }, 1)
  },
  formatBRL(value) {
    value = value.replace(/\D/g, "") //regular expression

    return value = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value / 100)
  }
}