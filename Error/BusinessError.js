class BusinessError extends Error {
  constructor(code, msg) {
    super(msg)
    this.code = code
    this.msg = msg
    this.name = 'BusinessError'
  }
}

module.exports = BusinessError