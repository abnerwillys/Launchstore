let i = 0
let finalValue = ""

const Mask = {
  apply(input, funcName) {
    setTimeout(() => {
      input.value = Mask[funcName](input.value)
    }, 1)
  },
  formatPercent(value) {
    value = value.replace(/\D/g, '')
    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      maximumFractionDigits: 4
    }).format(value/1000000)
  },
  formatCPF(value) {

    if (value.length < 11) {
      value = value.replace(/\D/g, '')
      i = 0
      finalValue = ""
      return value 
    }

    if (value.length == 11 && i == 0) {
      
      i = 0

      for (let letter of value) {
        i ++

        const controllerDot   = i == 3 || i == 6
        const controllerTrace = i == 9

        if (controllerDot) {
          finalValue += letter + "."

        } else if (controllerTrace) {
          finalValue += letter + "-" 

        } else {
          finalValue += letter
        }
      }
      return finalValue
    }  
    
    return finalValue
  }
}