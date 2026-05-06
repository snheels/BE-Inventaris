//arti penamaan itu gini jadi bagian dari formater dan menangani response
//file ini tu buat nge format kaya di postman tu nanti muncul apa aja gitu gitunya
module.exports = {
    //response: nama key object yang akan dipanggil pas export/require di file lain\\
    //sebelum : itu nama method/functionnya 
    // yang di dalem kurung itu propertinya
    response: (status, message, data) => {
        if (data) {
            return{
                status: status,
                message: message,
                data: data
            }
        }else{
            //kalau response ga ada data (misal error) hasil di postmannya jangan dikirim ke data di jsonnya
            return{
                status: status,
                message: message
            }
        }
    }
}