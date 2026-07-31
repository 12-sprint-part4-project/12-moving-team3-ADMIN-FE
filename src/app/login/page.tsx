'use client';

import axios from 'axios';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

import { AdminHeader } from '@/components/AdminHeader/AdminHeader';
import { Button } from '@/components/Button/Button';
import { Input } from '@/components/Input/Input';
import { useAdminLogin } from '@/hooks/useAdminLogin';

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
  const loginMutation = useAdminLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const isSubmitting = loginMutation.isPending;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setEmailError('');
    setPasswordError('');
    setFormError('');

    const trimmedEmail = email.trim();
    let hasValidationError = false;

    if (!trimmedEmail) {
      setEmailError('이메일을 입력해 주세요.');
      hasValidationError = true;
    }

    if (!password) {
      setPasswordError('비밀번호를 입력해 주세요.');
      hasValidationError = true;
    }

    // 빈 값이면 API를 호출하지 않는다.
    if (hasValidationError) {
      return;
    }

    loginMutation.mutate(
      {
        email: trimmedEmail,
        password,
      },
      {
        onSuccess: () => {
          // Access Token 저장은 useAdminLogin onSuccess에서 처리한다.
          // AdminSidebar 대시보드 경로(/)로 이동. 존재하지 않는 경로를 만들지 않는다.
          router.push('/');
        },
        onError: (error) => {
          setFormError(getLoginErrorMessage(error));
        },
      }
    );
  };

  return (
    <div className="flex min-h-full flex-col bg-white">
      <AdminHeader showUserMenu={false} />

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <form
          onSubmit={handleSubmit}
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
            <Input
              label="이메일"
              type="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="이메일을 입력하세요"
              autoComplete="email"
              disabled={isSubmitting}
              errorMessage={emailError || undefined}
              leftIcon={<User className="size-5" aria-hidden />}
            />
            <Input
              label="비밀번호"
              type={isPasswordVisible ? 'text' : 'password'}
              name="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="비밀번호를 입력하세요"
              autoComplete="current-password"
              disabled={isSubmitting}
              errorMessage={passwordError || undefined}
              leftIcon={<Lock className="size-5" aria-hidden />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setIsPasswordVisible((prev) => !prev)}
                  disabled={isSubmitting}
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
          </div>

          {formError ? (
            <p role="alert" className="text-md-medium text-red-200">
              {formError}
            </p>
          ) : null}

          <Button
            type="submit"
            variant="solid"
            loading={isSubmitting}
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
