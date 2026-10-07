import { useMemo } from 'react'

/**
 * 设计流程页组件（/zl/liucheng）
 * 顶部标题（支持公式区块）→ 竖向时间轴（黄色序号+引导线）→ 阶段模块
 * 模块内三列：我做什么 / 阶段成果(绿√) / 您的角色(无√)；阶段时长右上角框（贴阶段名右侧）。
 * 主标题/序号/引导线/前缀/hover 用主题金 #c9a96f；阶段名深色白；列标题 #978d7e。
 * 时长行识别：以"一般用时/一般工时"开头，或纯时长（如 1-3天 / 2-3周）。
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
    // 时长行：以"一般用时/一般工时"开头，或纯时长（1-3天 / 2-3周 等）
    const isDuration = t => /^一般(用|工)时/.test(t) || /^[0-9.]+[~\-—][0-9.]+(天|周|月|小时)?$/.test(t)
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
        type: seg(props['9dB^']),
        isDuration: isDuration(title)
      })
    }

    const map = new Map()
    for (const r of rows) {
      if (!map.has(r.stage)) {
        map.set(r.stage, { stage: r.stage, items: [], duration: null, order: Infinity })
      }
      const g = map.get(r.stage)
      if (r.isDuration) {
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
      {/* 顶部标题：主标题加大 + 主题金 */}
      <div className='text-center mb-12'>
        <h2 className='text-4xl md:text-5xl font-semibold text-[#c9a96f]'>
          {heading.title}
        </h2>
        {heading.subtitle && (
          <p className='mt-4 text-lg text-neutral-500 dark:text-gray-400 max-w-2xl mx-auto'>
            {heading.subtitle}
          </p>
        )}
      </div>

      <div className='relative'>
        {/* 纵向引导线（主题金，窄屏隐藏） */}
        <div className='absolute left-8 top-4 bottom-4 w-px bg-[#c9a96f]/40 dark:bg-[#c9a96f]/50 max-sm:hidden' />

        {data.map((g, i) => (
          <div key={g.stage || i} className={`relative flex gap-6 ${i > 0 ? 'mt-6' : ''}`}>
            {/* 序号（主题金，窄屏隐藏） */}
            <div className='relative z-10 w-16 flex-shrink-0 hidden sm:block'>
              <div className='w-16 h-16 rounded-full bg-[#c9a96f] text-white dark:text-black flex items-center justify-center text-xl font-semibold'>
                {String(i + 1).padStart(2, '0')}
              </div>
            </div>

            {/* 阶段模块 */}
            <div className='dp-module flex-1 min-w-0 rounded-2xl border border-neutral-200/70 dark:border-[#c9a96f]/25 bg-neutral-100/60 dark:bg-[#181818] p-5 md:p-7 transition-all duration-300'>
              {/* 阶段名（深色白）+ 时长框（贴右侧，参考图2） */}
              <div className='flex items-center flex-wrap gap-3'>
                <h3 className='text-2xl font-semibold text-neutral-900 dark:text-white'>
                  {g.stage}
                </h3>
                {g.duration && (
                  <span className='px-2.5 py-1 rounded-md border border-[#c9a96f]/40 text-sm text-neutral-600 dark:text-[#c9a96f] whitespace-nowrap'>
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
                        <span className='text-[#c9a96f] font-medium mr-1.5'>{item.title.split(' ')[0]}</span>
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
                          <span className='text-[#22c55e] mt-0.5'>✓</span>
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
                        <li key={item.id} className='text-sm text-neutral-700 dark:text-[#ece4d3]'>
                          {item.role}
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
