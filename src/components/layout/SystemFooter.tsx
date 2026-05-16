export default function SystemFooter() {
  return (
    <div className="fixed bottom-0 left-0 right-0 sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto h-6 bg-[#0a0a0a] flex items-center justify-between px-4 sm:px-6 z-40">
      <span className="text-[6px] sm:text-[7px] font-mono text-white/20 uppercase">
        Core: 4.1.2_Stable
      </span>
      <span className="text-[6px] sm:text-[7px] font-mono text-[#D1FF00]/30 uppercase">
        Market active: 1,240 Nodes
      </span>
    </div>
  );
}
