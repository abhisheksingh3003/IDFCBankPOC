/**
 * Shared Speech Synthesis Service for IDFC First Bank AI Travel Planner
 * Uses Google Cloud Text-to-Speech for premium "Journey/Neural" quality.
 * Falls back to browser Web Speech API if Cloud API is unavailable.
 */

const getApiKey = () => {
    return (import.meta as any).env?.VITE_GEMINI_API_KEY || "";
};

// --- Google Cloud TTS Support ---
const VOICE_MAPPING: Record<string, string> = {
    'pl': 'pl-PL-Neural2-A',
    'en': 'en-US-Journey-F', // Premium Journey voice
};

const SECONDARY_VOICE_MAPPING: Record<string, string> = {
    'pl': 'pl-PL-Wavenet-A',
    'en': 'en-US-Neural2-F',
};

async function synthesizeCloudSpeech(text: string, lang: string): Promise<string | null> {
    const apiKey = getApiKey();
    if (!apiKey) return null;

    const baseLang = lang.split('-')[0].toLowerCase();
    const voiceName = VOICE_MAPPING[baseLang] || VOICE_MAPPING['en'];
    const languageCode = lang.includes('-') ? lang : (baseLang === 'pl' ? 'pl-PL' : 'en-US');

    try {
        const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                input: { text },
                voice: { languageCode, name: voiceName },
                audioConfig: { audioEncoding: 'MP3', pitch: 0, speakingRate: 1.0 }
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.warn("Google Cloud TTS Primary Voice failed:", errorData);
            
            // Try fallback voice in case Journey is not enabled/available
            const secondaryVoice = SECONDARY_VOICE_MAPPING[baseLang] || SECONDARY_VOICE_MAPPING['en'];
            const retryResponse = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    input: { text },
                    voice: { languageCode, name: secondaryVoice },
                    audioConfig: { audioEncoding: 'MP3' }
                })
            });
            
            if (!retryResponse.ok) {
                const retryError = await retryResponse.json().catch(() => ({}));
                console.error("Google Cloud TTS Secondary Voice also failed:", retryError);
                return null;
            }
            const data = await retryResponse.json();
            return data.audioContent;
        }

        const data = await response.json();
        return data.audioContent;
    } catch (err) {
        console.error("Google Cloud TTS Network/Fetch Error:", err);
        return null;
    }
}

let currentAudio: HTMLAudioElement | null = null;

// --- Browser Web Speech Fallback ---
export const getBestBrowserVoice = (voices: SpeechSynthesisVoice[], targetLang: string = 'en') => {
    const baseLang = targetLang.split('-')[0].toLowerCase();
    
    // 1. Filter voices matching the target language strictly
    const langVoices = voices.filter(v => 
        v.lang.toLowerCase().startsWith(baseLang) || 
        (baseLang === 'en' && v.lang.toLowerCase().includes('en'))
    );

    if (langVoices.length === 0) {
        console.warn(`No browser voices found for language: ${targetLang}. Using all available.`);
    }

    const searchPool = langVoices.length > 0 ? langVoices : voices;

    // 2. Prioritize "Natural", "Neural", "Google", "Online" voices which sound better
    // AND prioritize female voices for the "Anya" character
    const findVoice = (criteria: (v: SpeechSynthesisVoice) => boolean) => searchPool.find(criteria);

    // Try Natural + Female
    const naturalFemale = findVoice(v => 
        (v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Online')) && 
        (v.name.includes('Female') || v.name.includes('Aria') || v.name.includes('Zira') || v.name.includes('Samantha'))
    );
    if (naturalFemale) return naturalFemale;

    // Try Natural (any)
    const naturalAny = findVoice(v => 
        v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Online')
    );
    if (naturalAny) return naturalAny;

    // Try Google + Female
    const googleFemale = findVoice(v => 
        v.name.includes('Google') && v.name.includes('Female')
    );
    if (googleFemale) return googleFemale;

    // Try any Female in target lang
    const anyFemale = findVoice(v => 
        v.name.includes('Female') || v.name.includes('Aria') || v.name.includes('Zira') || v.name.includes('Samantha')
    );
    if (anyFemale) return anyFemale;

    // Try Google (any) in target lang
    const googleAny = findVoice(v => v.name.includes('Google'));
    if (googleAny) return googleAny;

    // Fallback to the first voice in our filtered language pool, or the very first voice
    return langVoices[0] || voices[0];
};

const speakBrowserFallback = (text: string, lang: string = 'en', onEnd?: () => void) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (onEnd) utterance.onend = onEnd;
    
    // Ensure the utterance language is set correctly so the OS knows what to speak
    utterance.lang = lang === 'pl' ? 'pl-PL' : (lang.includes('-') ? lang : 'en-US');
    
    const voices = window.speechSynthesis.getVoices();
    const voice = getBestBrowserVoice(voices, lang);
    if (voice) {
        console.log("Using browser fallback voice:", voice.name, voice.lang);
        utterance.voice = voice;
    }
    
    window.speechSynthesis.speak(utterance);
};

export const speakText = async (text: string, options: { isMuted?: boolean, onEnd?: () => void, lang?: string } = {}) => {
    if (options.isMuted) {
        if (options.onEnd) options.onEnd();
        return;
    }

    // Stop anything currently playing
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
    window.speechSynthesis.cancel();

    const lang = options.lang || 'en-US';
    
    // 1. Try Google Cloud TTS (Premium)
    const audioContent = await synthesizeCloudSpeech(text, lang);
    
    if (audioContent) {
        const audioBlob = new Blob([Uint8Array.from(atob(audioContent), c => c.charCodeAt(0))], { type: 'audio/mp3' });
        const url = URL.createObjectURL(audioBlob);
        currentAudio = new Audio(url);
        if (options.onEnd) currentAudio.onended = options.onEnd;
        currentAudio.play().catch(err => {
            console.warn("Cloud Audio Playback failed, falling back to browser:", err);
            speakBrowserFallback(text, lang, options.onEnd);
        });
    } else {
        // 2. Fallback to Browser TTS
        speakBrowserFallback(text, lang, options.onEnd);
    }
}

