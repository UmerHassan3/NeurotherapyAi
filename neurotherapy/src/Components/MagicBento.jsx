import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';

const DEFAULT_PARTICLE_COUNT = 12;
const DEFAULT_SPOTLIGHT_RADIUS = 300;
const DEFAULT_GLOW_COLOR = '239, 68, 68'; // 🔥 RED

const cardData = [
    {
        color: '#120F17',
        title: 'AI Emotion Analysis',
        description: 'Understand your emotional state using intelligent AI models',
        label: 'AI Insight'
    },
    {
        color: '#120F17',
        title: 'EEG Signal Processing',
        description: 'Analyze brainwave signals for real-time mental state detection',
        label: 'Brain Data'
    },
    {
        color: '#120F17',
        title: 'Personalized Therapy',
        description: 'Receive therapy sessions tailored to your emotional condition',
        label: 'Custom Care'
    },
    {
        color: '#120F17',
        title: 'Guided Meditation',
        description: 'Relax with AI-powered meditation powered by Wysa integration',
        label: 'Mind Calm'
    },
    {
        color: '#120F17',
        title: 'Stress Monitoring',
        description: 'Track stress levels and get instant coping recommendations',
        label: 'Wellness'
    },
    {
        color: '#120F17',
        title: 'Mood Tracking',
        description: 'Monitor emotional patterns over time with smart insights',
        label: 'Tracking'
    },
    {
        color: '#120F17',
        title: 'Real-Time Feedback',
        description: 'Instant feedback based on your mental and emotional signals',
        label: 'Live Response'
    },
    {
        color: '#120F17',
        title: 'Secure Data Handling',
        description: 'Your mental health data is encrypted and secure at all times',
        label: 'Privacy'
    },
    {
        color: '#120F17',
        title: 'Therapy History',
        description: 'Access your past sessions and track your improvement journey',
        label: 'Progress'
    }
];

const MagicBento = () => {
    return (
        <>
            <style>
                {`
                .bento-section {
                    width: 100%;
                }

                .card-grid {
                    display: grid;
                    width: 100%;
                    gap: 1.5rem;
                }

                @media (min-width: 640px) {
                    .card-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (min-width: 1024px) {
                    .card-grid {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }

                @media (min-width: 1280px) {
                    .card-grid {
                        grid-template-columns: repeat(4, 1fr);
                    }
                }

                .card {
                    position: relative;
                    border-radius: 20px;
                    padding: 1.5rem;
                    min-height: 200px;
                    background: #120F17;
                    border: 1px solid #2F293A;
                    color: white;
                    transition: all 0.3s ease;
                    overflow: hidden;
                }

                .card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 40px rgba(239, 68, 68, 0.3);
                }

                .card::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    border-radius: inherit;
                    background: radial-gradient(
                        circle at var(--x, 50%) var(--y, 50%),
                        rgba(239, 68, 68, 0.4),
                        transparent 60%
                    );
                    opacity: 0;
                    transition: opacity 0.3s;
                }

                .card:hover::after {
                    opacity: 1;
                }
                `}
            </style>

            <div className="bento-section w-full px-4">
                <div className="card-grid">
                    {cardData.map((card, index) => (
                        <div
                            key={index}
                            className="card"
                            onMouseMove={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const x = e.clientX - rect.left;
                                const y = e.clientY - rect.top;

                                e.currentTarget.style.setProperty('--x', `${x}px`);
                                e.currentTarget.style.setProperty('--y', `${y}px`);
                            }}
                        >
                            <div className="flex justify-between mb-3">
                                <span className="text-sm text-gray-400">{card.label}</span>
                            </div>

                            <h3 className="text-lg font-semibold mb-2">
                                {card.title}
                            </h3>

                            <p className="text-sm text-gray-400 leading-relaxed">
                                {card.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default MagicBento;