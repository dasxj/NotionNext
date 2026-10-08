import LazyImage from '@/components/LazyImage'
import NotionIcon from '@/components/NotionIcon'
import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import { formatDateFmt } from '@/lib/utils/formatDate'
import SmartLink from '@/components/SmartLink'
import TagItemMini from './TagItemMini'

/**
 * 文章详情页的Hero块
 */
export default function PostHero({ post, siteInfo }) {
  const { locale, fullWidth } = useGlobal()

  if (!post) {
    return <></>
  }

  // 文章全屏隐藏标头
  if (fullWidth) {
    return <div className='my-8' />
  }

  const headerImage = post?.pageCover ? post.pageCover : siteInfo?.pageCover

  return (
    <div id='header' className='w-full h-96 relative md:flex-shrink-0 z-10'>
      <LazyImage
        priority={true}
        src={headerImage}
        className='w-full h-full object-cover object-center absolute top-0'
      />

      <header
        id='article-header-cover'
        className='bg-black bg-opacity-70 absolute top-0 w-full h-96 py-10 flex justify-center items-center '>
        <div className='mt-10'>
          <div className='mb-3 flex justify-center'>
            {post.category && (
              <>
                <SmartLink
                  href={`/category/${post.category}`}
                  passHref
                  legacyBehavior>
                  <div className='cursor-pointer px-2 py-1 mb-2 border rounded-sm dark:border-white text-sm font-medium hover:underline duration-200 shadow-text-md text-white'>
                    {post.category}
                  </div>
                </SmartLink>
              </>
            )}
          </div>

          {/* 文章Title */}
          <div className='leading-snug font-bold xs:text-4xl sm:text-4xl md:text-5xl md:leading-snug text-4xl shadow-text-md flex justify-center text-center text-white'>
            {siteConfig('POST_TITLE_ICON') && (
              <NotionIcon icon={post.pageIcon} className='text-4xl mx-1' />
            )}
            {post.title}
          </div>

          <section className='flex-wrap shadow-text-md flex text-sm justify-center mt-4 text-white font-light leading-8'>
            {post?.['设计师'] ? (
              /* —— 资料库：设计师 / 项目位置 / 项目面积（替代时间行） —— */
              <div className='flex flex-wrap justify-center items-center gap-x-1 dark:text-gray-200'>
                {post['设计师']?.[0] && (
                  <SmartLink
                    href={`/zl?designer=${encodeURIComponent(post['设计师'][0])}`}
                    className='pl-1 mr-2 cursor-pointer hover:underline'>
                    <i className='mr-1 fas fa-user-pen' /> {post['设计师'][0]}
                  </SmartLink>
                )}
                {post['项目位置']?.[0] && (
                  <SmartLink
                    href={`/zl?location=${encodeURIComponent(post['项目位置'][0])}`}
                    className='pl-1 mr-2 cursor-pointer hover:underline'>
                    <i className='mr-1 fas fa-location-dot' /> {post['项目位置'][0]}
                  </SmartLink>
                )}
                {post['项目面积'] && (
                  <div className='pl-1 mr-2'>
                    <i className='mr-1 fas fa-ruler-combined' /> {post['项目面积']}
                  </div>
                )}
                {post['风格']?.length > 0 && (
                  <div className='pl-1 mr-2'>
                    <i className='mr-1 fas fa-tags' /> {post['风格'].slice(0, 2).join(' / ')}
                  </div>
                )}
              </div>
            ) : (
              /* —— 主页：时间行（原样） —— */
              <>
                <div className='flex justify-center dark:text-gray-200 text-opacity-70'>
                  {post?.type !== 'Page' && (
                    <>
                      <SmartLink
                        href={`/archive#${formatDateFmt(post?.publishDate, 'yyyy-MM')}`}
                        passHref
                        className='pl-1 mr-2 cursor-pointer hover:underline'>
                        {locale.COMMON.POST_TIME}: {post?.publishDay}
                      </SmartLink>
                    </>
                  )}
                  <div className='pl-1 mr-2'>
                    {locale.COMMON.LAST_EDITED_TIME}: {post.lastEditedDay}
                  </div>
                </div>

                {JSON.parse(siteConfig('ANALYTICS_BUSUANZI_ENABLE')) && (
                  <div className='busuanzi_container_page_pv font-light mr-2'>
                    <span
                      className='mr-2 busuanzi_value_page_pv'
                      dangerouslySetInnerHTML={{ __html: '&nbsp;' }}
                    />
                    {locale.COMMON.VIEWS}
                  </div>
                )}
              </>
            )}
          </section>

          <div className='mt-4 mb-1'>
            {post?.['设计师'] ? null : (
              post.tagItems && (
                <div className='flex justify-center flex-nowrap overflow-x-auto'>
                  {post.tagItems.map(tag => (
                    <TagItemMini key={tag.name} tag={tag} />
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </header>
    </div>
  )
}
