import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from './lib/supabase';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import DashboardScreen from './screens/DashboardScreen';
import {
  SILVER,
  ELECTRIC,
  BG,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  ERROR,
  BORDER,
  TOUCH_TARGET,
} from './theme';

// Necesario para que el navegador de autenticación se cierre solo
// al volver a la app en iOS/Android (Pilar 3: cero fricción)
WebBrowser.maybeCompleteAuthSession();

// A dónde debe regresar Supabase después del login con Google.
// En web usa la URL actual; en nativo, el esquema de tu app.json ("scheme").
const redirectTo = Linking.createURL('auth-callback');

type Screen = 'login' | 'forgot' | 'dashboard';

export default function App() {
  const { width } = useWindowDimensions();
  const isWebWide = Platform.OS === 'web' && width > 600;

  const [screen, setScreen] = useState<Screen>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);

  // ── Fuente única de verdad para la navegación por sesión ──
  // Se dispara con login por email, por Google, o si ya había una
  // sesión guardada al abrir la app. Así el dashboard es el mismo
  // destino sin importar el método de login (Pilar 3: convergencia).
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setScreen('dashboard');
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setScreen('dashboard');
      } else {
        setScreen('login');
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pressIn = () =>
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, speed: 40 }).start();
  const pressOut = () =>
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 40 }).start();

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSignIn = async () => {
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Ingresa tu correo y contraseña para continuar.');
      return;
    }
    if (!isValidEmail(email)) {
      setErrorMessage('El correo electrónico no tiene un formato válido.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      const friendly = error.message.toLowerCase().includes('invalid login credentials')
        ? 'Correo o contraseña incorrectos.'
        : error.message;
      setErrorMessage(friendly);
      return;
    }
    // El listener de arriba se encarga de navegar al dashboard.
  };

  // ── Login con Google ──
  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setGoogleLoading(true);

    if (Platform.OS === 'web') {
      // En web, Supabase redirige la pestaña completa a Google y vuelve solo.
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      });
      if (error) setErrorMessage(error.message);
      setGoogleLoading(false);
      return;
    }

    // En iOS/Android abrimos el navegador de autenticación del sistema
    // y esperamos a que Google redirija de vuelta a nuestro esquema.
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, skipBrowserRedirect: true },
    });

    if (error || !data?.url) {
      setErrorMessage(error?.message ?? 'No se pudo iniciar el login con Google.');
      setGoogleLoading(false);
      return;
    }

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

    if (result.type === 'success' && result.url) {
      const params = new URLSearchParams(result.url.split('#')[1] ?? result.url.split('?')[1]);
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');

      if (access_token && refresh_token) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
        if (sessionError) setErrorMessage(sessionError.message);
        // El listener de arriba navega al dashboard automáticamente.
      } else {
        setErrorMessage('No se pudo completar el inicio de sesión con Google.');
      }
    }

    setGoogleLoading(false);
  };

  if (screen === 'forgot') {
    return <ForgotPasswordScreen onBackToLogin={() => setScreen('login')} />;
  }
  if (screen === 'dashboard') {
    return <DashboardScreen />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.card, { maxWidth: isWebWide ? 440 : '100%' }]}>

          <View style={styles.header}>
            <BrandMark size={64} />
            <Text style={styles.brandTitle}>VENTURACOM</Text>
            <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
          </View>

          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color={ERROR} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <FieldInput
            icon="mail-outline"
            placeholder="Correo electrónico"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              if (errorMessage) setErrorMessage(null);
            }}
            focused={focusedField === 'email'}
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
            hasError={!!errorMessage}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <FieldInput
            icon="lock-closed-outline"
            placeholder="Contraseña"
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              if (errorMessage) setErrorMessage(null);
            }}
            focused={focusedField === 'password'}
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField(null)}
            hasError={!!errorMessage}
            secureTextEntry={!showPassword}
            rightElement={
              <TouchableOpacity
                onPress={() => setShowPassword((s) => !s)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={TEXT_SECONDARY}
                />
              </TouchableOpacity>
            }
          />

          <TouchableOpacity
            style={styles.forgotWrapper}
            onPress={() => setScreen('forgot')}
            hitSlop={{ top: 8, bottom: 8 }}
          >
            <Text style={styles.linkText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              onPress={handleSignIn}
              onPressIn={pressIn}
              onPressOut={pressOut}
              disabled={loading}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[ELECTRIC.light, ELECTRIC.base]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryButton}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>Iniciar sesión</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o continúa con</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={[styles.socialRow, !isWebWide && styles.socialColumn]}>
            <SocialButton
              icon="logo-google"
              label="Google"
              loading={googleLoading}
              onPress={handleGoogleSignIn}
            />
            <SocialButton icon="logo-apple" label="Apple" onPress={() => {}} />
          </View>

          <View style={styles.footerLinks}>
            <Text style={styles.linkText}>
              ¿No tienes cuenta?{' '}
              <Text style={styles.boldText} onPress={() => {}}>
                Regístrate
              </Text>
            </Text>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function BrandMark({ size = 64 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size, marginBottom: 14 }}>
      <LinearGradient
        colors={[ELECTRIC.base, ELECTRIC.light]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.markStroke, { top: 0, right: 0, transform: [{ rotate: '18deg' }] }]}
      />
      <LinearGradient
        colors={[SILVER.dark, SILVER.light]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.markStroke, { bottom: 0, left: 0, transform: [{ rotate: '-18deg' }] }]}
      />
    </View>
  );
}

