import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import { ReduxProvider } from "@/shared/store/ReduxProvider"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "CinemaEC",
  description: "Sistema de gestión de cinema",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
        <Script
          id="chunk-recovery"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function () {
  var KEY = 'chunk-recovery-attempted';
  var shouldReload = function () {
    try {
      if (sessionStorage.getItem(KEY) === '1') return false;
      sessionStorage.setItem(KEY, '1');
      return true;
    } catch (_) {
      return true;
    }
  };

  var reloadHard = function () {
    if (!shouldReload()) return;
    var url = new URL(window.location.href);
    url.searchParams.set('_r', Date.now().toString());
    window.location.replace(url.toString());
  };

  window.addEventListener('error', function (event) {
    var target = event && event.target;
    if (!target) return;
    var src = target.src || target.href || '';
    if (typeof src === 'string' && src.indexOf('/_next/static/chunks/') !== -1) {
      reloadHard();
    }
  }, true);

  window.addEventListener('unhandledrejection', function (event) {
    var reason = event && event.reason;
    var message = '';
    if (typeof reason === 'string') message = reason;
    else if (reason && typeof reason.message === 'string') message = reason.message;
    if (message.indexOf('ChunkLoadError') !== -1 || message.indexOf('Loading chunk') !== -1) {
      reloadHard();
    }
  });

  window.addEventListener('pageshow', function () {
    try {
      sessionStorage.removeItem(KEY);
    } catch (_) {}
  });
})();`,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  )
}
