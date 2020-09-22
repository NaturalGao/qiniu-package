const { json } = require('express');
var express = require('express');
var router = express.Router();
var mac = require("../package/qiniu-package")
var multer = require('multer');
const { use } = require('.');
var upload = multer()
/* GET users listing. */
router.post('/uploadFile', upload.array('files'), function (req, response, next) {
  let files = req.files
  mac.putStream(files, (res) => {
    let data = res.data
    response.json(data)
  }, (res) => {
    response.json(res)
  })
});

module.exports = router;
