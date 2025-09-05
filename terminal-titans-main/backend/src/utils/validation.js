import validator from 'validator'

export function validateTarget(target) {
  try {
    // Check if the target is empty or not a string
    if (!target || typeof target !== 'string') {
      throw new Error('Target URL is required and must be a string')
    }

    // Trim whitespace
    target = target.trim()

    // Check URL format using validator
    if (!validator.isURL(target, {
      protocols: ['http', 'https'],
      require_protocol: true,
      require_valid_protocol: true
    })) {
      throw new Error('Invalid URL format. URL must start with http:// or https://')
    }

    // Parse URL for additional checks
    const url = new URL(target)

    // Check for localhost and private IPs
    if (
      url.hostname === 'localhost' ||
      url.hostname === '127.0.0.1' ||
      /^192\.168\./.test(url.hostname) ||
      /^10\./.test(url.hostname) ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(url.hostname)
    ) {
      throw new Error('Scanning local or private networks is not allowed')
    }

    // Additional security checks
    if (url.port && parseInt(url.port) <= 1024) {
      throw new Error('Scanning privileged ports (0-1024) is not allowed')
    }

    return true
  } catch (error) {
    if (error.message.includes('Invalid URL')) {
      throw new Error('Please enter a valid URL (e.g., https://example.com)')
    }
    throw error
  }
}