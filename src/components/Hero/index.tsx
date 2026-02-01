"use client";

import { useEffect, useRef } from "react";

const Hero = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- CONFIGURATION ---
  const frameCount = 205; // Total number of images (all frames in Frames_2)
  const folderPath = "/Frames_2";
  const durationInSeconds = 16; // Total time for animation playback

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1. Preload Images
    const images: HTMLImageElement[] = [];
    let loadedCount = 0;

    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      // Naming: ezgif-frame-001.jpg
      const filename = `ezgif-frame-${i.toString().padStart(3, "0")}.jpg`;
      img.src = `${folderPath}/${filename}`;
      img.onload = () => {
        loadedCount++;
        // Draw first frame once loaded
        if (loadedCount === 1 && i === 1) {
          drawFrame(images[0]);
        }
      };
      images.push(img);
    }

    // 2. Animation Variables
    let animationId: number;
    let frameIndex = 0;
    let lastFrameTime = 0;
    let animationComplete = false;

    // Calculate how many milliseconds should pass between each frame
    const frameInterval = (durationInSeconds * 1000) / frameCount;

    // Helper: Draw Logic with optional alpha
    const drawFrame = (img: HTMLImageElement, alpha: number = 1) => {
      if (!img || !img.complete) return;

      const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
      const x = (canvas.width / 2) - (img.width / 2) * scale;
      const y = (canvas.height / 2) - (img.height / 2) * scale;

      ctx.globalAlpha = alpha;
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      ctx.globalAlpha = 1;
    };

    // 3. Animation Loop - plays once and stops at last frame
    const render = (currentTime: number) => {
      if (animationComplete) return; // Stop if animation is done

      if (!lastFrameTime) lastFrameTime = currentTime;
      const deltaTime = currentTime - lastFrameTime;

      // Only update the frame if enough time has passed (throttling speed)
      if (deltaTime > frameInterval) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Normal playback
        drawFrame(images[frameIndex]);
        frameIndex++;

        // Check if we've completed all frames - stop at last frame
        if (frameIndex >= frameCount) {
          // Show last frame and stop
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          drawFrame(images[frameCount - 1], 1);
          animationComplete = true;
          return;
        }

        // Reset timer, accounting for drift
        lastFrameTime = currentTime - (deltaTime % frameInterval);
      }

      animationId = requestAnimationFrame(render);
    };

    // 4. Handle Resize
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const currentImg = images[animationComplete ? frameCount - 1 : (frameIndex < frameCount ? frameIndex : frameCount - 1)];
      if (currentImg && currentImg.complete) drawFrame(currentImg);
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
        className="relative z-10 flex min-h-screen w-full items-center overflow-hidden px-4 pt-[120px] md:pt-[150px] xl:pt-[180px] 2xl:pt-[210px]"
      >
        <div className="w-full text-center relative z-10 -mt-55">
          <h1 className="text-primary text-4xl font-bold leading-tight sm:text-5xl sm:leading-tight md:text-6xl md:leading-tight lg:text-7xl drop-shadow-lg">
            <span className="block">Welcome To</span>
            <span className="block">Terra-Matrix Engineering</span>
          </h1>
        </div>

        {/* --- ANIMATION BACKGROUND --- */}
        <div className="absolute inset-0 z-0 h-full w-full">
          <canvas
            ref={canvasRef}
            className="h-full w-full object-cover"
          />
        </div>
      </section>
    </>
  );
};

export default Hero;
