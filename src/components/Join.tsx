import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { associationMeta } from '../data/tracks'
import { GlitchText, Reveal, SectionTag } from './common'
import { useReducedMotion } from '../motion/useReducedMotion'

const assetBase = import.meta.env.BASE_URL
const focusableSelector = 'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])'

function getFocusableElements(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelector))
    .filter((element) => !element.hasAttribute('disabled') && element.getAttribute('aria-hidden') !== 'true')
}

export function JoinSection() {
  const { recruitment, qqGroup } = associationMeta
  const [qrOpen, setQrOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)
  const [qrImageError, setQrImageError] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const lastFocusRef = useRef<HTMLElement | null>(null)
  const copyTimerRef = useRef<number | null>(null)
  const joinGlitchTimerRef = useRef<number | null>(null)
  const glitchEndTimerRef = useRef<number | null>(null)
  const focusRestoreTimerRef = useRef<number | null>(null)
  const joinRef = useRef<HTMLElement>(null)
  const glitchBusyRef = useRef(false)
  const mountedRef = useRef(false)
  const reduced = useReducedMotion()
  const [glitching, setGlitching] = useState(false)

  const triggerGlitch = useCallback(() => {
    if (!mountedRef.current || reduced || document.visibilityState === 'hidden' || glitchBusyRef.current) return
    if (glitchEndTimerRef.current !== null) window.clearTimeout(glitchEndTimerRef.current)
    glitchBusyRef.current = true
    setGlitching(true)
    glitchEndTimerRef.current = window.setTimeout(() => {
      glitchEndTimerRef.current = null
      glitchBusyRef.current = false
      if (mountedRef.current) setGlitching(false)
    }, 500)
  }, [reduced])

  const openQr = () => {
    if (focusRestoreTimerRef.current !== null) {
      window.clearTimeout(focusRestoreTimerRef.current)
      focusRestoreTimerRef.current = null
    }
    lastFocusRef.current = document.activeElement as HTMLElement | null
    setQrOpen(true)
  }

  const closeQr = () => {
    const restoreTarget = lastFocusRef.current
    setQrOpen(false)
    if (focusRestoreTimerRef.current !== null) window.clearTimeout(focusRestoreTimerRef.current)
    focusRestoreTimerRef.current = window.setTimeout(() => {
      focusRestoreTimerRef.current = null
      if (mountedRef.current) restoreTarget?.focus()
    }, 0)
  }

  const copyGroup = async () => {
    let success = false
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(qqGroup)
        success = true
      } else {
        const input = document.createElement('textarea')
        input.value = qqGroup
        input.style.position = 'fixed'
        input.style.opacity = '0'
        document.body.appendChild(input)
        input.select()
        success = document.execCommand?.('copy') === true
        input.remove()
      }
      if (!success) throw new Error('copy unavailable')
      if (!mountedRef.current) return
      setCopyFailed(false)
      setCopied(true)
      if (copyTimerRef.current !== null) window.clearTimeout(copyTimerRef.current)
      copyTimerRef.current = window.setTimeout(() => {
        copyTimerRef.current = null
        if (mountedRef.current) setCopied(false)
      }, 1500)
    } catch {
      if (mountedRef.current) {
        setCopied(false)
        setCopyFailed(true)
      }
    }
  }

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (copyTimerRef.current !== null) window.clearTimeout(copyTimerRef.current)
      if (joinGlitchTimerRef.current !== null) window.clearTimeout(joinGlitchTimerRef.current)
      if (glitchEndTimerRef.current !== null) window.clearTimeout(glitchEndTimerRef.current)
      if (focusRestoreTimerRef.current !== null) window.clearTimeout(focusRestoreTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (!qrOpen) return undefined
    const app = document.querySelector<HTMLElement>('.app')
      ?? (document.body.firstElementChild as HTMLElement | null)
    const previousInert = app?.inert ?? false
    const previousAriaHidden: string | null = app?.getAttribute('aria-hidden') ?? null
    const supportsInert = Boolean(app && 'inert' in app)
    if (app && supportsInert) app.inert = true
    else if (app) app.setAttribute('aria-hidden', 'true')
    const previousOverflow = document.body.style.overflow
    document.body.classList.add('qr-open')
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeQr()
      if (event.key !== 'Tab') return
      const panel = panelRef.current
      if (!panel) return
      const focusable = getFocusableElements(panel)
      if (focusable.length === 0) {
        event.preventDefault()
        panel.focus()
        return
      }
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.classList.remove('qr-open')
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
      if (app && supportsInert) app.inert = previousInert
      else if (app) {
        if (previousAriaHidden === null) app.removeAttribute('aria-hidden')
        else app.setAttribute('aria-hidden', previousAriaHidden)
      }
    }
  }, [qrOpen])

  useEffect(() => {
    const node = joinRef.current
    if (reduced || !node || typeof IntersectionObserver === 'undefined') return undefined
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        if (joinGlitchTimerRef.current !== null) window.clearTimeout(joinGlitchTimerRef.current)
        joinGlitchTimerRef.current = window.setTimeout(() => {
          joinGlitchTimerRef.current = null
          triggerGlitch()
        }, 420)
        observer.disconnect()
      }
    }, { threshold: 0.45 })
    observer.observe(node)
    return () => {
      observer.disconnect()
      if (joinGlitchTimerRef.current !== null) window.clearTimeout(joinGlitchTimerRef.current)
    }
  }, [reduced, triggerGlitch])

  return (
    <section id="join" ref={joinRef} className="section join">
      <span className="ghost-word ghost-word--join" aria-hidden="true">
        JOIN
      </span>
      <div className="container join-inner">
        <Reveal className="join-copy">
          <SectionTag number="06" en="JOIN THE SOCIETY" label="加入协会" />
          <Reveal>
            <h2 className="section-title">
              准备好写下
              <br />
              <GlitchText text="下一行了吗？" active={glitching} onPointerEnter={triggerGlitch} />
            </h2>
          </Reveal>
          <p>
            扫描二维码加入 {recruitment}群，我们在群里等你发出第一条消息。
          </p>
          <div className="join-meta">
            <span>QQ GROUP // 招新群</span>
            <strong>{qqGroup}</strong>
          </div>
          <button className="btn btn--ink" type="button" onClick={openQr}>
            SCAN TO CONNECT <span aria-hidden="true">▸</span>
          </button>
        </Reveal>

        <Reveal className="qr-frame-wrap" delay={140}>
          <button className="qr-frame" type="button" onClick={openQr} aria-label="放大查看计算机协会招新群二维码">
            <span className="qr-frame__label">ENTRY TICKET / 加入凭证</span>
            {qrImageError ? <span className="qr-image-fallback">二维码加载失败</span> : (
              <img src={`${assetBase}assets/qq-group.jpg`} alt="计算机协会招新群二维码" onError={() => setQrImageError(true)} />
            )}
            <span className="qr-frame__caption">SCAN TO CONNECT · 2026</span>
          </button>
        </Reveal>
      </div>

      {qrOpen && typeof document !== 'undefined' ? createPortal(
        <div className="qr-modal" role="dialog" aria-modal="true" aria-labelledby="qr-modal-title">
          <button className="qr-modal__backdrop" type="button" aria-label="关闭二维码放大" onClick={closeQr} />
          <div ref={panelRef} className="qr-modal__panel" tabIndex={-1}>
            <div className="qr-modal__bar">
              <span id="qr-modal-title">ENTRY TICKET // FULL VIEW</span>
              <button ref={closeRef} className="qr-modal__close" type="button" onClick={closeQr} aria-label="关闭二维码放大">
                ×
              </button>
            </div>
            {qrImageError ? (
              <div className="qr-modal__image-fallback" role="status">
                <strong>二维码加载失败</strong>
                <span>可复制群号加入</span>
              </div>
            ) : (
              <img
                className="qr-modal__image"
                src={`${assetBase}assets/qq-group.jpg`}
                alt="计算机协会招新群二维码完整图片"
                onError={() => setQrImageError(true)}
              />
            )}
            <div className="qr-modal__footer">
              <span>QQ GROUP // {qqGroup}</span>
              <button className="qr-copy" type="button" onClick={copyGroup} aria-describedby="qr-copy-status">
                {copied ? 'COPIED' : 'COPY'}
              </button>
            </div>
            <span id="qr-copy-status" className="sr-only" role="status" aria-live="polite">
              {copyFailed ? '复制失败，请手动复制群号' : copied ? '群号已复制' : ''}
            </span>
          </div>
        </div>,
        document.body,
      ) : null}

      <footer className="footer container">
        <span>SYIT · COMPUTER ASSOCIATION</span>
        <span>沈阳理工大学 · 2026</span>
        <span>POWERED BY REACT + VITE</span>
        <span>END OF TRANSMISSION_</span>
      </footer>
    </section>
  )
}
