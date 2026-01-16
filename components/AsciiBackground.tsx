'use client';

import { useEffect, useRef } from 'react';

const alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ-+=x402#".split("");
const getRandomInt = (max: number) => Math.floor(Math.random() * max);

export function AsciiBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePos = useRef({ x: -1000, y: -1000 });

  // HyperText animation state
  const currentText = useRef(['COINBASE', 'DEVELOPER', 'PLATFORM']);
  const displayText = useRef<string[][]>([[], [], []]);
  const iterations = useRef(0);
  const animating = useRef(false);
  const texts = [
    ['COINBASE', 'DEVELOPER', 'PLATFORM'],
    ['HYPERBROWSER']
  ];
  const textChangeCounter = useRef(0);

  // Base character set
  const baseChars = ['-', '+', '=', 'x', '4', '0', '2', '#'];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Font settings
    const fontSize = 18;
    const charSpacing = 20;
    const lineHeight = 20;

    const cols = Math.ceil(canvas.width / charSpacing) + 1;
    const rows = Math.ceil(canvas.height / lineHeight) + 1;

    // Initialize display text
    displayText.current = currentText.current.map(line => line.split(''));

    // HyperText animation
    let animationInterval: NodeJS.Timeout | null = null;

    const startTextAnimation = () => {
      // Clear any existing animation to restart
      if (animationInterval) clearInterval(animationInterval);

      animating.current = true;
      iterations.current = 0;
      displayText.current = currentText.current.map(line => line.split(''));

      const maxLength = Math.max(...currentText.current.map(line => line.length));

      animationInterval = setInterval(() => {
        if (iterations.current < maxLength) {
          displayText.current = currentText.current.map(line =>
            line.split('').map((letter, i) =>
              letter === ' ' ? ' ' : i <= iterations.current ? line[i] : alphabets[getRandomInt(alphabets.length)]
            )
          );
          iterations.current += 0.1;
        } else {
          animating.current = false;
          if (animationInterval) clearInterval(animationInterval);
        }
      }, 30);
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background pattern
      ctx.font = `${fontSize}px monospace`;

      // Calculate base row for text (above cursor)
      const baseTextRow = Math.floor((mousePos.current.y - 45) / lineHeight);

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * charSpacing;
          const y = row * lineHeight;

          let char = null;
          let isTextChar = false;

          // Check each line of text
          for (let lineIndex = 0; lineIndex < displayText.current.length; lineIndex++) {
            const line = displayText.current[lineIndex];
            const textLength = line.length;
            const textPixelWidth = textLength * charSpacing;

            // Center each line horizontally based on its own width
            const textStartCol = Math.floor((mousePos.current.x - textPixelWidth / 2) / charSpacing);

            // Each line occupies its own row
            const textRow = baseTextRow + lineIndex;

            const textCharIndex = col - textStartCol;
            const isTextRow = row === textRow;
            const isTextPosition = isTextRow && textCharIndex >= 0 && textCharIndex < line.length;

            if (isTextPosition) {
              // Use HyperText characters
              char = line[textCharIndex];
              isTextChar = true;
              break;
            }
          }

          // If no text character, use normal pattern
          if (char === null) {
            // Create a more varied pattern using diagonal waves
            const wave1 = Math.floor(Math.sin(row * 0.1) * 2 + 3);
            const wave2 = Math.floor(Math.cos(col * 0.15) * 2 + 3);
            const diagonal = Math.floor((row + col) * 0.5) % baseChars.length;
            const baseIndex = (wave1 + wave2 + diagonal) % baseChars.length;
            char = baseChars[baseIndex];
          }

          // Set color based on whether it's text or background
          if (isTextChar) {
            ctx.fillStyle = '#FFFFFF'; // Bright white for text
          } else {
            ctx.fillStyle = '#555555'; // Dark gray for background
          }

          ctx.fillText(char, x, y);
        }
      }

      requestAnimationFrame(render);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX;
      const newY = e.clientY;

      // Trigger animation on any significant mouse movement
      if (Math.abs(newX - mousePos.current.x) > 5 || Math.abs(newY - mousePos.current.y) > 5) {
        textChangeCounter.current++;

        // Change text occasionally (every 20 movements)
        if (textChangeCounter.current % 20 === 0) {
          currentText.current = texts[Math.floor(Math.random() * texts.length)];
        }

        // Restart animation on every mouse move
        startTextAnimation();
      }

      mousePos.current = { x: newX, y: newY };
    };

    window.addEventListener('mousemove', handleMouseMove);
    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resize);
      if (animationInterval) clearInterval(animationInterval);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none select-none"
      style={{
        zIndex: 0,
        opacity: 0.15,
      }}
    />
  );
}
