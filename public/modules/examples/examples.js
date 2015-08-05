/*  examples constants file.
	every file in example dir has exports:
	name
	functional
	imperative
	this reads in all the exports and adds them to the optionStore

	not doing it programatically via fs for security
	*/

import sum from './exampleFiles/sum.js';
const examples = {
  sum,
};
export default examples;
