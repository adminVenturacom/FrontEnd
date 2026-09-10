import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';

// Permite cerrar la ventana emergente en Web
WebBrowser.maybeCompleteAuthSession();

export async function signInWithProvider(provider: 'google' | 'apple' | 'github') {
  try {
    // Genera la URL de retorno: miapp://auth/callback (o localhost en web)
    const redirectUrl = Linking.createURL('auth/callback');

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: Platform.OS !== 'web',
      },
    });

    if (error) throw error;

    // En móviles abre el modal seguro de autenticación
    if (Platform.OS !== 'web' && data?.url) {
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

      if (result.type === 'success' && result.url) {
        // Extrae el código de autenticación o tokens de la URL devuelta
        const parsedUrl = Linking.parse(result.url);
        const code = parsedUrl.queryParams?.code;

        if (code) {
          const { error: sessionError } = await supabase.auth.exchangeCodeForSession(
            code as string
          );
          if (sessionError) throw sessionError;
        }
      }
    }
  } catch (err: any) {
    console.error(`Error al iniciar sesión con ${provider}:`, err.message);
    throw err;
  }
}