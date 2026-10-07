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

    /* 设计流程模块：hover 描主题色细边（日间 #ecd452 / 深色 #c9a96f，CSS 实现确保生效） */
    .dp-module {
        border-color: rgba(236, 212, 82, 0.35);
    }
    .dp-module:hover {
        border-color: #ecd452 !important;
        transition: border-color .3s ease;
    }
    .dark .dp-module {
        border-color: rgba(201, 169, 111, 0.35);
    }
    .dark .dp-module:hover {
        border-color: #c9a96f !important;
    }

    /* 深色模式：footer 背景深蓝(#111827)覆盖为黑金黑，避免底部深蓝条 */
    .dark #theme-fukasawa footer,
    .dark #theme-fukasawa .footer,
    .dark #theme-fukasawa .site-info {
        background-color: #0a0a0a !important;
        color: #ece4d3;
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

