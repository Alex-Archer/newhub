Component({
  properties: {
    //是否垂直居中
    fixed: {
      type: Boolean,
      value: true
    },
    //图片地址，没有则不显示
    imgUrl: {
      type: String,
      value: ""
    },
    //图片宽度
    imgWidth: {
      type: String,
      optionalTypes:[Number],
      value: 200
    },
    //图片高度
    imgHeight: {
      type: String,
      optionalTypes:[Number],
      value: 200
    },
    //V2.3.0+
    imgBottom:{
      type: String,
      optionalTypes:[Number],
      value: 30
    },
    //按钮宽度
    btnWidth: {
      type: String,
      optionalTypes:[Number],
      value: 200
    },
    btnHeight:{
      type: String,
      optionalTypes:[Number],
      value: 60
    },
    //按钮文字，没有则不显示
    btnText: { 
      type: String,
      value: ""
    },
    //按钮背景色
    backgroundColor:{
      type:String,
      value: ""
    },
    size:{
      type: String,
      optionalTypes:[Number],
      value:28
    },
    radius:{
      type:String,
      value:'8rpx'
    },
    //2.3.0+
    marginTop: {
      type: String,
      optionalTypes:[Number],
      value: 0
    },
    
    contentColor:{//小鱼加 内容文字颜色
      type:String,
      value:'#666'
    },
    contentSize:{//小鱼加 内容文字大小
      type:String,
      value:'30rpx'
    },    
  },
  data:{
    g_danger: wx.$tui && wx.$tui.color.danger
  },
  methods: {
    handleClick(e) {
      this.triggerEvent('click', {});
    }
  }
})