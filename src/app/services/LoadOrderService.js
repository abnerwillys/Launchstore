const User  = require('../models/User')
const Order = require('../models/Order')
const LoadProductService = require('./LoadProductService')

const { date, formatPrice } = require('../../lib/useful')

async function format(order) {
  order.product = await LoadProductService.load('productWithDeleted', {
    where: { id: order.product_id }
  })
  
  order.buyer = await User.findOne({
    where: { id: order.buyer_id}
  })
  
  order.seller = await User.findOne({
    where: { id: order.seller_id}
  })
  
  order.formattedPrice = formatPrice(order.price)
  order.formattedTotal = formatPrice(order.total)
  
  const possibleStatus = {
    open: 'Aberto',
    sold: 'Vendido',
    canceled: 'Cancelado'
  }
  order.formattedStatus = possibleStatus[order.status]
  
  const { day, month, year, hour, minutes } = date(order.updated_at)
  order.formattedUpdatedAt = `${order.formattedStatus} em ${day}/${month}/${year} às ${hour}:${minutes}`

  return order
}

const LoadService = {
  load(service, filter) {
    this.filter = filter
    return this[service]()
  },
  async order() {
    try {
      const order = await Order.findOne(this.filter)
      return this.format(order)

    } catch (error) {
      console.error(error)
    }
  },
  async orders() {
    try {
      const orders = await Order.findAll(this.filter)
      const ordersPromise = orders.map(format)
      return Promise.all(ordersPromise)

    } catch (error) {
      console.error(error)
    }
  },
  format,
}

module.exports = LoadService