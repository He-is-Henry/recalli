"use client";

import { useRef, useCallback } from "react";

export function useSounds() {
  const ctxRef = useRef<AudioContext | null>(null);

  const ctx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    return ctxRef.current;
  }, []);

  const play = useCallback(
    (
      frequency: number,
      type: OscillatorType,
      duration: number,
      gainPeak: number,
      pitchEnd?: number,
      delay = 0,
    ) => {
      const ac = ctx();
      const osc = ac.createOscillator();
      const gain = ac.createGain();

      osc.connect(gain);
      gain.connect(ac.destination);

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ac.currentTime + delay);
      if (pitchEnd !== undefined) {
        osc.frequency.exponentialRampToValueAtTime(
          pitchEnd,
          ac.currentTime + delay + duration,
        );
      }

      gain.gain.setValueAtTime(0, ac.currentTime + delay);
      gain.gain.linearRampToValueAtTime(
        gainPeak,
        ac.currentTime + delay + 0.01,
      );
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        ac.currentTime + delay + duration,
      );

      osc.start(ac.currentTime + delay);
      osc.stop(ac.currentTime + delay + duration);
    },
    [ctx],
  );

  const playCorrect = useCallback(() => {
    play(440, "sine", 0.12, 0.3, 880);
    play(880, "sine", 0.18, 0.15, undefined, 0.08);
  }, [play]);

  const playWrong = useCallback(() => {
    play(180, "sawtooth", 0.25, 0.25, 80);
  }, [play]);

  const playWin = useCallback(() => {
    play(440, "sine", 0.15, 0.3, 660);
    play(660, "sine", 0.15, 0.25, 880, 0.15);
    play(880, "sine", 0.3, 0.2, 1100, 0.3);
  }, [play]);

  const playLose = useCallback(() => {
    play(300, "sawtooth", 0.2, 0.2, 150);
    play(150, "sawtooth", 0.3, 0.15, 80, 0.2);
  }, [play]);

  const playBegin = useCallback(() => {
    play(300, "sine", 0.1, 0.15, 600);
  }, [play]);

  const playHover = useCallback(() => {
    play(600, "sine", 0.05, 0.04);
  }, [play]);

  const playClick = useCallback(() => {
    play(200, "sine", 0.06, 0.1, 180);
  }, [play]);

  const playReviewCorrect = useCallback(() => {
    play(440, "sine", 0.1, 0.12, 660);
  }, [play]);

  const playReviewWrong = useCallback(() => {
    play(180, "sawtooth", 0.18, 0.1, 100);
  }, [play]);

  return {
    playCorrect,
    playWrong,
    playWin,
    playLose,
    playBegin,
    playHover,
    playClick,
    playReviewCorrect,
    playReviewWrong,
  };
}
