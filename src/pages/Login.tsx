import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Briefcase, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { extractFieldErrors } from '@/lib/pocketbase/errors'

export default function Login() {
  const [email, setEmail] = useState('patric.martins@adapta.org')
  const [password, setPassword] = useState('Skip@Pass')
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [err, setErr] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr('')
    setFieldErrors({})
    setIsSubmitting(true)

    const { error } = await signIn(email, password)

    setIsSubmitting(false)

    if (error) {
      const extracted = extractFieldErrors(error)
      if (Object.keys(extracted).length > 0) {
        setFieldErrors(extracted)
      } else {
        setErr('Credenciais inválidas ou erro no servidor.')
      }
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950 p-4">
      <Card className="w-full max-w-md shadow-elevation border-0">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="mx-auto bg-secondary/10 dark:bg-secondary/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-2">
            <Briefcase className="h-8 w-8 text-secondary" />
          </div>
          <CardTitle className="text-2xl font-bold">ERP Jurídico</CardTitle>
          <CardDescription>Acesse sua conta para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {err && (
              <div className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded">
                {err}
              </div>
            )}
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {fieldErrors.identity && (
                <p className="text-sm text-red-500">{fieldErrors.identity}</p>
              )}
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {fieldErrors.password && (
                <p className="text-sm text-red-500">{fieldErrors.password}</p>
              )}
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-secondary hover:bg-secondary/90 text-white"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
