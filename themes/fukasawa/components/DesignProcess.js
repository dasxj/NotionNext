import { useMemo } from 'react'

/**
 * 设计流程页组件（/zl/liucheng）
 * 参考 Jamie Budesky「我们如何合作」样式：全部阶段纵向展示在一页，
 * 每阶段 = 黄色圆形序号 + 阶段名 + 用时徽章 + 子项列表。
 * 数据完全动态读取 Notion「设计流程」数据库，不写死阶段名/项目/用时，
 * 在 Notion 中增删调整后页面自动跟随。
 */
const DesignProcess = ({ post }) => {
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
      // 字段 id 对应「设计流程」数据库 schema
      rows.push({
        id,
        title,
        stage: seg(props['l@l7']),
        std: num(props['444854a0-b674-4712-acdd-96d27fa106e3']),
        min: num(props['55868121-bcb9-4739-b465-042507d7f4ca']),
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

  return (
    <div className='w-full'>
      {data.map((g, i) => (
        <div
          key={g.stage || i}
          className={`py-8 ${i > 0 ? 'border-t border-neutral-100 dark:border-gray-700' : ''} last:pb-2`}>
          <div className='flex items-start gap-5'>
            {/* 黄色圆形序号 */}
            <div className='w-12 h-12 rounded-full bg-[#f0a500] text-white flex items-center justify-center text-lg font-semibold flex-shrink-0'>
              {String(i + 1).padStart(2, '0')}
            </div>

            <div className='flex-1 min-w-0'>
              {/* 阶段名 + 用时 */}
              <div className='flex items-center justify-between flex-wrap gap-2'>
                <h3 className='text-2xl font-semibold text-neutral-900 dark:text-gray-100'>
                  {g.stage}
                </h3>
                {g.duration && (
                  <span className='text-sm text-neutral-500 dark:text-gray-400 whitespace-nowrap'>
                    {g.duration}
                  </span>
                )}
              </div>

              {/* 子项列表 */}
              <div className='mt-4'>
                {g.items.map(item => (
                  <div
                    key={item.id}
                    className='flex items-baseline justify-between gap-3 py-2.5 border-b border-dashed border-neutral-100 dark:border-gray-700 last:border-0'>
                    <span className='text-neutral-800 dark:text-gray-200'>
                      <span className='text-[#f0a500] font-medium mr-2 whitespace-nowrap'>
                        {item.title.split(' ')[0]}
                      </span>
                      {item.title.split(' ').slice(1).join(' ')}
                      {item.type && (
                        <span className='ml-2 text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-gray-700 text-neutral-400 dark:text-gray-400 align-middle'>
                          {item.type}
                        </span>
                      )}
                    </span>
                    <span className='text-sm text-neutral-500 dark:text-gray-400 whitespace-nowrap'>
                      {item.std != null
                        ? item.min != null && item.min !== item.std
                          ? `${item.min}–${item.std}天`
                          : `${item.std}天`
                        : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default DesignProcess
