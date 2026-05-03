import { Player } from 'textalive-app-api';

export class TextAliveManager {
    constructor() {
        this.player = new Player({
            app: { token: "IWXbptrqdOIVSU7K" };
        })
    }
}