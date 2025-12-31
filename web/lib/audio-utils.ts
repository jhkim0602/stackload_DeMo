export class AudioProcessor {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private onAudioData: (data: Float32Array) => void;

  constructor(onAudioData: (data: Float32Array) => void) {
    this.onAudioData = onAudioData;
  }

  async start() {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 16000, // Prepare for 16kHz if possible
        },
      });

      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000, // Force 16kHz context if supported
      });

      this.source = this.audioContext.createMediaStreamSource(this.mediaStream);

      // Use ScriptProcessor for broad compatibility (though deprecated, AudioWorklet is complex in simple setup)
      // Buffer size 4096 gives ~250ms chunks at 16kHz
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

      this.processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        // Clone data to avoid reference issues
        this.onAudioData(new Float32Array(inputData));
      };

      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination); // Valid destination required for Chrome

    } catch (error) {
      console.error("Failed to start audio recording:", error);
      throw error;
    }
  }

  stop() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

export const playAudioQueue = async (
  audioQueue: Float32Array[],
  audioContext: AudioContext,
  sampleRate: number = 24000
) => {
  // Simple queue playback implementation would go here
  // For now, this logic will likely live in the hook or a separate player class
};
