// app/login/page.js
import LoginClient from '@/components/auth/LoginClient';


export const metadata = {
  title: 'Welcome Back | Zuno',
  description: 'Log back into your distraction-free college community space.',
};

export default function LoginPage() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-cover bg-center bg-no-repeat bg-[url('/images/mobile_bg.png')] md:bg-[url('/images/desktop_bg.png')] flex items-center justify-center">
      {/* Subtle overlay matching our landing page layout */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] pointer-events-none" />
      
      <LoginClient />
    </main>
  );
}