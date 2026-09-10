import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  useWindowDimensions,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  SILVER,
  ELECTRIC,
  BG,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  SUCCESS,
  ERROR,
  BORDER,
  TOUCH_TARGET,
} from '../theme';

// ─────────────────────────────────────────────────────────────
// Los 2 pilares financieros del dashboard: INGRESOS vs GASTOS.
// Es el problema aburrido y repetitivo que la mayoría evita
// resolver (anotar cada movimiento). El objetivo de esta pantalla
// es que registrar un movimiento tome 3 toques como máximo:
// 1) elegir tipo (ingreso/gasto) → 2) escribir el monto → 3) guardar.
// ─────────────────────────────────────────────────────────────

type TxType = 'ingreso' | 'gasto';

type Transaction = {
  id: string;
  type: TxType;
  amount: number;
  label: string;
  date: string; // "Hoy", "Ayer", etc. — en producción, formatear con la fecha real
};

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Salario: 'cash-outline',
  Ventas: 'trending-up-outline',
  Comida: 'fast-food-outline',
  Transporte: 'car-outline',
  Servicios: 'flash-outline',
  Otro: 'ellipsis-horizontal-outline',
};

const CATEGORIES = ['Salario', 'Ventas', 'Comida', 'Transporte', 'Servicios', 'Otro'];

// Datos de ejemplo — reemplazar por la consulta real a Supabase
// (tabla `transactions`, filtrada por RLS a `user_id = auth.uid()`)
const SEED_TRANSACTIONS: Transaction[] = [
  { id: '1', type: 'ingreso', amount: 1200, label: 'Salario', date: 'Hoy' },
  { id: '2', type: 'gasto', amount: 45, label: 'Comida', date: 'Hoy' },
  { id: '3', type: 'gasto', amount: 80, label: 'Servicios', date: 'Ayer' },
  { id: '4', type: 'ingreso', amount: 300, label: 'Ventas', date: 'Ayer' },
];

