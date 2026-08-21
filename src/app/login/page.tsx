'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { AdminHeader } from '@/components/AdminHeader/AdminHeader';
import { Button } from '@/components/Button/Button';
import { Input } from '@/components/Input/Input';
import { useAdminLogin } from '@/hooks/useAdminLogin';
import { useI18n } from '@/i18n/I18nProvider';

import type { TranslationKey } from '@/i18n/translator';

const adminLoginFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'auth.emailRequired')
    .email('auth.emailInvalid'),
  password: z.string().min(1, 'auth.passwordRequired'),
});

type AdminLoginFormValues = z.infer<typeof adminLoginFormSchema>;

const DEFAULT_LOGIN_ERROR_MESSAGE = 'auth.loginFailed';
const UNEXPECTED_LOGIN_ERROR_MESSAGE = 'auth.unexpectedError';

const LOGIN_TRANSLATION_KEYS = new Set<TranslationKey>([
  'auth.emailRequired',
  'auth.emailInvalid',
  'auth.passwordRequired',
  DEFAULT_LOGIN_ERROR_MESSAGE,
  UNEXPECTED_LOGIN_ERROR_MESSAGE,
]);

const isLoginTranslationKey = (message: string): message is TranslationKey =>
  LOGIN_TRANSLATION_KEYS.has(message as TranslationKey);

const getLoginErrorMessage = (error: unknown): string => {
  if (!axios.isAxiosError(error)) {
    return UNEXPECTED_LOGIN_ERROR_MESSAGE;
  }

  const responseData = error.response?.data;
  if (
    responseData &&
    typeof responseData === 'object' &&
    'error' in responseData &&
    responseData.error &&
    typeof responseData.error === 'object' &&
    'message' in responseData.error &&
    typeof responseData.error.message === 'string' &&
    responseData.error.message.trim()
  ) {
    return responseData.error.message;
  }

  return DEFAULT_LOGIN_ERROR_MESSAGE;
};

const LoginPage = () => {
  const router = useRouter();
  const { t } = useI18n();
  // 비로그인 /login 진입 시 /me·/refresh를 호출하지 않는다.
  // 관리자 영역 새로고침 복구는 AdminAuthGuard + axios interceptor가 담당한다.
  const loginMutation = useAdminLogin();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const {
    control,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const isLoginPending = isSubmitting || loginMutation.isPending;
  const getLocalizedErrorMessage = (message?: string) => {
    if (!message) return undefined;
    return isLoginTranslationKey(message) ? t(message) : message;
  };

  const onSubmit = handleSubmit(async (values) => {
    clearErrors('root');

    try {
      await loginMutation.mutateAsync({
        email: values.email,
        password: values.password,
      });
      // Access Token 저장은 useAdminLogin onSuccess에서 처리한다.
      router.push('/');
    } catch (error) {
      setError('root', {
        message: getLoginErrorMessage(error),
      });
    }
  });

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-white">
      <AdminHeader showUserMenu={false} logoLinkEnabled={false} />

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <form
          onSubmit={onSubmit}
          noValidate
          className="flex w-full max-w-md flex-col gap-8"
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-3xl-bold text-blue-300">{t('common.brand')}</p>
            <h1 className="text-2xl-bold text-black-400">
              {t('auth.adminLogin')}
            </h1>
            <p className="text-md-medium text-gray-500">
              {t('auth.description')}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label={t('auth.email')}
                  type="email"
                  placeholder={t('auth.emailPlaceholder')}
                  autoComplete="email"
                  disabled={isLoginPending}
                  errorMessage={getLocalizedErrorMessage(errors.email?.message)}
                  leftIcon={<User className="size-5" aria-hidden />}
                />
              )}
            />
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label={t('auth.password')}
                  type={isPasswordVisible ? 'text' : 'password'}
                  placeholder={t('auth.passwordPlaceholder')}
                  autoComplete="current-password"
                  disabled={isLoginPending}
                  errorMessage={getLocalizedErrorMessage(
                    errors.password?.message
                  )}
                  leftIcon={<Lock className="size-5" aria-hidden />}
                  rightIcon={
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setIsPasswordVisible((prev) => !prev)}
                      disabled={isLoginPending}
                      className="flex size-5 items-center justify-center text-gray-400 enabled:hover:text-gray-500 disabled:cursor-not-allowed disabled:text-gray-300"
                      aria-label={
                        isPasswordVisible
                          ? t('auth.hidePassword')
                          : t('auth.showPassword')
                      }
                    >
                      {isPasswordVisible ? (
                        <Eye className="size-5" aria-hidden />
                      ) : (
                        <EyeOff className="size-5" aria-hidden />
                      )}
                    </button>
                  }
                />
              )}
            />
          </div>

          {errors.root?.message ? (
            <p role="alert" className="text-md-medium text-red-200">
              {getLocalizedErrorMessage(errors.root.message)}
            </p>
          ) : null}

          <Button
            type="submit"
            variant="solid"
            loading={isLoginPending}
            className="w-full"
          >
            {t('auth.submit')}
          </Button>
        </form>
      </main>

      <footer className="px-6 py-6 text-center text-xs-medium text-gray-400">
        {t('auth.copyright')}
      </footer>
    </div>
  );
};

export default LoginPage;
