const { json } = require('express');
var express = require('express');
var router = express.Router();
var mac = require("../package/qiniu-package")
var multer = require('multer');
const { use, param, route } = require('.');
var upload = multer()

/* get 上传token*/
router.get('/uploadToken', function (req, response, next) {
  let options = req.query.options
  let keyToOverwrite = req.query.keyToOverwrite
  let token = mac.uploadToken(options, keyToOverwrite)
  response.json({
    code: 200,
    msg: 'success',
    data: token
  });
})

/* POST 单文件上传 */
router.post('/uploadFile', upload.single('file'), function (req, response, next) {
  let file = req.file
  mac.putStream(file).then(res => {
    response.json(res)
  }).catch(msg => {
    response.json({
      code: 400,
      msg: msg
    })
  })
})

/* POST 多文件上传*/
router.post('/uploadFile/many', upload.array('files'), function (req, response, next) {
  let files = req.files
  mac.putStream(files).then(res => {
    response.json(res)
  }).catch(msg => {
    response.json({
      code: 400,
      msg: msg
    })
  })

})

module.exports = router