type FieldInputProps = {
  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  hasError: boolean;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'sentences';
  rightElement?: React.ReactNode;
};

function FieldInput({
  icon,
  rightElement,
  focused,
  hasError,
  ...inputProps
}: FieldInputProps) {
  return (
    <View
      style={[
        styles.inputWrapper,
        focused && styles.inputWrapperFocused,
        hasError && styles.inputWrapperError,
      ]}
    >
      <Ionicons
        name={icon}
        size={18}
        color={focused ? ELECTRIC.base : TEXT_SECONDARY}
        style={styles.inputIcon}
      />
      <TextInput
        style={styles.input}
        placeholderTextColor="#98A2B3"
        {...inputProps}
      />
      {rightElement}
    </View>
  );
}

function SocialButton({
  icon,
  label,
  onPress,
  loading,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  loading?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.socialButton} activeOpacity={0.7} onPress={onPress} disabled={loading}>
      {loading ? (
        <ActivityIndicator size="small" color={TEXT_PRIMARY} />
      ) : (
        <>
          <Ionicons name={icon} size={18} color={TEXT_PRIMARY} style={{ marginRight: 8 }} />
          <Text style={styles.socialButtonText}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    shadowColor: SILVER.dark,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },

  header: { alignItems: 'center', marginBottom: 28 },
  markStroke: {
    position: 'absolute',
    width: '78%',
    height: '52%',
    borderRadius: 14,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: TEXT_PRIMARY,
    letterSpacing: 3,
  },
  subtitle: { fontSize: 14, color: TEXT_SECONDARY, marginTop: 6 },

  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3F2',
    borderWidth: 1,
    borderColor: '#FDA29B',
    borderRadius: 10,
    padding: 12,
    marginBottom: 18,
  },
  errorText: { color: ERROR, fontSize: 13, flex: 1 },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: TOUCH_TARGET,
    borderWidth: 1.5,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    marginBottom: 14,
  },
  inputWrapperFocused: {
    borderColor: ELECTRIC.base,
    shadowColor: ELECTRIC.base,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  inputWrapperError: { borderColor: ERROR },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, height: '100%', fontSize: 15, color: TEXT_PRIMARY },

  forgotWrapper: { alignItems: 'flex-end', marginBottom: 20, marginTop: -4 },

  primaryButton: {
    height: TOUCH_TARGET,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 22,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: BORDER },
  dividerText: { paddingHorizontal: 12, fontSize: 12, color: TEXT_SECONDARY },

  socialRow: { flexDirection: 'row', gap: 12 },
  socialColumn: { flexDirection: 'column' },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    height: TOUCH_TARGET,
    borderWidth: 1.5,
    borderColor: BORDER,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  socialButtonText: { fontSize: 14, fontWeight: '600', color: TEXT_PRIMARY },

  footerLinks: { marginTop: 24, alignItems: 'center' },
  linkText: { color: TEXT_SECONDARY, fontSize: 13 },
  boldText: { color: ELECTRIC.base, fontWeight: '700' },
});