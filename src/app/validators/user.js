const User = require('../models/User');
const { compare } = require('bcryptjs')

function checkAllFields(body) {
  const keys = Object.keys(body);

  for (key of keys) {
    if (body[key] == '' && body[key] == 'password') {
      return { 
        error: 'Por favor, preencha todos os campos!', 
        user: body 
      };
    }
  }
}

module.exports = {
  async post(req, res, next) {
    try {
      const fillAllFields = checkAllFields(req.body)
      if (fillAllFields) {
        return res.render('user/register', fillAllFields)
      }

      let { email, cpf_cnpj, password, passwordRepeat } = req.body;

      cpf_cnpj = cpf_cnpj.replace(/\D/g, '');

      const user = await User.findOne({
        where: { email },
        or: { cpf_cnpj },
      });

      if (user) {
        let error = 'Usuário já cadastrado!';
        return res.render('user/register', { error, user: req.body });
      }

      if (password != passwordRepeat) {
        let error = 'A senha repetida não confere com a digitada inicialmente!';
        return res.render('user/register', { error, user: req.body });
      }

      next();
    } catch (error) {
      console.error(error);
    }
  },
  async show(req, res, next) {
    try {
      const { userId: id } = req.session 

      const user = await User.findOne({ where: {id} })

      if (!user) return res.render('user/register', {
        error: "Usuário não encontrado!"
      })

      req.user = user

      next()
    } catch (error) {
      console.error(error)
    }
  },
  async update(req, res, next) {
    try {
      const fillAllFields = checkAllFields(req.body)
      if (fillAllFields) {
        return res.render('user/index', fillAllFields)
      }

      const { id, password } = req.body

      if (!password) {
        let error = 'Coloque sua senha para atualizar seu cadastro';
        return res.render('user/index', { error, user: req.body });
      }

      const user = await User.findOne({ where: {id} })

      const passed = await compare(password, user.password)

      if (!passed) {
        let error = 'Senha incorreta!';
        return res.render('user/index', { error, user: req.body });
      }

      req.user = user

      next()
    } catch (error) {
      console.error(error)
    }
  }
};
