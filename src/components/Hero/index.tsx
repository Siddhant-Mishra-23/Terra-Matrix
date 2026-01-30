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
    let isFading = false;
    let fadeProgress = 0;
    const fadeSteps = 15; // Number of steps for fade transition

    // Calculate how many milliseconds should pass between each frame
    // 8000ms / 100 frames = 80ms per frame
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

    // 3. Animation Loop - plays once, fades to first frame, then stops
    const render = (currentTime: number) => {
      if (animationComplete) return; // Stop if animation is done

      if (!lastFrameTime) lastFrameTime = currentTime;
      const deltaTime = currentTime - lastFrameTime;

      // Only update the frame if enough time has passed (throttling speed)
      if (deltaTime > frameInterval) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (isFading) {
          // Crossfade from last frame to first frame
          fadeProgress++;
          const fadeAlpha = fadeProgress / fadeSteps;

          // Draw last frame fading out
          drawFrame(images[frameCount - 1], 1 - fadeAlpha);
          // Draw first frame fading in
          drawFrame(images[0], fadeAlpha);

          if (fadeProgress >= fadeSteps) {
            // Fade complete - show first frame and stop
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawFrame(images[0], 1);
            animationComplete = true;
            return;
          }
        } else {
          // Normal playback
          drawFrame(images[frameIndex]);
          frameIndex++;

          // Check if we've completed all frames
          if (frameIndex >= frameCount) {
            // Start fade transition
            isFading = true;
            fadeProgress = 0;
          }
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
      const currentImg = images[animationComplete ? 0 : (frameIndex < frameCount ? frameIndex : 0)];
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
        className="relative z-10 flex min-h-screen w-full items-center overflow-hidden px-4 pt-[120px] dark:bg-gray-dark md:pt-[150px] xl:pt-[180px] 2xl:pt-[210px]"
      >
        <div className="w-full text-center relative z-10">
          <h1 className="text-gold text-4xl font-bold leading-tight sm:text-5xl sm:leading-tight md:text-6xl md:leading-tight lg:text-7xl drop-shadow-lg">
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

