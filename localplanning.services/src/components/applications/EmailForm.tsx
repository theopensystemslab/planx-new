import type { FormEventHandler } from "react";
import { useResumeApplication } from "./hooks/useResumeApplication";

const EmailForm: React.FC = () => {
  const { submitEmail, isLoading, error, clearError } = useResumeApplication();

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email")?.toString();
    if (!email) return;

    await submitEmail(email);
  };

  return (
    <div className="max-w-3xl text-body-lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label htmlFor="email" className="font-semibold text-md">
          Enter your email address
        </label>
        <input
          className="pt-2 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="email"
          type="email"
          name="email"
          required
          disabled={isLoading}
          onChange={clearError}
        />

        {error && (
          <div className="text-red-600 mt-2" role="alert">
            {error}
          </div>
        )}

        <button 
          type="submit" 
          disabled={isLoading} 
          className="inline-block font-semibold rounded transition m-0 bg-action-main hover:bg-action-main-hover text-body-md clamp-[py,2,3] clamp-[px,3,4] cursor-pointer w-min"
        >
          {isLoading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default EmailForm;