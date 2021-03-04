import { Presentation } from './Presentation';
import { Log } from '../../log';

export class PresentationHandler {
    presentations = [];

    constructor(private broadcast){}

    createPresentation(uid){

    }

    updatePresentation(uid){
    }

    deletePresentation(uid){
    }

    presentationEvent(channel, message){
        Log.info(`presentation: event: ${message.event}`);
        Log.info(JSON.stringify(message));

        if(message.event === 'create_presentation'){
            this.createPresentation(message.data);
            // this.broadcast
        }
        if(message.event === 'update_presentation'){
            this.updatePresentation(message.data);
        }
        if(message.event === 'delete_presentation'){
            this.deletePresentation(message.data);
        }

        // this.presentations.push(new Presentation(presentation));
    }

}