import ForgotPasswordClient from '@/components/auth/ForgotPasswordClient';

export const metadata = {
  title: 'Reset Password | Zuno',
  description: 'Recover access to your Zuno account.',
};

export default function ForgotPasswordPage() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-cover bg-center bg-no-repeat bg-[url('/images/mobile_bg.png')] md:bg-[url('/images/desktop_bg.png')] flex items-center justify-center">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] pointer-events-none" />
      
      <ForgotPasswordClient />
    </main>
  );
}