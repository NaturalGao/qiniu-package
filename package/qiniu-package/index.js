const qiniu = require("qiniu")   //七牛官方包
const fs = require("fs")     //文件包
const stream = require('stream');   //流处理
const stringRandom = require('string-random');   //随机字符串包

const config = require("./config")

const conf = config.conf

const mac = new qiniu.auth.digest.Mac(config.accessKey, config.secretKey);


const getUrl = (uri) => {
  return config.domain + uri;
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
  let putPolicy = new qiniu.rs.PutPolicy(conf);
  return putPolicy.uploadToken(mac);
}

/**
 * 上传文件流
 * @param {*} files 
 * @param {*} callbackThen 
 * @param {*} callbackCatch 
 */
mac.putStream = (files, callbackThen, callbackCatch) => {

  let uploadToken = mac.uploadToken()


  let uriArr = [];
  files.forEach((item, index) => {
    let formUploader = new qiniu.form_up.FormUploader(conf);
    let putExtra = new qiniu.form_up.PutExtra();

    let key = item.key ? item.key : config.fileStorePath + stringRandom(16)

    let readableStream = new stream.Duplex();
    readableStream.push(item.buffer);
    readableStream.push(null);

    formUploader.putStream(uploadToken, key, readableStream, putExtra, function (respErr,
      respBody, respInfo) {
      if (respErr) {
        return callbackCatch({
          code: 400,
          msg: 'error'
        })
      }
      if (respInfo.statusCode == 200) {
        let uri = getUrl(key)
        uriArr.push(uri)
        if (uriArr.length == files.length) {
          return callbackThen({
            code: 200,
            msg: 'success',
            data: uriArr
          })
        }
      } else {
        return callbackCatch({
          code: 400,
          msg: 'error'
        })
      }
    });
  })

}

module.exports = mac