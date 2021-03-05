import { Presentation } from './Presentation';
import { Slide } from './Slide';
import { Log } from '../../log';

export class PresentationHandler {
    presentations: Presentation[] = [];

    constructor(private broadcast){}

    updatePresentation(data: any): void {
        let presentationIndex: number = null;
        const presentation = this.presentations.find((presentation: Presentation, index: number) => {
            if(presentation.uid === data.uid){
                presentationIndex = index;
                return true;
            }
            return false;
        });

        const slides: Slide[] = data.slides.map((slide) => {
            return new Slide(slide.uid, slide.duration);
        });

        const uids: string[] = [];
        data.devices.map((device) => device.device_users.map((device_user) => {
            uids.push(device_user.contact.uid);
        }));

        if(!presentation){
            let newPresentation = new Presentation(this.broadcast, data.uid, data.running, slides, uids);
            this.presentations.push(newPresentation);
        }else{
            presentation.updatePresentation(data.running, slides, uids);
        }
    }

    deletePresentation(data: any): void {
        let presentationIndex: number = null;
        const presentation = this.presentations.find((presentation: Presentation, index: number) => {
            if(presentation.uid === data.uid){
                presentationIndex = index;
                return true;
            }
            return false;
        });

        presentation.destroy();
        this.presentations.splice(presentationIndex, 1);
    }

    presentationEvent(message: any): void {
        // Log.info(JSON.stringify(message));

        if(message.event === 'update_presentation'){
            this.updatePresentation(message.data.data.response);
        }
        if(message.event === 'delete_presentation'){
            this.deletePresentation(message.data.data.response);
        }
    }

}