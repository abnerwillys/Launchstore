const crypto   = require('crypto');
const mailer   = require('../../lib/mailer');
const { hash } = require('bcryptjs');

const User = require('../models/User');

module.exports = {
  loginForm(req, res) {
    return res.render('session/login');
  },
  login(req, res) {
    req.session.userId = req.user.id;

    return res.redirect('/users');
  },
  logout(req, res) {
    req.session.destroy();

    return res.redirect('/');
  },
  forgotForm(req, res) {
    return res.render('session/forgot-password');
  },
  async forgot(req, res) {
    try {
      const user = req.user;

      const token = crypto.randomBytes(20).toString('hex');

      let now = new Date();
      now = now.setHours(now.getHours() + 1);

      await User.update(user.id, {
        reset_token: token,
        reset_token_expires: now,
      });

      await mailer.sendMail({
        from: 'no-reply@launchstore.com.br',
        to: user.email,
        subject: 'Recuperação de senha',
        html: `
          <h2>Esqueceu sua senha?</h2>
          <p>Não se preocupe, clique no link abaixo para recuperar sua senha.</p>
          <p>
            <a href="http://localhost:3000/users/password-reset?token=${token}" target="_blank">
              Link para recuperar senha
            </a>
          </p>
        `,
      });

      return res.render('session/forgot-password', {
        success:
          'Verifique seu email para prosseguir com a recuperação de senha!',
      });
    } catch (error) {
      console.error(error);

      return res.render('session/forgot-password', {
        user: req.body,
        error:
          'Erro inesperado, tente novamente. Se o erro persistir contate nosso suporte!',
      });
    }
  },
  resetForm(req, res) {
    return res.render('session/password-reset', { token: req.query.token });
  },
  async reset(req, res) {
    const user = req.user;
    const { password, token } = req.body;
    
    try {
      const newPassword = await hash(password, 8);

      await User.update(user.id, {
        password: newPassword,
        reset_token: '',
        reset_token_expires: '',
      });

      return res.render('session/login', {
        user: req.body,
        success: 'Senha atualizada! Faça seu login.',
      });

    } catch (error) {
      console.error(error);

      return res.render('session/password-reset', {
        token,
        user: req.body,
        error: 'Erro inesperado, tente novamente. Se o erro persistir contate nosso suporte!',
      });
    }
  },
};
