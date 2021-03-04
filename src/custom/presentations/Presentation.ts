export class Presentation {
    //interval    
    currentTimeout = null;

    constructor(presentation){
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