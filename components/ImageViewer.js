import { useEffect, useRef, useState } from 'react'
import { compressImage } from '@/lib/db/notion/mapImage'

/**
 * 全屏图片查看器：替换 medium-zoom
 * - 点击正文内可放大图片 → 全屏查看
 * - 鼠标滚轮：跟随鼠标位置缩放
 * - 长按鼠标中键拖动：平移图片位置
 * - 左右方向键：按顺序切换同文章的所有图片
 * - Esc / 点击背景：关闭
 * 挂在 NotionPage 外层，通过事件委托捕获正文内 img 点击。
 */
const ImageViewer = () => {
  const [state, setState] = useState({
    open: false,
    list: [],
    index: -1,
    scale: 1,
    origin: { x: 50, y: 50 },
    pan: { x: 0, y: 0 }
  })
  const drag = useRef(null)

  const open = (src, list) => {
    const i = list.indexOf(src)
    setState({
      open: true,
      list,
      index: i >= 0 ? i : 0,
      scale: 1,
      origin: { x: 50, y: 50 },
      pan: { x: 0, y: 0 }
    })
  }
  const close = () => setState(s => ({ ...s, open: false }))
  const nav = dir =>
    setState(s => {
      if (s.list.length <= 1) return s
      const ni = (s.index + dir + s.list.length) % s.list.length
      return { ...s, index: ni, scale: 1, origin: { x: 50, y: 50 }, pan: { x: 0, y: 0 } }
    })

  // —— 事件委托：点击正文内无有效链接包裹的图片 → 打开查看器 ——
  useEffect(() => {
    const onDocClick = e => {
      const t = e.target
      if (!t || t.tagName !== 'IMG') return
      const article = t.closest('#notion-article')
      if (!article) return
      // 有有效链接（如可跳转的相册卡片）→ 放行，不拦截
      const a = t.closest('a')
      if (a && a.getAttribute('href')) return
      const imgs = article.querySelectorAll(
        '.notion-asset-wrapper img, .notion-collection-card-cover img'
      )
      const list = Array.from(imgs).map(i => i.src)
      if (!list.includes(t.src)) list.push(t.src)
      e.preventDefault()
      e.stopPropagation()
      open(t.src, list)
    }
    document.addEventListener('click', onDocClick, true)
    return () => document.removeEventListener('click', onDocClick, true)
  }, [])

  // —— 滚轮：跟随鼠标位置缩放（原生监听以允许 preventDefault）——
  useEffect(() => {
    if (!state.open) return
    const onWheel = e => {
      e.preventDefault()
      const delta = e.deltaY < 0 ? 0.15 : -0.15
      const x = (e.clientX / window.innerWidth) * 100
      const y = (e.clientY / window.innerHeight) * 100
      setState(s => ({
        ...s,
        scale: Math.min(8, Math.max(1, +(s.scale + delta).toFixed(2))),
        origin: { x, y }
      }))
    }
    window.addEventListener('wheel', onWheel, { passive: false })
    return () => window.removeEventListener('wheel', onWheel, { passive: false })
  }, [state.open])

  // —— 长按鼠标中键拖动：平移图片位置 ——
  useEffect(() => {
    if (!state.open) return
    const onMouseDown = e => {
      if (e.button === 1) {
        e.preventDefault()
        drag.current = {
          startX: e.clientX,
          startY: e.clientY,
          panX: state.pan.x,
          panY: state.pan.y
        }
        document.body.style.cursor = 'grabbing'
      }
    }
    const onMouseMove = e => {
      if (drag.current) {
        setState(s => ({
          ...s,
          pan: {
            x: drag.current.panX + (e.clientX - drag.current.startX),
            y: drag.current.panY + (e.clientY - drag.current.startY)
          }
        }))
      }
    }
    const onMouseUp = e => {
      if (e.button === 1) {
        drag.current = null
        document.body.style.cursor = ''
      }
    }
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      document.body.style.cursor = ''
    }
  }, [state.open])

  // —— 键盘：左右切换图片 / Esc 关闭 ——
  useEffect(() => {
    if (!state.open) return
    const onKey = e => {
      if (e.key === 'Escape') close()
      else if (e.key === 'ArrowRight') nav(1)
      else if (e.key === 'ArrowLeft') nav(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.open, state.list.length, state.index])

  if (!state.open) return null

  const src = state.list[state.index]
  return (
    <div
      className='fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center select-none'
      onClick={close}>
      <img
        src={src ? compressImage(src, 1600) : ''}
        alt=''
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '95%',
          maxHeight: '95%',
          objectFit: 'contain',
          transform: `translate(${state.pan.x}px, ${state.pan.y}px) scale(${state.scale})`,
          transformOrigin: `${state.origin.x}% ${state.origin.y}%`,
          transition: state.scale === 1 && state.pan.x === 0 && state.pan.y === 0
            ? 'transform .2s'
            : 'none',
          cursor: 'zoom-out'
        }}
      />

      {/* 左右切换按钮 */}
      {state.list.length > 1 && (
        <>
          <button
            onClick={e => { e.stopPropagation(); nav(-1) }}
            className='absolute left-3 top-1/2 -translate-y-1/2 bg-white/15 hover:bg-white/35 text-white rounded-full w-10 h-10 text-2xl leading-none flex items-center justify-center'>
            ‹
          </button>
          <button
            onClick={e => { e.stopPropagation(); nav(1) }}
            className='absolute right-3 top-1/2 -translate-y-1/2 bg-white/15 hover:bg-white/35 text-white rounded-full w-10 h-10 text-2xl leading-none flex items-center justify-center'>
            ›
          </button>
          <div className='absolute top-3 left-1/2 -translate-x-1/2 text-white/80 text-sm bg-black/40 px-3 py-1 rounded-full'>
            {state.index + 1} / {state.list.length}
          </div>
        </>
      )}

      <div className='absolute bottom-3 left-1/2 -translate-x-1/2 text-white/50 text-xs bg-black/40 px-3 py-1 rounded-full'>
        滚轮缩放 · 中键拖动 · ← → 切换 · Esc 关闭
      </div>
    </div>
  )
}

export default ImageViewer
