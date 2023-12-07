Component({
  properties: {
    
    headimgurl: {
      type: String,
      value: ''
    }, 
    nickname: {
      type: String,
      value: '',
      observer(val) {
        this.initData(val)
      }
    },     
    show: {
      type: Boolean,
      value: false
    },
    list: {
      type: Array,
      value: []
    },
    height: {
      type: Number,
      optionalTypes: [String],
      value: 0
    },
    radius: {
      type: Number,
      optionalTypes: [String],
      value: 24
    },
    title: {
      type: String,
      value: '请选择'
    },
    titleSize: {
      type: Number,
      optionalTypes: [String],
      value: 32
    },
    titleColor: {
      type: String,
      value: '#333'
    },
    fontWeight: {
      type: Number,
      optionalTypes: [String],
      value: 400
    },
    multiple: {
      type: Boolean,
      value: false
    },
    background: {
      type: String,
      value: '#fff'
    },
    padding: {
      type: String,
      value: '30rpx'
    },
    // //选择框选中后颜色
    // checkboxColor: {
    //   type: String,
    //   value: ''
    // },
    borderColor: {
      type: String,
      value: '#ccc'
    },
    isCheckMark: {
      type: Boolean,
      value: false
    },
    checkmarkColor: {
      type: String,
      value: '#fff'
    },
    reverse: {
      type: Boolean,
      value: false
    },
    dividerLine: {
      type: Boolean,
      value: true
    },
    dividerColor: {
      type: String,
      value: '#EEEEEE'
    },
    bottomLeft: {
      type: Number,
      optionalTypes: [String],
      value: 30
    },
    highlight: {
      type: Boolean,
      value: true
    },
    iconWidth: {
      type: Number,
      optionalTypes: [String],
      value: 48
    },
    //v2.9.0+
    iconBgColor:{
      type:String,
      value:'#F8F8F8'
    },
    size: {
      type: Number,
      optionalTypes: [String],
      value: 30
    },
    color: {
      type: String,
      value: '#333'
    },
    btnText: {
      type: String,
      value: '确定'
    },
    btnBackground: {
      type: String,
      value: ''
    },
    btnColor: {
      type: String,
      value: '#fff'
    },
    maskBackground: {
      type: String,
      value: 'rgba(0,0,0,.6)'
    },
    maskClosable: {
      type: Boolean,
      value: false
    },
    zIndex: {
      type: Number,
      optionalTypes: [String],
      value: 1000
    }

  },
  data: {
    itemList: [],
    index: -1,
    g_primary:(wx.$tui && wx.$tui.color.primary) || '#5677fc',
    inputNickname:''
  },
  lifetimes: {
    attached: function () {
      this.initData(this.data.nickname)
    }
  },
  methods: {
    initData(vals) {
      console.log("initData")
      // vals = JSON.parse(JSON.stringify(vals))
      this.setData({
        inputNickname: vals
      })
      console.log(this.data.inputNickname)
    },
   

    maskClose() {
      if (!this.data.maskClosable) return;
      this.handleClose()
    },
    handleClose() {
      this.triggerEvent('close', {})
    },
    stop() {}
    ,
//确认修改提交
handleClick() {
  let _this = this;
  console.log("inputNickname 3333 "+_this.data.inputNickname)
  _this.triggerEvent('confirm', {
    headimgurl: _this.data.headimgurl,
    nickname:_this.data.inputNickname
    
  })

},

inputText:function(e){
  let _this = this;
  _this.setData({
    inputNickname:e.detail
  })
  console.log(this.data.inputNickname)
},
    onChooseAvatar(e) 
    {
      const { avatarUrl } = e.detail 
      console.log(avatarUrl)
      this.setData({
        headimgurl:avatarUrl
      })

    }
  }
})