export function assertEqual<T extends number | string>(actual: T, expected: T): void {
  if (actual !== expected) {
    throw new Error(
      `Assertion Error: actual: \`${actual}\` is not equal to expected: \`${expected}\``
    )
  }
}

export function assertPositive(value: number): void {
  if (value <= 0) {
    throw new Error(`Assertion Error: expected ${value} > 0`)
  }
}
