const { formatPrice } = require('../../lib/useful')

const Category = require("../models/Category")
const Product  = require("../models/Product")
const File     = require("../models/File")

module.exports = {
  create(req, res) {
    Category.all()
    .then(function (results) {
      const categories = results.rows

      return res.render('products/create', { categories })
    }).catch(function (err) {
      throw new Error(err)
    })
  },
  async post(req, res) {
    const keys = Object.keys(req.body)

    for (key of keys) {
      if (req.body[key] == "") return res.send("Please, fill all fields!")
    }

    if (req.files.length == 0) return res.send("Please, send at least one image!")

    req.body.price = req.body.price.replace(/\D/g, "")//R$ 1,00 = 100

    let results = await Product.create(req.body)
    const productId = results.rows[0].id

    const filesPromise = req.files.map(file => {
      File.create({
        filename: file.filename,
        path: file.path.replace(/\\/g, "/" ),
        product_id: productId
      })
    })
    await Promise.all(filesPromise)

    return res.redirect(`/products/${productId}/edit`)
  },
  async edit(req, res) {
    let results = await Product.find(req.params.id)
    const product = results.rows[0]

    if(!product) return res.send("Product not found!")

    product.old_price = formatPrice(product.old_price)
    product.price = formatPrice(product.price)
    
    //Get categories
    results = await Category.all()
    const categories = results.rows

    //Get images
    results   = await Product.files(product.id)
    let files = results.rows
    files     = files.map(file => ({
      ...file,
      src: `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
    })) 

    return res.render('products/edit', { product, categories, files })
  },
  async put(req, res) {
    const keys = Object.keys(req.body)

    for (key of keys) {
      if (req.body[key] == "" && key != "removed_files") {
        return res.send("Please, fill all fields!")
      }
    }

    if (req.body.removed_files) {
      // 1,2,3,
      const removedFiles = req.body.removed_files.split(",") //[1,2,3, ]
      const lastIndex    = removedFiles.length - 1
      removedFiles.splice(lastIndex, 1) // [1,2,3]

      const removedFilesPromise = removedFiles.map(fileId => File.delete(fileId))

      await Promise.all(removedFilesPromise)
    }

    if (req.files.length != 0) {
      const newFilesPromise = req.files.map(file => {
        File.create({
          filename: file.filename,
          path: file.path.replace(/\\/g, "/" ),
          product_id: req.body.id
        })
      })

      await Promise.all(newFilesPromise)
    }


    req.body.price = req.body.price.replace(/\D/g, "")//R$ 1,00 = 100

    //Update of old_price;
    if (req.body.old_price != req.body.price) {
      const oldProduct = await Product.find(req.body.id)

      req.body.old_price = oldProduct.rows[0].price
    }

    await Product.update(req.body)

    return res.redirect(`products/${req.body.id}/edit`)
  },
  async delete(req, res) {
    await Product.delete(req.body.id)

    return res.redirect('/products/create')
  }
}