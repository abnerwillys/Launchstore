const express = require('express')
const routes  = express.Router()

routes.get('/', (req, res) => {
    return res.render('index.njk')
})

module.exports = routes