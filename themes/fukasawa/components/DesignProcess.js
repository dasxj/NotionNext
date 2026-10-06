import { useMemo } from 'react'

/**
 * 设计流程页组件（/zl/liucheng）
 * 布局：顶部标题（主标题+副标题，均读 Notion 页面块）→ 竖向时间轴（左侧序号+纵向引导线）→ 右侧阶段模块
 * 每个模块内分三列：我做什么 / 阶段成果 / 您的角色（阶段成果、您的角色来自 Notion 新增列）
 * 阶段用时加框徽章；模块灰底圆角，hover 金色细边（无光晕）。
 * 数据完全动态读取 Notion「设计流程」数据库，不写死内容。阶段顺序按标题数字前缀排序。
 */
const DesignProcess = ({ post }) => {
  // —— 标题与副标题：读 Notion 页面根块的 header / sub_sub_header ——
  const heading = useMemo(() => {
    let title = post?.title || '设计流程'
    let subtitle = ''
    if (post?.blockMap?.block?.[post?.id]) {
      const root = post.blockMap.block[post.id].value
      const content = root?.content || []
      for (const cid of content) {
        const b = post.blockMap.block[cid]
        if (!b) continue
        const v = b.value
        const seg = (v?.properties?.title || []).map(s => (s && s[0]) || '').join('')
        if (v.type === 'header' && seg) title = seg
        else if (v.type === 'sub_sub_header' && seg) subtitle = seg
      }
    }
    return { title, subtitle }
  }, [post])

  // —— 从 post.blockMap 解析「设计流程」数据库的行数据 ——
  const data = useMemo(() => {
    if (!post || !post.blockMap) return []
    const bm = post.blockMap
    const blocks = bm.block || {}
    const cqs = bm.collection_query || {}

    let ids = []
    for (const dbid in cqs) {
      const views = cqs[dbid] || {}
      for (const vid in views) {
        const cgr = (views[vid] || {}).collection_group_results || {}
        ids = ids.concat(cgr.blockIds || [])
      }
    }
    ids = [...new Set(ids)]

    const seg = v => {
      if (!v) return ''
      if (Array.isArray(v[0])) return v.map(s => (s && s[0]) || '').join('')
      return v[0] || ''
    }
    const num = v => {
      const s = seg(v)
      return s === '' ? null : Number(s)
    }
    const rows = []
    for (const id of ids) {
      const b = blocks[id]
      if (!b) continue
      const props = (b.value || {}).properties || {}
      const title = seg(props.title)
      if (!title) continue
      const m = /^(\d+)\./.exec(title)
      rows.push({
        id,
        title,
        order: m ? parseInt(m[1]) : null,
        stage: seg(props['l@l7']),
        outcome: seg(props['Kqqy']), // 阶段成果
        role: seg(props['Re_b']), // 您的角色
        std: num(props['444854a0-b674-4712-acdd-96d27fa106e3']),
        min: num(props['55868121-bcb9-4739-b465-042507d7f4ca']),
        type: seg(props['9dB^'])
      })
    }

    const map = new Map()
    for (const r of rows) {
      if (!map.has(r.stage)) {
        map.set(r.stage, { stage: r.stage, items: [], duration: null, order: Infinity })
      }
      const g = map.get(r.stage)
      if (r.title.indexOf('一般用时') === 0) {
        g.duration = r.title
      } else {
        g.items.push(r)
        if (r.order != null && r.order < g.order) g.order = r.order
      }
    }
    return [...map.values()].sort((a, b) => a.order - b.order)
  }, [post])

  if (!data || data.length === 0) return null

  return (
    <div className='w-full'>
      {/* 顶部标题：主标题 + 副标题（读 Notion） */}
      <div className='text-center mb-12'>
        <h2 className='text-3xl md:text-4xl font-semibold text-neutral-900 dark:text-[#f0a500]'>
          {heading.title}
        </h2>
        {heading.subtitle && (
          <p className='mt-3 text-neutral-500 dark:text-[#c9a55c] max-w-2xl mx-auto'>
            {heading.subtitle}
          </p>
        )}
      </div>

      <div className='relative'>
        {/* 纵向引导线（细金色） */}
        <div className='absolute left-8 top-4 bottom-4 w-px bg-[#f0a500]/40 dark:bg-[#f0a500]/50' />

        {data.map((g, i) => (
          <div key={g.stage || i} className={`relative flex gap-6 ${i > 0 ? 'mt-6' : ''}`}>
            {/* 黄色圆形序号（文字用背景色） */}
            <div className='relative z-10 w-16 flex-shrink-0'>
              <div className='w-16 h-16 rounded-full bg-[#f0a500] text-white dark:text-black flex items-center justify-center text-xl font-semibold'>
                {String(i + 1).padStart(2, '0')}
              </div>
            </div>

            {/* 右侧阶段模块：灰底圆角，hover 金色细边 */}
            <div className='flex-1 min-w-0 rounded-2xl border border-neutral-200/70 dark:border-[#f0a500]/25 bg-neutral-100/60 dark:bg-[#181818] p-5 md:p-7 transition-all duration-300 hover:border-[#f0a500]'>
              <div className='flex items-center justify-between flex-wrap gap-2'>
                <h3 className='text-2xl font-semibold text-neutral-900 dark:text-[#d4b36a]'>
                  {g.stage}
                </h3>
                {g.duration && (
                  <span className='px-2.5 py-1 rounded-md border border-[#f0a500]/40 text-sm text-[#b88000] dark:text-[#f0a500] whitespace-nowrap'>
                    {g.duration}
                  </span>
                )}
              </div>

              {/* 三列：我做什么 / 阶段成果 / 您的角色 */}
              <div className='mt-5 grid grid-cols-1 md:grid-cols-3 gap-6'>
                <div>
                  <h4 className='text-sm font-semibold text-neutral-900 dark:text-[#f0a500] mb-2'>我做什么</h4>
                  <ul className='space-y-2'>
                    {g.items.map(item => (
                      <li key={item.id} className='text-sm text-neutral-700 dark:text-[#ece4d3]'>
                        <span className='text-[#f0a500] font-medium mr-1.5'>{item.title.split(' ')[0]}</span>
                        <span>{item.title.split(' ').slice(1).join(' ')}</span>
                        {item.type && (
                          <span className='ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-neutral-200/60 dark:bg-[#242424] text-neutral-500 dark:text-[#c9a55c] align-middle'>{item.type}</span>
                        )}
                        {item.std != null && (
                          <span className='ml-2 px-1.5 py-0.5 rounded-md border border-neutral-300 dark:border-[#f0a500]/35 text-xs text-neutral-500 dark:text-[#c9a55c] whitespace-nowrap'>
                            {item.min != null && item.min !== item.std ? `${item.min}–${item.std}天` : `${item.std}天`}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className='text-sm font-semibold text-neutral-900 dark:text-[#f0a500] mb-2'>阶段成果</h4>
                  <ul className='space-y-2'>
                    {g.items.map(item => (
                      item.outcome && <li key={item.id} className='text-sm text-neutral-700 dark:text-[#ece4d3]'>{item.outcome}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className='text-sm font-semibold text-neutral-900 dark:text-[#f0a500] mb-2'>您的角色</h4>
                  <ul className='space-y-2'>
                    {g.items.map(item => (
                      item.role && <li key={item.id} className='text-sm text-neutral-700 dark:text-[#ece4d3]'>{item.role}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DesignProcess
