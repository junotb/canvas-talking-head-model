'use client';

import { useEffect, useRef } from 'react';
import { Viseme } from '../types/types';
import Script from 'next/script';

const Mimi = ({
  mimiProps
}: {
  mimiProps: {
    voice: string,
    script: string,
    rate: number,
    pitch: number
  }
}) => {
  const voice = mimiProps.voice;
  const script = mimiProps.script;
  const rate = mimiProps.rate;
  const pitch = mimiProps.pitch;

  const SPEECH_KEY = process.env.SPEECH_KEY!;
  const SPEECH_REGION = process.env.SPEECH_REGION!;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageCache = new Map();
  const TRANSITION_DELAY = 60;
  let ctx: CanvasRenderingContext2D;
  let ttsAudio: HTMLAudioElement;
  let audioDestination: any;

  const tts = () => {
    // Synthesizer 객체 생성
    audioDestination = new window.SpeechSDK.SpeakerAudioDestination();    
    const speechConfig = window.SpeechSDK.SpeechConfig.fromSubscription(SPEECH_KEY, SPEECH_REGION);
    const audioConfig = window.SpeechSDK.AudioConfig.fromSpeakerOutput(audioDestination);
    let synthesizer = new window.SpeechSDK.SpeechSynthesizer(speechConfig, audioConfig);

    // 자동재생 방지
    audioDestination.onAudioStart = () => {
      audioDestination.pause();
    };

    // Viseme 배열 초기화
    let visemes: Viseme[] = [];

    // SSML 마크업을 음원으로 변환
    const ssml = `
      <speak version='1.0' xml:lang='en-US'>
        <voice xml:lang='en-US' name='${voice}' rate='${rate}' pitch='${pitch}'>
          ${script}
        </voice>
      </speak>
    `;
    synthesizer.speakSsmlAsync(
      ssml,
      (result: any) => {
        // 사용자 콜백함수 실행
        // 성공여부: Boolean, Audio 데이터: ArrayBuffer -> any, Viseme 데이터: Viseme[]
        if (result.reason === window.SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
          result_SynthesizingAudioCompleted(
            result.audioData
            , visemes
          );
        }
        
        synthesizer.close();
        synthesizer = undefined;
      },
      (error: any) => {
        // 사용자 콜백함수 실행
        error_SynthesizingAudioCompleted(error);

        synthesizer.close();
        synthesizer = undefined;
      }
    );
    
    // Viseme 수신 이벤트 함수   
    synthesizer.visemeReceived = (s: any, e: any) => {
      // window.console.log("(Viseme), Audio offset: " + e.audioOffset / 10000 + "ms. Viseme ID: " + e.visemeId);

      // `Animation` is an xml string for SVG or a json string for blend shapes
      const animation = e.Animation;

      const viseme: Viseme = {
        offset: e.audioOffset / 10000,
        id: e.visemeId
      }
      visemes.push(viseme);
    }
  };

  const result_SynthesizingAudioCompleted = (audioData: any, visemes: Viseme[]) => {
    const audioUrl = window.URL.createObjectURL(new Blob([audioData], { type: "audio/mp3" }));
    playAudio(audioUrl, visemes);
  };

  const error_SynthesizingAudioCompleted = (error: any) => {
    window.console.log(error);
  };

  const loadImageBySrc = (pathname: string) => {
    if (imageCache.has(pathname)) {
      return Promise.resolve(imageCache.get(pathname))
    }

    return new Promise(resolve => {
      const image = new window.Image();
      image.onload = () => {
        imageCache.set(pathname, image);
        resolve(image);
      };
      image.src = pathname;
    });
  }

  const drawImage = async (pathname: string) => {
    const image = await loadImageBySrc(pathname);
    ctx.drawImage(image, 0, 0);
  }

  const clearEyes = () => {
    ctx.fillStyle = 'rgb(90, 81, 74)';
    ctx.fillRect(293, 156, 40, 44);
    ctx.fillRect(167, 156, 40, 44);
  }

  const sleep = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  const eyeBlink = async () => {
    const leftEye = await loadImageBySrc('/images/eye-l.png');
    const rightEye = await loadImageBySrc('/images/eye-r.png');

    const targetHeight = Math.floor(leftEye.height * 0.2);
    const ANIMATION_STEP = 20;
    let height = leftEye.height;

    while (height > targetHeight) {
      await sleep(ANIMATION_STEP);
      height *= 0.8;
      clearEyes();
      ctx.drawImage(leftEye, 0, (leftEye.height - height) / 3, leftEye.width, height);
      ctx.drawImage(rightEye, 0, (rightEye.height - height) / 3, rightEye.width, height);
    }

    await sleep(ANIMATION_STEP);
    clearEyes();
    ctx.drawImage(leftEye, 0, (leftEye.height - targetHeight) / 3, leftEye.width, targetHeight);
    ctx.drawImage(rightEye, 0, (rightEye.height - targetHeight) / 3, rightEye.width, targetHeight);

    await sleep(75);
    clearEyes();
    await drawImage('/images/eye-l-closed.png');
    await drawImage('/images/eye-r-closed.png');

    await sleep(120);
    clearEyes();
    await drawImage('/images/eye-l.png');
    await drawImage('/images/eye-r.png');
  }

  const drawMouthFrame = async (id: string) => {
    const image = await loadImageBySrc(`/images/mouth-${id}.png`);

    ctx.fillStyle = 'rgb(90, 81, 74)';
    ctx.fillRect(200, 165, 100, 75);
    ctx.drawImage(image, 0, 0);
  }

  const playAudio = async (audioUrl: string, visemes: Viseme[]) => {
    if (ttsAudio) {
      ttsAudio.pause();
    }
    ttsAudio = new Audio(audioUrl);

    ttsAudio.ontimeupdate = () => {
      const currentViseme = visemes.find(viseme => {
        return viseme.offset - (TRANSITION_DELAY / 2) >= ttsAudio.currentTime * 1000;
      });

      if (currentViseme) {
        drawMouthFrame(currentViseme!.id ?? 0);
      }
    };

    ttsAudio.play();
  }

  useEffect(() => {
    const init = async () => {
      const BLINK_INTERVAL = 3500;
      ctx = canvasRef.current!.getContext('2d')!;

      const imageIds = ['/images/body.png', '/images/eye-l.png', '/images/eye-r.png', '/images/mouth-0.png'];
      imageIds.forEach(async (imageId) => {        
        const image = await loadImageBySrc(imageId);
        ctx.drawImage(image, 0, 0);
      });

      eyeBlink();
      setInterval(() => {
        eyeBlink();
      }, BLINK_INTERVAL);
    };
    init();
  }, []);

  useEffect(() => {
    if (voice === '' || script === '') {
      return;
    }
    tts();
  }, [voice, script, rate, pitch]);

  return (
    <>
      <Script src="https://aka.ms/csspeech/jsbrowserpackageraw" />
      <canvas
        id='canvas'
        ref={canvasRef}
        width={512}
        height={512}
      />
    </>
  )
}
export default Mimi;