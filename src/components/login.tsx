'use client';

import Image from 'next/image';
import Button from '@/components/ui/button';
import { useState } from 'react';
import LoginInput from '@/components/ui/login-input';
import Checkbox from '@/components/ui/checkbox';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { t } = useLanguage();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { username, password } = formData;

      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
        remember: rememberMe,
        callbackUrl: '/robot-home',
      });

      if (result?.error) {
        setError('Invalid credentials. Please try again.');
      } else if (result?.ok) {
        // Redirect to robot-home page after successful login
        router.push('/robot-home');
      }
    } catch (err) {
      console.error('Error during login:', err);
      setError('An error occurred during login.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative w-full h-64 flex flex-col items-center justify-center min-h-screen p-6 text-center">
      {/* <div className="absolute top-0 left-0 w-full h-full bg-home-img bg-no-repeat z-[-1] bg-clear-pink bg-[50%_0%]" /> */}
      <div className="absolute top-0 left-0 w-full h-full z-[-1] bg-clear-pink bg-[50%_0%]" />

      <div className="w-80 h-full flex flex-col items-center justify-center">
        <Image
          className="mb-8"
          src="/bot.png"
          alt="BotBot Logo"
          width={260}
          height={260}
          priority
        />
        <Image
          className=""
          src="/botbot-logo.png"
          alt="BotBot Logo"
          width={160}
          height={160}
          priority
        />

        <form
          onSubmit={handleLogin}
          className="flex flex-col items-center justify-center w-full mt-8"
        >
          {error && <div className="text-red-500 mb-4">{error}</div>}

          <LoginInput
            label={t('login', 'username')}
            name="username"
            value={formData.username}
            placeholder={t('login', 'username')}
            onChange={handleChange}
          />
          <LoginInput
            label={t('login', 'password')}
            name="password"
            value={formData.password}
            type="password"
            onChange={handleChange}
          />
          <div className="w-full h-full">
            <Checkbox
              label={t('login', 'rememberMe')}
              id="rememberMe"
              labelClassName="text-blue-800"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
          </div>
          <Button
            type="submit"
            label={loading ? 'Logging in...' : t('login', 'loginButton')}
          />
        </form>
      </div>
    </div>
  );
}
