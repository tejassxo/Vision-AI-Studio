import React, { useEffect, useRef } from 'react';

interface Meteor {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
  width: number;
}

interface MeteorsCanvasProps {
  theme: 'light' | 'dark';
}

export const MeteorsCanvas: React.FC<MeteorsCanvasProps> = ({ theme }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const meteors: Meteor[] = [];
    const maxMeteors = 20;

    // Create a single meteor
    const createMeteor = (initOffscreen = false): Meteor => {
      const speed = Math.random() * 8 + 6;
      return {
        // Start from top-right area
        x: initOffscreen ? Math.random() * width * 1.5 : Math.random() * width * 1.5 - width * 0.5,
        y: initOffscreen ? -100 : Math.random() * -height,
        length: Math.random() * 80 + 50,
        speed: speed,
        opacity: Math.random() * 0.6 + 0.3,
        width: Math.random() * 1.5 + 0.5,
      };
    };

    // Initialize meteors
    for (let i = 0; i < maxMeteors; i++) {
      meteors.push(createMeteor(false));
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Determine colors based on theme
      const trailColor = theme === 'dark' ? '255, 110, 0' : '100, 110, 130';
      const headColor = theme === 'dark' ? '#fffaee' : '#2d3748';

      for (let i = 0; i < meteors.length; i++) {
        const m = meteors[i];

        // Move diagonally (down and to the left)
        m.x -= m.speed;
        m.y += m.speed * 0.7; // slight angle

        // Create gradient tail
        const grad = ctx.createLinearGradient(
          m.x, m.y, 
          m.x + m.length, m.y - m.length * 0.7
        );
        grad.addColorStop(0, `rgba(${trailColor}, ${m.opacity})`);
        grad.addColorStop(1, `rgba(${trailColor}, 0)`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = m.width;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x + m.length, m.y - m.length * 0.7);
        ctx.stroke();

        // Draw meteor head
        ctx.fillStyle = headColor;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.width * 1.2, 0, Math.PI * 2);
        ctx.fill();

        // Reset if offscreen
        if (m.x < -m.length || m.y > height + m.length) {
          meteors[i] = createMeteor(true);
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ mixBlendMode: theme === 'dark' ? 'screen' : 'multiply' }}
    />
  );
};
