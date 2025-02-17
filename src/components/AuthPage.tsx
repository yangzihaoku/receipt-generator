import { useState } from 'react';
import { useRouter } from 'next/router';

export default function AuthPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 这里使用简单的密码验证，实际应用中建议使用更安全的方式
    if (password === process.env.NEXT_PUBLIC_AUTH_PASSWORD) {
      localStorage.setItem('isAuthenticated', 'true');
      router.push('/generator');
    } else {
      setError('密码错误');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">访问验证</h1>
        <div className="mb-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入访问密码"
            className="w-full p-2 border rounded"
          />
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          确认
        </button>
      </form>
    </div>
  );
} 