const warnings = {
  functionDoesNotReturnValue: {
    get: (name) => {
      return {
        status: 'failure',
        errorValue: 1,
        action: 'Principle: Referential transparency',
        message: `Function '${name}' did not return a value.`,
      };
    },
  },
  functionReturnUnassigned: {
    get: (affectedNodeName, actingNodeName) => {
      return {
        errorValue: 1,
        status: 'warning',
        action: 'Principle: Side effects',
        message: `Result of function '${actingNodeName}' is not assigned to a value.`,
      };
    },
  },
  variableMutatedOutOfScope: {
    get: (mutatorScopeName, declarationScopeName, variableName) => {
      return {
        errorValue: 1,
        status: 'warning',
        action: 'Principle: Side effects',
        message: `Function  '${mutatorScopeName}' has mutated variable '${variableName}' in the scope of function '${declarationScopeName}'.`,
      };
    },
  },
  variableDoesNotExist: {
    get: (name, affectedNodeName, variableName) => {
      return {
        errorValue: 1,
        status: 'failure',
        'action': 'Principle: Side effects',
        message: `Function '${name}' refers to the variable ${variableName} that does not exist in the scope chain.`,
      };
    },
  },
  variableMutatedInScope: {
    get: (name, declarationScopeName, variableName) => {
      return {
        errorValue: 0,
        status: 'notice',
        'action': 'Principle: Immutability (notice only)',
        message: `'${name}' has mutated variable '${variableName}' within its own scope after creation`,
      };
    },
  },
};

export default warnings;
