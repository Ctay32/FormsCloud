import './globals.css'

export const metadata = {
  title: 'FormCloud',
  description: 'Créez et gérez vos formulaires en toute simplicité',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className="font-sans">
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </body>
    </html>
  )
}
