/* eslint-disable react/no-unknown-property */
import CONFIG from './config'
import { themeConsoleStyle } from '@/lib/themeConsoleStyle'
/**
 * 此处样式只对当前主题生效
 * 此处不支持tailwindCSS的 @apply 语法
 * @returns
 */
const Style = () => {
  return <style jsx global>{`
    // 底色
    body{
        background-color: #ffffff;
    }
    .dark body{
        background-color: black;
    }

    /* 黑金深色：fukasawa 主容器与文章区深色背景改为近黑（覆盖全局 hexo-black-gray 深蓝灰） */
    .dark #theme-fukasawa main,
    .dark #theme-fukasawa article,
    .dark #theme-fukasawa .article,
    .dark #theme-fukasawa .card {
        background-color: #0a0a0a !important;
    }
    .dark #theme-fukasawa #wrapper,
    .dark #theme-fukasawa #container-inner {
        background-color: #0a0a0a !important;
    }

    /* 设计流程模块：hover 描 #978d7e 细边（CSS 实现，确保生效） */
    .dp-module {
        border-color: rgba(151, 141, 126, 0.35);
    }
    .dp-module:hover {
        border-color: #978d7e !important;
        transition: border-color .3s ease;
    }

    /* fukasawa的首页响应式分栏 */
    #theme-fukasawa .grid-item {
        height: auto;
        break-inside: avoid-column;
        margin-bottom: .5rem;
    }

    /* 大屏幕（宽度≥1024px）下显示3列 */
    @media (min-width: 1024px) {
        #theme-fukasawa .grid-container {
        column-count: 3;
        column-gap: .5rem;
        }
    }

    /* 小屏幕（宽度≥640px）下显示2列 */
    @media (min-width: 640px) and (max-width: 1023px) {
        #theme-fukasawa .grid-container {
        column-count: 2;
        column-gap: .5rem;
        }
    }

    /* 移动端（宽度<640px）下显示1列 */
    @media (max-width: 639px) {
        #theme-fukasawa .grid-container {
        column-count: 1;
        column-gap: .5rem;
        }
    }

    .container {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            grid-gap: 10px;
            padding: 10px;
        }


      ${themeConsoleStyle('fukasawa', CONFIG)}
  `}</style>
}

export { Style }

