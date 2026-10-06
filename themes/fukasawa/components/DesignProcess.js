import { useMemo, useState } from 'react'

/**
 * 设计流程页组件（/zl/liucheng）
 * 参考 Jamie Budesky 风格：阶段编号导航 + 子项卡片 + 用时徽章
 * 数据完全动态读取 Notion「设计流程」数据库，不写死阶段名/项目/用时，
 * 在 Notion 中增删调整后页面自动跟随。
 */
const DesignProcess = ({ post }) => {
  const [active, setActive] = useState(0)

  // —— 从 post.blockMap 解析「设计流程」数据库的行数据 ——
  const data = useMemo(() => {
    if (!post || !post.blockMap) return []
    const bm = post.blockMap
    const blocks = bm.block || {}
    const cqs = bm.collection_query || {}

    // 1) 汇总所有视图返回的行 ID（去重，保持 Notion 视图顺序）
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
      // 字段 id 对应「设计流程」数据库 schema（阶段 multi_select / 标准用时 / 最少用时 / 已完成 / 类型）
      rows.push({
        id,
        title,
        stage: seg(props['l@l7']),
        std: num(props['444854a0-b674-4712-acdd-96d27fa106e3']),
        min: num(props['55868121-bcb9-4739-b465-042507d7f4ca']),
        done: seg(props['igjs']),
        type: seg(props['9dB^'])
      })
    }

    // 3) 按阶段分组（保持视图顺序）；「一般用时X」行作为阶段用时徽章
    const groups = []
    const map = new Map()
    for (const r of rows) {
      if (!map.has(r.stage)) {
        map.set(r.stage, { stage: r.stage, items: [], duration: null })
        groups.push(map.get(r.stage))
      }
      const g = map.get(r.stage)
      if (r.title.indexOf('一般用时') === 0) {
        g.duration = r.title
      } else {
        g.items.push(r)
      }
    }
    return groups
  }, [post])

  if (!data || data.length === 0) return null
  const current = data[Math.min(active, data.length - 1)]

  return (
    <div className='w-full'>
      {/* 阶段编号导航 */}
      <div className='flex flex-nowrap md:flex-wrap gap-2 md:gap-3 overflow-x-auto pb-2 md:pb-0 scroll-hidden'>
        {data.map((g, i) => {
          const on = i === active
          return (
            <button
              key={g.stage || i}
              onClick={() => setActive(i)}
              className={`flex-shrink-0 px-4 py-2 rounded-full border text-sm transition-colors ${
                on
                  ? 'bg-[#f0a500] border-[#f0a500] text-white'
                  : 'border-neutral-200 text-neutral-600 hover:border-[#f0a500] hover:text-[#f0a500]'
              }`}>
              <span className={`mr-1.5 font-semibold ${on ? 'text-white/80' : 'text-[#f0a500]'}`}>
                {String(i + 1).padStart(2, '0')}
              </span>
              {g.stage}
            </button>
          )
        })}
      </div>

      {/* 当前阶段标题 + 用时徽章 */}
      <div className='mt-6 mb-4 flex items-center gap-3 flex-wrap'>
        <h3 className='text-xl font-semibold text-neutral-900 dark:text-gray-100'>
          {String(active + 1).padStart(2, '0')} · {current.stage}
        </h3>
        {current.duration && (
          <span className='text-xs px-3 py-1 rounded-full bg-[#f0a500]/10 border border-[#f0a500]/30 text-[#b88000] dark:text-[#f0a500]'>
            {current.duration}
          </span>
        )}
      </div>

      {/* 子项卡片网格 */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
        {current.items.map(item => (
          <div
            key={item.id}
            className='border border-neutral-100 dark:border-gray-700 rounded-lg p-4 bg-neutral-50 dark:bg-gray-800 hover:border-[#f0a500]/60 hover:shadow-sm transition-colors'>
            <div className='flex items-baseline justify-between gap-2'>
              <span className='text-[#f0a500] font-semibold text-sm whitespace-nowrap'>
                {item.title.split(' ')[0]}
              </span>
              {item.type && (
                <span className='text-[10px] px-1.5 py-0.5 rounded bg-neutral-200/60 dark:bg-gray-700 text-neutral-500 dark:text-gray-300'>
                  {item.type}
                </span>
              )}
            </div>
            <p className='mt-1 text-neutral-800 dark:text-gray-100 font-medium'>
              {item.title.split(' ').slice(1).join(' ')}
            </p>
            {item.std != null && (
              <p className='mt-2 text-xs text-neutral-500 dark:text-gray-400'>
                用时 {item.min != null && item.min !== item.std ? `${item.min}–${item.std} 天` : `${item.std} 天`}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default DesignProcess
