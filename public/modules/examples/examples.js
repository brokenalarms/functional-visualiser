/*  examples constants file.
	every file in example dir has exports:
	name
	functional
	imperative
	this reads in all the exports and adds them to the optionStore

	not doing it programatically via fs for security
	*/

import sum from './exampleFiles/sum.js';
import escopeDemo from './exampleFiles/escopeDemo.js';
const examples = {
  sum, escopeDemo,
};
export default examples;
