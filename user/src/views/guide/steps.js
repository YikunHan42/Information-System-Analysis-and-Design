const steps = [
  {
    element: '#hamburger-container',
    popover: {
      title: '夹层',
      description: '开关侧边栏',
      position: 'bottom'
    }
  },
  {
    element: '#breadcrumb-container',
    popover: {
      title: '面包屑导航',
      description: '显示目前页面定位',
      position: 'bottom'
    }
  },
  {
    element: '#header-search',
    popover: {
      title: '页面查询',
      description: '快速定位',
      position: 'left'
    }
  },
  {
    element: '#screenfull',
    popover: {
      title: '全屏',
      description: '缩放页面至全屏',
      position: 'left'
    }
  },
  {
    element: '#size-select',
    popover: {
      title: '更换大小',
      description: '更换系统大小',
      position: 'left'
    }
  },
  {
    element: '#tags-view-container',
    popover: {
      title: '标签显示',
      description: '历史浏览页面',
      position: 'bottom'
    },
    padding: 0
  }
]

export default steps
