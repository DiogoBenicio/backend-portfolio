export function PageContainer({ children }: { children: React.ReactNode }) {
  return <div className="relative z-10 mx-auto w-full max-w-5xl px-6 py-8 md:px-10">{children}</div>
}
