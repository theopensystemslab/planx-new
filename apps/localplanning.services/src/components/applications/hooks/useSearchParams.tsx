/**
 * Fetch search params used for logging into the application
 */
export const useSearchParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");
  const email = urlParams.get("email");

  return { token, email };
}