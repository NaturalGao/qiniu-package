//基本配置
const config = {
  accessKey: '', //accessKey
  secretKey: '', //secretKey
  bucket: '', //bucket
  domain: '', //domain
  fileStorePath: '/test/', //fileStorePath  上传前缀
  defaultSize: 4 //默认4m                               //默认大小
}

//上传配置
config.conf = {
  scope: config.bucket
}

module.exports = config