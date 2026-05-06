const Validator = require("fastest-validator");
const v = new Validator();
const { Item, Loan, Return } = require('../models');
const { response } = require('../helpers/response.formatter');
const { Op } = require("sequelize");

module.exports = {
    createReturn: async (req, res)=>{
        try{
            const {loan_id, total_item, notes, date} = req.body;

            const schema = {
                loan_id: {type: "number", positive: true, integer: true},
                total_item: {type: "number", positive: true, integer: true},
                notes: {type: "string"},
                date: {type: "date"}
            }

            const data = {
                loan_id: Number(loan_id),
                total_item: Number(total_item),
                notes: notes ?? "-",
                date: new Date(date)
            }

            const validate = v.validate(data, schema);
            if (validate.length > 0){
                return res.status(400).json(response(400, "Validasi Error", validate));
            }

            const loan = await Loan.findByPk(loan_id, {include: Item}); //sekaligus mengambil data item nya, untuk digunakan stock akan diupdate (+)
            //pengecekan kalau data loan ga ada
            if (!loan) {
                return res.status(400).json(response(400, "validasi error", "Data Loan not Found"));
            }
            //pengecekan kalo yang dibalikin ga kurang dari yang dipinjam
            if(data.total_item > loan.total_item) {
                return res.status(400).json(response(400, "Validasi Error", "Total return item more than loan item"))
            }
            //menambahkan data return
            const returnData = await Return.create(data); //value return sudah ada di const data semuanya
            //update stock : stock sebelumnnya + total_item pengembalian
            const updateStatus = await Item.update({
                //loan.Item mengambil relasi item (include) dari loan. ambil stocknya
                stock: loan.Item.stock + data.total_item
            },{
                where: {id: loan.Item.id} //data id item adanya di relasi Item data loan
            });
            //kembalikan data item, peminjaman, pengembalian
            const loanWithItemReturn = await Loan.findByPk(loan_id, {include: [Item, Return]});
            return res.status(201).json(response(201, 'created', loanWithItemReturn))
        }catch(error){
            return res.status(500).json(response(500, "server error", error.message));
        }
    }
}