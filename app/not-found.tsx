export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-lg">This page could not be found.</p>
      <a href="/" className="mt-4 text-blue-500">Go back home</a>
    </div>
  )
}
