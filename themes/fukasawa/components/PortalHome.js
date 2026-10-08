import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import SmartLink from '@/components/SmartLink'

// 解析面积字符串数字：'1100㎡' -> 1100
const parseArea = v => {
  if (v == null) return null
  const m = String(v).match(/(\d+(\.\d+)?)/)
  return m ? parseFloat(m[1]) : null
}

// 随机取 n 个
const randomPick = (arr, n) => {
  const a = [...arr].filter(Boolean)
  const shuffled = a.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(n, shuffled.length))
}

// 判断是否为 Notion 默认占位封面（未在 Notion 设置封面时）
const isPlaceholderCover = c =>
  !c || c.includes('solid_beige') || c.includes('/images/page-cover/')

/**
 * /zl 案例平台首页：横幅轮播 + 筛选栏 + 案例卡片网格
 * 设计师/项目位置不在筛选栏中，而是作为卡片上的可点击字段标签，
 * 点击后跳转 /zl?designer=XX 或 /zl?location=XX 显示该值下的全部项目。
 */
const PortalHome = ({ posts = [], categoryOptions = [], siteInfo }) => {
  const router = useRouter()

  // —— 筛选状态 ——
  const [space, setSpace] = useState('全部') // 空间分类
  const [style, setStyle] = useState('全部') // 风格
  const [sort, setSort] = useState('latest') // latest / hot
  const [designer, setDesigner] = useState('全部') // 设计师关联筛选
  const [projectLocation, setProjectLocation] = useState('全部') // 项目位置关联筛选
  const [areaMin, setAreaMin] = useState('')
  const [areaMax, setAreaMax] = useState('')

  // —— 从 URL 参数初始化关联筛选（点击卡片上的设计师/位置标签跳转而来）——
  useEffect(() => {
    const d = router.query?.designer
    const l = router.query?.location
    if (d) setDesigner(typeof d === 'string' ? d : d[0])
    if (l) setProjectLocation(typeof l === 'string' ? l : l[0])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query?.designer, router.query?.location])

  // —— 浏览量（热门排序用）——
  const [pvMap, setPvMap] = useState({})

  // —— 横幅：挂载后随机选 5-6 张（SSR 渲染空，避免服务端/客户端随机不一致导致 hydration 报错）——
  const [bannerIndex, setBannerIndex] = useState(0)
  const [bannerPosts, setBannerPosts] = useState([])
  useEffect(() => {
    setBannerPosts(randomPick(posts, 6))
  }, [posts])
  useEffect(() => {
    if (bannerPosts.length <= 1) return
    const t = setInterval(() => setBannerIndex(i => (i + 1) % bannerPosts.length), 5000)
    return () => clearInterval(t)
  }, [bannerPosts.length])

  // —— 动态聚合风格选项（不写死，随 Notion 变化）——
  const styleOptions = useMemo(() => {
    const set = new Set()
    posts.forEach(p => (p['风格'] || []).forEach(s => set.add(s)))
    return Array.from(set).filter(Boolean)
  }, [posts])

  // —— 拉取浏览量（热门排序用，Vercel Analytics 真实浏览数据）——
  useEffect(() => {
    let alive = true
    fetch('/api/portal-pv')
      .then(r => r.json())
      .then(d => {
        if (alive && d?.configured && d?.pvMap) setPvMap(d.pvMap)
      })
      .catch(() => {})
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // —— 筛选 + 排序 ——
  const filteredPosts = useMemo(() => {
    let list = posts.filter(p => p.type === 'Post' && p.status === 'Published')
    if (space !== '全部') list = list.filter(p => p.category === space)
    if (style !== '全部') list = list.filter(p => (p['风格'] || []).includes(style))
    if (designer !== '全部') list = list.filter(p => (p['设计师'] || []).includes(designer))
    if (projectLocation !== '全部') list = list.filter(p => (p['项目位置'] || []).includes(projectLocation))
    const min = parseArea(areaMin)
    const max = parseArea(areaMax)
    if (min != null || max != null) {
      list = list.filter(p => {
        const area = parseArea(p['项目面积'])
        if (area == null) return false
        if (min != null && area < min) return false
        if (max != null && area > max) return false
        return true
      })
    }
    if (sort === 'latest') {
      list = [...list].sort((a, b) => (b.publishDate || 0) - (a.publishDate || 0))
    } else if (sort === 'hot') {
      list = [...list].sort((a, b) => (pvMap[b.href] || 0) - (pvMap[a.href] || 0))
    }
    return list
  }, [posts, space, style, designer, projectLocation, areaMin, areaMax, sort, pvMap])

  const hasActiveFilter =
    space !== '全部' || style !== '全部' || designer !== '全部' ||
    projectLocation !== '全部' || areaMin !== '' || areaMax !== '' || sort !== 'latest'

  const resetFilter = () => {
    setSpace('全部'); setStyle('全部'); setDesigner('全部'); setProjectLocation('全部')
    setAreaMin(''); setAreaMax(''); setSort('latest')
    router.replace('/zl', undefined, { shallow: true })
  }

  const clearDesigner = () => {
    setDesigner('全部')
    router.replace('/zl', undefined, { shallow: true })
  }
  const clearLocation = () => {
    setProjectLocation('全部')
    router.replace('/zl', undefined, { shallow: true })
  }

  return (
    <div className='w-full bg-white text-neutral-800'>
      {/* ===== 顶部横幅：自动轮播 ===== */}
      {bannerPosts.length > 0 && (
        <div className='relative w-full h-[46vh] min-h-[280px] overflow-hidden bg-neutral-100'>
          {bannerPosts.map((p, i) => (
            <div
              key={p.id}
              className={`absolute inset-0 transition-opacity duration-700 ${i === bannerIndex ? 'opacity-100' : 'opacity-0'}`}>
              {isPlaceholderCover(p.pageCover) ? (
                <SmartLink href={`/zl${p.href}`}>
                  <div className='w-full h-full bg-gradient-to-br from-neutral-800 via-neutral-800 to-neutral-900 flex items-end'>
                    <div className='text-white p-6 md:p-10 w-full'>
                      <div className='flex items-center gap-2 text-xs md:text-sm tracking-widest mb-2'>
                        <span className='inline-block w-4 h-[3px] bg-[#f0a500]' />
                        <span>{p.category || ''} · {(p['风格'] || []).join('、')}</span>
                      </div>
                      <h2 className='text-xl md:text-3xl font-semibold'>{p.title}</h2>
                    </div>
                  </div>
                </SmartLink>
              ) : (
                <SmartLink href={`/zl${p.href}`}>
                  <img
                    src={p.pageCover || ''}
                    alt={p.title}
                    className='w-full h-full object-cover'
                    loading={i === 0 ? 'eager' : 'lazy'}
                  />
                  <div className='absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent text-white p-6 md:p-10'>
                    <div className='flex items-center gap-2 text-xs md:text-sm tracking-widest mb-2'>
                      <span className='inline-block w-4 h-[3px] bg-[#f0a500]' />
                      <span>{p.category || ''} · {(p['风格'] || []).join('、')}</span>
                    </div>
                    <h2 className='text-xl md:text-3xl font-semibold'>{p.title}</h2>
                  </div>
                </SmartLink>
              )}
            </div>
          ))}
          {/* 轮播指示点 */}
          <div className='absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2'>
            {bannerPosts.map((p, i) => (
              <button
                key={p.id}
                onClick={() => setBannerIndex(i)}
                className={`h-1.5 rounded-full transition-all ${i === bannerIndex ? 'w-6 bg-white' : 'w-2 bg-white/50'}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* ===== 筛选栏 ===== */}
      <div className='max-w-6xl mx-auto px-4 md:px-6 pt-6 pb-2'>
        {/* 当前关联筛选（点击卡片上的设计师/位置标签后显示，可清除） */}
        {(designer !== '全部' || projectLocation !== '全部') && (
          <div className='flex flex-wrap items-center gap-2 mb-3 text-sm'>
            <span className='text-neutral-400 whitespace-nowrap'>当前筛选：</span>
            {designer !== '全部' && (
              <button
                onClick={clearDesigner}
                className='flex items-center gap-1 px-2.5 py-1 rounded-full border border-neutral-200 text-neutral-700 hover:border-neutral-900'>
                设计师：{designer} <span className='text-neutral-400'>×</span>
              </button>
            )}
            {projectLocation !== '全部' && (
              <button
                onClick={clearLocation}
                className='flex items-center gap-1 px-2.5 py-1 rounded-full border border-neutral-200 text-neutral-700 hover:border-neutral-900'>
                位置：{projectLocation} <span className='text-neutral-400'>×</span>
              </button>
            )}
          </div>
        )}

        <div className='flex flex-wrap items-center gap-2 mb-2'>
          <span className='text-sm text-neutral-400 whitespace-nowrap'>空间分类</span>
          <button
            onClick={() => setSpace('全部')}
            className={`px-3 py-1 rounded-full text-sm border ${space === '全部' ? 'bg-neutral-900 text-white border-neutral-900' : 'border-neutral-200 text-neutral-600 hover:border-neutral-900'}`}>
            全部
          </button>
          {categoryOptions.map(c => (
            <button
              key={c.name}
              onClick={() => setSpace(c.name)}
              className={`px-3 py-1 rounded-full text-sm border ${space === c.name ? 'bg-neutral-900 text-white border-neutral-900' : 'border-neutral-200 text-neutral-600 hover:border-neutral-900'}`}>
              {c.name}
            </button>
          ))}
        </div>

        <div className='flex flex-wrap items-center gap-2 mb-2'>
          <span className='text-sm text-neutral-400 whitespace-nowrap'>风格分类</span>
          <button
            onClick={() => setStyle('全部')}
            className={`px-3 py-1 rounded-full text-sm border ${style === '全部' ? 'bg-neutral-900 text-white border-neutral-900' : 'border-neutral-200 text-neutral-600 hover:border-neutral-900'}`}>
            全部
          </button>
          {styleOptions.map(s => (
            <button
              key={s}
              onClick={() => setStyle(s)}
              className={`px-3 py-1 rounded-full text-sm border ${style === s ? 'bg-neutral-900 text-white border-neutral-900' : 'border-neutral-200 text-neutral-600 hover:border-neutral-900'}`}>
              {s}
            </button>
          ))}
        </div>

        {/* 面积区间 + 排序 */}
        <div className='flex flex-wrap items-center gap-3 pt-1 border-t border-neutral-100 mt-1'>
          <span className='text-sm text-neutral-400 whitespace-nowrap'>面积(㎡)</span>
          <input
            value={areaMin}
            onChange={e => setAreaMin(e.target.value)}
            placeholder='最小'
            type='number'
            className='w-20 px-2 py-1 text-sm border border-neutral-200 rounded focus:outline-none focus:border-neutral-900'
          />
          <span className='text-neutral-300'>-</span>
          <input
            value={areaMax}
            onChange={e => setAreaMax(e.target.value)}
            placeholder='最大'
            type='number'
            className='w-20 px-2 py-1 text-sm border border-neutral-200 rounded focus:outline-none focus:border-neutral-900'
          />

          <div className='ml-auto flex items-center gap-1 text-sm'>
            <button
              onClick={() => setSort('latest')}
              className={`px-4 py-1.5 rounded-full ${sort === 'latest' ? 'bg-neutral-900 text-white' : 'text-neutral-500 hover:text-neutral-900'}`}>
              最新
            </button>
            <button
              onClick={() => setSort('hot')}
              className={`px-4 py-1.5 rounded-full ${sort === 'hot' ? 'bg-neutral-900 text-white' : 'text-neutral-500 hover:text-neutral-900'}`}>
              热门
            </button>
            {hasActiveFilter && (
              <button onClick={resetFilter} className='ml-2 text-neutral-400 hover:text-neutral-900 text-sm'>
                清空筛选
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ===== 案例卡片网格 ===== */}
      <div className='max-w-6xl mx-auto px-4 md:px-6 py-6'>
        {filteredPosts.length === 0 ? (
          <div className='text-center text-neutral-400 py-16'>暂无符合条件的案例</div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'>
            {filteredPosts.map(p => (
              <div key={p.id} className='group bg-white overflow-hidden'>
                <SmartLink href={`/zl${p.href}`}>
                  <div className='aspect-[4/3] overflow-hidden bg-neutral-100'>
                    {isPlaceholderCover(p.pageCover) ? (
                      <div className='w-full h-full bg-gradient-to-br from-neutral-700 to-neutral-900 flex items-center justify-center p-4'>
                        <span className='text-white/90 text-lg font-medium leading-snug text-center'>{p.title}</span>
                      </div>
                    ) : (
                      <img
                        src={p.pageCover || ''}
                        alt={p.title}
                        className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
                        loading='lazy'
                      />
                    )}
                  </div>
                </SmartLink>
                <div className='py-3'>
                  <SmartLink href={`/zl${p.href}`}>
                    <div className='text-sm font-medium text-neutral-900 dark:text-white line-clamp-1 hover:text-neutral-600 dark:hover:text-neutral-300'>{p.title}</div>
                  </SmartLink>
                  <div className='mt-1 flex items-center gap-2 text-xs text-neutral-400 dark:text-neutral-300'>
                    {p.category && <span>{p.category}</span>}
                    {(p['风格'] || []).slice(0, 2).map(s => <span key={s}>{s}</span>)}
                    <span className='ml-auto flex items-center gap-2'>
                      {p['设计师']?.[0] && (
                        <SmartLink href={`/zl?designer=${encodeURIComponent(p['设计师'][0])}`} className='hover:text-neutral-900 dark:hover:text-neutral-100'>
                          {p['设计师'][0]}
                        </SmartLink>
                      )}
                      {p['项目位置']?.[0] && (
                        <SmartLink href={`/zl?location=${encodeURIComponent(p['项目位置'][0])}`} className='hover:text-neutral-900 dark:hover:text-neutral-100'>
                          {p['项目位置'][0]}
                        </SmartLink>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default PortalHome
