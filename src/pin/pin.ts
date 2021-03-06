import { Observable, merge } from 'rxjs';

import { Emission } from '../shared/emission';

import { PinLike } from './pin-like';
import { Connectible } from './connectible';


/**
 *
 * Represents the basic [pin](https://connective.dev/docs/pin) object.
 * This pin type gets locked when its observable is realized,
 * will resolve only when its observable is not realized and its resolution
 * will be merged observable of all of the incoming pins' observables.
 *
 */
export class Pin extends Connectible {
  /**
   *
   * Determines if this pin is locked, based on whether or not its underlying
   * observable has been resolved or not.
   *
   * @param observable
   *
   */
  protected isLocked(observable: Observable<Emission> | undefined) {
    return observable !== undefined;
  }

  /**
   *
   * Determines whether this pin should resolve its underlying observable,
   * based on whether or not its underlying observable has been resolved or not.
   *
   * @param _
   * @param observable
   *
   */
  protected shouldResolve(_: PinLike[], observable: Observable<Emission> | undefined) {
    return observable === undefined;
  }

  /**
   *
   * Resolves its underlying observable, by
   * [mergeing](https://rxjs-dev.firebaseapp.com/api/index/function/merge)
   * corresponding observables of inbound pins.
   *
   * @param inbound
   *
   */
  protected resolve(inbound: PinLike[]): Observable<Emission> {
    return (inbound.length == 1)?
      inbound[0].observable:
      merge(...inbound.map(pin => pin.observable));
  }
}


/**
 *
 * Creates a typical [pin](https://connective.dev/docs/pin) object.
 * [Checkout the docs](https://connective.dev/docs/pin) for examples and further information.
 *
 */
export function pin() { return new Pin(); }


export default pin;
