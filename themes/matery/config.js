const CONFIG = {
  MATERY_HOME_BANNER_ENABLE: true,
  // 3.14.1以后的版本中，欢迎语在blog.config.js中配置，用英文逗号','隔开多个。
  MATERY_HOME_BANNER_GREETINGS: ['开始您的设计之旅'], // 首页大图标语文字

  MATERY_HOME_NAV_BUTTONS: true, // 首页是否显示分类大图标按钮
  MATERY_HOME_NAV_BACKGROUND_IMG_FIXED: false, // 首页背景图滚动时是否固定，true 则滚动时图片不懂； false则随鼠标滚动

  // 是否显示开始阅读按钮
  MATERY_SHOW_START_READING: true,

  // 菜单配置
  MATERY_MENU_CATEGORY: true, // 显示分类
  MATERY_MENU_TAG: true, // 显示标签
  MATERY_MENU_ARCHIVE: true, // 显示归档
  MATERY_MENU_SEARCH: true, // 显示搜索

  MATERY_POST_LIST_COVER: true, // 文章封面
  MATERY_POST_LIST_SUMMARY: true, // 文章摘要
  MATERY_POST_LIST_PREVIEW: true, // 读取文章预览

  MATERY_ARTICLE_ADJACENT: true, // 显示上一篇下一篇文章推荐
  MATERY_ARTICLE_COPYRIGHT: false, // 显示文章版权声明
  MATERY_ARTICLE_RECOMMEND: true, // 文章关联推荐

  MATERY_WIDGET_LATEST_POSTS: false, // 显示最新文章卡
  MATERY_WIDGET_ANALYTICS: false, // 显示统计卡
  MATERY_WIDGET_TO_TOP: true,
  MATERY_WIDGET_TO_COMMENT: true, // 跳到评论区
  WIDGET_DARK_MODE: true, // 夜间模式
  MATERY_WIDGET_TOC: true // 移动端悬浮目录
}
export default CONFIG

/* 导航栏签颜色 */
#sticky-nav.bg-indigo-700 {
    background-color: #ebd61e;
}

/* 夜间模式导航栏签颜色 */
.dark div#sticky-nav {
 background-color: red;
}


/* 首页开始阅读按钮 */
.glassmorphism.w-40.z-40 {
    background-color: #ebd61e;
    border: none;
}

/* 标签颜色 */
a.cursor-pointer.bg-indigo-700 {
    background-color: #ebd61e;
}

/* 移动端侧边栏 */
#side-bar>.bg-indigo-700 {
    background-color: #ebd61e;
}

/* 移动端侧边栏菜单 */
nav div:hover,li:hover {
    background-color: #ebd61e!important;
}

/* 悬浮菜单 */
.right-2 .bg-indigo-700 {
    background-color: #ebd61e;
}

/* 目录进度条 */
.h-4.bg-indigo-400 {
    background-color: #ebd61e;
}

/* 目录文字高亮 */
nav .text-green-500{
    color: #ebd61e;
}

/* 网站页脚 */ 
footer.bg-indigo-700{
    background-color: #ebd61e;
}

/* 翻页按钮 */
button.bg-indigo-700{
    background-color: #ebd61e;
}

/* 文章页隐藏发布时间 */
#article-wrapper > div.wow.fadeInUp.px-10 > section > div.flex.flex-wrap.gap-3.mt-5.text-sm > a {
  display: none;
}


/* 文章页隐藏发布时间 */
#article-wrapper > div.wow.fadeInUp.px-10 > section > div.flex.flex-wrap.gap-3.mt-5.text-sm > a {
  display: none;
}

/* 文章页隐藏更新时间 */
#article-wrapper > div.wow.fadeInUp.px-10 > section > div.flex.flex-wrap.gap-3.mt-5.text-sm > span.whitespace-nowrap {
  display: none;
}

/* 文章页隐藏阅读次数 */
#article-wrapper .busuanzi_container_page_pv {
  display: none ！important;
}

/* 文章页隐藏字数 */
#wordCountWrapper > span:nth-child(1){
 display: none !important;
}

/* 文章页隐藏阅读时长 */
#wordCountWrapper > span:nth-child(2){
 display: none;
}
