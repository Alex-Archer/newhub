const app = getApp();
const filter = require('../../../../utils/loginFilter');
Page(filter.loginCheck(true,app,{ 
  data: {
    preventOnShow:true,

    addressList: [1,2,3]
  },
  onShow(e){
          if(this.data.preventOnShow) return;//5.登录验证  需要登录时，阻止ONSHOW 
    
      },
    onLoad(e){

    },
  editAddr(e) {
    wx.navigateTo({
      url: "../editAddress/index"
    })
  }
}))