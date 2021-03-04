import { reject } from "lodash";

export class Presentation {
    //interval    
    currentTimeout = null;

    constructor(presentation){
        this.startLoop(1000);
    }

    startLoop(timeout){
        this.currentTimeout = setTimeout(() => {
            //EMIT
            this.startLoop(timeout);
        }, timeout);
    }

    destruct(){
        clearTimeout(this.currentTimeout);
    }

}