'use client';

import { useRef } from 'react';
import Mimi, { MimiHandle } from '@/components/Mimi';

const Home = () => {
  const mimiRef = useRef<MimiHandle>(null);

  const voiceRef = useRef<HTMLSelectElement>(null);
  const scriptRef = useRef<HTMLTextAreaElement>(null);
  const rateRef = useRef<HTMLInputElement>(null);
  const pitchRef = useRef<HTMLInputElement>(null);

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    console.log('handleFocus');
    event.currentTarget.value = '';
  }

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    console.log('handleBlur');
    const min = parseInt(event.currentTarget.getAttribute('min')!);
    const max = parseInt(event.currentTarget.getAttribute('max')!);
    const value = parseInt(event.currentTarget.value);

    if (Number.isNaN(value)) {
      event.currentTarget.value = '0';
      return;
    }
    if (value < min) {
      event.currentTarget.value = `${min.toString()}%`;
      return;
    }
    if (value > max) {
      event.currentTarget.value = `${max.toString()}%`;
      return;
    }
    event.currentTarget.value = `${value.toString()}%`;
  }

  const handleClick = () => {
    const voice = voiceRef.current!.value;
    const script = scriptRef.current!.value;
    const rate = rateRef.current!.value;
    const pitch = pitchRef.current!.value;

    mimiRef.current!.activeMimi(voice, script, rate, pitch);
  }

  return (
    <main className='flex flex-col items-center overflow-hidden'>
      <div>
        <Mimi ref={mimiRef} />
      </div>
      <div className='w-64 space-y-4'>
        <div className='flex items-center gap-4'>
          <p>Voice: </p>
          <select
            name='voice'
            ref={voiceRef}
            className='border-2 border-white outline-none px-4 py-2 w-full bg-transparent'
            placeholder='Voice'
          >
            <option value='en-US-JasonNeural'>Jason</option>
            <option value='en-US-CoraNeural'>Cora</option>
            <option value='en-GB-RyanNeural'>Ryan</option>
            <option value='en-GB-AbbiNeural'>Abbi</option>
          </select>
        </div>
        <div className='flex items-center gap-4'>
          <p>Script: </p>
          <textarea
            name='script'
            ref={scriptRef}
            className='border-2 border-white focus:border-neutral-500 outline-none px-4 py-2 w-full bg-transparent'
          />
        </div>
        <div className='flex items-center gap-4'>
          <p>Rate: </p>
          <input
            type='text'
            name='rate'
            ref={rateRef}
            className='border-2 border-white focus:border-neutral-500 outline-none w-full px-4 py-2 bg-transparent text-right'
            placeholder='Rate'
            min={-100}
            max={100}
            defaultValue={0}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>
        <div className='flex items-center gap-4'>
          <p>Pitch: </p>
          <input
            type='text'
            name='pitch'
            ref={pitchRef}
            className='border-2 border-white focus:border-neutral-500 outline-none w-full px-4 py-2 bg-transparent text-right'
            placeholder='Pitch'
            min={-100}
            max={100}
            defaultValue={0}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>
        <button
          className='border-2 border-white active:border-neutral-500 active:text-neutral-500 px-4 py-2 w-full'
          onClick={handleClick}
        >Play</button>
      </div>
    </main>
  )
}
export default Home;