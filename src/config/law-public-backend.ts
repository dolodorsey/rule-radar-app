export const LAW_APPROVED_PROJECT_REF = 'dzlmtvodpyhetvektfuo'
export const LAW_APPROVED_SUPABASE_URL = `https://${LAW_APPROVED_PROJECT_REF}.supabase.co`

export function assertLawPublicBackend(url: string, key: string) {
  if (url !== LAW_APPROVED_SUPABASE_URL) {
    throw new Error('THE LAW backend configuration does not match the approved project.')
  }
  if (!key || key.length < 20) {
    throw new Error('THE LAW publishable backend key is missing or malformed.')
  }
  if (/service_role|sb_secret_/i.test(key)) {
    throw new Error('THE LAW client configuration contains a secret credential.')
  }
}
