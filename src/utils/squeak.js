let audioContext

/**
 * Plays a short rubber-duck squeak synthesised with the Web Audio API,
 * so no audio file needs to be shipped. Silently does nothing if audio
 * is unavailable.
 */
export function playSqueak() {
  try {
    audioContext ??= new (window.AudioContext || window.webkitAudioContext)()
    if (audioContext.state === 'suspended') audioContext.resume()

    const now = audioContext.currentTime
    const oscillator = audioContext.createOscillator()
    const gain = audioContext.createGain()

    oscillator.type = 'triangle'
    oscillator.frequency.setValueAtTime(820, now)
    oscillator.frequency.exponentialRampToValueAtTime(1500, now + 0.08)
    oscillator.frequency.exponentialRampToValueAtTime(640, now + 0.26)

    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28)

    oscillator.connect(gain)
    gain.connect(audioContext.destination)
    oscillator.start(now)
    oscillator.stop(now + 0.3)
  } catch {
    // Audio is a nicety; ignore browsers or settings that block it.
  }
}
