"use client";

import { useEffect, useRef } from "react";

const Hero = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- CONFIGURATION ---
  const frameCount = 100; // Total number of images
  const folderPath = "/Frames_2"; 
  const durationInSeconds = 8; // Total time for one loop
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1. Preload Images
    const images: HTMLImageElement[] = [];
    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      // Naming: ezgif-frame-001.jpg
      const filename = `ezgif-frame-${i.toString().padStart(3, "0")}.jpg`; 
      img.src = `${folderPath}/${filename}`;
      images.push(img);
    }

    // 2. Animation Variables
    let animationId: number;
    let frameIndex = 0;
    let lastFrameTime = 0;
    
    // Calculate how many milliseconds should pass between each frame
    // 8000ms / 100 frames = 80ms per frame
    const frameInterval = (durationInSeconds * 1000) / frameCount; 

    // Helper: Draw Logic
    const drawFrame = (img: HTMLImageElement) => {
      if (!img || !img.complete) return;
      
      const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
      const x = (canvas.width / 2) - (img.width / 2) * scale;
      const y = (canvas.height / 2) - (img.height / 2) * scale;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
    };

    // 3. Animation Loop with Time Control
    const render = (currentTime: number) => {
      if (!lastFrameTime) lastFrameTime = currentTime;
      
      const deltaTime = currentTime - lastFrameTime;

      // Only update the frame if enough time has passed (throttling speed)
      if (deltaTime > frameInterval) {
        
        // STOP CONDITION: If we have played all frames
        if (frameIndex >= frameCount) {
           // Reset to Frame 1 (Index 0)
           drawFrame(images[0]); 
           // Stop the loop here
           return; 
        }

        // Draw current frame
        drawFrame(images[frameIndex]);

        // Move to next frame
        frameIndex++;
        
        // Reset timer, accounting for drift
        lastFrameTime = currentTime - (deltaTime % frameInterval);
      }

      animationId = requestAnimationFrame(render);
    };

    // 4. Handle Resize
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // If stopped or resizing, redraw current frame
      const currentImg = images[frameIndex < frameCount ? frameIndex : 0];
      if(currentImg) drawFrame(currentImg);
    };
    
    window.addEventListener('resize', resize);
    resize();
    
    // Start the loop
    animationId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <>
      <section
        id="home"
        className="relative z-10 flex min-h-screen w-full items-center overflow-hidden bg-white px-4 pt-[120px] dark:bg-gray-dark md:pt-[150px] xl:pt-[180px] 2xl:pt-[210px]"
      >
        <div className="w-full text-center">
          <h1 className="text-creme-white text-4xl font-bold leading-tight sm:text-5xl sm:leading-tight md:text-6xl md:leading-tight lg:text-7xl">
            <span className="block">Welcome To</span>
            <span className="block">Terra-Matrix Engineering</span>
          </h1>
        </div>

        {/* --- ANIMATION BACKGROUND --- */}
        <div className="absolute top-0 right-0 z-[-1] h-full w-full opacity-30 lg:opacity-100">
           <canvas 
             ref={canvasRef} 
             className="h-full w-full mix-blend-screen" 
           />
        </div>
      </section>
    </>
  );
};

export default Hero;
