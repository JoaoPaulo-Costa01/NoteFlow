import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import {
  Mail, Lock, Eye, EyeOff,
  Sparkles, Tag, ShieldCheck, Quote, UserPlus,
} from 'lucide-react';
import api from '../services/api';

const registerSchema = z
  .object({
    email:           z.string().min(1, 'E-mail é obrigatório').email('Informe um e-mail válido'),
    password:        z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path:    ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const [showPassword, setShowPassword]               = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError]                       = useState<string | null>(null);

  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterFormData) => {
    setApiError(null);
    try {
      await api.post('/account/register', {
        email:    data.email,
        password: data.password,
      });
      navigate('/login', {
        state: { message: 'Conta criada com sucesso! Faça login para continuar.' },
      });
    } catch (err: any) {
      setApiError(err.response?.data?.error ?? 'Falha ao criar conta. Tente novamente.');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative" style={{ background: '#050816' }}>

      <div className="absolute -top-[10%] -left-[10%] w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none" style={{ background: 'rgba(30,64,175,0.12)' }} />
      <div className="absolute -bottom-[10%] -right-[10%] w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none" style={{ background: 'rgba(29,78,216,0.08)' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full blur-[100px] pointer-events-none" style={{ background: 'rgba(37,99,235,0.07)' }} />

      <div className="relative z-10 w-full max-w-5xl flex rounded-2xl overflow-hidden shadow-2xl" style={{ border: '1px solid rgba(37,99,235,0.12)' }}>

        <aside className="hidden lg:flex lg:w-5/12 flex-col justify-between p-10" style={{ background: 'rgba(11,17,32,0.6)', borderRight: '1px solid rgba(37,99,235,0.1)' }}>

          <header className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-sm"
              style={{ background: '#1D4ED8', boxShadow: '0 0 16px rgba(37,99,235,0.4)' }}
            >
              N
            </div>
            <span className="font-semibold text-lg" style={{ color: '#F8FAFC' }}>
              Note<span style={{ color: '#2563EB' }}>Flow</span>
            </span>
          </header>

          <div>
            <h2 className="text-3xl font-bold leading-snug mb-3" style={{ color: '#F8FAFC' }}>
              Comece a organizar suas{' '}
              <span style={{ color: '#2563EB' }}>ideias hoje.</span>
            </h2>
            <p className="text-sm leading-relaxed mb-8" style={{ color: '#94A3B8' }}>
              Crie sua conta gratuitamente e transforme notas em conhecimento
              com o poder da IA.
            </p>

            <div className="flex flex-col gap-5">
              <Feature icon={<Sparkles size={16} />}    title="IA que entende suas notas"     description="Resuma, organize e encontre o que realmente importa." />
              <Feature icon={<Tag size={16} />}          title="Tudo sempre organizado"         description="Tags, favoritos e busca inteligente para encontrar qualquer informação." />
              <Feature icon={<ShieldCheck size={16} />}  title="Privacidade em primeiro lugar"  description="Suas notas são suas. Segurança e privacidade by design." />
            </div>
          </div>

          <figure
            className="rounded-xl p-4 flex gap-3 items-start"
            style={{ background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.12)' }}
          >
            <Quote size={18} style={{ color: '#2563EB' }} className="shrink-0 mt-0.5" />
            <blockquote className="text-sm italic leading-relaxed" style={{ color: '#94A3B8' }}>
              A clareza nas notas traz clareza para o pensamento.
            </blockquote>
          </figure>

        </aside>

        <section
          className="flex-1 backdrop-blur-3xl flex items-center justify-center p-8 lg:p-12"
          style={{ background: 'rgba(11,17,32,0.75)' }}
        >
          <div className="w-full max-w-sm">

            <header className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-1" style={{ color: '#F8FAFC' }}>
                Crie sua <span style={{ color: '#2563EB' }}>conta</span>
              </h1>
              <p className="text-sm" style={{ color: '#94A3B8' }}>
                Preencha os dados abaixo para começar
              </p>
            </header>

            {apiError && (
              <div role="alert" className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">

              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-medium" style={{ color: '#94A3B8' }}>
                  E-mail
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#94A3B8' }} />
                  <input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    autoComplete="email"
                    {...register('email')}
                    className="w-full rounded-lg pl-10 pr-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-[#2563EB]/40"
                    style={{
                      background: '#111827',
                      border:     errors.email ? '1px solid rgba(239,68,68,0.6)' : '1px solid rgba(37,99,235,0.18)',
                      color:      '#F8FAFC',
                    }}
                  />
                </div>
                {errors.email && <span role="alert" className="text-red-400 text-xs">{errors.email.message}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-sm font-medium" style={{ color: '#94A3B8' }}>
                  Senha
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#94A3B8' }} />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 8 caracteres"
                    autoComplete="new-password"
                    {...register('password')}
                    className="w-full rounded-lg pl-10 pr-11 py-3 text-sm outline-none transition focus:ring-2 focus:ring-[#2563EB]/40"
                    style={{
                      background: '#111827',
                      border:     errors.password ? '1px solid rgba(239,68,68,0.6)' : '1px solid rgba(37,99,235,0.18)',
                      color:      '#F8FAFC',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 transition hover:text-white"
                    style={{ color: '#94A3B8' }}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <span role="alert" className="text-red-400 text-xs">{errors.password.message}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="confirmPassword" className="text-sm font-medium" style={{ color: '#94A3B8' }}>
                  Confirmar Senha
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#94A3B8' }} />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Repita a senha"
                    autoComplete="new-password"
                    {...register('confirmPassword')}
                    className="w-full rounded-lg pl-10 pr-11 py-3 text-sm outline-none transition focus:ring-2 focus:ring-[#2563EB]/40"
                    style={{
                      background: '#111827',
                      border:     errors.confirmPassword ? '1px solid rgba(239,68,68,0.6)' : '1px solid rgba(37,99,235,0.18)',
                      color:      '#F8FAFC',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(p => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 transition hover:text-white"
                    style={{ color: '#94A3B8' }}
                    aria-label={showConfirmPassword ? 'Ocultar confirmação' : 'Mostrar confirmação'}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && <span role="alert" className="text-red-400 text-xs">{errors.confirmPassword.message}</span>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:brightness-110 mt-1"
                style={{
                  background: 'linear-gradient(135deg, #1E40AF 0%, #1D4ED8 100%)',
                  boxShadow:  '0 4px 20px rgba(37,99,235,0.35)',
                }}
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <> Criar conta <UserPlus size={16} /> </>
                )}
              </button>

            </form>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px" style={{ background: 'rgba(37,99,235,0.15)' }} />
              <span className="text-xs" style={{ color: '#94A3B8' }}>ou</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(37,99,235,0.15)' }} />
            </div>

            <p className="text-center text-sm" style={{ color: '#94A3B8' }}>
              Já tem uma conta?{' '}
              <Link to="/login" className="font-medium transition hover:opacity-80" style={{ color: '#2563EB' }}>
                Entrar
              </Link>
            </p>

            <footer className="flex items-center justify-center gap-1.5 mt-6">
              <ShieldCheck size={13} style={{ color: '#94A3B8' }} />
              <span className="text-xs" style={{ color: '#94A3B8' }}>
                Seus dados estão protegidos com criptografia de ponta a ponta.
              </span>
            </footer>

          </div>
        </section>

      </div>
    </main>
  );
}

function Feature({ icon, title, description }: {
  icon: React.ReactNode; title: string; description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.2)', color: '#2563EB' }}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium" style={{ color: '#F8FAFC' }}>{title}</p>
        <p className="text-xs leading-relaxed" style={{ color: '#94A3B8' }}>{description}</p>
      </div>
    </div>
  );
}