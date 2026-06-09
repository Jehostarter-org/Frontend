'use client';

interface SelectionCardProps {
  id: string;
  title: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
  icon?: React.ElementType;
}

export function SelectionCard({ title, description, isSelected, onClick, icon: Icon }: SelectionCardProps) {
  return (
    <div
      onClick={onClick}
      role="radio"
      aria-checked={isSelected ? "true" : "false"}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); }}}
      className={` relative w-full p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer text-left group hover:shadow-md
        ${ isSelected ? "border-[#2d7a7a] bg-[#f0f9f9]/30" : "border-gray-200 bg-white hover:border-[#2d7a7a]/50" }`}
    >
      <div className="flex items-start gap-4">
        {Icon ? (
          <div className={` shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 transition-colors
              ${ isSelected ? "border-[#2d7a7a] bg-[#2d7a7a]/10" : "border-gray-300 group-hover:border-[#2d7a7a]/50" }`}>
            <Icon className={`h-4 w-4 ${ isSelected ? "text-[#2d7a7a]" : "text-gray-500 group-hover:text-[#2d7a7a]" }`} />
          </div>
        ) : (
          <div className={` shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 transition-colors
              ${ isSelected ? "border-[#2d7a7a]" : "border-gray-300 group-hover:border-[#2d7a7a]/50" }`}>
            {isSelected && <div className="w-3 h-3 rounded-full bg-[#2d7a7a]" />}
          </div>
        )}

        <div className="flex-1">
          <h3 className={`font-semibold text-lg mb-1 ${ isSelected ? "text-[#2d7a7a]" : "text-gray-900"}`}>
            {title}
          </h3>
          <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}
