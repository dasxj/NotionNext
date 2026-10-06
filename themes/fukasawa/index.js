'use client'

import AlgoliaSearchModal from '@/components/AlgoliaSearchModal'
import { AdSlot } from '@/components/GoogleAdsense'
import replaceSearchResult from '@/components/Mark'
import WWAds from '@/components/WWAds'
import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import { isBrowser } from '@/lib/utils'
import { Transition } from '@headlessui/react'
import dynamic from 'next/dynamic'
import SmartLink from '@/components/SmartLink'
import { useRouter } from 'next/router'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import ArticleDetail from './components/ArticleDetail'
import ArticleLock from './components/ArticleLock'
import AsideLeft from './components/AsideLeft'
import BlogListPage from './components/BlogListPage'
import BlogListScroll from './components/BlogListScroll'
import BlogArchiveItem from './components/BlogPostArchive'
import Header from './components/Header'
import TagItemMini from './components/TagItemMini'
import PortalHome from './components/PortalHome'
import CONFIG from './config'
import { Style } from './style'

const Live2D = dynamic(() => import('@/components/Live2D'))

// 主题全局状态
const ThemeGlobalFukasawa = createContext()
export const useFukasawaGlobal = () => useContext(ThemeGlobalFukasawa)

/**
 * /zl 案例平台顶部导航（桌面端常显）
 */
const PortalTopNav = props => {
  const { customMenu = [], siteInfo } = props
  const [open, setOpen] = useState(false)
  const { isDarkMode, toggleDarkMode } = useGlobal()
  const rawMenus = (customMenu || []).filter(m => m && (m.href || m.name || m.title))
  // 去重：customMenu 可能已含"首页"，避免重复
  const menus = rawMenus.filter(m => m.href !== '/' && m.name !== '首页' && m.title !== '首页')
  return (
    <header className='sticky top-0 z-50 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur border-b border-neutral-100 dark:border-neutral-800'>
      <div className='max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between'>
        <SmartLink href='/' className='flex items-center gap-2 font-semibold text-neutral-900 dark:text-neutral-100 tracking-wide'>
          <span className='inline-block w-3 h-3 bg-[#f0a500]' />
          {siteInfo?.title || '大设小计'}
        </SmartLink>
        <nav className='hidden md:flex items-center gap-7 text-sm text-neutral-600 dark:text-neutral-400'>
          <SmartLink href='/' className='hover:text-neutral-900 dark:hover:text-neutral-100'>首页</SmartLink>
          {menus.map(m => (
            <SmartLink key={m.id || m.name || m.title} href={m.href || '#'} target={m.target || '_self'} className='hover:text-neutral-900 dark:hover:text-neutral-100'>
              {m.name || m.title}
            </SmartLink>
          ))}
          <button onClick={toggleDarkMode} title={isDarkMode ? '切换到日间模式' : '切换到夜间模式'} className='text-lg leading-none text-neutral-600 dark:text-neutral-200 hover:text-[#f0a500]'>
            {isDarkMode ? <i className='fas fa-sun' /> : <i className='fas fa-moon' />}
          </button>
        </nav>
        <div className='md:hidden flex items-center gap-3'>
          <button onClick={toggleDarkMode} title={isDarkMode ? '切换到日间模式' : '切换到夜间模式'} className='text-lg leading-none text-neutral-600 dark:text-neutral-200'>
            {isDarkMode ? <i className='fas fa-sun' /> : <i className='fas fa-moon' />}
          </button>
          <button onClick={() => setOpen(!open)} className='text-xl text-neutral-600 dark:text-neutral-200'>
            {open ? <i className='fas fa-times' /> : <i className='fas fa-bars' />}
          </button>
        </div>
      </div>
      {open && (
        <nav className='md:hidden bg-white dark:bg-[#0a0a0a] border-t border-neutral-100 dark:border-neutral-800 px-4 py-3 flex flex-col gap-3 text-sm text-neutral-700 dark:text-neutral-300'>
          <SmartLink href='/'>首页</SmartLink>
          {menus.map(m => (
            <SmartLink key={m.id || m.name || m.title} href={m.href || '#'} target={m.target || '_self'}>{m.name || m.title}</SmartLink>
          ))}
        </nav>
      )}
    </header>
  )
}

