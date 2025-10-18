import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { StructuredData } from '@/components/structured-data'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap'
})

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  ),
  title: {
    default: 'Spellbook - Your Personal Code Repository',
    template: '%s | Spellbook'
  },
  description:
    'Store, manage, execute and share your code snippets with the world. Support for JavaScript, Python, PHP, HTML, CSS, SQL and more.',
  keywords: [
    'code snippets',
    'code repository',
    'code sharing',
    'code execution',
    'javascript',
    'python',
    'php',
    'developer tools',
    'programming',
    'code playground'
  ],
  authors: [{ name: 'Spellbook Team' }],
  creator: 'Spellbook',
  publisher: 'Spellbook',
  formatDetection: {
    email: false,
    address: false,
    telephone: false
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Spellbook - Your Personal Code Repository',
    description:
      'Store, manage, execute and share your code snippets with the world',
    siteName: 'Spellbook',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Spellbook - Code Repository'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Spellbook - Your Personal Code Repository',
    description:
      'Store, manage, execute and share your code snippets with the world',
    images: ['/og-image.png'],
    creator: '@spellbook'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/apple-icon.svg', type: 'image/svg+xml' }]
  },
  manifest: '/manifest.json',
  verification: {
    // Add your verification codes here when available
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  }
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <StructuredData />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
