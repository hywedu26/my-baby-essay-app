export const metadata = {
  title: '우리 아이 육아 에세이',
  description: '따뜻한 기록이 에세이가 되는 공간',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
