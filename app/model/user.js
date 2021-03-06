'use strict';

const ApiError = require('../ApiError.js');
const moment = require('moment');

module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;

  const User = app.model.define('users', {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    phone: {
      type: STRING(20),
      allowNull: false,
    },
    password: STRING(32),
    name: STRING(30),
    email: STRING(30),
    avatar: STRING(30),
    signature: STRING(30),
    city: STRING(30),
    status: STRING(30),
    age: INTEGER,
    last_sign_in_at: {
      type: DATE,
      get() {
        return this.getDataValue('last_sign_in_at') ?
          moment(this.getDataValue('last_sign_in_at')).format('YYYY-MM-DD HH:mm') : '';
      }
    },
    created_at: {
      type: DATE,
      get() {
        return this.getDataValue('created_at') ?
          moment(this.getDataValue('created_at')).format('YYYY-MM-DD HH:mm') : '';
      }
    },
    updated_at: {
      type: DATE,
      get() {
        return this.getDataValue('updated_at') ?
          moment(this.getDataValue('updated_at')).format('YYYY-MM-DD HH:mm') : '';
      }
    },
    deleted_at: DATE,
    job: STRING,
    introduction: STRING,
    ability_value: INTEGER,
    is_admin: INTEGER,
  }, {
    indexes: [
      { unique: true, fields: ['phone'] }
    ],
  });

  User.tryCreate = async (data) => {
    let existUser = await User.findOne({ where: { phone: data.phone } });
    if (existUser) {
      throw new Error('该手机号已注册');
    }
    existUser = await User.findOne({ where: { name: data.name } });
    if (existUser) {
      throw new Error('用户名已存在');
    }
    return await User.create(data);
  }

  User.prototype.logSignin = async function() {
    return await this.update({ last_sign_in_at: new Date() });
  }

  return User;
};
