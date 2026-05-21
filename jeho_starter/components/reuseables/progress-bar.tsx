export function ProgressBar({ step, totalSteps }: { step: number; totalSteps: number }) {
  const percentage = (step / totalSteps) * 100
  
  return (
    <div className="mb-6 max-w-md mx-auto">
      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
        <div className="bg-[#2d7a7a] h-full rounded-full transition-all duration-500 ease-out progress-fill"
          style={{ '--progress-width': `$100%` } as React.CSSProperties}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Step progress"
        />
      </div>
      {/* <p className="text-center text-sm text-gray-500 mt-3 font-medium">
        Step {step} of {totalSteps}
      </p> */}
    </div>
  )
}
