/**
 * Mapeamento de códigos de erro Firebase Authentication → mensagens em pt-BR.
 * SPEC: SPEC_AUTH.md §7.1
 *
 * SEGURANÇA: Nenhuma função neste módulo registra tokens, senhas ou dados do usuário em logs.
 */

export const AUTH_ERRORS: Record<string, string> = {
  // Cadastro
  'auth/email-already-in-use':
    'Este e-mail já está cadastrado. Tente fazer login.',
  'auth/invalid-email':
    'Formato de e-mail inválido.',
  'auth/weak-password':
    'Senha muito fraca. Use ao menos 8 caracteres com letras e números.',
  'auth/operation-not-allowed':
    'Este método de login não está habilitado. Entre em contato com o suporte.',

  // Login
  'auth/wrong-password':
    'E-mail ou senha incorretos.',
  'auth/user-not-found':
    'E-mail ou senha incorretos.',
  'auth/invalid-credential':
    'E-mail ou senha incorretos.',
  'auth/user-disabled':
    'Esta conta foi desativada. Entre em contato com o suporte.',

  // Limites
  'auth/too-many-requests':
    'Muitas tentativas seguidas. Aguarde alguns minutos antes de tentar novamente.',
  'auth/quota-exceeded':
    'Limite de operações atingido. Tente mais tarde.',

  // Rede
  'auth/network-request-failed':
    'Falha de conexão. Verifique sua internet e tente novamente.',

  // Token / Sessão
  'auth/id-token-expired':
    'Sua sessão expirou. Faça login novamente.',
  'auth/user-token-expired':
    'Sua sessão expirou. Faça login novamente.',
  'auth/invalid-user-token':
    'Sessão inválida. Faça login novamente.',

  // Recuperação de senha
  'auth/expired-action-code':
    'O link de redefinição expirou. Solicite um novo.',
  'auth/invalid-action-code':
    'Link de redefinição inválido ou já utilizado.',
};

/**
 * Converte um erro Firebase (ou qualquer objeto com `.code`) em mensagem pt-BR.
 * Nunca loga o erro original — caller é responsável por decidir o que logar.
 */
export function mapAuthError(error: unknown): string {
  const code = (error as { code?: string })?.code ?? '';
  return AUTH_ERRORS[code] ?? 'Ocorreu um erro inesperado. Tente novamente.';
}
