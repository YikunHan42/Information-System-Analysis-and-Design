const UPLOAD_PATH = 'D:/UPLOADPATH'
const OLD_UPLOAD_URL = 'http://localhost:8090/book/res/img'
const UPLOAD_URL = 'http://localhost:8091'

module.exports = {
    CODE_ERROR: -1,
    CODE_SUCCESS: 0,
    CODE_TOKEN_EXPIRED: -2,
    debug: true,
    PWD_SALT: 'admin_imooc_node',
    PRIVATE_KEY: 'admin_imooc_node_test_youbaobao_xyz',
    JWT_EXPIRED: 60 * 60,
    UPLOAD_PATH,
    OLD_UPLOAD_URL,
    UPLOAD_URL,
    MIME_TYPE_EPUB: 'application/epub+zip'
}