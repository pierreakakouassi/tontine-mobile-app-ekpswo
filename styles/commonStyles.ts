
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

export const colors = {
  primary: '#FF6600',
  secondary: '#FFCC00',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  background: '#FFFFFF',
  surface: '#F8F9FA',
  card: '#FFFFFF',
  
  text: '#212121',
  textSecondary: '#757575',
  textLight: '#9E9E9E',
  
  border: '#E0E0E0',
  divider: '#EEEEEE',
  
  // Payment provider colors
  orange: '#FF6600',
  mtn: '#FFCC00',
  wave: '#00D4FF',
};

export const commonStyles = StyleSheet.create({
  // Layout
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  } as ViewStyle,

  container: {
    flex: 1,
    padding: 16,
  } as ViewStyle,

  scrollView: {
    flex: 1,
  } as ViewStyle,

  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 8,
  } as ViewStyle,

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  } as ViewStyle,

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  } as TextStyle,

  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 8,
    lineHeight: 24,
  } as TextStyle,

  // Content sections
  content: {
    flex: 1,
    marginBottom: 24,
  } as ViewStyle,

  section: {
    marginBottom: 32,
  } as ViewStyle,

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  } as TextStyle,

  // Cards
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  } as ViewStyle,

  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  } as TextStyle,

  // Rows and columns
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  } as ViewStyle,

  column: {
    flex: 1,
  } as ViewStyle,

  // Text styles
  text: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  } as TextStyle,

  label: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  } as TextStyle,

  value: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  } as TextStyle,

  helperText: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
    marginTop: 8,
  } as TextStyle,

  // Inputs
  inputContainer: {
    marginBottom: 20,
  } as ViewStyle,

  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
  } as ViewStyle,

  inputFocused: {
    borderColor: colors.primary,
  } as ViewStyle,

  // Buttons
  button: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  } as ViewStyle,

  primaryButton: {
    backgroundColor: colors.primary,
  } as ViewStyle,

  secondaryButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  } as ViewStyle,

  buttonDisabled: {
    opacity: 0.5,
  } as ViewStyle,

  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
  } as TextStyle,

  linkButton: {
    alignItems: 'center',
    padding: 8,
  } as ViewStyle,

  linkText: {
    fontSize: 14,
    color: colors.primary,
    textDecorationLine: 'underline',
  } as TextStyle,

  // Payment methods
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
    backgroundColor: colors.background,
  } as ViewStyle,

  paymentMethodSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  } as ViewStyle,

  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  } as ViewStyle,

  paymentMethodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  } as ViewStyle,

  paymentMethodName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  } as TextStyle,

  // Radio buttons
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  radioSelected: {
    borderColor: colors.primary,
  } as ViewStyle,

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  } as ViewStyle,

  // Status indicators
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  } as ViewStyle,

  statusText: {
    fontSize: 14,
    color: colors.textSecondary,
  } as TextStyle,

  // Settings
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  } as ViewStyle,

  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  } as TextStyle,

  settingDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  } as TextStyle,

  settingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
    backgroundColor: colors.background,
  } as ViewStyle,

  settingButtonText: {
    fontSize: 16,
    color: colors.primary,
    marginLeft: 12,
    fontWeight: '500',
  } as TextStyle,

  // Security notice
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: 24,
  } as ViewStyle,

  securityText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
  } as TextStyle,

  // Footer
  footer: {
    paddingTop: 24,
  } as ViewStyle,

  // Progress indicators
  progressContainer: {
    marginVertical: 16,
  } as ViewStyle,

  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  } as ViewStyle,

  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  } as ViewStyle,

  progressText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  } as TextStyle,

  // Loading states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  } as ViewStyle,

  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  } as TextStyle,

  // Error states
  errorContainer: {
    padding: 16,
    backgroundColor: colors.error + '10',
    borderRadius: 8,
    marginBottom: 16,
  } as ViewStyle,

  errorText: {
    fontSize: 14,
    color: colors.error,
    textAlign: 'center',
  } as TextStyle,

  // Success states
  successContainer: {
    padding: 16,
    backgroundColor: colors.success + '10',
    borderRadius: 8,
    marginBottom: 16,
  } as ViewStyle,

  successText: {
    fontSize: 14,
    color: colors.success,
    textAlign: 'center',
  } as TextStyle,
});
