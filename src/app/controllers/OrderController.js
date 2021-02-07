const LoadProductService = require('../services/LoadProductService')
const User = require('../models/User')
const mailer = require('../../lib/mailer')
const { formatCep, formatCpfCnpj } = require('../../lib/useful') 

const email = (seller, product, buyer) => `
  <h2>Olá ${seller.name}</h2>
  <p>Você tem um novo pedido de compra do seu produto.</p>
  <p>Produto: ${product.name}</p>
  <p>Preço: ${product.formattedPrice}</p>
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
  async post(req, res) {
    try {
      //Get the products data
      const product = await LoadProductService.load('product', {
        where: { id: req.body.id }
      })

      //Get the seller data
      const seller = await User.findOne({ where: { id: product.user_id }})

      //Get the buyer data
      const buyer = await User.findOne({ where: { id: req.session.userId }})

      //Send email with the purchase data for the seller
      await mailer.sendMail({
        to: seller.email,
        from: 'no-reply@launchstore.com.br', 
        subject: 'Novo pedido de compra',
        html: email(seller, product, buyer)
      })

      //Notify the user with some msg of success or error
      return res.render('orders/success')

    } catch (error) {
      console.error(error)
      return res.render('orders/error')
    }
  }
}