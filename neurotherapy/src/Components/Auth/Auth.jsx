import { Outlet } from "react-router-dom";
import SoftAurora from "../SoftAurora";
import TextType from "../TextType";

export default function Auth() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full overflow-hidden relative">

      {/* LEFT / TOP SECTION (AURORA) */}
      <div className="w-full md:w-1/2 h-[40vh] md:h-screen relative overflow-hidden bg-black">

        <SoftAurora
          speed={0.6}
          scale={1.5}
          brightness={1.2}
          color1="#a55a5a"
          color2="#e100ff"
          enableMouseInteraction={true}
        />

        {/* overlay text */}
        <div className="absolute inset-0 flex items-center justify-center z-10 px-4">
          <TextType
            text={[
              "Welcome to NeuroTherapy",
              "Heal Your Mind with AI",
              "Your Journey Starts Here"
            ]}
            typingSpeed={70}
            pauseDuration={1500}
            deletingSpeed={40}
            showCursor
            cursorCharacter="|"
            className="text-white text-2xl md:text-4xl font-bold text-center"
          />
        </div>

        {/* dark overlay for contrast */}
     <div className="absolute inset-0 bg-black/10"></div>
      </div>

      {/* RIGHT / BOTTOM SECTION (AUTH FORM) */}
    <div className="w-full md:w-1/2 min-h-[60vh] md:h-screen flex items-center justify-center bg-white px-4 py-10">

        <div className="w-full max-w-md">
          <Outlet />
        </div>

      </div>
    </div>
  );
}