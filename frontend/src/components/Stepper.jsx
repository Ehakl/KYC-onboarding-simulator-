// Stepper.jsx - A visual indicator showing the user's progress in the onboarding flow.
// Props:
// - currentStep: integer (1, 2, or 3) indicating the active step
const Stepper = ({ currentStep }) => {
  const steps = [
    { id: 1, name: 'Upload ID' },
    { id: 2, name: 'Face Verify' },
    { id: 3, name: 'Complete' },
  ];

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {/* Connecting line behind steps */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 z-0"></div>
        {/* Active connecting line */}
        <div 
          className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-primary-600 z-0 transition-all duration-300"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        ></div>

        {steps.map((step) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 font-semibold text-sm transition-colors duration-300
                  ${isCompleted ? 'bg-primary-600 border-primary-600 text-white' : 
                    isActive ? 'bg-white border-primary-600 text-primary-600 ring-4 ring-primary-100' : 
                    'bg-white border-gray-300 text-gray-400'}`}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.id
                )}
              </div>
              <div className={`mt-2 text-xs font-medium ${isActive ? 'text-primary-600' : isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                {step.name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Stepper;
