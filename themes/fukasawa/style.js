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
    /* 覆盖 fukasawa 深色卡片 CSS 变量，消除底部深蓝残留 */
    .dark {
        --fukasawa-color-card-dark: #0a0a0a;
        --fukasawa-color-text: #ece4d3;
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
        background-color: #ecd452;
        border-color: #e3c54a;
        transition: background-color .3s ease, border-color .3s ease, box-shadow .3s ease;
    }
    .dp-module:hover {
        background-color: #e6c445;
        border-color: #cfa83c !important;
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

