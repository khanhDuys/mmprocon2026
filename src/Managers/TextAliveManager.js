import { Player } from 'textalive-app-api';

export class TextAliveManager {
    constructor() {
        this.isSongReady = false;
        this.cur_char = null;
        this.cur_joined_word = null;
        this.cur_beat = null;
        this.onLyricUpdate = null;
        this.onBeatUpdate = null;
        this.returnPosition = null; 
        this.player = new Player({
            app: { token: "IWXbptrqdOIVSU7K" },
            valenceArousalEnabled: true
        });
        this.initListeners();
    }
    initListeners() {
        this.player.addListener({
            onAppReady: (app) => {
                if (!app.managed) {
                    // シャッターチャンス / 夜未アガリ
                    this.player.createFromSongUrl("https://piapro.jp/t/PNpQ/20251209170719", {
                      video: {
                        // 音楽地図訂正履歴
                        beatId: 4827295,
                        chordId: 2963756,
                        repetitiveSegmentId: 3086263,
                    
                        // 歌詞URL: https://piapro.jp/t/wyWv
                        // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2FPNpQ%2F20251209170719
                        lyricId: 126542,
                        lyricDiffId: 28628
                      },
                    });
                    //this.player.createFromSongUrl("https://staff.aist.go.jp/m.goto/RWC-MDB/MP3/RWC-MDB-P-2001.No.087.mp3");
                }
            },
            onTimerReady: () => {
                this.isSongReady = true;
                console.log("ready");
            },
            onTimeUpdate: (pos) => {
                if (!this.player.video) return;
                const newChar = this.player.video.findChar(pos);
                const newBeat = this.player.findBeat(pos);
                if (newBeat && newBeat!=this.cur_beat) {
                    this.cur_beat=newBeat;
                    //console.log("beat " + this.cur_beat.startTime + " " + this.cur_beat.endTime);
                    if (this.onBeatUpdate) {
                        this.onBeatUpdate();
                    }
                }
                if (newChar && newChar!=this.cur_char) {
                    this.cur_char=newChar;
                    console.log(this.cur_joined_word);
                    if (!this.cur_joined_word || this.cur_char.startTime >= this.cur_joined_word.endTime) {
                        this.joinLyrics(this.cur_char.parent, this.cur_beat);
                    }
                    //console.log("Current Char: " + this.cur_char.text + " of text " + this.cur_char.parent.text);
                    //console.log("CurStartTime" + this.cur_char.startTime);
                    //console.log("CurValence: " + this.player.getValenceArousal(pos).v + ", Arou: " + this.player.getMedianValenceArousal(pos).a);
                    if (this.onLyricUpdate) {
                        this.onLyricUpdate(this.cur_joined_word, this.cur_char);
                    }
                }

            }
        });
    }
    joinLyrics(iWord, iBeat) {

        let start_word = iWord;
        let end_word = iWord;
        let end_time = iWord.endTime;
        let duration_threshold = (iBeat.duration);
        let new_duration = iWord.duration;
        let joined = iWord.text;
        iWord = iWord.next;
        while (iWord) {
            let flag = false; // breaks out of loop if flag false
            
            // Rule: append to current if it's a particle
            if (iWord.pos === "P" || iWord.pos === "R") flag = true;

            // Rule: append to current if it's punctuation (! , . ? ; and it's japanese variant)
            if (iWord.text === "!" ||
                iWord.text === "," || 
                iWord.text === "." ||
                iWord.text === "?" ||
                iWord.text === ";" ||
                iWord.text === "！" ||
                iWord.text === "、") flag = true;


            if (!flag) break;

            joined += iWord.text;
            end_time = iWord.endTime;
            new_duration += iWord.duration;
            end_word = iWord;
            iWord = iWord.next;
        }
        
        this.cur_joined_word = {
            text: joined,
            endTime: end_time,
            duration: new_duration,
            firstChar: start_word.firstChar,
            lastChar: end_word.lastChar
        };
    }
}