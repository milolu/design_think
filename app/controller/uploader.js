'use strict';
const fs = require('fs');
const sendToWormhole = require('stream-wormhole');
const Controller = require('egg').Controller;
const path = require('path');
const md5 = require('md5');
const awaitWriteStream = require('await-stream-ready').write;

class UploaderController extends Controller {
  async index() {
    const ctx = this.ctx;
    console.log(ctx.request.body);
    console.log(ctx.query);
    // egg-multipart 已经帮我们处理文件二进制对象
    // node.js 和 php 的上传唯一的不同就是 ，php 是转移一个 临时文件
    // node.js 和 其他语言（java c#） 一样操作文件流
    const stream = await ctx.getFileStream();
    // 新建一个文件名
    const filename = md5(stream.filename) + path.extname(stream.filename).toLocaleLowerCase();
    // 文件生成绝对路径
    // 当然这里这样市不行的，因为你还要判断一下是否存在文件路径
    const target = path.join(this.config.baseDir, 'app/public/uploads', filename);
    // 生成一个文件写入 文件流
    const writeStream = fs.createWriteStream(target);
    try {
      // 异步把文件流 写入
      await awaitWriteStream(stream.pipe(writeStream));
    } catch (err) {
      // 如果出现错误，关闭管道
      await sendToWormhole(stream);
      throw err;
    }
    if (ctx.query && ctx.query.from === 'editor') {
      // 富文本上传
      ctx.body = {
        errno: 0,
        data: ['/public/uploads/' + filename]
      };
      ctx.isFormatRes = false;
    } else {
      ctx.body = {
        url: '/public/uploads/' + filename
      };
    }
  }
}

module.exports = UploaderController;
