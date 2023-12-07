  //该组件主要用于tui-radio，tui-checkbox，tui-switch组件外层，类似label功能
  let relations = {};
  const children = [
    'tui-radio',
    'tui-checkbox',
    'tui-switch'
  ]
  children.map((name) => {
    relations[`../${name}/${name}`]= {
      type: 'descendant',
      linked: function (target) {
        this.data.childrens.push(target)
      }
    }
  })
  Component({
    properties: {
      padding: {
        type: String,
        value: '0'
      },
      margin: {
        type: String,
        value: '0'
      }
    },
    relations: {
      ...relations
    },
    data: {
      childrens: []
    },
    methods: {
      onClick() {
        if (this.data.childrens && this.data.childrens.length > 0) {
          for (let child of this.data.childrens) {
            child.labelClick()
          }
        }
      }
    }
  })