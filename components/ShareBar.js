import { siteConfig } from '@/lib/config'
import dynamic from 'next/dynamic'
import ClientOnly from './ClientOnly'

const ShareButtons = dynamic(() => import('@/components/ShareButtons'), {
  ssr: false
})

/**
 * 分享栏
 * @param {} param0
 * @returns
 */
const ShareBar = ({ post }) => {
  if (
    !JSON.parse(siteConfig('POST_SHARE_BAR_ENABLE')) ||
    !post ||
    post?.type !== 'Post'
  ) {
    return <></>
  }

  return (
    <div className='m-1 overflow-x-auto scroll-hidden'>
      <div className='flex w-max min-w-full flex-nowrap md:w-full md:justify-end [&>*]:shrink-0'>
        {/* ssr:false 组件需挂载后再渲染，避免 hydration 不一致 */}
        <ClientOnly>
          <ShareButtons post={post} />
        </ClientOnly>
      </div>
    </div>
  )
}
export default ShareBar
