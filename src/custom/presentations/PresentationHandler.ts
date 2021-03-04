import { Presentation } from './Presentation';

export class PresentationHandler {
    presentations = [];

    constructor(broadcast){}

    addPresentation(presentation){
        this.presentations.push(new Presentation(presentation));
    }

}