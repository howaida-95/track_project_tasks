type ErrorContext = Record<string, unknown>

const isDevelopment = import.meta.env.DEV

export function reportError(error: unknown, context?: ErrorContext): void {
  if (isDevelopment) {
    if (context) {
      console.error('[error]', error, context)
      return
    }

    console.error('[error]', error)
    return
  }

  // Production seam: forward to Sentry/Datadog/etc.
  void context
  void error
}
