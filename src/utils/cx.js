/** Joins class names, skipping anything falsy. */
export function cx(...classNames) {
  return classNames.filter(Boolean).join(' ')
}
