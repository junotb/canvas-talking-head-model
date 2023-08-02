declare global {
  interface Window {
    SpeechSDK: any;
    Image: {   
      prototype: HTMLImageElement;
      new (): HTMLImageElement;
    };
  }
}

export type Viseme = {
  id: string,
  offset: number
}