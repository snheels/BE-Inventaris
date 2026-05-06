const express = require('express')
const app = express()
const port = 3000

const db = require("./models")
const methodOverride = require('method-override')
const itemRoutes = require('./routes/item.routes')
const loanRoutes = require('./routes/loan.routes')
const loginRoutes = require('./routes/login.routes')
const {checkToken} = require('./middlewares/auth')

//cek koneksi model - migration - proyek sequelize
db.sequelize.authenticate()
.then(() => console.log("Database (model) terkoneksi"))
.catch((error) => console.error(error))

//app.use : mendaftarkan routing atau config header lain,  urutannya sebelum app.get
app.use(express.json()); //mengijinkan req.body
app.use(methodOverride("_method"));
app.use('/uploads', express.static('uploads')); //agar gambar yang disimpan di folder uploads dibolehkan untuk diambil/dimunculkan di browser (fe)
app.use('/items', checkToken, itemRoutes); //mendaftarkan routes dan prefix nya
app.use('/loans', checkToken,  loanRoutes);
app.use('/', loginRoutes);

app.get('/', (req, res) => {
  res.send('Hello Cat!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
