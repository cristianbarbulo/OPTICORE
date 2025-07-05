export function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export function normalizeCode(code: string) {
  return code.toLowerCase().replace(/[^a-z0-9]/g, '')
}
