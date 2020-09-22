//基本配置
const config = {
  accessKey: 'rX6mOHSG29zzcdaqwEE7D6FR6me7fbx04rP6NAL8',
  secretKey: '52seBU7aQzFt7ySwfniHI7uu36eW2iCiwDJdvmRY',
  bucket: 'cimeiren',
  domain: 'http://yun.kccmr.com/',
  fileStorePath: '/uploads/',
  defaultSize: 4   //默认4m 
}

//上传配置
config.conf = {
  scope: config.bucket
}

module.exports = config