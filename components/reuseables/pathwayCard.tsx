import { PathwayOption } from "../types/types";

export function PathwayCard({ option, onClick }: { option: PathwayOption; onClick: () => void }) {
  const Icon = option.icon;

  return (
    <button onClick={onClick} aria-label={`Select pathway: ${option.title}`}
      className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-[#2d7a7a] hover:bg-teal-50 transition-all text-left group focus:outline-none focus:ring-2 focus:ring-teal-500/20"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">
          <Icon className="h-6 w-6 text-[#2d7a7a]" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#2d7a7a] transition-colors">
            {option.title}
          </h3>
          <p className="text-gray-600 mt-1 text-sm leading-relaxed">
            {option.description}
          </p>
          
          <div className="mt-3 text-xs text-gray-500">
            <p className="font-medium text-gray-700 uppercase tracking-tight">
              {option.requirementsTitle}
            </p>
            <ul className="list-disc list-inside mt-1 space-y-0.5 opacity-80">
              {option.requirements.map((req: string, index: number) => (
                <li key={index} className="pl-1">
                  {req}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </button>
  );
}