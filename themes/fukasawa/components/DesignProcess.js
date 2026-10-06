import { useMemo } from 'react'

/**
 * 设计流程页组件（/zl/liucheng）
 * 布局：顶部居中标题 → 横向阶段步骤条（01–06，箭头）→ 全部阶段纵向模块
 * 每个模块：阶段名 + 用时加框徽章 + 子项列表；模块灰底圆角，hover 金色细边（无光晕）。
 * 数据完全动态读取 Notion「设计流程」数据库，不写死阶段名/项目/用时。
 * 阶段顺序按项目标题的数字前缀（1.x/2.x/…）排序。
 */
const DesignProcess = ({ post }) => {
  // —— 从 post.blockMap 解析「设计流程」数据库的行数据 ——
  const data = useMemo(() => {
    if (!post || !post.blockMap) return []
    const bm = post.blockMap
    const blocks = bm.block || {}
    const cqs = bm.collection_query || {}

    // 1) 汇总所有视图返回的行 ID（去重）
    let ids = []
    for (const dbid in cqs) {
      const views = cqs[dbid] || {}
      for (const vid in views) {
        const cgr = (views[vid] || {}).collection_group_results || {}
        ids = ids.concat(cgr.blockIds || [])
      }
    }
    ids = [...new Set(ids)]

    // 2) 读取每一行字段
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
        std: num(props['444854a0-b674-4712-acdd-96d27fa106e3']),
        min: num(props['55868121-bcb9-4739-b465-042507d7f4ca']),
        type: seg(props['9dB^'])
      })
    }

    // 3) 按阶段分组；「一般用时X」行作为阶段用时徽章
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
    // 4) 按阶段顺序（标题前缀数字）排序
    const groups = [...map.values()].sort((a, b) => a.order - b.order)
    return groups
  }, [post])

  if (!data || data.length === 0) return null

  return (
    <div className='w-full'>
      {/* 顶部居中标题（参考图2） */}
      <div className='text-center mb-10'>
        <h2 className='text-3xl md:text-4xl font-semibold text-neutral-900 dark:text-[#f0a500]'>
          {post?.title || '设计流程'}
        </h2>
        <p className='mt-3 text-neutral-500 dark:text-[#c9a55c] max-w-xl mx-auto'>
          从前期沟通到项目交付，每一步流程清晰透明、全程可参与。
        </p>
      </div>

      {/* 横向阶段步骤条（01–06，箭头衔接） */}
      <div className='flex flex-nowrap md:flex-wrap items-center gap-2 md:gap-3 overflow-x-auto pb-3 scroll-hidden mb-8'>
        {data.map((g, i) => (
          <div key={g.stage || i} className='flex items-center flex-shrink-0'>
            {i > 0 && <span className='mx-0.5 text-[#f0a500]' aria-hidden>→</span>}
            <div className='flex items-center gap-2'>
              <span className='w-9 h-9 rounded-full bg-[#f0a500] text-white dark:text-black flex items-center justify-center text-sm font-semibold'>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className='text-sm font-medium text-neutral-700 dark:text-[#d4b36a] whitespace-nowrap'>
                {g.stage}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 全部阶段纵向模块 */}
      {data.map((g, i) => (
        <div
          key={g.stage || i}
          className='rounded-2xl border border-neutral-100 dark:border-[#f0a500]/25 bg-neutral-100/60 dark:bg-[#181818] p-5 md:p-7 mb-6 transition-colors duration-300 hover:border-[#f0a500]/70'>
          <div className='flex items-center justify-between flex-wrap gap-2'>
            <div className='flex items-center gap-3'>
              <span className='text-[#f0a500] font-semibold text-lg'>
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className='text-xl font-semibold text-neutral-900 dark:text-[#d4b36a]'>
                {g.stage}
              </h3>
            </div>
            {g.duration && (
              <span className='px-2.5 py-1 rounded-md border border-[#f0a500]/40 text-xs text-[#b88000] dark:text-[#f0a500] whitespace-nowrap'>
                {g.duration}
              </span>
            )}
          </div>

          {/* 子项列表 */}
          <div className='mt-4'>
            {g.items.map(item => (
              <div
                key={item.id}
                className='flex items-baseline justify-between gap-3 py-2.5 border-b border-dashed border-neutral-200 dark:border-[#f0a500]/15 last:border-0'>
                <span className='text-neutral-800 dark:text-[#ece4d3]'>
                  <span className='text-[#f0a500] font-medium mr-2 whitespace-nowrap'>
                    {item.title.split(' ')[0]}
                  </span>
                  {item.title.split(' ').slice(1).join(' ')}
                  {item.type && (
                    <span className='ml-2 text-[10px] px-1.5 py-0.5 rounded bg-neutral-200/60 dark:bg-[#242424] text-neutral-500 dark:text-[#c9a55c] align-middle'>
                      {item.type}
                    </span>
                  )}
                </span>
                {item.std != null && (
                  <span className='px-2 py-0.5 rounded-md border border-neutral-300 dark:border-[#f0a500]/35 text-xs text-neutral-500 dark:text-[#c9a55c] whitespace-nowrap'>
                    {item.min != null && item.min !== item.std
                      ? `${item.min}–${item.std}天`
                      : `${item.std}天`}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default DesignProcess
