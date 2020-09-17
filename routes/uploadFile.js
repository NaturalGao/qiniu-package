const { json } = require('express');
var express = require('express');
var router = express.Router();
var mac = require("../package/qiniu")
var multer = require('multer');
const { use } = require('.');
var upload = multer({ dest: 'uploads/' })
/* GET users listing. */
router.post('/', upload.array('files'), function (req, response, next) {
  let files = req.files
  mac.putFile(files, (res) => {
    let data = res.data
    response.json(data)
  }, (res) => {
    let msg = {
      'code': 400,
      'msg': 'error'
    }
    response.json(msg)
  })

});

module.exports = router;
