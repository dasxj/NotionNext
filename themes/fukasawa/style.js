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
    .dark html,
    .dark body {
        background-color: black;
    }
    /* 覆盖 fukasawa 深色卡片/背景 CSS 变量，消除底部深蓝残留 */
    .dark {
        --fukasawa-color-bg-dark: #0a0a0a;
        --fukasawa-color-card-dark: #0a0a0a;
        --fukasawa-color-text: #ece4d3;
    }
    .dark #__next,
    .dark #theme-fukasawa {
        background-color: #0a0a0a !important;
    }

    /* 资料库主题色变量（日间/深色），供目录/进度条等跟随主题高亮 */
    #theme-fukasawa {
        --theme-color: #ecd452;
    }
    .dark #theme-fukasawa {
        --theme-color: #c9a96f;
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

    /* 设计流程模块：hover 交互
       日间：正常灰底 → hover 变浅主题色(#978d7e 系) + 描边
       夜间：黑底 → hover 金边 #c9a96f + 金色金属光泽(边框光晕)，不做背景扫过 */
    .dp-module {
        background-color: #f5f5f5;
        border-color: #e6e3db;
        transition: background-color .3s ease, border-color .3s ease, box-shadow .3s ease, backdrop-filter .3s ease;
    }
    .dp-module:hover {
        background-color: rgba(236, 212, 82, 0.3);
        border-color: #ecd452 !important;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
    }
    .dark .dp-module {
        background-color: #181818;
        border-color: rgba(201, 169, 111, 0.35);
    }
    .dark .dp-module:hover {
        border-color: #c9a96f !important;
        box-shadow: 0 0 12px rgba(201, 169, 111, 0.4), inset 0 0 6px rgba(201, 169, 111, 0.12);
    }

    /* 深色模式：footer 背景深蓝(#111827)覆盖为黑金黑，避免底部深蓝条 */
    .dark #theme-fukasawa footer,
    .dark #theme-fukasawa .footer,
    .dark #theme-fukasawa .site-info {
        background-color: #0a0a0a !important;
        color: #ece4d3;
    }

    /* 评论容器：强覆盖任何深蓝背景(#111827/bg-night)，深色统一为黑金黑（高特异性 + !important） */
    #theme-fukasawa .dp-comment {
        background-color: #ffffff;
    }
    .dark #theme-fukasawa main .dp-comment,
    .dark #theme-fukasawa article .dp-comment,
    .dark #theme-fukasawa .dp-comment {
        background-color: #0a0a0a !important;
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

    /* 详情页目录与进度条：跟随主页(hexo)设置，高亮用主题色 */
    #theme-fukasawa a[class*='hover:text-indigo-800']:hover {
        color: var(--theme-color) !important;
    }
    .dark #theme-fukasawa .catalog-item {
        color: white !important;
        border-color: white !important;
    }
    .dark #theme-fukasawa .catalog-item:hover {
        color: var(--theme-color) !important;
    }
    /* 当前高亮项：文字与边框用主题色（日间/深色一致） */
    #theme-fukasawa .catalog-item.font-bold,
    #theme-fukasawa .catalog-item.font-bold .truncate {
        color: var(--theme-color) !important;
        border-color: var(--theme-color) !important;
    }
    /* 阅读进度条用主题色 */
    #theme-fukasawa .bg-indigo-600 {
        background-color: var(--theme-color) !important;
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