/**
 * 基础布局 采用左右两侧布局，移动端使用顶部导航栏
 * @param children
 * @param layout
 * @param tags
 * @param meta
 * @param post
 * @param currentSearch
 * @param currentCategory
 * @param currentTag
 * @param categories
 * @returns {JSX.Element}
 * @constructor
 */
const LayoutBase = props => {
  const { children, headerSlot } = props
  const leftAreaSlot = <Live2D />
  const { onLoading, fullWidth } = useGlobal()
  const searchModal = useRef(null)
  // /zl 资料库站（案例平台）：该站标题固定为"大设小计 资料库"，走全宽布局
  const isPortal = props?.siteInfo?.title === '大设小计 资料库'

  // /zl 案例平台：全宽布局，无侧边栏，顶部导航
  if (isPortal) {
    return (
      <ThemeGlobalFukasawa.Provider value={{ searchModal }}>
        <div id='theme-fukasawa' className='bg-white min-h-screen'>
          <Style />
          <PortalTopNav {...props} />
          <main className='w-full bg-white'>{children}</main>
        </div>
      </ThemeGlobalFukasawa.Provider>
    )
  }

  return (
    <ThemeGlobalFukasawa.Provider value={{ searchModal }}>
      <div
        id='theme-fukasawa'
        className={`${siteConfig('FONT_STYLE')} dark:bg-black scroll-smooth`}>
        <Style />
        {/* 页头导航，此主题只在移动端生效 */}
        <Header {...props} />

        <div
          className={
            (JSON.parse(siteConfig('LAYOUT_SIDEBAR_REVERSE'))
              ? 'flex-row-reverse'
              : '') + ' flex'
          }>
          {/* 侧边抽屉 */}
          <AsideLeft {...props} slot={leftAreaSlot} />

          <main
            id='wrapper'
            className='relative flex w-full py-8 justify-center bg-day dark:bg-night'>
            <div
              id='container-inner'
              className={`${fullWidth ? '' : '2xl:max-w-6xl md:max-w-4xl'} w-full relative z-10`}>
              <Transition
                show={!onLoading}
                appear={true}
                className='w-full'
                enter='transition ease-in-out duration-700 transform order-first'
                enterFrom='opacity-0 translate-y-16'
                enterTo='opacity-100'
                leave='transition ease-in-out duration-300 transform'
                leaveFrom='opacity-100 translate-y-0'
                leaveTo='opacity-0 -translate-y-16'
                unmount={false}>
                <div> {headerSlot} </div>
                <div> {children} </div>
              </Transition>

              <div className='mt-2'>
                <AdSlot type='native' />
              </div>
            </div>
          </main>
        </div>

        <AlgoliaSearchModal cRef={searchModal} {...props} />
      </div>
    </ThemeGlobalFukasawa.Provider>
  )
}

/**
 * 首页
 * @param {*} props notion数据
 * @returns 首页就是一个博客列表；/zl 为案例平台首页
 */
const LayoutIndex = props => {
  // /zl 资料库站走案例平台首页；其余站走博客列表
  if (props?.siteInfo?.title === '大设小计 资料库') {
    return <PortalHome {...props} />
  }
  return <LayoutPostList {...props} />
}

/**
 * 博客列表
 * @param {*} props
 */
const LayoutPostList = props => {
  const POST_LIST_STYLE = siteConfig('POST_LIST_STYLE')
  return (
    <>
      <div className='w-full p-2'>
        <WWAds className='w-full' orientation='horizontal' />
      </div>
      { POST_LIST_STYLE=== 'page' ? (
        <BlogListPage {...props} />
      ) : (
        <BlogListScroll {...props} />
      )}
    </>
  )
}

/**
 * 文章详情
 * @param {*} props
 * @returns
 */
const LayoutSlug = props => {
  const { post, lock, validPassword } = props
  const router = useRouter()
  const waiting404 = siteConfig('POST_WAITING_TIME_FOR_404') * 1000
  useEffect(() => {
    // 404
    if (!post) {
      setTimeout(
        () => {
          if (isBrowser) {
            const article = document.querySelector('#article-wrapper #notion-article')
            if (!article) {
              router.push('/404').then(() => {
                console.warn('找不到页面', router.asPath)
              })
            }
          }
        },
        waiting404
      )
    }
  }, [post])
  return (
    <>
      {lock ? (
        <ArticleLock validPassword={validPassword} />
      ) : post && (
        <ArticleDetail {...props} />
      )}
    </>
  )
}

