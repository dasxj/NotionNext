import { useState } from 'react'
import Comment from '@/components/Comment'
import { AdSlot } from '@/components/GoogleAdsense'
import LazyImage from '@/components/LazyImage'
import NotionIcon from '@/components/NotionIcon'
import NotionPage from '@/components/NotionPage'
import ShareBar from '@/components/ShareBar'
import WWAds from '@/components/WWAds'
import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import { formatDateFmt } from '@/lib/utils/formatDate'
import SmartLink from '@/components/SmartLink'
import ArticleAround from './ArticleAround'
import Catalog from './Catalog'
import TagItemMini from './TagItemMini'

/**
 *
 * @param {*} param0
 * @returns
 */
export default function ArticleDetail(props) {
  const { post, prev, next } = props
  const { locale, fullWidth } = useGlobal()
  const [tocOpen, setTocOpen] = useState(false)

  if (!post) {
    return <></>
  }
  return (
    <div
      id='container'
      className={`${fullWidth ? 'px-10 xl:pl-56' : 'max-w-5xl xl:pl-56'} overflow-x-auto flex-grow mx-auto w-screen md:w-full`}>
      {/* 左侧固定目录：宽屏显示，垂直居中，占位少 */}
      {post?.toc?.length > 0 && (
        <>
          <aside className='fixed left-0 top-1/2 -translate-y-1/2 z-30 w-36 hidden xl:flex flex-col max-h-[70vh] overflow-y-auto px-1 text-sm text-neutral-600'>
            <Catalog toc={post.toc} />
          </aside>

          {/* 手机：目录浮标按钮 */}
          <button
            onClick={() => setTocOpen(!tocOpen)}
            className='fixed left-1 top-1/2 -translate-y-1/2 z-40 xl:hidden text-neutral-500 hover:text-[#f0a500] text-lg leading-none'>
            <i className='fas fa-list' />
          </button>

          {/* 手机：展开的目录抽屉 */}
          {tocOpen && (
            <div className='fixed inset-y-0 left-0 z-50 w-56 bg-white shadow-xl p-4 overflow-y-auto xl:hidden'>
              <div className='flex justify-between items-center mb-3 text-neutral-700 font-medium text-sm'>
                <span>目录</span>
                <button onClick={() => setTocOpen(false)} className='text-neutral-400 hover:text-neutral-700'>
                  <i className='fas fa-times' />
                </button>
              </div>
              <Catalog toc={post.toc} />
            </div>
          )}
        </>
      )}
      {post?.type && !post?.type !== 'Page' && post?.pageCover && (
        <div className='w-full relative md:flex-shrink-0 overflow-hidden'>
          <LazyImage
            alt={post.title}
            src={post?.pageCover}
            className='object-cover max-h-[60vh] w-full'
          />
        </div>
      )}

      <article className='subpixel-antialiased overflow-y-hidden py-10 px-5 lg:pt-24 md:px-32  dark:border-gray-700 bg-white dark:bg-hexo-black-gray'>
        <header>
          {/* 文章Title */}
          <div className='font-bold text-4xl text-black dark:text-white'>
            {siteConfig('POST_TITLE_ICON') && (
              <NotionIcon icon={post?.pageIcon} />
            )}
            {post.title}
          </div>

          <section className='flex-wrap flex mt-2 text-gray-400 dark:text-gray-400 font-light leading-8'>
            <div className='flex items-center gap-x-4 text-neutral-600'>
              {post?.category && (
                <SmartLink
                  href={`/category/${post.category}`}
                  passHref
                  className='flex items-center cursor-pointer text-md hover:text-[#f0a500]'>
                  <i className='mr-1.5 fas fa-folder-open text-[#f0a500]' />
                  {post.category}
                </SmartLink>
              )}

              {post?.['设计师']?.[0] && (
                <SmartLink
                  href={`/zl?designer=${encodeURIComponent(post['设计师'][0])}`}
                  className='flex items-center cursor-pointer hover:text-[#f0a500]'>
                  <i className='mr-1.5 fas fa-user-pen text-[#f0a500]' />
                  {post['设计师'][0]}
                </SmartLink>
              )}
              {post?.['项目位置']?.[0] && (
                <SmartLink
                  href={`/zl?location=${encodeURIComponent(post['项目位置'][0])}`}
                  className='flex items-center cursor-pointer hover:text-[#f0a500]'>
                  <i className='mr-1.5 fas fa-location-dot text-[#f0a500]' />
                  {post['项目位置'][0]}
                </SmartLink>
              )}
              {post?.['项目面积'] && (
                <span className='flex items-center'>
                  <i className='mr-1.5 fas fa-ruler-combined text-[#f0a500]' />
                  {post['项目面积']}
                </span>
              )}
            </div>

              <div className='my-2'>
                {post.tagItems && (
                  <div className='flex flex-nowrap overflow-x-auto'>
                    {post.tagItems.map(tag => (
                      <TagItemMini key={tag.name} tag={tag} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          <WWAds className='w-full' orientation='horizontal' />
        </header>

        {/* Notion文章主体 */}
        <section id='article-wrapper'>
          {post && <NotionPage post={post} />}
        </section>

        <section>
          <AdSlot type='in-article' />
          {/* 分享 */}
          <ShareBar post={post} />
        </section>
      </article>

      {post?.type === 'Post' && <ArticleAround prev={prev} next={next} />}

      {/* 评论互动 */}
      <div className='duration-200 shadow py-6 px-12 w-screen md:w-full overflow-x-auto dark:border-gray-700 bg-white dark:bg-hexo-black-gray'>
        <Comment frontMatter={post} />
      </div>
    </div>
  )
}
