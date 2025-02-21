'use client';

import { SpeechConfig, AudioConfig, SpeakerAudioDestination, SpeechSynthesizer, ResultReason, SpeechSynthesisResult } from 'microsoft-cognitiveservices-speech-sdk';

const SPEECH_KEY = process.env.NEXT_PUBLIC_SPEECH_KEY!;
const SPEECH_REGION = process.env.NEXT_PUBLIC_SPEECH_REGION!;

interface TextToSpeechResult {
  audio: Blob;
  visemes: Viseme[];
}

/**
 * 텍스트를 음성으로 변환하고 시각화 데이터를 반환합니다.
 * @param voice 음성 이름
 * @param expressStyle 음성 스타일
 * @param phrase 텍스트
 * @returns 음성 데이터와 시각화 데이터
 */
const texttospeech = async (voice: string, expressStyle: string, phrase: string, rate: string, pitch: string): Promise<TextToSpeechResult> => {
  return new Promise((resolve, reject) => {
    // Synthesizer 객체 생성
    const audioDestination = new SpeakerAudioDestination();    
    const speechConfig = SpeechConfig.fromSubscription(SPEECH_KEY, SPEECH_REGION);
    const audioConfig = AudioConfig.fromSpeakerOutput(audioDestination);
    const synthesizer = new SpeechSynthesizer(speechConfig, audioConfig);

    // 자동재생 방지
    audioDestination.onAudioStart = () => audioDestination.pause();

    // Viseme 배열 초기화
    let visemes: Viseme[] = [];

    // SSML 마크업을 음원으로 변환
    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
        <voice name="${voice}" rate="${rate}" pitch="${pitch}">
          <mstts:express-as style="${expressStyle}" styledegree="2">
            ${phrase}
          </mstts:express-as>
        </voice>
      </speak>
    `;
    
    synthesizer.speakSsmlAsync(
      ssml,
      (result: SpeechSynthesisResult) => {
        if (result.reason === ResultReason.SynthesizingAudioCompleted) {
          const audio = new Blob([result.audioData], { type: 'audio/wav' });

          resolve({ audio, visemes });
        } else {
          reject(new Error('음성 합성 실패'));
        }
        
        synthesizer.close();
      },
      (error: string) => {
        console.error(error);
        synthesizer.close();
        reject(new Error('음성 합성 실패'));
      }
    );
    
    // Viseme 수신 이벤트 함수   
    synthesizer.visemeReceived = (s: any, e: any) => {
      visemes.push({
        audioOffset: e.audioOffset / 10000,
        visemeId: e.visemeId
      });
    }
  });
};

export { texttospeech };