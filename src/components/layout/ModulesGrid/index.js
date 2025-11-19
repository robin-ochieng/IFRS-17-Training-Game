import React from 'react';
import ModuleCard from './ModuleCard';

/**
 * Grid of IFRS 17 modules with lock/completion states.
 */
const ModulesGrid = ({
  modules,
  currentModule,
  completedModules,
  unlockedModules,
  isGuest,
  showModuleComplete,
  onModuleSelect,
  onLockedModuleSelect,
}) => {
  return (
    <div className="mb-8 mt-6">
      <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
        IFRS 17 Training Modules
        <span className="text-sm md:text-lg font-normal text-gray-300 ml-2 md:ml-4">
          ({completedModules.length}/{modules.length} completed)
        </span>
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
        {modules.map((module, index) => {
          const unlocked = unlockedModules.includes(index);
          const isCompleted = completedModules.includes(index);
          const isCurrent = index === currentModule && !isCompleted;
          const isLocked = !unlocked || (isGuest && index > 0);

          const disabled = (isLocked && !isGuest) || isCompleted || (index === currentModule && !showModuleComplete);

          const handleClick = () => {
            if (isGuest && index > 0) {
              onLockedModuleSelect?.(index);
              return;
            }

            if (unlocked && !isCompleted && index !== currentModule) {
              onModuleSelect?.(index);
            }
          };

          return (
            <ModuleCard
              key={index}
              module={module}
              index={index}
              isCompleted={isCompleted}
              isCurrent={isCurrent}
              isLocked={isLocked}
              isGuest={isGuest}
              disabled={disabled}
              onClick={handleClick}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ModulesGrid;
