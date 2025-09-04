export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
        <div className="w-full max-w-md p-6 bg-white shadow rounded-xl">
          {children}
        </div>
  )
}
