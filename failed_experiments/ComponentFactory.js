/* This is not in use, but was just written to understand how
   the Class syntatic sugar actually works under the hood
   with Javascript prototypal inheritance. */

import React from 'react';

export default function ComponentFactory(name, methods) {
  const instance = Object.create(React.Component.prototype);
  instance.constructor = instance;
  instance.displayName = name;

  Object.assign(instance, methods);

  return instance;
}
