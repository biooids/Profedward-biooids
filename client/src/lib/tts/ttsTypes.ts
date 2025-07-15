export interface Voice {
  id: string;
  name: string;
  gender: "male" | "female";
}

export interface TtsState {
  isOpen: boolean;
  isPlaying: boolean;
  isLoading: boolean;
  isError: boolean;
  textToPlay: string;
  audioUrl: string | null;
  duration: number;
  currentTime: number;
  selectedVoiceId: string;
}
