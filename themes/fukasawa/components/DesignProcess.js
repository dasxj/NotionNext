import { useMemo } from 'react'

/**
 * 设计流程页组件（/zl/liucheng）
 * 顶部标题（主标题+副标题，支持 Notion 公式区块 equation 与 header/sub_*）
 * → 竖向时间轴（左侧序号，窄屏隐藏 + 纵向引导线）→ 右侧阶段模块（内容限宽）
 * 模块内三列：我做什么 / 阶段成果(前加绿√) / 您的角色；阶段用时右上角矩形框。
 * 强调色统一 #978d7e；模块 hover 描 #978d7e 细边（CSS 实现）。
 * 数据完全动态读取 Notion「设计流程」数据库。阶段顺序按标题数字前缀排序。
 */
const DesignProcess = ({ post }) => {
  // —— 标题与副标题：读 Notion 页面根块的 equation / header ——
  const heading = useMemo(() => {
    let title = ''
    let subtitle = ''
    if (post?.blockMap?.block?.[post?.id]) {
      const root = post.blockMap.block[post.id].value
      for (const cid of root?.content || []) {
        const b = post.blockMap.block[cid]
        if (!b) continue
        const v = b.value
        const segs = v?.properties?.title || []
        let raw = segs.map(s => (s && s[0]) || '').join('')
        const eq = /\\text\{([^}]*)\}/.exec(raw)
        if (eq) raw = eq[1]
        const t = raw.trim()
        if (!t) continue
        if (['equation', 'header', 'sub_header', 'sub_sub_header'].includes(v.type)) {
          if (!title) title = t
          else if (!subtitle) subtitle = t
        }
      }
    }
    return { title: title || post?.title || '设计流程', subtitle }
  }, [post])

  // —— 解析「设计流程」数据库 ——
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
    const rows = []
    for (const id of ids) {
      const b = blocks[id]
      if (!b) continue
      const props = (b.value || {}).properties || {}
      const title = seg(props.title)
      if (!title) continue
      const m = /^(\d+)\./.exec(title)
      rows.push({
        id, title,
        order: m ? parseInt(m[1]) : null,
        stage: seg(props['l@l7']),
        outcome: seg(props['Kqqy']),
        role: seg(props['Re_b']),
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
    <div className='w-full max-w-4xl mx-auto'>
      {/* 顶部标题 */}
      <div className='text-center mb-12'>
        <h2 className='text-3xl md:text-4xl font-semibold text-neutral-900 dark:text-[#978d7e]'>
          {heading.title}
        </h2>
        {heading.subtitle && (
          <p className='mt-3 text-neutral-500 dark:text-[#978d7e] max-w-2xl mx-auto'>
            {heading.subtitle}
          </p>
        )}
      </div>

      <div className='relative'>
        {/* 纵向引导线（窄屏隐藏） */}
        <div className='absolute left-8 top-4 bottom-4 w-px bg-[#978d7e]/40 dark:bg-[#978d7e]/50 max-sm:hidden' />

        {data.map((g, i) => (
          <div key={g.stage || i} className={`relative flex gap-6 ${i > 0 ? 'mt-6' : ''}`}>
            {/* 序号（窄屏隐藏） */}
            <div className='relative z-10 w-16 flex-shrink-0 hidden sm:block'>
              <div className='w-16 h-16 rounded-full bg-[#978d7e] text-white dark:text-black flex items-center justify-center text-xl font-semibold'>
                {String(i + 1).padStart(2, '0')}
              </div>
            </div>

            {/* 阶段模块：hover 描 #978d7e 细边（dp-module 由 style.js 实现） */}
            <div className='dp-module flex-1 min-w-0 rounded-2xl border border-neutral-200/70 dark:border-[#978d7e]/25 bg-neutral-100/60 dark:bg-[#181818] p-5 md:p-7 transition-all duration-300'>
              <div className='flex items-center justify-between flex-wrap gap-2'>
                <h3 className='text-2xl font-semibold text-neutral-900 dark:text-[#978d7e]'>
                  {g.stage}
                </h3>
                {g.duration && (
                  <span className='px-2.5 py-1 rounded-md border border-[#978d7e]/40 text-sm text-neutral-600 dark:text-[#978d7e] whitespace-nowrap'>
                    {g.duration}
                  </span>
                )}
              </div>

              {/* 三列 */}
              <div className='mt-5 grid grid-cols-1 md:grid-cols-3 gap-6'>
                <div>
                  <h4 className='text-sm font-semibold text-neutral-900 dark:text-[#978d7e] mb-2'>我做什么</h4>
                  <ul className='space-y-2'>
                    {g.items.map(item => (
                      <li key={item.id} className='text-sm text-neutral-700 dark:text-[#ece4d3]'>
                        <span className='text-[#978d7e] font-medium mr-1.5'>{item.title.split(' ')[0]}</span>
                        <span>{item.title.split(' ').slice(1).join(' ')}</span>
                        {item.type && (
                          <span className='ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-neutral-200/60 dark:bg-[#242424] text-neutral-500 dark:text-[#978d7e] align-middle'>{item.type}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className='text-sm font-semibold text-neutral-900 dark:text-[#978d7e] mb-2'>阶段成果</h4>
                  <ul className='space-y-2'>
                    {g.items.map(item => (
                      item.outcome && (
                        <li key={item.id} className='text-sm text-neutral-700 dark:text-[#ece4d3] flex items-start gap-1.5'>
                          <span className='text-green-500 mt-0.5'>✓</span>
                          <span>{item.outcome}</span>
                        </li>
                      )
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className='text-sm font-semibold text-neutral-900 dark:text-[#978d7e] mb-2'>您的角色</h4>
                  <ul className='space-y-2'>
                    {g.items.map(item => (
                      item.role && (
                        <li key={item.id} className='text-sm text-neutral-700 dark:text-[#ece4d3] flex items-start gap-1.5'>
                          <span className='text-green-500 mt-0.5'>✓</span>
                          <span>{item.role}</span>
                        </li>
                      )
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
