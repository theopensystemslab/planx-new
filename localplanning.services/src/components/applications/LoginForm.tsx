import type { FormEventHandler } from "react";
import { useLogin } from "./hooks/useLogin";

const LoginForm: React.FC = () => {
  const { login, isLoading, error, clearError } = useLogin();

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email")?.toString();
    if (!email) return;

    await login(email);
  };

  return (
    <div className="max-w-3xl text-body-lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-start">
        <div>
          <label htmlFor="email" className="text-body-lg inline-block">
            Enter your email address to log in
          </label>
          <input
            id="email"
            type="email"
            name="email"
            required
            disabled={isLoading}
            onChange={clearError}
          />
        </div>

        {error && (
          <div className="text-red-600 mt-2" role="alert">
            {error}
          </div>
        )}

        <button 
          type="submit" 
          disabled={isLoading} 
          className="button button--primary button--medium button-focus-style"
        >
          {isLoading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
