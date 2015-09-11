const warnings = {
  functionDoesNotReturnValue: {
    get: (name) => {
      return {
        status: 'failure',
        action: 'Principle: Referential transparency',
        message: `'${name}' did not return a value`,
      };
    },
  },
  functionReturnUnassigned: {
    get: (affectedNodeName, actingNodeName) => {
      return {
        status: 'warning',
        action: 'Principle: Side effects',
        message: `Result of '${actingNodeName}' is not assigned to a value`,
      };
    },
  },
  variableMutatedOutOfScope: {
    get: (mutatorScopeName, declarationScopeName) => {
      return {
        status: 'warning',
        action: 'Principle: Side effects',
        message: `'${mutatorScopeName}' has mutated variable in the scope of '${declarationScopeName}'`,
      };
    },
  },
  variableDoesNotExist: {
    get: (name) => {
      return {
        status: 'failure',
        'action': 'Principle: Side effects',
        message: `'${name}' refers to an external variable that does not exist in the scope chain`,
      };
    },
  },
  variableMutatedInScope: {
    get: (name) => {
      return {
        status: 'notice',
        'action': 'Principle: Immutability (notice only)',
        message: `'${name}' has changed a variable within its own scope after creation`,
      };
    },
  },
};

export default warnings;
