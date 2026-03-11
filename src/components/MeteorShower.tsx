import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Meteor {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
}

export function MeteorShower() {
  const [meteors, setMeteors] = useState<Meteor[]>([]);

  useEffect(() => {
    const generateMeteors = () => {
      const newMeteors: Meteor[] = [];
      for (let i = 0; i < 20; i++) {
        newMeteors.push({
          id: i,
          left: Math.random() * 100,
          delay: Math.random() * 10,
          duration: 1.5 + Math.random() * 2,
          size: 1 + Math.random() * 2,
        });
      }
      setMeteors(newMeteors);
    };

    generateMeteors();
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {meteors.map((meteor) => (
        <motion.div
          key={meteor.id}
          className="absolute w-px bg-gradient-to-b from-primary via-primary/50 to-transparent"
          style={{
            left: `${meteor.left}%`,
            top: '-5%',
            height: `${40 + meteor.size * 20}px`,
            width: `${meteor.size}px`,
            filter: 'blur(0.5px)',
          }}
          initial={{ y: '-100%', opacity: 0 }}
          animate={{
            y: ['0%', '2000%'],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: meteor.duration,
            delay: meteor.delay,
            repeat: Infinity,
            repeatDelay: Math.random() * 15 + 5,
            ease: 'linear',
          }}
        >
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary shadow-glow"
            style={{
              boxShadow: '0 0 6px 2px hsl(var(--primary) / 0.6)',
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}
