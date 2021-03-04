import { array } from 'yargs';
import Presentation from './Presentation';

export class PresentationHandler {
    presentations = [];

    constructor(broadcast){}

    addPresentation(presentation){
        let presentation = new Presentation(presentation);
        this.presentations.push(Presentation);
    }

}