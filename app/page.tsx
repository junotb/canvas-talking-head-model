'use client';

import Image from 'next/image'
import { useEffect, useRef } from 'react';
import { FrameData } from '../types/types';

const Home = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const voiceRef = useRef<HTMLSelectElement>(null);
  const rateRef = useRef<HTMLInputElement>(null);
  const pitchRef = useRef<HTMLInputElement>(null);
  const imageCache = new Map();
  let ctx: CanvasRenderingContext2D;
  let ttsAudio: HTMLAudioElement;

  /*
  const loadImage = (id: string): Promise<HTMLImageElement> => {
    return new Promise(resolve => {
      const image = document.getElementById(id) as HTMLImageElement;
      if (image.complete) {
        return resolve(image);
      }

      image.onload = () => {
        resolve(image);
      };
    });
  }
  */

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

  const playAudio = async (id: string) => {
    if (ttsAudio) {
      ttsAudio.pause();
    }
    ttsAudio = new Audio(`/audios/${id}.wav`);
    
    const response = await fetch(new Request(`/jsons/${id}.json`), {
      method: 'GET',
      mode: 'no-cors'
    });
    const visemeData: FrameData[] = await response.json();

    ttsAudio.ontimeupdate = () => {
      const currentFrame = visemeData.find(frameData => {
        const TRANSITION_DELAY = 60;
        return frameData.offset - (TRANSITION_DELAY / 2) >= ttsAudio.currentTime * 1000;
      });
      drawMouthFrame(currentFrame!.id ?? 0);
    };

    ttsAudio.play();
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const min = parseInt(event.currentTarget.getAttribute('min')!);
    const max = parseInt(event.currentTarget.getAttribute('max')!);
    const value = parseInt(event.currentTarget.value);

    if (value < min) {
      event.currentTarget.value = min.toString();
      return;
    }
    if (value > max) {
      event.currentTarget.value = max.toString();
      return;
    }
  }

  const handleClick = () => {
    const voice = voiceRef.current!.value;
    playAudio(voice);
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

  return (
    <main className='flex flex-col h-screen items-center justify-center gap-8'>
      <div>
        <canvas
          id='canvas'
          ref={canvasRef}
          width={512}
          height={512}
        />
      </div>
      <div className='flex flex-col w-64 gap-4'>
        <select
          name='voice'
          ref={voiceRef}
          className='border-2 border-white outline-none px-4 py-2 bg-transparent'
          placeholder='Voice'
        >
          <option value='british'>British</option>
          <option value='french'>French</option>
          <option value='korean'>Korean</option>
        </select>
        <div className='flex items-center gap-4 hidden'>
          <input
            type='number'
            name='rate'
            ref={rateRef}
            className='border-2 border-white outline-none w-full px-4 py-2 bg-transparent'
            placeholder='Rate'
            min={-100}
            max={100}
            defaultValue={0}
            onChange={handleChange}
          />
          <p>%</p>
        </div>
        <div className='flex items-center gap-4 hidden'>
          <input
            type='number'
            name='pitch'
            ref={pitchRef}
            className='border-2 border-white outline-none w-full px-4 py-2 bg-transparent'
            placeholder='Pitch'
            min={-100}
            max={100}
            defaultValue={0}
            onChange={handleChange}
          />
          <p>%</p>
        </div>
        <button
          className='border-2 border-white active:border-neutral-500 px-4 py-2'
          onClick={handleClick}
        >Play</button>
      </div>
    </main>
  )
}
export default Home;