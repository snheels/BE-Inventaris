const Validator = require("fastest-validator");
const v = new Validator();
const { User } = require('../models');
const { response } = require('../helpers/response.formatter');
const passwordHash = require('password-hash');
const {auth_secret} = require('../config/base.config');
const jwt = require('jsonwebtoken');
module.exports = {
    login: async (req,res) => {
        try{
            const {email, password} = req.body;

            const schema = {
                email: {type: "string"},
                password: {type: "string"}
            }

            const data = {
                email: email,
                password: password
            }

            const validate = v.validate(data,schema);
            if (validate.length > 0){
                return res.status(400).json(response(400, "Validasi Error", validate));
            }
            //cek apakah email tersebut ada di table user
            const user = await User.findOne({ where: {email: email} });
            //find one itu mencari 1 data bukan berdasarkan primary key
            if (!user) {
                return res.status(400).json(response(400, "Validasi Error", "Email not found try again!"));
            } 
            //mencocokan password dengan password encrypt
            const checkPassword = passwordHash.verify(password, user.password);
            //jika tidak cocok
            if (!checkPassword){
                return res.status(400).json(response(400, "Validasi Error", "Password Incorrect. Try Again!"))
            } 

            //jika validasi berhasil, buat token jwt
            const token = jwt.sign({userId: user.id, email: user.email, name: user.name }, auth_secret);
            if (!token) {
                return res.statut(400).json(response(400, "Validasi Error", "Login Failed"));
            }
            //output
            const formatData = {
                data: user,
                token: token
            }
            return res.status(200).json(response(200, "success", formatData))
        } catch(error){
            return res.status(500).json(response(500, "Internal Server Error", error.message));
        }
    }
}
