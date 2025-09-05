// import React from 'react';
// import { cn } from '../../lib/utils';

// const GlassmorphicContainer = ({ 
//   children, 
//   className = "", 
//   variant = "default",
//   ...props 
// }) => {
//   const baseStyles = "backdrop-blur-md rounded-2xl border transition-all duration-300";
  
//   const variants = {
//     default: "bg-glass-bg border-glass-border shadow-lg",
//     elevated: "bg-glass-bg border-glass-border shadow-xl hover:shadow-2xl",
//     subtle: "bg-gray-800/20 border-gray-700/30 shadow-md"
//   };

//   return (
//     <div 
//       className={cn(
//         baseStyles,
//         variants[variant],
//         className
//       )}
//       {...props}
//     >
//       {children}
//     </div>
//   );
// };

// export default GlassmorphicContainer;


import React from 'react';
import { cn } from '../../lib/utils';

const GlassmorphicContainer = ({ children, className = "", variant = "default", ...props }) => {
  const baseStyles = "backdrop-blur-md rounded-2xl border transition-all duration-300";
  const variants = {
    default: "bg-glass-bg border-glass-border shadow-lg",
    elevated: "bg-glass-bg border-glass-border shadow-xl hover:shadow-2xl",
    subtle: "bg-gray-800/20 border-gray-700/30 shadow-md"
  };
  return (
    <div className={cn(baseStyles, variants[variant], className)} {...props}>
      {children}
    </div>
  );
};
export default GlassmorphicContainer;