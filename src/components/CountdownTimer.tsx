import { useEffect, useState } from "react";

const CountdownTimer = () => {
  const [time, setTime] = useState({ hours: 23, minutes: 59, seconds: 57 });

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) { hours = 23; minutes = 59; seconds = 59; }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <div className="flex gap-3 text-center justify-center">
      {[
        { value: time.hours, label: "Hours" },
        { value: time.minutes, label: "Min" },
        { value: time.seconds, label: "Sec" },
      ].map((item) => (
        <div key={item.label} className="bg-foreground text-background rounded-lg px-4 py-2 text-center min-w-[60px]">
          <div className="text-2xl font-bold animate-countdown-pulse">{pad(item.value)}</div>
          <div className="text-xs uppercase tracking-wide opacity-80">{item.label}</div>
        </div>
      ))}
    </div>
  );
};

export default CountdownTimer;
