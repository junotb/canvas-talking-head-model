interface MimiHandle {
  activeMimi: (
    speechKey: string,
    speechRegion: string,
    voice: string,
    expressStyle: string,
    phrase: string,
    rate: string,
    pitch: string
  ) => void;
}

interface Viseme {
  audioOffset: number;
  visemeId: number;
}