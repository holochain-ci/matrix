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

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export function assertExists(value: any, message?: string): void {
  if (value == null) {
    throw new Error(
      'Assertion Error: value was null or undefined' + (message ? ` [ ${message} ]` : '')
    )
  }
}

export function assertPresent(value: string, message?: string): void {
  assertExists(value, message)
  if (value === '') {
    throw new Error('Assertion Error: value was empty string' + (message ? ` [ ${message} ]` : ''))
  }
}
