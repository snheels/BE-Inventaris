'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Item extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Item.hasMany(models.Loan, {
        foreignKey: "item_id"
      });
    }
  }
  Item.init({
    name: DataTypes.STRING,
    stock: DataTypes.INTEGER,
    image: {
      type: DataTypes.STRING,
      //getter: memanipulasi data untuk responsenya
      get() {
        const rawValue = this.getDataValue('image');
        //image yang di db cuma filename, di reFjsponse jadi link yang bisa dibuka/ditambilin gambarnya
        return rawValue ? `http://localhost:3000/uploads/${rawValue}` : null;
      },
    }
  }, {
    sequelize,
    modelName: 'Item',
  });
  return Item;
};