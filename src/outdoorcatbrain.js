// Neutral scheduled layer extracted from outdoorcatbrain.js (same source as outdoorcatroute.js).
// Visitor, food, prey and optional outings deliberately excluded from this passive viewer.
import { routePlan, catAt } from './outdoorcatroute.js';
import { OUTDOOR_CATS as C } from './config.js';
export class OutdoorCatBrain {
 constructor(spec,id){this.spec=spec;this.id=id;this.plan=routePlan(spec.route,spec.rest,C.speed);}
 scheduled(now=Date.now()/1000){return catAt(this.plan,now-C.epoch+this.spec.phase,this.id);}
}
