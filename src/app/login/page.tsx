'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { AdminHeader } from '@/components/AdminHeader/AdminHeader';
import { Button } from '@/components/Button/Button';
import { Input } from '@/components/Input/Input';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { useAdminLogin } from '@/hooks/useAdminLogin';
import { useAdminMe } from '@/hooks/useAdminMe';

const adminLoginFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, '이메일을 입력해 주세요.')
    .email('올바른 이메일 형식을 입력해 주세요.'),
  password: z.string().min(1, '비밀번호를 입력해 주세요.'),
});

type AdminLoginFormValues = z.infer<typeof adminLoginFormSchema>;

const DEFAULT_LOGIN_ERROR_MESSAGE =
  '로그인에 실패했습니다. 이메일과 비밀번호를 확인해 주세요.';

const getLoginErrorMessage = (error: unknown): string => {
  if (!axios.isAxiosError(error)) {
    return '로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.';
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
  // 이미 로그인된 관리자의 /login 접근을 막기 위한 역방향 확인.
  // 실패는 비로그인 정상 흐름이므로 폼 에러로 표시하지 않는다.
  const { isPending: isAuthChecking, isSuccess: isAuthenticated } = useAdminMe();
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

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    router.replace('/');
  }, [isAuthenticated, router]);

  // 로그인 요청 상태는 인증 확인(isAuthChecking)과 분리한다.
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
        message: getLoginErrorMessage(error),
      });
    }
  });

  // 확인 중이거나 이미 인증되어 이동하는 동안 로그인 폼을 노출하지 않는다.
  if (isAuthChecking || isAuthenticated) {
    return (
      <div className="flex h-full flex-col overflow-y-auto bg-white">
        <AdminHeader showUserMenu={false} />
        <LoadingState
          message="인증 확인 중..."
          className="flex-1 py-0"
        />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-white">
      <AdminHeader showUserMenu={false} />

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <form
          onSubmit={onSubmit}
          noValidate
          className="flex w-full max-w-md flex-col gap-8"
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-3xl-bold text-blue-300">무빙</p>
            <h1 className="text-2xl-bold text-black-400">관리자 로그인</h1>
            <p className="text-md-medium text-gray-500">
              관리자 계정으로 로그인하여 관리자 페이지를 이용하세요.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="이메일"
                  type="email"
                  placeholder="이메일을 입력하세요"
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
                  label="비밀번호"
                  type={isPasswordVisible ? 'text' : 'password'}
                  placeholder="비밀번호를 입력하세요"
                  autoComplete="current-password"
                  disabled={isLoginPending}
                  errorMessage={errors.password?.message}
                  leftIcon={<Lock className="size-5" aria-hidden />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setIsPasswordVisible((prev) => !prev)}
                      disabled={isLoginPending}
                      className="flex size-5 items-center justify-center text-gray-400 enabled:hover:text-gray-500 disabled:cursor-not-allowed disabled:text-gray-300"
                      aria-label={
                        isPasswordVisible
                          ? '비밀번호 숨기기'
                          : '비밀번호 표시하기'
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
            로그인
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
