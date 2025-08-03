"use client"

import { useEffect, useRef } from 'react'

interface QRCodeProps {
  value: string
  size?: number
  level?: 'L' | 'M' | 'Q' | 'H'
  className?: string
}

export function QRCode({ value, size = 200, level = 'M', className = '' }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const generateQR = async () => {
      if (!canvasRef.current || !value) return

      try {
        // Dynamic import to avoid SSR issues
        const QRCode = (await import('qrcode')).default
        
        await QRCode.toCanvas(canvasRef.current, value, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          errorCorrectionLevel: level
        })
      } catch (error) {
        console.error('Error generating QR code:', error)
        // Fallback: create a simple placeholder
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.fillStyle = '#f3f4f6'
          ctx.fillRect(0, 0, size, size)
          ctx.fillStyle = '#6b7280'
          ctx.font = '12px Arial'
          ctx.textAlign = 'center'
          ctx.fillText('QR Code', size / 2, size / 2)
        }
      }
    }

    generateQR()
  }, [value, size, level])

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={`border border-gray-200 rounded-lg ${className}`}
    />
  )
} 