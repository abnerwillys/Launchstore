const LoadProductService = require('../services/LoadProductService')
const LoadOrderService   = require('../services/LoadOrderService')
const User   = require('../models/User')
const Order  = require('../models/Order')
const mailer = require('../../lib/mailer')
const Cart   = require('../../lib/cart')
const { formatCep, formatCpfCnpj, formatPrice } = require('../../lib/useful') 

const email = (seller, product, buyer, order) => `
  <h2>Olá ${seller.name}</h2>
  <p>Você tem um novo pedido de compra do seu produto.</p>
  <p>Produto: ${product.name}</p>
  <p>Preço Unitário: ${formatPrice(order.price)}</p>
  <p>Quantidade: ${order.quantity}</p>
  <p>Preço Total: ${formatPrice(order.total)}</p>
  <p><br/></p>
  <h3>Dados do comprador</h3>
  <p>Nome: ${buyer.name}</p>
  <p>Email: ${buyer.email}</p>
  <p>CPF/CNPJ: ${formatCpfCnpj(buyer.cpf_cnpj)}</p>
  <p>Endereço: ${buyer.address}</p>
  <p>CEP: ${formatCep(buyer.cep)}</p>
  <p><br/></p>
  <p><strong>Entre em contato com o comprador para finalizar a venda!</strong></p>
  <p><br/></p>
  <p>Atenciosamente, Equipe <strong>LaunchStore</strong></p>
`

module.exports = {
  async index(req, res) {
    try {
      const orders = await LoadOrderService.load('orders', {
        where: { buyer_id: req.session.userId}
      })
  
      return res.render('orders/index', { orders })

    } catch (error) {
      console.error(error)
    }
  },

  async sales(req, res) {
    try {
      const sales = await LoadOrderService.load('orders', {
        where: { seller_id: req.session.userId}
      })

      return res.render('orders/sales', { sales: sales.sort((a,b) => b.updated_at - a.updated_at) })

    } catch (error) {
      console.error(error)
    }
  },

  async show(req, res) {
    try {
      const order = await LoadOrderService.load('order', {
        where: { id: req.params.id }
      })

      return res.render('orders/details', { order })
    } catch (error) {
      console.error(error)
    }
  },

  async post(req, res) {
    try {
      const cart = Cart.init(req.session.cart)

      const buyer_id = req.session.userId
      const filteredItems = cart.items.filter(item => 
        item.product.user_id != buyer_id
      )

      const createOrdersPromise = filteredItems.map(async item => {
        let { product, price: total, quantity } = item
        const { price, id: product_id, user_id: seller_id} = product
        const status = 'open'

        const orderData = {
          seller_id,
          buyer_id,
          product_id,
          price,
          total,
          quantity,
          status
        }

        const order = await Order.create(orderData)

        product = await LoadProductService.load('product', {
          where: { id: product_id }
        })

        const seller = await User.findOne({ where: { id: seller_id }})
        const buyer = await User.findOne({ where: { id: buyer_id }})

        await mailer.sendMail({
          to: seller.email,
          from: 'no-reply@launchstore.com.br', 
          subject: 'Novo pedido de compra',
          html: email(seller, product, buyer, orderData)
        })

        return order
      })      

      await Promise.all(createOrdersPromise)

      delete req.session.cart
      Cart.init()

      return res.render('orders/success')

    } catch (error) {
      console.error(error)
      return res.render('orders/error')
    }
  },

  async update(req, res) {
    try {
      const acceptedActions = ['close', 'cancel']
      const { id, action } = req.params
      const sales = await LoadOrderService.load('orders', {
        where: { seller_id: req.session.userId}
      })

      if (!acceptedActions.includes(action)) {
        return res.render('orders/sales', {
          sales,
          error:
            'Não foi possível realizar esta ação. Tente novamente ou entre em contato com o suporte!',
        });
      }

      const order = await Order.findOne({
        where: { id }
      })

      if (!order) {
        return res.render('orders/sales', {
          sales,
          error:
            'Pedido não encontrado!',
        });
      }

      if (order.status != 'open') {
        return res.render('orders/sales', {
          sales,
          error:
            'Não foi possível realizar esta ação. Tente novamente ou entre em contato com o suporte!',
        });
      }
      const finalStatus = {
        close: 'sold',
        cancel: 'canceled'
      }

      order.status = finalStatus[action]
      await Order.update(id,  {
        status: order.status
      })

      return res.redirect('/orders/sales')
    } catch (error) {
      console.error(error)
    }
  }
}