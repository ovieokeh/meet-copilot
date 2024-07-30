declare module 'web-audio-api' {
  export class AudioContext {
    decodeAudioData(
      buffer: Buffer,
      cb: (audioBuffer: AudioBuffer) => void
    ): void
  }
}