/**
 * 搜索页
 */
const LayoutSearch = props => {
  const { keyword } = props
  const router = useRouter()
  useEffect(() => {
    if (isBrowser) {
      replaceSearchResult({
        doms: document.getElementById('posts-wrapper'),
        search: keyword,
        target: {
          element: 'span',
          className: 'text-red-500 border-b border-dashed'
        }
      })
    }
  }, [router])
  return <LayoutPostList {...props} />
}

/**
 * 归档页面
 */
const LayoutArchive = props => {
  const { archivePosts } = props
  return (
    <>
      <div className='mb-10 pb-20 bg-white md:p-12 p-3 dark:bg-gray-800 shadow-md min-h-full'>
        {Object.keys(archivePosts).map(archiveTitle => (
          <BlogArchiveItem
            key={archiveTitle}
            posts={archivePosts[archiveTitle]}
            archiveTitle={archiveTitle}
          />
        ))}
      </div>
    </>
  )
}

/**
 * 404
 * @param {*} props
 * @returns
 */
const Layout404 = props => {
  const router = useRouter()
  const { locale } = useGlobal()
  useEffect(() => {
    // 延时3秒如果加载失败就返回首页
    setTimeout(() => {
      const article = isBrowser && document.getElementById('article-wrapper')
      if (!article) {
        router.push('/').then(() => {
          // console.log('找不到页面', router.asPath)
        })
      }
    }, 3000)
  }, [])

  return <>
        <div className='md:-mt-20 text-black w-full h-screen text-center justify-center content-center items-center flex flex-col'>
            <div className='dark:text-gray-200'>
                <h2 className='inline-block border-r-2 border-gray-600 mr-2 px-3 py-2 align-top'><i className='mr-2 fas fa-spinner animate-spin' />404</h2>
                <div className='inline-block text-left h-32 leading-10 items-center'>
                    <h2 className='m-0 p-0'>{locale.NAV.PAGE_NOT_FOUND_REDIRECT}</h2>
                </div>
            </div>
        </div>
    </>
}

/**
 * 分类列表
 * @param {*} props
 * @returns
 */
const LayoutCategoryIndex = props => {
  const { locale } = useGlobal()
  const { categoryOptions } = props
  return (
    <>
      <div className='bg-white dark:bg-gray-700 px-10 py-10 shadow'>
        <div className='dark:text-gray-200 mb-5'>
          <i className='mr-4 fas fa-th' />
          {locale.COMMON.CATEGORY}:
        </div>
        <div id='category-list' className='duration-200 flex flex-wrap'>
          {categoryOptions?.map(category => {
            return (
              <SmartLink
                key={category.name}
                href={`/category/${category.name}`}
                passHref
                legacyBehavior>
                <div
                  className={
                    'hover:text-black dark:hover:text-white dark:text-gray-300 dark:hover:bg-gray-600 px-5 cursor-pointer py-2 hover:bg-gray-100'
                  }>
                  <i className='mr-4 fas fa-folder' />
                  {category.name}({category.count})
                </div>
              </SmartLink>
            )
          })}
        </div>
      </div>
    </>
  )
}

/**
 * 标签列表
 * @param {*} props
 * @returns
 */
const LayoutTagIndex = props => {
  const { locale } = useGlobal()
  const { tagOptions } = props
  return (
    <>
      <div className='bg-white dark:bg-gray-700 px-10 py-10 shadow'>
        <div className='dark:text-gray-200 mb-5'>
          <i className='mr-4 fas fa-tag' />
          {locale.COMMON.TAGS}:
        </div>
        <div id='tags-list' className='duration-200 flex flex-wrap ml-8'>
          {tagOptions.map(tag => {
            return (
              <div key={tag.name} className='p-2'>
                <TagItemMini key={tag.name} tag={tag} />
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

export {
  Layout404,
  LayoutArchive,
  LayoutBase,
  LayoutCategoryIndex,
  LayoutIndex,
  LayoutPostList,
  LayoutSearch,
  LayoutSlug,
  LayoutTagIndex,
  CONFIG as THEME_CONFIG
}
