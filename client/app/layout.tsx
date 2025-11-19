import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'SOMS - Streamline Your Workflow, Amplify Your Impact',
  description: 'The all-in-one platform that helps modern teams collaborate, automate, and scale their operations with intelligent tools designed for the way you work.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/SOMS-Logo2.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/SOMS-Logo2.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/SOMS-Logo3.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        {/* <Analytics /> */}
      </body>
    </html>
  )
}
