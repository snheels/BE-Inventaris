'use strict';
const {Item, Loan} = require('../models')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    //ambil data item semua, untuk akses id nya buat FK item_id
    const items = await Item.findAll()
    //loop sebanyak 20 data
    let dummyData = [];
    for(let index = 1; index <= 20; index ++){
      const itemId = items[Math.floor(Math.random()*items.length)];
      // math random itu menghasilkan angka 0-1 termasuk desimal, item length: itung jumlah item, contoh hasil random 0.5 length itemnya 3
      //0.5 * 3 = 1.5 kemudian di math floor diambil angka sebelum koma = 1 jadi item_id atau 0.9 * 3 = 2.7 item_idnya 2 atau 1 * 3 = 3 jadi item_idnya 3
      let data = {
        item_id: itemId.id, //itemId isinya full data item yang indexnya antara 0-2 hasil dari random, itemID berisi mulai dari name, image, stock, id. yang pake bagian idnya jadi (.id)
        name: `peminjaman ke-${index}`,
        total_item: 1,
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
      dummyData.push(data)
    }
    await queryInterface.bulkInsert('Loans', dummyData);
  },
  //karena pake async kita ngga return tapi pake await
  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Loans', null, {});
  }
};
