const qiniu = require("qiniu")   //七牛官方包
const fs = require("fs")     //文件包
const stream = require('stream');   //流处理
const stringRandom = require('string-random');   //随机字符串包

const config = require("./config");
const BusinessError = require("../../Error/BusinessError");

const conf = config.conf

const mac = new qiniu.auth.digest.Mac(config.accessKey, config.secretKey);

/**
 * 获取资源地址
 * @param {*} uri 
 */
const getUrl = uri => {
  return config.domain + uri;
}

/**
 * 流处理
 * @param {*} buffer 
 */
const streamDuplex = buffer => {
  let readableStream = new stream.Duplex()
  readableStream.push(buffer)
  readableStream.push(null)
  return readableStream
}

/**
 * 
 * 单文件上传
 * @param {*} uploadToken //上传token
 * @param {*} putExtra //上传配置
 * @param {*} key //文件key
 * @param {*} buffer   //文件buffer
 */
const singleUpload = (uploadToken, formUploader, putExtra, key, buffer, callback) => {

  let readableStream = streamDuplex(buffer);

  formUploader.putStream(uploadToken, key, readableStream, putExtra, function (respErr,
    respBody, respInfo) {
    if (respErr) {
      throw new BusinessError(400, '上传错误')
    }
    if (respInfo.statusCode == 200) {
      let uri = getUrl(key)
      return callback(uri)
    } else {
      throw new BusinessError(400, respBody)
    }
  });

}

/**
 * 多文件上传
 * @param {*} files 
 */
const manyUpload = (uploadToken, formUploader, putExtra, files, callback) => {
  let uriArr = [];
  files.forEach(item => {
    let key = item.key ? item.key : config.fileStorePath + stringRandom(16)
    singleUpload(uploadToken, formUploader, putExtra, key, item.buffer, uri => {
      uriArr.push(uri)
      if (uriArr.length == files.length) {
        return callback(uriArr)
      }
    })
  })
}

const getUploadObject = (file) => {
  let size = file.size / 1024 / 1024
  let object = {}
  if (size >= config.defaultSize) {
    object.uploadObject = new qiniu.form_up.FormUploader(conf)
    object.putExtraObject = new qiniu.form_up.PutExtra()
    // 如果指定了断点记录文件，那么下次会从指定的该文件尝试读取上次上传的进度，以实现断点续传
    let filePath = `log/${file.filename}_progress.log`
    object.putExtraObject.resumeRecordFile = filePath;
  } else {
    object.uploadObject = new qiniu.resume_up.ResumeUploader(conf)
    object.putExtraObject = new qiniu.resume_up.PutExtra()
  }

  return object
}

/**
 * 上传token
 * @param {*} options 
 * @param {*} keyToOverwrite 
 */
mac.uploadToken = (options = {}, keyToOverwrite = '') => {
  if (keyToOverwrite) {
    conf.scope += ":" + keyToOverwrite
  }

  Object.assign(conf, options)
  let putPolicy = new qiniu.rs.PutPolicy(conf)
  return putPolicy.uploadToken(mac)
}

/**
 * 上传文件流
 * @param {*} files 
 * @param {*} callback 
 */
mac.putStream = (files, callback) => {

  let uploadToken = mac.uploadToken()
  let formUploader = new qiniu.form_up.FormUploader(conf);
  let putExtra = new qiniu.form_up.PutExtra();
  if (files instanceof Array) {
    manyUpload(uploadToken, formUploader, putExtra, files, uri => {
      return callback({
        code: 200,
        status: 'success',
        data: uri
      })
    })
  } else {
    let key = files.key ? files.key : config.fileStorePath + stringRandom(16)
    singleUpload(uploadToken, formUploader, putExtra, key, files.buffer, uri => {
      return callback({
        code: 200,
        status: 'success',
        data: uri
      })
    })
  }
}

module.exports = mac