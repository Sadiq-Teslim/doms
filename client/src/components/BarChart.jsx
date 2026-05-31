// Lightweight, dependency-free vertical bar chart matching the BOVAS dashboard.
function niceMax(v) {
  if (v <= 0) return 5;
  return Math.ceil(v / 5) * 5;
}

export default function BarChart({ data = [], color = "#E6D4B6", height = 340 }) {
  const maxVal = data.reduce((m, d) => Math.max(m, d.value), 0);
  const max = niceMax(maxVal);
  const ticks = Array.from({ length: 6 }, (_, i) => Math.round(max - (i * max) / 5));

  return (
    <div className="flex w-full flex-col" style={{ height }}>
      <div className="flex min-h-0 flex-1">
        {/* y-axis */}
        <div className="flex w-7 shrink-0 flex-col justify-between pr-2 text-right text-[10px] text-[#6B665E]">
          {ticks.map((t, i) => (
            <span key={i}>{t}</span>
          ))}
        </div>
        {/* bars */}
        <div className="flex flex-1 items-end gap-3 border-b border-l border-[#EFEAE1] px-2">
          {data.length === 0 && (
            <div className="flex h-full w-full items-center justify-center text-[12px] text-[#A39E96]">
              No data yet
            </div>
          )}
          {data.map((d) => (
            <div key={d.label} className="flex h-full flex-1 items-end justify-center">
              <div
                className="w-[34px] max-w-full rounded-t-[3px] transition-[height] duration-500"
                style={{ height: `${(d.value / max) * 100}%`, background: color }}
                title={`${d.label}: ${d.value}`}
              />
            </div>
          ))}
        </div>
      </div>
      {/* x labels */}
      <div className="flex pl-7">
        <div className="flex flex-1 gap-3 px-2 pt-1.5">
          {data.map((d) => (
            <div key={d.label} className="flex-1 truncate text-center text-[10px] text-[#6B665E]">
              {d.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
