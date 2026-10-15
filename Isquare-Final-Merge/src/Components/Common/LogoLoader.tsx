import { ISquareIcon } from "./ISquareLogo";

export default function LogoLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-6 gap-3">
      <div className="relative flex items-center justify-center">
        <div className="absolute w-16 h-16 rounded-2xl bg-orange-500/20 animate-ping" />
        <ISquareIcon size={52} className="relative z-10 animate-pulse" />
      </div>
      <span className="text-xs font-bold text-slate-500 tracking-widest uppercase">
        Loading...
      </span>
    </div>
  );
}