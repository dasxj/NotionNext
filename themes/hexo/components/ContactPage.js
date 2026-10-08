/**
 * 联系页定制组件（slug=lianxi）
 * 数据完全来自 Notion 联系页 blockMap：
 *  - 顶部 equation 块 → 大标题 / 副标题 / 引导语（按序取前 3 行）
 *  - column_list → 每列一张信息卡片：第 1 行=标题，第 2 行=内容（文本或微信二维码图），第 3 行=说明（可选，Notion 里加一行即显示）
 * 样式参考容大设计联系页：顶部居中标题 + 横排信息卡片；跟随全站日间/夜间主题
 *  （夜间黑金、日间浅色+主题色描边），hover 描主题色细边
 */

// 提取 Notion equation 里的纯文本，如 "\\huge\\text{联系我们}" -> "联系我们"
const extractLaTeX = t => {
  if (!t) return ''
  const re = /\\[a-zA-Z]+\{([^{}]*)\}/g
  const parts = []
  let m
  while ((m = re.exec(t))) parts.push(m[1])
  if (parts.length) return parts.join('')
  return t.replace(/\\[a-zA-Z]+\{/g, '').replace(/[{}]/g, '')
}

// 标题关键词 → FontAwesome 图标
const iconFor = title => {
  const t = (title || '').toLowerCase()
  if (t.includes('电话') || t.includes('手机') || t.includes('tel')) return 'fa-solid fa-phone'
  if (t.includes('微信') || t.includes('wechat')) return 'fa-brands fa-weixin'
  if (t.includes('whatsapp')) return 'fa-brands fa-whatsapp'
  if (t.includes('邮箱') || t.includes('mail') || t.includes('email')) return 'fa-solid fa-envelope'
  if (t.includes('地址') || t.includes('位置')) return 'fa-solid fa-location-dot'
  return 'fa-solid fa-circle-info'
}

// 解析 blockMap：返回 { headings: [], columns: [[{type,text|url},...], ...] }
const parseContact = blockMap => {
  const headings = []
  const columns = []
  if (!blockMap || !blockMap.block) return { headings, columns }
  const block = blockMap.block
  for (const id in block) {
    const val = block[id]?.value
    if (!val) continue
    if (val.type === 'equation') {
      const t = val.properties?.title?.[0]?.[0] || ''
      const txt = extractLaTeX(t)
      if (txt && headings.length < 3) headings.push(txt)
    }
    if (val.type === 'column_list') {
      for (const cid of val.content || []) {
        const col = block[cid]?.value
        if (!col || col.type !== 'column') continue
        const rows = []
        for (const bid of col.content || []) {
          const bv = block[bid]?.value
          if (!bv) continue
          if (bv.type === 'text') {
            const t = (bv.properties?.title?.[0]?.[0] || '').trim()
            if (t) rows.push({ type: 'text', text: t })
          } else if (bv.type === 'image') {
            const url = blockMap.signed_urls?.[bid]
            if (url) rows.push({ type: 'image', url })
          }
        }
        if (rows.length) columns.push(rows)
      }
    }
  }
  return { headings, columns }
}

const ContactPage = ({ post }) => {
  const { headings, columns } = parseContact(post?.blockMap)

  return (
    <div className='w-full'>
      {/* 顶部标题区 */}
      <div className='text-center pt-10 pb-8 md:pt-16 md:pb-12 px-4'>
        {headings[0] && (
          <h1 className='text-3xl md:text-5xl font-bold tracking-wide' style={{ color: 'var(--theme-color)' }}>
            {headings[0]}
          </h1>
        )}
        {headings[1] && (
          <h2 className='mt-3 text-xl md:text-2xl text-gray-700 dark:text-gray-200'>
            {headings[1]}
          </h2>
        )}
        {headings[2] && (
          <p className='mt-4 text-sm md:text-base text-gray-500 dark:text-gray-400'>
            {headings[2]}
          </p>
        )}
      </div>

      {/* 信息卡片区 */}
      {columns.length > 0 && (
        <div
          className={`grid gap-5 md:gap-8 max-w-5xl mx-auto px-4 pb-16 ${
            columns.length === 1
              ? 'grid-cols-1'
              : columns.length === 2
                ? 'grid-cols-1 md:grid-cols-2'
                : 'grid-cols-1 md:grid-cols-3'
          }`}>
          {columns.map((col, i) => {
            const title = col[0]?.text || ''
            const content = col[1] // 第 2 行：文本或微信二维码图
            const desc = col[2]?.type === 'text' ? col[2].text : undefined
            const icon = iconFor(title)
            const isImage = content?.type === 'image'
            const text = isImage ? '' : content?.text || ''
            const cardKey = title || i
            return (
              <div
                key={cardKey}
                className='group relative rounded-xl p-6 md:p-8 transition-all duration-300 bg-white dark:bg-[#161616] border border-gray-200 dark:border-[#2b2b2b] hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/40'
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--theme-color)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '')}>
                {/* 图标 */}
                <div
                  className='w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-lg md:text-xl'
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--theme-color) 14%, transparent)',
                    color: 'var(--theme-color)'
                  }}>
                  <i className={icon} />
                </div>
                <h3 className='mt-4 text-lg font-semibold text-gray-800 dark:text-gray-100'>
                  {title}
                </h3>
                {/* 内容 */}
                {isImage ? (
                  <img
                    src={content.url}
                    alt={title || '二维码'}
                    className='mt-3 w-32 md:w-36 rounded-lg border border-gray-100 dark:border-gray-700'
                  />
                ) : (
                  <p className='mt-2 text-base md:text-lg text-gray-700 dark:text-gray-300 break-all'>
                    {title.includes('电话') || title.includes('手机') ? (
                      <a
                        href={`tel:${text.replace(/[^\d+]/g, '')}`}
                        className='hover:opacity-80 transition-opacity'>
                        {text}
                      </a>
                    ) : title.includes('邮箱') || title.includes('mail') ? (
                      <a
                        href={`mailto:${text.trim()}`}
                        className='hover:opacity-80 transition-opacity'>
                        {text}
                      </a>
                    ) : (
                      text
                    )}
                  </p>
                )}
                {/* 说明文字（Notion 列内第 3 行，可选） */}
                {desc && (
                  <p className='mt-2 text-sm text-gray-400 dark:text-gray-500'>{desc}</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ContactPage
