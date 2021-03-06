import { PinLike } from '../pin/pin-like';

import { Agent } from './agent';
import { Signature } from './signature';
import { Composition } from './composition';


type _ChildType = PinLike | Agent;
type _PinDict = {[name: string]: PinLike};

export type TrackFunc = (...children: _ChildType[]) => void;
export type CompositionFactory = (track: TrackFunc) => [_PinDict | PinLike[], _PinDict | PinLike[]];


class InlineComposition extends Composition {
  readonly inpins: _PinDict | PinLike[];
  readonly outpins: _PinDict | PinLike[];

  constructor(readonly factory: CompositionFactory, signature: Signature) {
    super(signature);
    [this.inpins, this.outpins] = this.factory(
      (...children: _ChildType[]) => children.forEach(child => this.add(child)));
  }

  init() {}
  wire() {}
  build() {}

  createInput(label: string) { return (this.inpins as any)[label]; }
  createOutput(label: string) { return (this.outpins as any)[label]; }

  createEntries() { return Object.values(this.inpins); }
  createExits() { return Object.values(this.outpins); }
}


export function composition(factory: CompositionFactory): () => InlineComposition;
export function composition(signature: Signature, factory: CompositionFactory): () => InlineComposition;
/**
 *
 * Creates a [composition](https://connective.dev/docs/composition) using given factory function.
 * [Checkout the docs](https://connective.dev/docs/composition) for examples and further information.
 *
 * @param factoryOrSignature either the [signature](https://connective.dev/docs/agent#signature) of
 * the composition or the factory function creating it. If signature is not provided, the factory function
 * will be invoked once to deduce the signature.
 * @param factory the factory function for creating the composition. If provided, the first parameter must
 * be a signature.
 *
 */
export function composition(factoryOrSignature: CompositionFactory | Signature, factory?: CompositionFactory) {
  let signature: Signature;
  if (!factory) {
    factory = factoryOrSignature as CompositionFactory;
    let tracked = <_ChildType[]>[];
    let s = factory((...children) => { tracked = tracked.concat(children); });
    signature = { inputs: Object.keys(s[0]), outputs: Object.keys(s[1]) };
    tracked.forEach(thing => thing.clear());
  }
  else {
    signature = factoryOrSignature as Signature;
  }

  let func = () => new InlineComposition(factory as CompositionFactory, signature);
  (func as any).signature = signature;
  return func;
}


export default composition;