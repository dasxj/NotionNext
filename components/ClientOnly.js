import { useEffect, useState } from 'react'

/**
 * 仅客户端渲染组件：SSR 与客户端首帧都不渲染（返回 fallback），
 * 挂载后再渲染子内容。用于包裹 ssr:false 的动态组件，
 * 消除其"服务端占位 vs 客户端组件"的 hydration 不一致报错。
 */
const ClientOnly = ({ children, fallback = null }) => {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  return mounted ? children : fallback
}

export default ClientOnly
