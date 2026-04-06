/**
 * soundService — Web Audio API sound generator
 * No external audio files needed, works in Capacitor WebView.
 */

let audioCtx: AudioContext | null = null;

const getCtx = (): AudioContext => {
    if (!audioCtx || audioCtx.state === 'closed') {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtx;
};

/** Resume context after user gesture (required by browsers) */
const resume = async () => {
    const ctx = getCtx();
    if (ctx.state === 'suspended') await ctx.resume();
    return ctx;
};

/**
 * Play a sequence of tones.
 * notes: array of { freq, duration (s), type }
 */
const playTones = async (
    notes: { freq: number; dur: number; vol?: number }[],
    wave: OscillatorType = 'sine'
) => {
    try {
        const ctx = await resume();
        let t = ctx.currentTime;
        notes.forEach(({ freq, dur, vol = 0.4 }) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = wave;
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(vol, t + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
            osc.start(t);
            osc.stop(t + dur);
            t += dur;
        });
    } catch (e) {
        console.warn('Sound play failed:', e);
    }
};

export const soundService = {
    /**
     * Suara pesan baru — 2 nada pendek naik (ding-dong)
     */
    async playNewMessage() {
        await playTones([
            { freq: 880, dur: 0.12, vol: 0.35 },
            { freq: 1100, dur: 0.18, vol: 0.3 },
        ], 'sine');
    },

    /**
     * Suara pengumuman — 3 nada tegas (fanfare mini)
     */
    async playAnnouncement() {
        await playTones([
            { freq: 523, dur: 0.1, vol: 0.4 },  // C5
            { freq: 659, dur: 0.1, vol: 0.4 },  // E5
            { freq: 784, dur: 0.1, vol: 0.4 },  // G5
            { freq: 1047, dur: 0.25, vol: 0.45 }, // C6
        ], 'triangle');
    },

    /**
     * Suara deadline warning — nada turun berulang
     */
    async playDeadlineWarning() {
        await playTones([
            { freq: 660, dur: 0.15, vol: 0.4 },
            { freq: 440, dur: 0.15, vol: 0.4 },
            { freq: 660, dur: 0.15, vol: 0.4 },
            { freq: 440, dur: 0.25, vol: 0.45 },
        ], 'sawtooth');
    },

    /** Unlock audio context on first user interaction */
    unlock() {
        getCtx();
    }
};

export default soundService;
