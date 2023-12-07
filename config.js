let config = {
    version:"202312031422",//版本号
    debug:true,//是否打印,总局关闭
    host: "https://ssl.aoben.yoga", //接口域名 
    env: "development",//production 或 development 则调用 dev_host 
  }; 
  config = Object.assign(config, wx.getExtConfigSync ? wx.getExtConfigSync() : {})
  //测试开发域名
  let dev_host = 'https://aoben.kshot.com';
  if(config.env === 'development')
  {
    config.host = dev_host
  }
  module.exports = config
