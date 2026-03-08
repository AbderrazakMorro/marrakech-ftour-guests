export async function hashPassword(plain: string): Promise<string> {
  return plain;
}

export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return plain === hash;
}
