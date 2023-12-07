import { findIndex } from '../we-lodash';
var util = require('../../utils/util.js')
class authorUtils 
{
//   setToken(value) {
//     this.wx.setStorageSync(TOKEN_LOCAL_STORAGE, value);
//     return this;
//   }
//   getToken() {
//     this.wx.getStorageSync(TOKEN_LOCAL_STORAGE);
//     return this;
//   }
 Token(_accessToken, _refreshToken, _accessExpires, _refreshExpires) 
 {
    this.accesstoken = _accessToken;
    this.refreshtoken = _refreshToken;
    this.accessexpires = _accessExpires;
    this.refreshexpires = _refreshExpires;
  }
  
  /*
  使用 we-lodash 修改上面的写法，性能提升
  import { includes, findIndex } from 'we-lodash';
  */
  validateAuthenticationURL(url) 
  {
    const currentUrl = url;
    if(util.isNull(currentUrl))
    {
      return true;//本应该为false,但用了true是为了跳过它不拦截
    }
    const arrUrl=[
    "/login.php",//暂未使用
    "/refreshToken",//刷新TOKEN
    "/DecodeUserInfo",//小程序登录换OPENID
    "/User/modifyMobile"//电话号码登录
  ];
    const found = findIndex(arrUrl, x => x === currentUrl) !== -1;
    if (found) {
      return true;
    } else {
      return false;
    }
  }

  validateDateExpires(accessExpires) {
    const currentTime = Date.now(); //13位时间戳 1693376939413
    let _accessExpires = new Date(Date.parse(accessExpires.replace(/-/g, "/"))).getTime(); //加上000为13位的时间戳 1693372853000
    if (currentTime > _accessExpires) {
      return true;
    } else {
      return false;
    }
  }

}
//是否过期
module.exports = authorUtils;