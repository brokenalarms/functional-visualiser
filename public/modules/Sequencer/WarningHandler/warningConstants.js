const warnings = {
  functionDoesNotReturnValue: {
    get: (name) => {
      return {
        status: 'failure',
        errorValue: 1,
        action: 'Principle: Referential transparency',
        message: `'${name}' did not return a value`,
      };
    },
  },
  functionReturnUnassigned: {
    get: (affectedNodeName, actingNodeName) => {
      return {
        errorValue: 1,
        status: 'warning',
        action: 'Principle: Side effects',
        message: `Result of '${actingNodeName}' is not assigned to a value`,
      };
    },
  },
  variableMutatedOutOfScope: {
    get: (mutatorScopeName, declarationScopeName) => {
      return {
        errorValue: 1,
        status: 'warning',
        action: 'Principle: Side effects',
        message: `'${mutatorScopeName}' has mutated variable in the scope of '${declarationScopeName}'`,
      };
    },
  },
  variableDoesNotExist: {
    get: (name) => {
      return {
        errorValue: 1,
        status: 'failure',
        'action': 'Principle: Side effects',
        message: `'${name}' refers to an external variable that does not exist in the scope chain`,
      };
    },
  },
  variableMutatedInScope: {
    get: (name) => {
      return {
        errorValue: 0,
        status: 'notice',
        'action': 'Principle: Immutability (notice only)',
        message: `'${name}' has changed a variable within its own scope after creation`,
      };
    },
  },
};

export default warnings;
