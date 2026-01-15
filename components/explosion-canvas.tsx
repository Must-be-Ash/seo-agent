'use client';
import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  char: string;
  rotation: number;
  rotationSpeed: number;
  fontSize: number;
  opacity: number;
  birthTime: number;
  duration: number;
}

export interface ExplosionCanvasRef {
  explode: (x: number, y: number) => void;
}

export const ExplosionCanvas = forwardRef<ExplosionCanvasRef>((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const fillColorRef = useRef<string>('rgba(255, 255, 255, 0.6)');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size to full viewport
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Get text color from CSS variable
    const textColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--foreground')
      .trim();
    fillColorRef.current = textColor ? `hsl(${textColor} / 0.6)` : 'rgba(255, 255, 255, 0.6)';

    const animate = (timestamp: number) => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw all particles
      particlesRef.current = particlesRef.current.filter((particle) => {
        const elapsed = timestamp - particle.birthTime;
        const progress = Math.min(elapsed / particle.duration, 1);

        // Remove completed particles
        if (progress >= 1) return false;

        // Apply gravity
        particle.vy += 0.03;

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Update rotation
        particle.rotation += particle.rotationSpeed;

        // Fade out
        particle.opacity = 1 - progress;

        // Draw particle
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation);
        ctx.globalAlpha = particle.opacity;
        ctx.font = `bold ${particle.fontSize}px Monaco, monospace`;
        ctx.fillStyle = fillColorRef.current;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(particle.char, 0, 0);
        ctx.restore();

        return true;
      });

      // Continue animation if there are particles
      if (particlesRef.current.length > 0) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        animationFrameRef.current = null;
      }
    };

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [ref]);

  useImperativeHandle(ref, () => ({
    explode: (x: number, y: number) => {
      const chars = ['S', 'E', 'O', 'SEO', 'AGENT'];
      const particleCount = 60;
      const timestamp = performance.now();

      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
        const speed = 3 + Math.random() * 5;

        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed + 1.5,
          vy: Math.sin(angle) * speed - 3,
          char: chars[Math.floor(Math.random() * chars.length)],
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.2,
          fontSize: 14 + Math.floor(Math.random() * 3) * 4,
          opacity: 1,
          birthTime: timestamp,
          duration: 2500,
        });
      }

      // Start animation if not running
      if (!animationFrameRef.current && canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d', { alpha: true });
        if (ctx) {
          const animate = (timestamp: number) => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particlesRef.current = particlesRef.current.filter((particle) => {
              const elapsed = timestamp - particle.birthTime;
              const progress = Math.min(elapsed / particle.duration, 1);

              if (progress >= 1) return false;

              particle.vy += 0.05;
              particle.x += particle.vx;
              particle.y += particle.vy;
              particle.rotation += particle.rotationSpeed;
              particle.opacity = 1 - progress;

              ctx.save();
              ctx.translate(particle.x, particle.y);
              ctx.rotate(particle.rotation);
              ctx.globalAlpha = particle.opacity;
              ctx.font = `bold ${particle.fontSize}px Monaco, monospace`;
              ctx.fillStyle = fillColorRef.current;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(particle.char, 0, 0);
              ctx.restore();

              return true;
            });

            if (particlesRef.current.length > 0) {
              animationFrameRef.current = requestAnimationFrame(animate);
            } else {
              animationFrameRef.current = null;
            }
          };
          animationFrameRef.current = requestAnimationFrame(animate);
        }
      }
    },
  }));

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 50 }}
    />
  );
});

ExplosionCanvas.displayName = 'ExplosionCanvas';
