import { useEffect, useState, type FormEvent, type PointerEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import logoMokada from '../../../assets/login/logo-mokada.png';
import productoAmortiguador from '../../../assets/login/producto-amortiguador.png';
import productoBateria from '../../../assets/login/producto-bateria.png';
import productoDiscoFreno from '../../../assets/login/producto-disco-freno.png';
import productoFaro from '../../../assets/login/producto-faro.png';
import { useAuth } from '../context/useAuth';

interface LocationState {
  from?: {
    pathname?: string;
  };
}

export const LoginPage = () => {
  const { signIn, session, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const state = location.state as LocationState | null;
  const redirectTo = state?.from?.pathname || '/';

  useEffect(() => {
    if (session && profile) {
      navigate(redirectTo, { replace: true });
    }
  }, [navigate, profile, redirectTo, session]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await signIn(email, password);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo iniciar sesió.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F]">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,1fr)]">
        <section className="hidden overflow-hidden border-r border-gray-200 bg-[#F5F5F7] lg:block">
          <LoginParallaxShowcase />
        </section>

        <section className="flex items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-[420px] rounded-lg border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-7">
              <img src={logoMokada} alt="Mokada" className="mb-6 h-auto w-40 lg:hidden" />
              <h2 className="text-2xl font-semibold tracking-tight">Iniciar sesión</h2>
              <p className="mt-1 text-sm text-[#86868B]">Entra con tu correo y contrasena.</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-medium text-[#1D1D1F]">Correo</span>
                <div className="flex items-center rounded-lg border border-gray-300 bg-white px-3 focus-within:border-[#0066CC] focus-within:ring-2 focus-within:ring-[#0066CC]/15">
                  <Mail className="h-4 w-4 text-[#86868B]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm outline-none"
                    autoComplete="email"
                    required
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[13px] font-medium text-[#1D1D1F]">Contrasena</span>
                <div className="flex items-center rounded-lg border border-gray-300 bg-white px-3 focus-within:border-[#0066CC] focus-within:ring-2 focus-within:ring-[#0066CC]/15">
                  <Lock className="h-4 w-4 text-[#86868B]" />
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm outline-none"
                    autoComplete="current-password"
                    required
                  />
                </div>
              </label>

              {errorMessage && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex h-11 w-full items-center justify-center rounded-lg bg-[#0066CC] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0057AD] disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {isSubmitting ? 'Entrando...' : 'Entrar'}
              </button>
              <p className="pt-1 text-center text-[12px] font-medium text-[#A1A1A6] lg:hidden">
                Developed by Nizana Studio
              </p>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
};

const productLayers = [
  {
    src: productoDiscoFreno,
    alt: 'Disco de freno',
    className: 'login-product--brake',
    depth: 22,
  },
  {
    src: productoBateria,
    alt: 'Bateria',
    className: 'login-product--battery',
    depth: 14,
  },
  {
    src: productoFaro,
    alt: 'Faro',
    className: 'login-product--headlight',
    depth: 18,
  },
  {
    src: productoAmortiguador,
    alt: 'Amortiguador',
    className: 'login-product--shock',
    depth: 28,
  },
];

const LoginParallaxShowcase = () => {
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    setPointer({ x, y });
  };

  return (
    <div
      className="login-showcase relative h-full min-h-screen overflow-hidden"
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setPointer({ x: 0, y: 0 })}
    >
      <div className="absolute left-8 top-6 z-20">
        <img src={logoMokada} alt="Mokada" className="h-auto w-36" />
      </div>
      <div className="login-showcase-stage" aria-hidden="true">
        {productLayers.map((product) => (
          <div
            key={product.className}
            className="login-product-layer"
            style={{
              transform: `translate3d(${pointer.x * product.depth}px, ${pointer.y * product.depth}px, 0)`,
            }}
          >
            <img src={product.src} alt={product.alt} className={`login-product ${product.className}`} />
          </div>
        ))}

        <div
          className="login-logo-layer"
          style={{
            transform: `translate3d(${pointer.x * -10}px, ${pointer.y * -10}px, 0)`,
          }}
        >
          <img src={logoMokada} alt="Mokada" className="login-logo-mark" />
        </div>
      </div>
      <div className="absolute bottom-10 left-8 z-20 max-w-sm">
        <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#86868B]">Autopartes</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#1D1D1F]">Acceso operativo</h1>
        <p className="mt-4 text-[15px] leading-6 text-[#6E6E73]">
          Gestiona catalogo, inventario y usuarios con cuentas verificadas por correo.
        </p>
      </div>
    </div>
  );
};
