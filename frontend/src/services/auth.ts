import {
  GoogleSignin,
  isSuccessResponse,
} from "@react-native-google-signin/google-signin";

GoogleSignin.configure({
  webClientId: "723465956365-ecfduj45gssrkm4vpi8f85iaeirpcm8n.apps.googleusercontent.com",
  iosClientId: "723465956365-6cm345dtlts4t7h81arokvgv8glo5bjq.apps.googleusercontent.com",
});

export async function signInWithGoogle(): Promise<string> {
  await GoogleSignin.hasPlayServices();
  const response = await GoogleSignin.signIn();
  if (!isSuccessResponse(response)) {
    throw new Error("Google sign-in was cancelled");
  }

  const idToken = response.data.idToken;
  if (!idToken) {
    throw new Error("No ID token returned");
  }

  return idToken;
}

export async function signOut(): Promise<void> {
  await GoogleSignin.signOut();
}

export function getCurrentUser() {
  return GoogleSignin.getCurrentUser();
}
