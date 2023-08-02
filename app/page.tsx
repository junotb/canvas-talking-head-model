'use client';

import { useRef, useState } from 'react';
import Mimi from '@/components/Mimi';

const Home = () => {
  const voiceRef = useRef<HTMLSelectElement>(null);
  const scriptRef = useRef<HTMLTextAreaElement>(null);
  const rateRef = useRef<HTMLInputElement>(null);
  const pitchRef = useRef<HTMLInputElement>(null);
  const [mimiProps, setMimiProps] = useState({
    voice: '',
    script: '',
    rate: 0,
    pitch: 0
  });

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
    event.currentTarget.value = value.toString();
  }

  const handleClick = () => {
    const voice = voiceRef.current!.value;
    const script = scriptRef.current!.value;
    const rate = parseInt(rateRef.current!.value);
    const pitch = parseInt(pitchRef.current!.value);

    const props = {
      voice: voice,
      script: script,
      rate: rate,
      pitch: pitch
    }
    setMimiProps(props);
  }

  return (
    <main className='flex flex-col items-center overflow-hidden'>
      <div>
        <Mimi
          mimiProps={mimiProps}
        />
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
            type='number'
            name='rate'
            ref={rateRef}
            className='border-2 border-white focus:border-neutral-500 outline-none w-full px-4 py-2 bg-transparent'
            placeholder='Rate'
            min={-100}
            max={100}
            defaultValue={0}
            onChange={handleChange}
          />
          <p>%</p>
        </div>
        <div className='flex items-center gap-4'>
          <p>Pitch: </p>
          <input
            type='number'
            name='pitch'
            ref={pitchRef}
            className='border-2 border-white focus:border-neutral-500 outline-none w-full px-4 py-2 bg-transparent'
            placeholder='Pitch'
            min={-100}
            max={100}
            defaultValue={0}
            onChange={handleChange}
          />
          <p>%</p>
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