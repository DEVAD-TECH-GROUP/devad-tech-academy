// Google authentication using Google Client ID / @react-oauth/google
//
// The GoogleLogin component receives the Google credential
// and passes it to this function.
//
// Backend endpoint:
// POST /auth/google

export const googleLogin = async (credential) => {
  if (!credential) {
    throw new Error(
      "Google credential is required."
    );
  }

  // Import api from your configured Axios instance
  const { default: api } = await import("../api/Api");

  const { data } = await api.post(
    "/auth/google",
    {
      credential,
    }
  );

  return data;
};
