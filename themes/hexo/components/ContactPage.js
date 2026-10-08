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
  const lineColor = 'color-mix(in srgb, var(--theme-color) 40%, transparent)'

  return (
    <div className='w-full'>
      {/* 上横线（主题色细线，全宽，与导航栏和标题区留间距） */}
      <div className='mx-auto max-w-5xl border-t mt-16' style={{ borderColor: lineColor }} />

      {/* 顶部标题区 */}
      <div className='text-center pt-24 md:pt-28 pb-2 px-4'>
        {headings[0] && (
          <h1 className='text-xs font-medium tracking-wide' style={{ color: 'var(--theme-color)' }}>
            {headings[0]}
          </h1>
        )}
        {headings[1] && (
          <h2 className='mt-4 text-[42px] leading-tight font-semibold text-gray-800 dark:text-gray-100'>
            {headings[1]}
          </h2>
        )}
        {headings[2] && (
          <p className='mt-4 text-sm md:text-base text-gray-500 dark:text-gray-400'>
            {headings[2]}
          </p>
        )}
      </div>

      {/* 信息卡片区：三张 256x256 正方形卡片，样式完全复用设计流程页的 dp-module（日间灰底/夜间黑金 + hover 主题色描边） */}
      {columns.length > 0 && (
        <div className='max-w-5xl mx-auto px-4 py-8 flex flex-wrap justify-center items-center gap-6 md:gap-10'>
          {columns.map((col, i) => {
            const title = col[0]?.text || ''
            const content = col[1] // 第 2 行：文本或微信二维码图
            const desc = col[2]?.type === 'text' ? col[2].text : undefined
            const icon = iconFor(title)
            const isImage = content?.type === 'image'
            const text = isImage ? '' : content?.text || ''
            const cardKey = title || i
            return (
              <div key={cardKey} className='dp-module flex flex-col items-center text-center rounded-2xl border w-[256px] h-[256px] p-5'>
                {/* 标题行（固定在卡片顶部）：图标在标题前；均用主题色 */}
                <div className='flex items-center justify-center gap-2 tracking-wider pt-2'>
                  {icon && (
                    <i
                      className={icon}
                      style={{ fontSize: '0.85rem', color: 'var(--theme-color)' }}
                    />
                  )}
                  <h3 className='text-xs font-medium tracking-wider' style={{ color: 'var(--theme-color)' }}>
                    {title}
                  </h3>
                </div>
                {/* 内容区：二维码卡片 flex 居中；号码/邮箱卡片与二维码图片中心对齐（偏移 62px） */}
                <div
                  className={`w-full flex flex-col items-center ${isImage ? 'flex-1 justify-center' : 'justify-start'}`}
                  style={isImage ? undefined : { paddingTop: '62px' }}>
                  {isImage ? (
                    <img
                      src={content.url}
                      alt={title || '二维码'}
                      className='w-28 md:w-32 rounded-md border border-gray-100 dark:border-gray-700 mx-auto'
                    />
                  ) : (
                    <p className='text-xl text-gray-700 dark:text-gray-300 break-all tracking-wide leading-relaxed'>
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
                    <p className='mt-3 text-xs text-gray-400 dark:text-gray-500 tracking-wider leading-relaxed'>{desc}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 下横线（主题色细线，全宽，与内容留三段换行） */}
      <div className='mx-auto max-w-5xl border-t mt-24 mb-4' style={{ borderColor: lineColor }} />
    </div>
  )
}

export default ContactPage
