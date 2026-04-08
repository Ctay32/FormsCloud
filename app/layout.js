import './globals.css'
import AdminShell from './components/AdminShell'

export const metadata = {
  title: 'FormCloud',
  description: 'Créez et gérez vos formulaires en toute simplicité',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className="font-sans">
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  )
}
