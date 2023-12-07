Page({
  data: {
    globalURL: app.globalData.globalURL,
    modal: false
  },
  view() {
    wx.previewImage({
      urls: [app.globalData.globalURL+'/miniprogram/url-img/my/img_invoice.jpg']//
    })
  },
  sendEmail() {
    this.setData({
      modal: true
    })
  },
  cancel() {
    this.setData({
      modal: false
    })
  }
})