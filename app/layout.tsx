import { ReactNode } from 'react'
import type { Metadata } from 'next'
import { Noto_Sans_KR } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
const notoSansKR = Noto_Sans_KR({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Canvas Talking Head Model',
  description: 'Forked from jetfontanilla/canvas-talking-head-model',
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang='ko'>
      <body className={notoSansKR.className}>
        <Header />
        {children}
      </body>
    </html>
  )
}
