
import React, { useState, useEffect } from 'react';
import { getKeywordImage, CATEGORY_FALLBACKS, getHash } from '../services/imageService';

interface SafeImageProps {
    src?: string;
    alt: string;
    className?: string;
    category?: 'flight' | 'hotel' | 'activity' | 'dining' | 'transfer' | 'generic';
    style?: React.CSSProperties;
}

const SafeImage: React.FC<SafeImageProps> = ({ 
    src, 
    alt, 
    className = "", 
    category = 'generic',
    style
}) => {
    const [error, setError] = useState(false);
    const [finalUrl, setFinalUrl] = useState<string | null>(null);

    useEffect(() => {
        // Reset error state when src changes
        setError(false);
        
        if (!src) {
            setFinalUrl(null);
            return;
        }

        if (src.startsWith('keyword:')) {
            const keyword = src.replace('keyword:', '');
            const unsplashId = getKeywordImage(keyword);
            if (unsplashId) {
                setFinalUrl(`https://images.unsplash.com/${unsplashId}?auto=format&fit=crop&q=80&w=800&sig=${encodeURIComponent(src)}`);
            } else {
                setFinalUrl(null); // Force fallback
            }
        } else {
            setFinalUrl(src);
        }
    }, [src]);

    const getFallbackUrl = () => {
        const cat = category === 'generic' ? 'activity' : category;
        const list = CATEGORY_FALLBACKS[cat] || CATEGORY_FALLBACKS.activity;
        
        // Deterministic selection based on alt text if possible, otherwise first one
        const index = alt ? (getHash(alt) % list.length) : 0;
        const unsplashId = list[index];
        
        return `https://images.unsplash.com/${unsplashId}?auto=format&fit=crop&q=80&w=800`;
    };

    return (
        <img 
            src={error || !finalUrl ? getFallbackUrl() : finalUrl} 
            alt={alt} 
            className={className} 
            style={style}
            onError={() => setError(true)}
            loading="lazy"
        />
    );
};

export default SafeImage;
