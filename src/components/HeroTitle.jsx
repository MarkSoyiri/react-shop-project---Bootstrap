import { useEffect, useRef, useMemo } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const lines = [
    ['Taste the Fire,', 'Feel the Rhythm'],
];

function Word({ word, lineIndex, wordIndex, totalWords }) {
    const ref = useRef(null);

    const entranceDelay = lineIndex * 0.18 + wordIndex * 0.09;

    return (
        <motion.span
            ref={ref}
            className="hero-title__word"
            initial={{ opacity: 0, y: 28, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{
                duration: 0.8,
                delay: 0.55 + entranceDelay,
                ease: [0.16, 1, 0.3, 1],
            }}
            style={{
                '--word-index': wordIndex,
                '--line-index': lineIndex,
                '--total-words': totalWords,
            }}
        >
            {word}
        </motion.span>
    );
}

function GlowOrb({ className }) {
    return (
        <motion.div
            className={`hero-title__glow ${className}`}
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.6, delay: 1.0, ease: [0.22, 1, 0.36, 1] }}
        />
    );
}

export default function HeroTitle() {
    const containerRef = useRef(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

    const springConfig = { stiffness: 60, damping: 20, mass: 1.5 };
    const smoothX = useSpring(mouseX, springConfig);
    const smoothY = useSpring(mouseY, springConfig);

    const parallaxX = useTransform(smoothX, [-0.5, 0.5], [-6, 6]);
    const parallaxY = useTransform(smoothY, [-0.5, 0.5], [-4, 4]);
    const glowX = useTransform(smoothX, [-0.5, 0.5], [-30, 30]);
    const glowY = useTransform(smoothY, [-0.5, 0.5], [-20, 20]);

    useEffect(() => {
        if (isTouchDevice) return;

        const el = containerRef.current;
        if (!el) return;

        const handleMouseMove = (e) => {
            const rect = el.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            mouseX.set(x);
            mouseY.set(y);
        };

        el.addEventListener('mousemove', handleMouseMove, { passive: true });
        return () => el.removeEventListener('mousemove', handleMouseMove);
    }, [mouseX, mouseY, isTouchDevice]);

    const wordCount = useMemo(
        () => lines.reduce((acc, line) => acc + line.length, 0),
        []
    );

    return (
        <div className="hero-title__wrapper" ref={containerRef}>
            <GlowOrb className="hero-title__glow--brand" />
            <GlowOrb className="hero-title__glow--accent" />

            <motion.h1
                className="hero-title"
                style={{ x: parallaxX, y: parallaxY }}
                role="heading"
                aria-level="1"
            >
                {lines.map((lineWords, lineIdx) => (
                    <span className="hero-title__line" key={lineIdx}>
                        {lineWords.map((word, wordIdx) => (
                            <Word
                                key={`${lineIdx}-${wordIdx}`}
                                word={word}
                                lineIndex={lineIdx}
                                wordIndex={wordIdx}
                                totalWords={wordCount}
                            />
                        ))}
                    </span>
                ))}
            </motion.h1>

            <motion.div
                className="hero-title__shine"
                aria-hidden="true"
                initial={{ x: '-120%' }}
                animate={{ x: '220%' }}
                transition={{
                    duration: 3.0,
                    delay: 1.8,
                    repeat: Infinity,
                    repeatDelay: 4.5,
                    ease: [0.22, 1, 0.36, 1],
                }}
            />
        </div>
    );
}
