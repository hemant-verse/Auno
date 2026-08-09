// app/login/page.js
import LoginClient from '@/components/auth/LoginClient';
import Background from '@/components/Background';

export const metadata = {
  title: 'Welcome Back | Zuno',
  description: 'Log back into your distraction-free college community space.',
};

export default function LoginPage() {
  return (
    <main className="relative min-h-screen w-full  flex items-center justify-center">
      <Background />
      <LoginClient />
    </main>
  );
}