import React, { use } from 'react'
import home from '../../assets/home.png'
import BlurText from "../../Components/BlurText";
import { useNavigate } from 'react-router-dom';
import { ScrollVelocity } from "../../Components/ScrollVelocity";
import MagicBento from '../../Components/MagicBento';

const Home = () => {
    const navigate = useNavigate();
    const handleAnimationComplete = () => {
        console.log('Animation completed!');
    };
    const features = [
        "Personalized Neuro-Therapy Recommendations Engine",
        "Session Logging with Behavioral Trend Analysis",
        "Voice-Guided Cognitive Relaxation System",
        "Adaptive Therapy Based on User Biofeedback",
        "Secure Authentication with Role-Based Access Control",
        "Emergency Mental Health Alert System",
    ];

    return (
        <div>
            <div className="w-full min-h-screen flex flex-col md:flex-row items-center justify-between px-6 md:px-10 bg-black text-white font-sans">

                {/* RIGHT SIDE IMAGE (comes first on mobile) */}
                <div className="w-full md:w-[700px] h-[200px] mt-[20px] md:h-[400px] flex items-center justify-center order-1 md:order-2">
                    <img
                        src={home}
                        alt="Neuro Therapy"
                        className="w-full h-full object-cover rounded-2xl shadow-2xl"
                    />
                </div>

                {/* LEFT SIDE TEXT */}
                <div className="w-full md:w-1/2 flex flex-col justify-center mt-8 mb-8 md:mt-0 order-2 md:order-1">

                    {/* HEADING */}
                    <div className="leading-tight mb-4">
                        <BlurText
                            text="Heal Mind."
                            delay={120}
                            animateBy="words"
                            direction="top"
                            onAnimationComplete={handleAnimationComplete}
                            className="text-4xl md:text-6xl font-extrabold text-red-600"
                        />

                        <BlurText
                            text="Restore Balance."
                            delay={120}
                            animateBy="words"
                            direction="top"
                            onAnimationComplete={handleAnimationComplete}
                            className="text-4xl md:text-6xl font-extrabold text-white"
                        />
                    </div>

                    {/* DESCRIPTION */}
                    <p className="text-base md:text-xl text-gray-300 max-w-lg leading-relaxed">
                        Experience AI-powered neurotherapy that understands your emotions,
                        reduces stress, and helps you achieve mental clarity and balance.
                    </p>

                    {/* BUTTON */}
                    <div className="mt-8">
                        <button
                            onClick={() => navigate("/therapy")}
                            className="px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600 transition-all duration-300 shadow-lg hover:scale-105 hover:shadow-red-500/30"
                        >
                            Start Session
                        </button>
                    </div>

                </div>

            </div>
            <div>
                <ScrollVelocity
                    texts={['Where Technology Meets Emotional Healing.']}
                    velocity={100}
                    className="custom-scroll-text"
                    numCopies={6}
                    damping={50}
                    stiffness={400}
                />
            </div>
            <div className="bg-black w-full py-16">

                <h1 className="text-4xl md:text-6xl font-extrabold text-red-600 text-center mb-12">
                    Platform Features
                </h1>

                <div className="w-full px-6">
                    <div className="w-full">
                        <MagicBento
                            className="w-full !max-w-none"
                            textAutoHide={true}
                            enableStars
                            enableSpotlight
                            enableBorderGlow={true}
                            enableTilt={false}
                            enableMagnetism={false}
                            clickEffect
                            spotlightRadius={400}
                            particleCount={12}
                            glowColor="239, 68, 68"
                            disableAnimations={false}
                        />
                    </div>
                </div>

            </div>
            <div className="w-full  bg-gray-50 py-12 px-6">

                {/* Heading */}
                <h1 className="text-4xl font-bold text-center text-black mb-10">
                    Upcoming Features
                </h1>

                {/* Cards Container */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">

                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="bg-white border-t-4 border-red-600 rounded-xl shadow-md p-6 hover:shadow-xl transition duration-300"
                        >
                            <p className="text-gray-800 font-medium text-lg">
                                {feature}
                            </p>
                        </div>
                    ))}

                </div>
            </div>
        </div>
    )
}

export default Home