'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { AdminHeader } from '@/components/AdminHeader/AdminHeader';
import { Button } from '@/components/Button/Button';
import { Input } from '@/components/Input/Input';
import { useAdminLogin } from '@/hooks/useAdminLogin';

import type { TFunction } from 'i18next';

const createAdminLoginFormSchema = (t: TFunction) =>
  z.object({
    email: z
      .string()
      .trim()
      .min(1, t('auth.validation.emailRequired'))
      .email(t('auth.validation.emailInvalid')),
    password: z.string().min(1, t('auth.validation.passwordRequired')),
  });

type AdminLoginFormValues = z.infer<
  ReturnType<typeof createAdminLoginFormSchema>
>;

const getLoginErrorMessage = (error: unknown, t: TFunction): string => {
  if (!axios.isAxiosError(error)) {
    return t('auth.error.unexpected');
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

  return t('auth.error.invalidCredentials');
};

const LoginPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  // 비로그인 /login 진입 시 /me·/refresh를 호출하지 않는다.
  // 관리자 영역 새로고침 복구는 AdminAuthGuard + axios interceptor가 담당한다.
  const loginMutation = useAdminLogin();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const adminLoginFormSchema = useMemo(
    () => createAdminLoginFormSchema(t),
    [t]
  );

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
        message: getLoginErrorMessage(error, t),
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
            <p className="text-3xl-bold text-blue-300">{t('auth.brand')}</p>
            <h1 className="text-2xl-bold text-black-400">{t('auth.title')}</h1>
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
                  label={t('auth.email.label')}
                  type="email"
                  placeholder={t('auth.email.placeholder')}
                  autoComplete="email"
                  disabled={isLoginPending}
                  errorMessage={errors.email?.message}
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
                  label={t('auth.password.label')}
                  type={isPasswordVisible ? 'text' : 'password'}
                  placeholder={t('auth.password.placeholder')}
                  autoComplete="current-password"
                  disabled={isLoginPending}
                  errorMessage={errors.password?.message}
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
                          ? t('auth.password.hide')
                          : t('auth.password.show')
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
              {errors.root.message}
            </p>
          ) : null}

          <Button
            type="submit"
            variant="solid"
            loading={isLoginPending}
            className="w-full"
          >
            {t('common.login')}
          </Button>
        </form>
      </main>

      <footer className="px-6 py-6 text-center text-xs-medium text-gray-400">
        © 2024 Moving. All rights reserved.
      </footer>
    </div>
  );
};

export default LoginPage;
