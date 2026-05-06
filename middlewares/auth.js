const jwt = require('jsonwebtoken');
const {response} = require('../helpers/response.formatter');
const {auth_secret} = require('../config/base.config');

module.exports = {
    checkToken: async (req, res, next) => {
        //token diambil dari header request ini berasal dari headers di postman
        const token = req.header("Authorization");
        if (!token) {
            //401 itu error untuk pengguna yang belum login
            return res.status(401).json(response(401, "error 1", "please login and try again"));
        }
        try{
            const check = jwt.verify(token, auth_secret);//check token (blm expired)
            //karena nanti pengguna perlu data identitas pengguna, panggil payload yang dikirim jwt.sign() di loginController dan simpan di req. data payload tersimpan di const check (hasil verify) ada {userId,name,email}
            req.userId = check.userId;
            next(); //lanjutkan proses routing yang diminta
        }catch (error){
            //jika terjadi error, ini hubungannya dengan token. jadi kasi 401 (suruh login lagi)
            return res.status(401).json(response(401, "error 2", "please login and try again"));
        }
    }
}