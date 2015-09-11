const warnings = {
  functionDoesNotReturnValue: {
    action: 'Principle: Referential transparency',
    get: (name) => {
      return {
        action: warnings.functionDoesNotReturnValue.action,
        message: `'${name}' did not return a value`,
      };
    },
  },
  functionReturnUnassigned: {
    action: 'Principle: Side effects',
    get: (name) => {
      return {
        action: warnings.functionReturnUnassigned.action,
        message: `Result of '${name}' is not assigned to a value`,
      };
    },
  },
  variableMutatedOutOfScope: {
    action: 'Principle: Side effects',
    get: (mutatorScopeName, declarationScopeName) => {
      return {
        action: warnings.variableMutatedOutOfScope.action,
        message: `'${mutatorScopeName}' has mutated variable in the scope of '${declarationScopeName}'`,
      };
    },
  },
  variableDoesNotExist: {
    'action': 'Principle: Side effects',
    get: (name) => {
      return {
        action: warnings.variableDoesNotExist.action,
        message: `'${name}' refers to an external variable that does not exist in the scope chain`,
      };
    },
  },
  variableMutatedInScope: {
    'action': 'Principle: Immutability (notice only)',
    get: (name) => {
      return {
        action: warnings.variableMutatedInScope.action,
        message: `'${name}' has changed a variable within its own scope after creation`,
      };
    },
  },
};

export default warnings;
