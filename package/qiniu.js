var qiniu = require("qiniu")
var fs = require("fs")

const accessKey = 'rX6mOHSG29zzcdaqwEE7D6FR6me7fbx04rP6NAL8';
const secretKey = '52seBU7aQzFt7ySwfniHI7uu36eW2iCiwDJdvmRY';
const bucket = 'cimeiren';
const domain = 'http://yun.kccmr.com/';

const defaultSize = 4   //默认4m

const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);

const config = {
  scope: bucket
}
//上传对象
const uploadObjects = {
  form_up: new qiniu.form_up.FormUploader(config),  //表单上传
  resume_up: new qiniu.resume_up.ResumeUploader(config), //分块上传
}

const putExtraObjects = {
  form_up: new qiniu.form_up.PutExtra(),
  resume_up: new qiniu.resume_up.PutExtra()
}

const getUrl = (uri) => {
  return domain + uri;
}

const getUploadObject = (file) => {
  let size = file.size / 1024 / 1024
  let object = {}
  if (size >= defaultSize) {
    object.uploadObject = uploadObjects.resume_up
    object.putExtraObject = putExtraObjects.resume_up
    // 如果指定了断点记录文件，那么下次会从指定的该文件尝试读取上次上传的进度，以实现断点续传
    let filePath = `log/${file.filename}_progress.log`
    object.putExtraObject.resumeRecordFile = filePath;
  } else {
    object.uploadObject = uploadObjects.form_up
    object.putExtraObject = putExtraObjects.form_up
  }

  return object
}

mac.uploadToken = (options = {}, keyToOverwrite = '') => {
  if (keyToOverwrite) {
    config.scope += ":" + keyToOverwrite
  }
  Object.assign(config, options)
  let putPolicy = new qiniu.rs.PutPolicy(config);
  return putPolicy.uploadToken(mac);
}

mac.putFile = (files, callbackThen, callbackCatch) => {
  let uriArr = [];

  console.log(files)
  files.forEach((item, index) => {
    let object = getUploadObject(item)
    var formUploader = object.uploadObject;
    var putExtra = object.putExtraObject;
    let uploadToken = mac.uploadToken()

    let localFile = item.path
    let key = item.key ?? item.filename
    formUploader.putFile(uploadToken, key, localFile, putExtra, (respErr,
      respBody, respInfo) => {
      if (respErr) {
        return callbackCatch({
          'code': 400,
          'msg': 'error'
        })
      }
      if (respInfo.statusCode == 200) {
        let delete_path = 'uploads/' + item.filename
        //删除文件夹
        fs.unlink(delete_path, () => {
          let uri = getUrl(key)
          uriArr.push(uri)
          if (uriArr.length == files.length) {
            return callbackThen({
              'code': 200,
              'msg': 'success',
              "data": uriArr
            })
          }
        })

      } else {
        return callbackCatch({
          'code': 400,
          'msg': 'error'
        })
      }
    });
  })

}

module.exports = mac