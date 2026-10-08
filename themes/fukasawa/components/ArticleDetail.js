import { useState } from 'react'
import Comment from '@/components/Comment'
import NotionPage from '@/components/NotionPage'
import ShareBar from '@/components/ShareBar'
import DesignProcess from './DesignProcess'
// 复用主页(hexo)详情页组件：头图 / 目录 / 版权 / 推荐 / 相邻文章
import PostHero from '@/themes/hexo/components/PostHero'
import Catalog from '@/themes/hexo/components/Catalog'
import ArticleCopyright from '@/themes/hexo/components/ArticleCopyright'
import ArticleRecommend from '@/themes/hexo/components/ArticleRecommend'
import ArticleAdjacent from '@/themes/hexo/components/ArticleAdjacent'

/**
 * 文章详情页（资料库 /zl）：样式与主页(hexo)文章详情一致
 * - 顶部 PostHero 头图（分类/标题/时间/标签叠加在图上）
 * - 白卡正文 Notion 排版（图片放大查看器为全局组件，保留）
 * - 桌面右侧固定目录、移动端悬浮目录（同主页）
 * - 文末分享 / 版权 / 推荐 / 相邻文章 / 评论
 * - 设计流程页(liucheng)保持定制组件，不走此样式
 */
export default function ArticleDetail(props) {
  const { post } = props
  const [tocOpen, setTocOpen] = useState(false)

  if (!post) {
    return <></>
  }

  // 设计流程页：保持定制的时间轴组件
  if (post?.slug === 'liucheng') {
    return (
      <div id='container' className='w-full'>
        <DesignProcess post={post} />
      </div>
    )
  }

  const hasToc = post?.toc?.length > 1

  return (
    <div id='container' className='w-full'>
      {/* 顶部头图（主页 PostHero 风格） */}
      <PostHero {...props} />

      {/* 主体：主区 + 右侧固定目录 */}
      <div className='w-full max-w-6xl mx-auto py-6 lg:flex lg:space-x-6 lg:px-6'>
        {/* 主区白卡 */}
        <div className='w-full lg:max-w-4xl bg-white dark:bg-black lg:px-2 lg:py-4'>
          <article
            id='article-wrapper'
            className='subpixel-antialiased overflow-y-hidden'>
            {/* Notion 文章主体 */}
            <section className='px-5 justify-center mx-auto max-w-2xl lg:max-w-full'>
              <NotionPage post={post} />
            </section>

            {/* 分享 */}
            <ShareBar post={post} />
            {post?.type === 'Post' && (
              <>
                <ArticleCopyright {...props} />
                <ArticleRecommend {...props} />
                <ArticleAdjacent {...props} />
              </>
            )}
          </article>

          <div className='pt-4 border-dashed'></div>

          {/* 评论互动 */}
          <div className='duration-200 overflow-x-auto bg-white dark:bg-black px-3'>
            <Comment frontMatter={post} />
          </div>
        </div>

        {/* 桌面右侧目录（同主页 SideRight 目录） */}
        {hasToc && (
          <div className='hidden lg:block lg:w-80'>
            <div className='sticky top-8'>
              <div className='shadow rounded-xl p-4 bg-white dark:bg-black dark:border-black'>
                <Catalog toc={post.toc} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 移动端目录浮标按钮 */}
      {hasToc && (
        <>
          <button
            onClick={() => setTocOpen(!tocOpen)}
            className='fixed left-1 top-1/2 -translate-y-1/2 z-40 lg:hidden text-neutral-500 dark:text-neutral-400 hover:text-[#c9a96f] dark:hover:text-[#c9a96f] text-lg leading-none'>
            <i className='fas fa-list' />
          </button>

          {/* 移动端展开的目录抽屉 */}
          {tocOpen && (
            <div className='fixed inset-y-0 left-0 z-50 w-56 bg-white dark:bg-black shadow-xl p-4 overflow-y-auto lg:hidden'>
              <div className='flex justify-between items-center mb-3 text-neutral-700 dark:text-gray-200 font-medium text-sm'>
                <span>目录</span>
                <button
                  onClick={() => setTocOpen(false)}
                  className='text-neutral-400 hover:text-neutral-700'>
                  <i className='fas fa-times' />
                </button>
              </div>
              <Catalog toc={post.toc} />
            </div>
          )}
        </>
      )}
    </div>
  )
}
