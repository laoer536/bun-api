export function generateVerificationCode() {
  const min = 100000
  const max = 999999
  return Math.floor(Math.random() * (max - min + 1)) + min // Generate 6-digit random numbers
}
