Component({
  options: {
		virtualHost: true
	},
  properties: {
    //数据obj
    entity: {
      type: Object,
      value:{}
    },
    //是否为列表展示
    isList: {
      type: Boolean,
      value: false
    }
  },
  methods: {
    detail(){
      wx.navigateTo({
        url: '/pages/moments/swiper/index?id=1',
      })
			// wx.showToast({
			// 	title:'功能开发中~',
			// 	icon:'none'
			// })
		}
  }
})