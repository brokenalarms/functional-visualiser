/*  examples constants file.
	every file in example dir has exports:
	name
	functional
	imperative
	this reads in all the exports and adds them to the RefreshStore

	not doing it programatically via fs for security
	*/

import assorted from './exampleFiles/assorted.js';
import smashingMagazineDemo from './exampleFiles/smashingMagazine.js';
const examples = {
  assorted, smashingMagazineDemo,
};
export default examples;
