Component({
  properties: {
    title: {
      type: String,
      value: ''
    },
    color:{
      type: String,
      value: '#666'
    },
    //rpx
    size:{
      type:Number,
      value:30
    },
    backgroundColor: {
      type: String,
      value: 'transparent'
    },
    unlined: {
      type: String,
      value: '' //top,bottom,all
    },
    marginTop:{
      type:String,
      value:'0'
    },
    //圆角值，单位rpx
    radius: {
      type: String,
      optionalTypes:[Number],
      value: 0
    }
  }
})