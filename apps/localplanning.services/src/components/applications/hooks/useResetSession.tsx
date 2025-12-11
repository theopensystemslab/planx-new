import { $session } from "@stores/session";
import { queryClient } from "@lib/queryClient";

export const useResetSession = () => {
  const resetAndNavigate = (path: string = "/applications") => {
    $session.set({ token: null, email: null });
    
    queryClient.removeQueries({ queryKey: ["fetchApplications"] });
    
    window.location.href = path;
  };

  return { resetAndNavigate };
};
