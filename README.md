# 七牛文件上传服务



## 1. 配置

配置文件位于： /package/qiniu-package/config.js

```markdown
  
  accessKey: '', //accessKey
  secretKey: '', //secretKey
  bucket: '', //bucket
  domain: '', //domain
  fileStorePath: '/test/', //fileStorePath  上传前缀
  defaultSize: 4 //默认4m    

```

启动服务: (默认挂载在3000端口)

```markdown
npm start   //生产环境
//or
npm run devstart  //开发环境
```

服务挂载：[localhost:3000](http://localhost:3000)



## 2. 接口

### 2.1 获取token

```markdown
METHOD: GET
URL: /qiniu/uploadToken
```



**success：**

```json
{
    "code": 200,
    "msg": "success",
    "data": "rX6mOHSG29zzcdaqwEE7fbx04rP6NAL8:3lu4nEaMfODBeEetmr5y2Vg0g0o=:eyJzY29wZSI6ImNpbWVpcmVuIiwiZGVjE2MDE0NTE1MTd9"
}
```



**error:**

```json
{
    "code": 400,
    "msg": "error",
}
```



### 2.2 单文件上传

```markdown
METHOD: POST
URL: /qiniu/uploadFile
```



**使用：**

```javascript
let formData = new FormData()

formData.append('file', file)

let url = 'http://localhost:3000/qiniu/uploadFile'

axios.post(url, formData)
	.then(function (response) {
      console.log(response);
	}).catch(function (error) {
       console.log(error);
});
```



**success：**

```json
{
  "code": 200,
  "data": "http://xx.xx.com/test/ra2jIojLGlgS0Cfo",
  "status": "success",
}
```



**error:**

```json
{
    "code": 400,
    "msg": "error",
}
```



### 2.3 多文件上传

```markdown
METHOD: POST
URL: /qiniu/uploadFile/many
```



**使用：**

```javascript
let formData = new FormData()

formData.append('file', file1)
formData.append('file', file2)
formData.append('file', file3)

let url = 'http://localhost:3000/qiniu/uploadFile/many'

axios.post(url, formData)
	.then(function (response) {
      console.log(response);
	}).catch(function (error) {
       console.log(error);
});
```


**success：**

```json
{
  "code": 200,
  "data" : "http://xx.xx.com/test/ra2jIojLGlgS0Cfo",
  "status": "success",
}
```

**error:**

```json
{
    "code": 400,
    "msg": "error",
}
```

