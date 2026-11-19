// Decorative point-cloud: dots arranged in a lens that narrows to the right. Deterministic, no randomness.
export function DotField() {
  const dots: { x: number; y: number; r: number; o: number }[] = [];
  for (let i = 0; i < 26; i++) {
    for (let j = 0; j < 17; j++) {
      const x = i / 25;
      const spread = Math.sin(Math.PI * Math.min(1, x * 1.05)) * 0.9 + 0.1;
      const wave = Math.sin(i * 0.7 + j * 0.35) * 0.35;
      const y = 0.5 + ((j - 8) / 8) * 0.48 * spread + wave * 0.03 * spread;
      const edge = Math.abs((j - 8) / 8);
      dots.push({ x: 20 + x * 560, y: 20 + y * 360, r: 1 + (1 - edge) * 1.3, o: 0.25 + (1 - edge) * 0.65 });
    }
  }
  return (
    <svg viewBox="0 0 600 400" aria-hidden="true" className="h-full w-full">
      {dots.map((d, k) => (
        <circle key={k} cx={d.x.toFixed(1)} cy={d.y.toFixed(1)} r={d.r.toFixed(2)} fill={k % 5 === 0 ? "#19C7CC" : "#86C9F5"} opacity={d.o.toFixed(2)} />
      ))}
    </svg>
  );
}
