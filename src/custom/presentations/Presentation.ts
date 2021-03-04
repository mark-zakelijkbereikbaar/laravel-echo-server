import { Slide } from './Slide';

export class Presentation {
    //interval    
    currentTimeout = null;
    
    uid: string;
    running: boolean;
    slides: Slide[];

    constructor(uid: string, running: boolean){
        this.uid = uid;
        this.running = running;
        
        this.startLoop(1000);
    }

    startLoop(timeout){
        this.currentTimeout = setTimeout(() => {
            //EMIT
            console.log('LOOPING!!!');
            this.startLoop(timeout);
        }, timeout);
    }

    destruct(){
        clearTimeout(this.currentTimeout);
    }

}