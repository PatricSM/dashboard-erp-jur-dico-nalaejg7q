import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Scale, Mail, Lock, Eye, EyeOff, Fingerprint, Loader2 } from 'lucide-react'

import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { extractFieldErrors } from '@/lib/pocketbase/errors'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  rememberMe: z.boolean().default(false).optional(),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'patric.martins@adapta.org',
      password: 'Skip@Pass',
      rememberMe: false,
    },
  })

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true)
    const { error } = await signIn(data.email, data.password)
    setIsSubmitting(false)

    if (error) {
      const extracted = extractFieldErrors(error)
      if (Object.keys(extracted).length > 0) {
        Object.entries(extracted).forEach(([field, msg]) => {
          form.setError(field as any, { type: 'manual', message: msg as string })
        })
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro de autenticação',
          description: 'Credenciais inválidas ou erro no servidor.',
        })
      }
    } else {
      navigate('/')
    }
  }

  const handleComingSoon = () => {
    toast({
      description: 'Esta funcionalidade estará disponível em breve.',
    })
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-background p-4 pt-[0px]">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-secondary/5 -skew-x-12 transform origin-top-right" />
        <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-muted/40 blur-[120px] rounded-full" />
      </div>

      {/* Login Card */}
      <div className="w-full max-w-[480px] bg-card/95 backdrop-blur-md p-10 rounded-2xl shadow-[0_12px_40px_-12px_rgba(0,81,213,0.12)] border border-border/30 relative z-10 pt-[0px] mb-[15px]">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-secondary w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg pt-[0px] mt-[30px]">
            <Scale className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">ERP Jurídico</h1>
          <p className="text-muted-foreground mt-2 text-center">
            Acesse sua conta para gerenciar clientes, contratos e atividades.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-label-caps text-muted-foreground">E-mail</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input placeholder="seu@email.com" className="pl-10" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-label-caps text-muted-foreground">Senha</FormLabel>
                    <Link to="#" className="text-sm font-medium text-secondary hover:underline">
                      Esqueceu?
                    </Link>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="font-normal text-muted-foreground cursor-pointer">
                      Mantenha-me conectado
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-secondary hover:bg-secondary/90 text-white font-medium text-base h-11"
            >
              {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              Entrar
            </Button>
          </form>
        </Form>

        <div className="mt-8 mb-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center"></div>
            <div className="relative flex justify-center text-xs"></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4"></div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 w-full text-center text-sm text-muted-foreground pointer-events-none z-10">
        <p>Enterprise Legal Management &copy; {new Date().getFullYear()}</p>
        <div className="flex items-center justify-center space-x-4 mt-2 pointer-events-auto">
          <Link to="#" className="hover:text-foreground transition-colors">
            Termos
          </Link>
          <Link to="#" className="hover:text-foreground transition-colors">
            Privacidade
          </Link>
          <Link to="#" className="hover:text-foreground transition-colors">
            Suporte
          </Link>
        </div>
      </div>
    </main>
  )
}
