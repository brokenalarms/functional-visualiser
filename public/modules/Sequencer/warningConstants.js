const warnings = {
  functionDoesNotReturnValue: {
    action: 'Principle: Referential transparency',
    message: 'Function does not return a value',
  },
  functionReturnUnassigned: {
    action: 'Principle: Side effects',
    message: 'Function result is not assigned to a value',
  },
  variableMutatedOutOfScope: {
    action: 'Principle: Side effects',
    message: 'Function has mutated variable in another scope',
  },
  variableDoesNotExist: {
    'action': 'Principle: Side effects',
    'message': 'Function refers to an external variable that does not exist in the scope chain',
  },
  variableMutatedInScope: {
    'action': 'Principle: Immutability',
    'message': 'Function has changed a variable in scope after creation',
  },
};

export default warnings;
