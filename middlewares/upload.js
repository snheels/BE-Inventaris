//middleware ini klo di express ini karena dia jembatan antara routing dan controller
//disini itu biar si file sebelum di tanganin ke controller itu disini di ubah dulu jadi file yang bisa di pake di controller
const multer = require("multer")
    //path: agar bisa mengakses folder file project
const path = require("path")

//proses up;oad multer disimpan di middleware karena :
//middleware penghubung/tengah proses (route - middleware - controller)]
// sblm file ini di akses controller oleh middleware di proses dulu agar siap digunakan
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    //file yang diupload akan di simpen di folder project ini bagian uploads
    //buat nyabungin path di laptop sam folder upoas
    cb(null, path.join(__dirname, "../uploads"))
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    //biar ada .jpg gitu gitunya kita bikin
    //ngambil .jpg ,png dari nama asli file
    const ext = path.extname(file.originalname);
    //uniquesuffix isinya nama file random, ext isinya .jpg jadi perlu digabung
    //field name input dari 
    const name = file.fieldname + '-' + uniqueSuffix + ext;
    cb(null, name)
  }
})

module.exports = multer({ storage: storage })