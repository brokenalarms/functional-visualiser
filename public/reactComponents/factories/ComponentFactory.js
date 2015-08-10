import React from 'react';

export default function ComponentFactory(name, methods) {
  const instance = Object.create(React.Component.prototype);
  instance.constructor = instance;
  instance.displayName = name;

  Object.assign(instance, methods);

  return instance;
}
