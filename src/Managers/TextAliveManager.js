import { Player } from 'textalive-app-api';

export class TextAliveManager {
    constructor() {
        this.isSongReady = false;
        this.cur_char = null;
        this.onLyricUpdate = null;
        this.returnPosition = null; 
        this.player = new Player({
            app: { token: "IWXbptrqdOIVSU7K" },
        });
        this.initListeners();
    }
    initListeners() {
        this.player.addListener({
            onAppReady: (app) => {
                if (!app.managed) {
                    // アフター・ザ・カーテン / Rulmry 
                    //this.player.createFromSongUrl("https://piapro.jp/t/zoqO/20251214200738", {
                    //  video: {
                    //    // 音楽地図訂正履歴
                    //    beatId: 4827294,
                    //    chordId: 2963755,
                    //    repetitiveSegmentId: 3086262,
//
                    //    // 歌詞URL: https://piapro.jp/t/EVO2
                    //    // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2FzoqO%2F20251214200738
                    //    lyricId: 126591,
                    //    lyricDiffId: 28627
                    //  },
                    //});
                    this.player.createFromSongUrl("https://staff.aist.go.jp/m.goto/RWC-MDB/MP3/RWC-MDB-P-2001.No.087.mp3");
                }
            },
            onTimerReady: () => {
                this.isSongReady = true;
                console.log("ready");
            },
            onTimeUpdate: (pos) => {
                if (!this.player.video) return;
                const newChar = this.player.video.findChar(pos);
                if (newChar && newChar!=this.cur_char) {
                    this.cur_char=newChar;
                    console.log("Current Char:" + this.cur_char.text + " of text " + newChar.parent.text);
                    if (this.onLyricUpdate) {
                        this.onLyricUpdate(newChar.parent, this.cur_char);
                    }
                }
            }
        });
    }
}