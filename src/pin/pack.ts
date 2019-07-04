import { combineLatest, of } from 'rxjs';
import { map } from 'rxjs/operators';

import emission, { Emission } from '../shared/emission';

import { Pin } from './pin';
import { PinLike } from './pin-like';
import { PinMap } from './pin-map';


//
// TODO: add context related tests.
//
export class Pack extends Pin {
  constructor(readonly pinmap?: PinMap) {
    super();

    if (pinmap)
      this.track(pinmap.subscribe((_: string, pin: PinLike) => pin.to(this)));
  }

  protected resolve(inbound: PinLike[]) {
    if (this.pinmap) {
      let _entries = this.pinmap.entries;
      if (_entries.length == 0) return of(emission());
      return combineLatest(..._entries.map(entry => entry[1].observable))
              .pipe(map(
                  emissions => Emission.from(emissions, _entries.reduce(
                    (_map, entry, index) => {
                      _map[entry[0]] = emissions[index].value;
                      return _map;
                    }
                    , <{[label: string]: Emission}>{}))
              ))
    }
    else
      return combineLatest(
        ...inbound
        .map(pin => pin.observable))
        .pipe(map(emissions => Emission.from(emissions)));
  }
}


export default function pack(...stuff: (PinMap|PinLike)[]) {
  let _mapped = stuff.map(each => (each instanceof PinMap)?new Pack(each):each);
  if (_mapped.length == 0) return new Pack();
  if (_mapped.length == 1) return (_mapped[0] instanceof Pack)?_mapped[0]:new Pack().from(_mapped[0]);
  return new Pack().from(..._mapped);
}