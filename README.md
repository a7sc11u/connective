<p align="center">
<img src="https://raw.githubusercontent.com/CONNECT-platform/connective/master/logo.svg?sanitize=true" width="320px"/>
</p>

```
npm i @connective.js/core
```

**CONNECTIVE** facilitates large-scale [reactive programming](https://en.wikipedia.org/wiki/Reactive_programming) in Type(Java)Script. It enables intuitive declarative creation of large and complex data-flow graphs and encourages re-use of sub-graphs via abtraction through the concept of 'Agents'.

Example:

```typescript
import { wrap, map, filter } from '@connective.js/core';
import { fromEvent } from 'rxjs';

let a = document.getElementById('a') as HTMLInputElement;
let p = document.getElementById('p');

//
// Will say hello to everyone but 'Donald'.
// For obvious reasons.
//

wrap(fromEvent(a, 'input'))           // --> wrap the `Observable in a Pin`
.to(map(() => a.value))               // --> map the event to value of the input
.to(filter(name => name != 'Donald')) // --> filter 'Donald' out
.to(map(name => 'hellow ' + name))    // --> add 'hellow' to the name
.subscribe(msg => p.innerHTML = msg); // --> write it to the <p> element
```
[check it on Stackblitz](https://stackblitz.com/edit/connective-hellow-world)
