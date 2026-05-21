interface FormProgressProps {
  currentStep: number
  totalSteps: number
  labels: string[]
}

export default function FormProgress({ currentStep, totalSteps, labels }: FormProgressProps) {
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className="mb-6">
      <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
        <div className="bg-teal-600 h-3 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex justify-between text-sm text-gray-500">
        {labels.map((label, index) => (
          <span key={index} className={`${ index + 1 === currentStep ? 'text-black font-medium' : index + 1 < currentStep ? 'text-gray-700' : 'text-gray-400' }`} >
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
