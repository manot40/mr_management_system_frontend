import Head from 'next/head'
import Script from 'next/script'
import { BaseLayout } from 'layout'
import type { AppProps } from 'next/app'
import { ThemeProvider } from 'next-themes'

import '../styles/globals.css'

function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class" enableSystem>
      <Script src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.esm.js" type="module"/>
      <Script src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.js" noModule />
      <Head>
        <title>MMS Frontend - Next (Dev)</title>
      </Head>
      <BaseLayout>
        <Component {...pageProps} />
      </BaseLayout>
    </ThemeProvider>
  )
}

export default App
