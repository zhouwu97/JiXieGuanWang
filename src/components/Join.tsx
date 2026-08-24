import { useCallback, useEffect, useRef, useState } from 'react'
import { associationMeta } from '../data/tracks'
import { GlitchText, Reveal, SectionTag } from './common'

const assetBase = import.meta.env.BASE_URL

export function JoinSection() {
  const { recruitment, qqGroup } = associationMeta
  const [qrOpen, setQrOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)
  const lastFocusRef = useRef<HTMLElement | null>(null)
  const copyTimerRef = useRef<number | null>(null)
  const joinGlitchTimerRef = useRef<number | null>(null)
  const joinRef = useRef<HTMLElement>(null)
  const glitchBusyRef = useRef(false)
  const [glitching, setGlitching] = useState(false)

  const triggerGlitch = useCallback(() => {
    if (glitchBusyRef.current) return
    glitchBusyRef.current = true
    setGlitching(true)
    window.setTimeout(() => {
      glitchBusyRef.current = false
      setGlitching(false)
    }, 500)
  }, [])

  const openQr = () => {
    lastFocusRef.current = document.activeElement as HTMLElement | null
    setQrOpen(true)
  }

  const closeQr = () => {
    setQrOpen(false)
    window.setTimeout(() => lastFocusRef.current?.focus(), 0)
  }

  const copyGroup = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(qqGroup)
      } else {
        const input = document.createElement('textarea')
        input.value = qqGroup
        input.style.position = 'fixed'
        input.style.opacity = '0'
        document.body.appendChild(input)
        input.select()
        document.execCommand?.('copy')
        input.remove()
      }
      setCopied(true)
      if (copyTimerRef.current !== null) window.clearTimeout(copyTimerRef.current)
      copyTimerRef.current = window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // 复制失败保持静默，避免打断扫码流程。
    }
  }

  useEffect(() => {
    if (!qrOpen) return undefined
    document.body.classList.add('qr-open')
    closeRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeQr()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.classList.remove('qr-open')
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [qrOpen])

  useEffect(() => {
    const node = joinRef.current
    if (!node || typeof IntersectionObserver === 'undefined') return undefined
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        joinGlitchTimerRef.current = window.setTimeout(triggerGlitch, 420)
        observer.disconnect()
      }
    }, { threshold: 0.45 })
    observer.observe(node)
    return () => {
      observer.disconnect()
      if (joinGlitchTimerRef.current !== null) window.clearTimeout(joinGlitchTimerRef.current)
    }
  }, [triggerGlitch])

  useEffect(() => () => {
    if (copyTimerRef.current !== null) window.clearTimeout(copyTimerRef.current)
  }, [])

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
            <img src={`${assetBase}assets/qq-group.jpg`} alt="计算机协会招新群二维码" />
            <span className="qr-frame__caption">SCAN TO CONNECT · 2026</span>
          </button>
        </Reveal>
      </div>

      {qrOpen && (
        <div className="qr-modal" role="dialog" aria-modal="true" aria-labelledby="qr-modal-title">
          <button className="qr-modal__backdrop" type="button" aria-label="关闭二维码放大" onClick={closeQr} />
          <div className="qr-modal__panel">
            <div className="qr-modal__bar">
              <span id="qr-modal-title">ENTRY TICKET // FULL VIEW</span>
              <button ref={closeRef} className="qr-modal__close" type="button" onClick={closeQr} aria-label="关闭二维码放大">
                ×
              </button>
            </div>
            <img className="qr-modal__image" src={`${assetBase}assets/qq-group.jpg`} alt="计算机协会招新群二维码完整图片" />
            <div className="qr-modal__footer">
              <span>QQ GROUP // {qqGroup}</span>
              <button className="qr-copy" type="button" onClick={copyGroup}>
                {copied ? 'COPIED' : 'COPY'}
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="footer container">
        <span>SYIT · COMPUTER ASSOCIATION</span>
        <span>沈阳理工大学 · 2026</span>
        <span>POWERED BY REACT + VITE</span>
        <span>END OF TRANSMISSION_</span>
      </footer>
    </section>
  )
}
