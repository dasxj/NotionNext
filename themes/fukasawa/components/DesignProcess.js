import { useMemo } from 'react'

/**
 * 设计流程页组件（/zl/liucheng）
 * 布局：顶部居中标题 → 竖向时间轴（左侧序号 + 纵向引导线）→ 右侧阶段模块
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
      {/* 顶部居中标题（参考图2：主标题 + 副标题） */}
      <div className='text-center mb-12'>
        <h2 className='text-3xl md:text-4xl font-semibold text-neutral-900 dark:text-[#f0a500]'>
          {post?.title || '设计流程'}
        </h2>
        <p className='mt-3 text-neutral-500 dark:text-[#c9a55c] max-w-xl mx-auto'>
          从前期沟通到项目交付，每一步流程清晰透明、全程可参与。
        </p>
      </div>

      <div className='relative'>
        {/* 纵向引导线（细金色，覆盖在序号列中心） */}
        <div className='absolute left-8 top-4 bottom-4 w-px bg-[#f0a500]/40 dark:bg-[#f0a500]/50' />

        {data.map((g, i) => (
          <div key={g.stage || i} className={`relative flex gap-6 ${i > 0 ? 'mt-6' : ''}`}>
            {/* 黄色圆形序号（覆盖在引导线上，文字用背景色） */}
            <div className='relative z-10 w-16 flex-shrink-0'>
              <div className='w-16 h-16 rounded-full bg-[#f0a500] text-white dark:text-black flex items-center justify-center text-xl font-semibold'>
                {String(i + 1).padStart(2, '0')}
              </div>
            </div>

            {/* 右侧阶段模块：灰底圆角，hover 金色细边（无光晕） */}
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
          </div>
        ))}
      </div>
    </div>
  )
}

export default DesignProcess
