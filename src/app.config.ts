export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/drafts/index',
    'pages/mine/index',
    'pages/create/index',
    'pages/detail/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#1E6FFF',
    navigationBarTitleText: '洽商采集助手',
    navigationBarTextStyle: 'white',
    backgroundColor: '#F4F6FA'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#1E6FFF',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '洽商列表'
      },
      {
        pagePath: 'pages/drafts/index',
        text: '待完善'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