function formatCurrency(value: number) {
  return `$${value.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function DashboardScreen() {
  const { width } = useWindowDimensions();
  const isWebWide = Platform.OS === 'web' && width > 700;

  const [transactions, setTransactions] = useState<Transaction[]>(SEED_TRANSACTIONS);
  const [modalVisible, setModalVisible] = useState(false);
  const [step, setStep] = useState<'type' | 'amount'>('type');
  const [pendingType, setPendingType] = useState<TxType>('ingreso');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>('Otro');

  const { totalIngresos, totalGastos, saldo } = useMemo(() => {
    const ingresos = transactions.filter((t) => t.type === 'ingreso').reduce((s, t) => s + t.amount, 0);
    const gastos = transactions.filter((t) => t.type === 'gasto').reduce((s, t) => s + t.amount, 0);
    return { totalIngresos: ingresos, totalGastos: gastos, saldo: ingresos - gastos };
  }, [transactions]);

  const maxValue = Math.max(totalIngresos, totalGastos, 1);
  const ingresoBarWidth = `${(totalIngresos / maxValue) * 100}%`;
  const gastoBarWidth = `${(totalGastos / maxValue) * 100}%`;

  const openModal = (type: TxType) => {
    setPendingType(type);
    setStep('amount');
    setAmount('');
    setCategory('Otro');
    setModalVisible(true);
  };

  const saveTransaction = () => {
    const numeric = parseFloat(amount.replace(',', '.'));
    if (!numeric || numeric <= 0) return;

    const newTx: Transaction = {
      id: String(Date.now()),
      type: pendingType,
      amount: numeric,
      label: category,
      date: 'Hoy',
    };
    setTransactions((prev) => [newTx, ...prev]);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { maxWidth: isWebWide ? 520 : '100%', alignSelf: 'center', width: '100%' }]}
      >

        {/* ── Saludo ── */}
        <Text style={styles.greeting}>Hola 👋</Text>
        <Text style={styles.greetingSub}>Así va tu mes</Text>

        {/* ── Saldo total: el número que más importa, sin scroll ── */}
        <LinearGradient
          colors={[ELECTRIC.base, ELECTRIC.dark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <Text style={styles.balanceLabel}>Saldo disponible</Text>
          <Text style={styles.balanceValue}>{formatCurrency(saldo)}</Text>
        </LinearGradient>

        {/* ── Los 2 pilares: Ingresos vs Gastos ── */}
        <View style={styles.pillarsRow}>
          <View style={styles.pillarCard}>
            <View style={styles.pillarHeader}>
              <Ionicons name="arrow-down-circle" size={18} color={SUCCESS} />
              <Text style={styles.pillarLabel}>Ingresos</Text>
            </View>
            <Text style={[styles.pillarValue, { color: SUCCESS }]}>{formatCurrency(totalIngresos)}</Text>
          </View>

          <View style={styles.pillarCard}>
            <View style={styles.pillarHeader}>
              <Ionicons name="arrow-up-circle" size={18} color={ERROR} />
              <Text style={styles.pillarLabel}>Gastos</Text>
            </View>
            <Text style={[styles.pillarValue, { color: ERROR }]}>{formatCurrency(totalGastos)}</Text>
          </View>
        </View>

        {/* ── Comparación visual instantánea (sin gráfica compleja) ── */}
        <View style={styles.compareCard}>
          <View style={styles.compareBarRow}>
            <Text style={styles.compareBarLabel}>Ingresos</Text>
            <View style={styles.compareBarTrack}>
              <View style={[styles.compareBarFill, { width: ingresoBarWidth as any, backgroundColor: SUCCESS }]} />
            </View>
          </View>
          <View style={styles.compareBarRow}>
            <Text style={styles.compareBarLabel}>Gastos</Text>
            <View style={styles.compareBarTrack}>
              <View style={[styles.compareBarFill, { width: gastoBarWidth as any, backgroundColor: ERROR }]} />
            </View>
          </View>
        </View>

        {/* ── Movimientos recientes ── */}
        <Text style={styles.sectionTitle}>Movimientos recientes</Text>
        {transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={28} color={SILVER.dark} />
            <Text style={styles.emptyText}>Aún no registras movimientos.{'\n'}Usa el botón + para empezar.</Text>
          </View>
        ) : (
          transactions.slice(0, 8).map((tx) => (
            <View key={tx.id} style={styles.txRow}>
              <View style={styles.txIconWrapper}>
                <Ionicons
                  name={CATEGORY_ICONS[tx.label] ?? 'ellipsis-horizontal-outline'}
                  size={18}
                  color={tx.type === 'ingreso' ? SUCCESS : ERROR}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.txLabel}>{tx.label}</Text>
                <Text style={styles.txDate}>{tx.date}</Text>
              </View>
              <Text style={[styles.txAmount, { color: tx.type === 'ingreso' ? SUCCESS : ERROR }]}>
                {tx.type === 'ingreso' ? '+ ' : '- '}
                {formatCurrency(tx.amount)}
              </Text>
            </View>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Botón flotante: punto de entrada único para registrar (Pilar 3) ── */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.9}
        onPress={() => {
          setStep('type');
          setModalVisible(true);
        }}
      >
        <LinearGradient
          colors={[ELECTRIC.light, ELECTRIC.base]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>

      {/* ── Modal de registro rápido: máximo 3 toques ── */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />

            {step === 'type' ? (
              // Toque 1: elegir tipo
              <>
                <Text style={styles.sheetTitle}>¿Qué quieres registrar?</Text>
                <View style={styles.typeRow}>
                  <TouchableOpacity
                    style={[styles.typeButton, { borderColor: SUCCESS }]}
                    onPress={() => openModal('ingreso')}
                  >
                    <Ionicons name="arrow-down-circle" size={26} color={SUCCESS} />
                    <Text style={[styles.typeButtonText, { color: SUCCESS }]}>Ingreso</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.typeButton, { borderColor: ERROR }]}
                    onPress={() => openModal('gasto')}
                  >
                    <Ionicons name="arrow-up-circle" size={26} color={ERROR} />
                    <Text style={[styles.typeButtonText, { color: ERROR }]}>Gasto</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              // Toque 2: monto + categoría · Toque 3: guardar
              <>
                <Text style={styles.sheetTitle}>
                  Nuevo {pendingType === 'ingreso' ? 'ingreso' : 'gasto'}
                </Text>

                <View style={styles.amountWrapper}>
                  <Text style={styles.amountCurrency}>$</Text>
                  <TextInput
                    style={styles.amountInput}
                    placeholder="0.00"
                    placeholderTextColor="#98A2B3"
                    keyboardType="decimal-pad"
                    value={amount}
                    onChangeText={setAmount}
                    autoFocus
                  />
                </View>

                <View style={styles.chipsRow}>
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.chip, category === cat && styles.chipActive]}
                      onPress={() => setCategory(cat)}
                    >
                      <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity onPress={saveTransaction} activeOpacity={0.9}>
                  <LinearGradient
                    colors={[ELECTRIC.light, ELECTRIC.base]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.saveButton}
                  >
                    <Text style={styles.saveButtonText}>Guardar</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  scrollContent: { padding: 20, paddingTop: 32 },

  greeting: { fontSize: 22, fontWeight: '800', color: TEXT_PRIMARY },
  greetingSub: { fontSize: 14, color: TEXT_SECONDARY, marginTop: 2, marginBottom: 20 },

  balanceCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
  },
  balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  balanceValue: { color: '#FFFFFF', fontSize: 34, fontWeight: '800', marginTop: 6 },

  pillarsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  pillarCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },
  pillarHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  pillarLabel: { fontSize: 13, color: TEXT_SECONDARY, fontWeight: '600' },
  pillarValue: { fontSize: 20, fontWeight: '800' },

  compareCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 28,
    gap: 12,
  },
  compareBarRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  compareBarLabel: { width: 64, fontSize: 12, color: TEXT_SECONDARY },
  compareBarTrack: {
    flex: 1,
    height: 10,
    borderRadius: 6,
    backgroundColor: SILVER.light,
    overflow: 'hidden',
  },
  compareBarFill: { height: '100%', borderRadius: 6 },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: TEXT_PRIMARY, marginBottom: 12 },

  emptyState: { alignItems: 'center', paddingVertical: 32, gap: 10 },
  emptyText: { color: TEXT_SECONDARY, fontSize: 13, textAlign: 'center', lineHeight: 19 },

  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: BORDER,
  },
  txIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: SILVER.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txLabel: { fontSize: 14, fontWeight: '600', color: TEXT_PRIMARY },
  txDate: { fontSize: 12, color: TEXT_SECONDARY, marginTop: 2 },
  txAmount: { fontSize: 14, fontWeight: '700' },

  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowColor: ELECTRIC.base,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(16,24,40,0.4)' },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 32,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: BORDER,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: { fontSize: 17, fontWeight: '700', color: TEXT_PRIMARY, marginBottom: 20, textAlign: 'center' },

  typeRow: { flexDirection: 'row', gap: 12 },
  typeButton: {
    flex: 1,
    height: 90,
    borderWidth: 1.5,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  typeButtonText: { fontSize: 14, fontWeight: '700' },

  amountWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  amountCurrency: { fontSize: 28, fontWeight: '700', color: TEXT_SECONDARY, marginRight: 6 },
  amountInput: { fontSize: 34, fontWeight: '800', color: TEXT_PRIMARY, minWidth: 120, textAlign: 'center' },

  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24, justifyContent: 'center' },
  chip: {
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipActive: { backgroundColor: ELECTRIC.base, borderColor: ELECTRIC.base },
  chipText: { fontSize: 13, color: TEXT_SECONDARY, fontWeight: '600' },
  chipTextActive: { color: '#FFFFFF' },

  saveButton: {
    height: TOUCH_TARGET,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

  cancelButton: { marginTop: 14, alignItems: 'center' },
  cancelText: { color: TEXT_SECONDARY, fontSize: 13 },
});