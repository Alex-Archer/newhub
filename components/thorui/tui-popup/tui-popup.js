Component({
  properties: {
    show: {
			type: Boolean,
      value: false,
      observer(val){
        if (val) {
					this.open();
				} else {
					this.close();
				}
      }
		},
		/*
		  [fade|slide-top|slide-right|slide-bottom|slide-left|zoom-in|zoom-out]
		  过渡动画类型
		*/
		
		modeClass: {
			type: Array,
			value:[]
		},
		duration: {
			type: Number,
			value: 300
		},
		//styles 组件样式，同 css 样式
		styles: {
			type: Object,
			value:{},
      observer(val){
        this.setData({
          stylesObject:this.stylesHandle()
        })
      }
		}
  },
  data: {
    isShow: false,
    transform: '',
    ani: {
      in: '',
      active: ''
    },
    stylesObject:''
  },
  lifetimes:{
    attached:function(){
      this.setData({
        stylesObject:this.stylesHandle()
      })
    }
  },
  methods: {
    stylesHandle() {
      const ani = {
        position: 'fixed',
        bottom: 0,
        top: 0,
        left: 0,
        right: 0,
        display: 'flex',
        'justify-content': 'center',
        'align-items': 'center'
      }
      const aniStyles = Object.assign({}, ani, this.data.styles);
			let styles = {
				...aniStyles,
				'transition-duration': this.data.duration / 1000 + 's'
			};
			let transfrom = '';
			for (let i in styles) {
				let line = this.toLine(i);
				transfrom += line + ':' + styles[i] + ';';
			}
			return transfrom;
		},
    change() {
			this.triggerEvent('click', {
				detail: this.data.isShow
			});
		},
		open() {
      clearTimeout(this.data.timer);
      let aniIn=`ani.in`
      this.setData({
        isShow:true,
        transform:'',
        [aniIn]:''
      })
      let transform=''
			for (let i in this.getTranfrom(false)) {
				if (i === 'opacity') {
          this.setData({
            [aniIn]:'fade-in'
          })
				} else {
         transform += `${this.getTranfrom(false)[i]} `;
				}
      }
      this.setData({
        transform:transform
      },()=>{
        setTimeout(() => {
          this._animation(true);
        }, 50);
      })
		},
		close(type) {
			clearTimeout(this.data.timer);
			this._animation(false);
		},
		_animation(type) {
			let styles = this.getTranfrom(type);
      this.setData({
        transform:''
      })
      let aniIn=`ani.in`,
      transform=''
			for (let i in styles) {
				if (i === 'opacity') {
          this.setData({
            [aniIn]:`fade-${type ? 'out' : 'in'}`
          })
				} else {
					transform += `${styles[i]} `;
				}
      }
      this.setData({
        transform:transform
      })
			this.data.timer = setTimeout(() => {
				if (!type) {
          this.setData({
            isShow:false
          })
				}
				this.triggerEvent('change', {
					detail: this.data.isShow
				});
			}, this.data.duration);
		},
		getTranfrom(type) {
			let styles = {
				transform: ''
			};
			this.data.modeClass.forEach(mode => {
				switch (mode) {
					case 'fade':
						styles.opacity = type ? 1 : 0;
						break;
					case 'slide-top':
						styles.transform += `translateY(${type ? '0' : '-100%'}) `;
						break;
					case 'slide-right':
						styles.transform += `translateX(${type ? '0' : '100%'}) `;
						break;
					case 'slide-bottom':
						styles.transform += `translateY(${type ? '0' : '100%'}) `;
						break;
					case 'slide-left':
						styles.transform += `translateX(${type ? '0' : '-100%'}) `;
						break;
					case 'zoom-in':
						styles.transform += `scale(${type ? 1 : 0.8}) `;
						break;
					case 'zoom-out':
						styles.transform += `scale(${type ? 1 : 1.2}) `;
						break;
				}
			});
			return styles;
		},
		_modeClassArr(type) {
			let mode = this.data.modeClass;
			if (typeof mode !== 'string') {
				let modestr = '';
				mode.forEach(item => {
					modestr += item + '-' + type + ',';
				});
				return modestr.substr(0, modestr.length - 1);
			} else {
				return mode + '-' + type;
			}
		},
		toLine(name) {
			return name.replace(/([A-Z])/g, '-$1').toLowerCase();
		}
  }
})
