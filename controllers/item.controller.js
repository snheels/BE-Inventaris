const Validator = require("fastest-validator");
const v = new Validator();
const { Item } = require('../models');
const { response } = require('../helpers/response.formatter');
const { Op } = require("sequelize");
const fs = require('fs'); //file system, melakukan sesuai yang berhubungan dengan lokasi file
const path = require('path');

module.exports = {
    createItem: async (req, res) => {
        try{
            //ambil inputan (payload) : req.body
            //konsep destructuring itu const {} ngeluarin datanya karena formatnya json
            const { name, stock } = req.body;
            const {image} = req.file;

            //validasi
            const schema = {
                name: { type: "string", min: 3 },
                stock: { type: "number", positive: true, integer: "true" } //pake integer biar isinya ga desimal 
            }
            //menyimpan data yang akan di validasi
            const data = {
                //name sebelum : itu di ambil dari database
                name: name, //fileDatabase: namaDariReq
                stock: Number(stock) //karena req.body json berupa string, jadi stock diubah ke tipe data number pake Number
            }
            const validate = v.validate(data, schema);
            if (validate.length > 0 ) {
                //jika hasil validate ada error
                //pake , itu kalo datanya
                return res.status(400).json(response(400, "Validasi Error", validate));
            }
            //cek jika image tidak diupload  (req.file: ngambil input file)
            if(!req.file){
                return res.status(400).json(response(400, "Validasi Error", "Image not found"));
            }

            //prosses menyimpan data melalui ORM sequelize
            //Item i nya besar karena dia ngambil dari model
            const item = await Item.create({
                name: data.name, //ambil dari objest data yang divalidasi sebelumnya
                stock: data.stock,
                image: req.file.filename //ambil filename hasil dari middleware multer
            });
            return res.status(201).json(response(201, 'created', item));
        }catch(error){
            //penanganan err kodingan di try
            // res: parameter func untuk memberikan response (hasil)
            // response: method dari helpers formatter untuk format hasil outputnya outputnya dalam bentuk json
            return res.status(500).json(response(500, "Server error", error.message));
        }
    },
    //req input data dari json bagian body atau inputan
    //res output
    getItem: async (req, res) => {
        try{
            //req.query : ambil params di postman/ambil data acuan
            //sortBy: ngurutin berdasarkan field apa
            //order: ASC/DESC
            const { name, sortBy, order } = req.query;

            const items = await Item.findAll({
                //cari berdasarkan field name di db dari name req.wuery
                where: name? { 
                    name: {
                        [Op.like]: `%${name}%`, //mencari yang mirip
                    }
                } : {},
                //kalau di params postman ada sortBy dan order, jalanin pengurutan, kalo ga ada pake default. misal sortBy 'stock' order DESC
                order: sortBy && order ?[ 
                    [sortBy, order] 
                ] : []
            })

            const {page, limit} = req.query;
            const offset = (Number(page)-1) * Number(limit);

            const {count, rows} = await Item.findAndCountAll({
                offset: Number(offset),
                limit: Number(limit)
            })

            const formatPagination = {
                data: rows, 
                limit: limit,
                rows: (Number(offset)+1) + "-" + (Number(offset)+rows.length),
                total: count,
                page: page,
            }

            return res.status(200).json(response(200, "success", formatPagination));
        }catch (error){
            return res.status(500).json(response(500, 'Server Error', error.message));
        }
    },
    showItem: async (req, res) =>{
        try{    
            //req.params : ambil path dinamis, /item/2. ambil angka 2 (id)
            const { id } = req.params;

            //findByPk : mencari berdasarkan primary key (id)
            const item = await Item.findByPk(id);
            
            //jika data yang dicari tidak ada di database
            if (!item){
                return res.status(400).json(response(400, "Data [id] not found"));
            }
            return res.status(200).json(response(200, "success", item));
        }catch{
            return res.status(500).json(response(500, "Server Error", error.message));
        }
    },
    updateItem: async (req, res) =>{
        try{
            const {id} = req.params;
             const { name, stock } = req.body;
            // const {image} = req.file;

            //validasi
            const schema = {
                name: { type: "string", min: 3 },
                stock: { type: "number", positive: true, integer: "true" } //pake integer biar isinya ga desimal 
            }
            //menyimpan data yang akan di validasi
            const data = {
                //name sebelum : itu di ambil dari database
                name: name, //fileDatabase: namaDariReq
                stock: Number(stock) //karena req.body json berupa string, jadi stock diubah ke tipe data number pake Number
            }
            const validate = v.validate(data, schema);
            if (validate.length > 0 ) {
                return res.status(400).json(response(400, "Validasi Error", validate));
            }
            // //validasi stok gabole kurang dari stok sebelumnya
            const item = await Item.findByPk(id);
            //bandingkan stok sebelumnya dan stok yang diinput jadi setok yang diupdate itu ga boleh 
            if (!item) {
                return res.status(400).json(response(400, "Validasi Error", "Data not found"));
            }

            //kalo ada file baru, file lama dihapus
            if (req.file) {
                //karena image uda diganti jadi link di getter model, jadi ambil yang aslinya pake getDataValue
                const imageName = item.getDataValue('image');
                //cari image ke folder uploads
                const filePath = path.join(__dirname, '../uploads', imageName);
                //cek jika file ada di folder tsb 
                //path husus mencari lokasi
                //fs itu dari lokasi tersebut mau diapain
                if (fs.existsSync(filePath)) {
                    //hapus file
                    fs.unlinkSync(filePath);
                }
            }
            
            //.update hasil dari update proses hanya true/false bukan data terbaru
            const updateProcess = await Item.update({
                name: data.name,
                stock: data.stock,
                //jika file baru, ambil filename baru, jika gaada ambil data asli tanpa link (nama gambar sebelumnya)
                image: (req.file ? req.file.filename : id.getDataValue('image'))
            },{
                where: {id: id}
            });
            //ambil data baru yang di update
            const newItem = await Item.findByPk(id); //untuk dimunculkan 
            return res.status(200).json(response(200, 'success', newItem));
        }catch (error) {
            return res.status(500).json(response(500, "Server Error", error.message));
        }
    },
    deleteItem: async (req, res) => {
        try{
            const { id } = req.params;

            //ambil data item untuk diambil gambar dan dihapus
            const item = await Item.findByPk(id);
            const imageName = item.getDataValue('image');
            const filePath = path.join(__dirname, '../uploads', imageName);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            const deleteProcess = await Item.destroy({
                where: {id: id}
            });
            return res.status(200).json(response(200, "deleted"));
        }catch(error){
            return res.status(500).json(response(500, "Server Error", error.message));
        }
    }
}