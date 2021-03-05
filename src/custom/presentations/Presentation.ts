import { Slide } from './Slide';
import { Log } from '../../log';
import { throws } from 'assert';

export class Presentation {
    //interval    
    currentTimeout = null;
    
    uid: string;
    running: boolean;
    slides: Slide[];
    device_user_uids: string[];

    currentSlide: number = null;

    constructor(private broadcast, uid: string, running: boolean, slides: Slide[], device_user_uids: string[]){
        this.uid = uid;
        this.running = running;
        this.slides = slides;
        this.device_user_uids = device_user_uids;
    }

    updatePresentation(running: boolean, slides: Slide[], device_user_uids: string[]){
        this.running = running;
        this.slides = slides;
        this.device_user_uids = device_user_uids;

        if(this.running){
            if(this.currentTimeout != null){
                clearTimeout(this.currentTimeout);
            }

            this.currentSlide = 0;
            this.startLoop();
        }else{
            if(this.currentTimeout){
                clearTimeout(this.currentTimeout);
            }
        }
    }

    startLoop(){
        if(this.running && this.slides.length && this.device_user_uids.length){

            let duration = null;
            if(this.slides[this.currentSlide]){
                duration = this.slides[this.currentSlide].duration;
            }else{
                this.currentSlide = 0;
                this.startLoop();
            }

            if(duration){
                Log.info(`Broodkast: Presentation: ${this.uid} | slideIndex: ${this.currentSlide} | duration: ${duration}`);
                this.device_user_uids.map((device_user_uid) => {
                    Log.info(`Broodkast: Presentation: ${this.uid} | slideIndex: ${this.currentSlide} | duration: ${duration} | device: ${device_user_uid}`);
                    this.broadcast(`private-personal.${device_user_uid}`, {
                        event: `set_presentation_slide`,
                        data: {
                            presentation_uid: this.uid,
                            slide_index: this.currentSlide
                        }
                    });
                });
    
                this.currentTimeout = setTimeout(() => {
                    this.currentSlide++;
                    this.startLoop();
                }, duration);
            }
        }
    }

    destroy(){
        clearTimeout(this.currentTimeout);
    }

}