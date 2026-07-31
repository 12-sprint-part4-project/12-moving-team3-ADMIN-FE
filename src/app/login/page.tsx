'use client';

import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

import { loginAdmin } from '@/api/adminAuthApi';
import { AdminHeader } from '@/components/AdminHeader/AdminHeader';
import { Button } from '@/components/Button/Button';
import { Input } from '@/components/Input/Input';
import { setAdminAccessToken } from '@/lib/adminAccessToken';

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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
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

    setIsSubmitting(true);

    try {
      const response = await loginAdmin({
        email: trimmedEmail,
        password,
      });

      // BE 응답: { data: { accessToken, admin } }
      setAdminAccessToken(response.data.accessToken);
      // AdminSidebar 대시보드 경로(/)로 이동. 존재하지 않는 경로를 만들지 않는다.
      router.push('/');
    } catch (error) {
      setFormError(getLoginErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-full flex-col bg-background-200">
      <AdminHeader showUserMenu={false} />

      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex w-full max-w-md flex-col gap-6 rounded-lg border border-line-200 bg-white p-8"
        >
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl-bold text-black-400">관리자 로그인</h1>
            <p className="text-md-medium text-gray-500">
              관리자 계정으로 로그인해 주세요.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <Input
              label="이메일"
              type="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@example.com"
              autoComplete="email"
              disabled={isSubmitting}
              errorMessage={emailError || undefined}
            />
            <Input
              label="비밀번호"
              type="password"
              name="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="비밀번호를 입력해 주세요"
              autoComplete="current-password"
              disabled={isSubmitting}
              errorMessage={passwordError || undefined}
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
    </div>
  );
};

export default LoginPage;
