import { Player } from 'textalive-app-api';

export class TextAliveManager {
    constructor() {
        this.isSongReady = false;
        this.player = new Player({
            app: { token: "IWXbptrqdOIVSU7K" },
        });
        this.initListeners();
    }
    initListeners() {
        this.player.addListener({
            onAppReady: (app) => {
                if (!app.managed) {
                    // こたえて / imie
                    this.player.createFromSongUrl("https://piapro.jp/t/6W2N/20251215164617", {
                        video: {
                            // 音楽地図訂正履歴
                            beatId: 4827293,
                            chordId: 2963754,
                            repetitiveSegmentId: 3086261,
                            
                            // 歌詞URL: https://piapro.jp/t/9o24
                            // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2F6W2N%2F20251215164617
                            lyricId: 126519,
                            lyricDiffId: 28645
                        },
                    });
                }
            },
            onTimerReady: () => {
                this.isSongReady = true;
                console.log("ready");
            }
        })
    }
}