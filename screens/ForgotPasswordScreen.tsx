import React, { useState } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import {
  SILVER,
  ELECTRIC,
  BG,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  ERROR,
  SUCCESS,
  BORDER,
  TOUCH_TARGET,
} from '../theme';

type Props = {
  onBackToLogin: () => void;
};

export default function ForgotPasswordScreen({ onBackToLogin }: Props) {
  const { width } = useWindowDimensions();
  const isWebWide = Platform.OS === 'web' && width > 600;

  const [email, setEmail] = useState('');
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleReset = async () => {
    setErrorMessage(null);

    if (!email) {
      setErrorMessage('Ingresa tu correo electrónico.');
      return;
    }
    if (!isValidEmail(email)) {
      setErrorMessage('El correo electrónico no tiene un formato válido.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'venturacom://reset-password', // ajusta a tu deep link real
    });
    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }
    // Un solo paso, una sola respuesta clara del sistema (Pilar 3)
    setSent(true);
  };

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

          <TouchableOpacity
            style={styles.backButton}
            onPress={onBackToLogin}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={20} color={TEXT_PRIMARY} />
          </TouchableOpacity>

          {sent ? (
            // ── Estado de éxito: una sola pantalla, sin pasos extra ──
            <View style={styles.successState}>
              <View style={styles.successIconWrapper}>
                <Ionicons name="mail-open-outline" size={30} color={ELECTRIC.base} />
              </View>
              <Text style={styles.title}>Revisa tu correo</Text>
              <Text style={styles.bodyText}>
                Enviamos un enlace para restablecer tu contraseña a{'\n'}
                <Text style={styles.boldText}>{email}</Text>
              </Text>

              <TouchableOpacity onPress={onBackToLogin} activeOpacity={0.9}>
                <LinearGradient
                  colors={[ELECTRIC.light, ELECTRIC.base]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.primaryButton}
                >
                  <Text style={styles.primaryButtonText}>Volver a iniciar sesión</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleReset} style={{ marginTop: 16 }}>
                <Text style={styles.linkText}>¿No llegó? Reenviar correo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // ── Estado de solicitud: un solo campo, un solo botón ──
            <>
              <View style={styles.header}>
                <View style={styles.iconWrapper}>
                  <Ionicons name="key-outline" size={26} color={SILVER.dark} />
                </View>
                <Text style={styles.title}>¿Olvidaste tu contraseña?</Text>
                <Text style={styles.subtitle}>
                  Ingresa tu correo y te enviaremos un enlace para restablecerla.
                </Text>
              </View>

              {errorMessage ? (
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle" size={18} color={ERROR} />
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              ) : null}

              <View
                style={[
                  styles.inputWrapper,
                  focused && styles.inputWrapperFocused,
                  errorMessage && styles.inputWrapperError,
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color={focused ? ELECTRIC.base : TEXT_SECONDARY}
                  style={{ marginRight: 10 }}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Correo electrónico"
                  placeholderTextColor="#98A2B3"
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <TouchableOpacity onPress={handleReset} disabled={loading} activeOpacity={0.9}>
                <LinearGradient
                  colors={[ELECTRIC.light, ELECTRIC.base]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.primaryButton}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Enviar enlace</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity onPress={onBackToLogin} style={{ marginTop: 20, alignItems: 'center' }}>
                <Text style={styles.linkText}>
                  ¿Recordaste tu contraseña? <Text style={styles.boldText}>Inicia sesión</Text>
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  backButton: {
    width: TOUCH_TARGET * 0.7,
    height: TOUCH_TARGET * 0.7,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: BORDER,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  header: { alignItems: 'center', marginBottom: 24 },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: SILVER.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 20, fontWeight: '800', color: TEXT_PRIMARY, textAlign: 'center' },
  subtitle: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  bodyText: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    marginTop: 8,
    marginBottom: 28,
    textAlign: 'center',
    lineHeight: 20,
  },

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
    marginBottom: 20,
  },
  inputWrapperFocused: {
    borderColor: ELECTRIC.base,
    shadowColor: ELECTRIC.base,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  inputWrapperError: { borderColor: ERROR },
  input: { flex: 1, height: '100%', fontSize: 15, color: TEXT_PRIMARY },

  primaryButton: {
    height: TOUCH_TARGET,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

  linkText: { color: TEXT_SECONDARY, fontSize: 13, textAlign: 'center' },
  boldText: { color: ELECTRIC.base, fontWeight: '700' },

  successState: { alignItems: 'center' },
  successIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: SILVER.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
});