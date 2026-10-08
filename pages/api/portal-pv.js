/**
 * 资料库热门排序数据源：Vercel Web Analytics 各页面真实浏览量
 * 环境变量（在 Vercel 项目设置里配置）：
 *   VERCEL_TOKEN      - Vercel API Token（Settings -> Tokens 生成）
 *   VERCEL_PROJECT_ID - Vercel 项目 ID（Settings -> General -> Project ID）
 *   VERCEL_TEAM_ID    - 可选，项目属于 Team/组织时需要（Settings -> General 里能看到）
 * 未配置时返回 { configured: false }，前端热门排序保持原始顺序，不影响其它功能。
 */
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300')

  const token = process.env.VERCEL_TOKEN
  const projectId = process.env.VERCEL_PROJECT_ID
  if (!token || !projectId) {
    return res.status(200).json({ configured: false })
  }

  // 最近 30 天
  const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const to = new Date().toISOString()
  const teamId = process.env.VERCEL_TEAM_ID
  // 按页面路径(requestPath)维度聚合浏览量
  const url =
    `https://api.vercel.com/v1/query/web-analytics/visits/aggregate?` +
    `projectId=${encodeURIComponent(projectId)}` +
    `&by=requestPath` +
    `&since=${encodeURIComponent(from)}&until=${encodeURIComponent(to)}` +
    `&limit=100` +
    (teamId ? `&teamId=${encodeURIComponent(teamId)}` : '')

  try {
    const r = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!r.ok) {
      const detail = await r.text().catch(() => '')
      return res
        .status(200)
        .json({ configured: true, error: `http-${r.status}`, detail: detail.slice(0, 300) })
    }
    const data = await r.json()

    // 兼容解析：找出 { requestPath, pageviews } 数组
    let rows = Array.isArray(data) ? data : data?.data || data?.rows || []
    if (Array.isArray(data?.result)) rows = data.result
    const pvMap = {}
    rows.forEach(row => {
      const path = row?.requestPath || row?.path || row?.page || row?.url
      const views =
        row?.pageviews ?? row?.views ?? row?.count ?? row?.pv ?? row?.viewCount ?? row?.visits ?? 0
      if (path && views != null) {
        pvMap[path] = Number(views) || 0
      }
    })
    return res.status(200).json({ configured: true, pvMap })
  } catch (e) {
    return res.status(200).json({ configured: true, error: String(e) })
  }
}
