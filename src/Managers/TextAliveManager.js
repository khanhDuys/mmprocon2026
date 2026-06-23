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
                    // こたえて / imie
                    //this.player.createFromSongUrl("https://piapro.jp/t/6W2N/20251215164617", {
                    //  video: {
                    //    // 音楽地図訂正履歴
                    //    beatId: 4827293,
                    //    chordId: 2963754,
                    //    repetitiveSegmentId: 3086261,
                    //
                    //    // 歌詞URL: https://piapro.jp/t/9o24
                    //    // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2F6W2N%2F20251215164617
                    //    lyricId: 126519,
                    //    lyricDiffId: 28645
                    //  },
                    //});

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

                    // シャッターチャンス / 夜未アガリ
                    // this.player.createFromSongUrl("https://piapro.jp/t/PNpQ/20251209170719", {
                    //   video: {
                    //     // 音楽地図訂正履歴
                    //     beatId: 4827295,
                    //     chordId: 2963756,
                    //     repetitiveSegmentId: 3086263,
                    // 
                    //     // 歌詞URL: https://piapro.jp/t/wyWv
                    //     // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2FPNpQ%2F20251209170719
                    //     lyricId: 126542,
                    //     lyricDiffId: 28628
                    //   },
                    // });

                    // 世界最後の音楽隊 / 夏山よつぎ×ど～ぱみん
                    // this.player.createFromSongUrl("https://piapro.jp/t/B3yJ/20251215061727", {
                    //   video: {
                    //     // 音楽地図訂正履歴
                    //     beatId: 4827296,
                    //     chordId: 2963757,
                    //     repetitiveSegmentId: 3086264,
                    // 
                    //     // 歌詞URL: https://piapro.jp/t/9U-6
                    //     // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2FB3yJ%2F20251215061727
                    //     lyricId: 126594,
                    //     lyricDiffId: 28629
                    //   },
                    // });

                    // トリツクロジー / 鶴三
                    // this.player.createFromSongUrl("https://piapro.jp/t/QBdL/20251215094303", {
                    //   video: {
                    //     // 音楽地図訂正履歴
                    //     beatId: 4827297,
                    //     chordId: 2963758,
                    //     repetitiveSegmentId: 3086265,
                    // 
                    //     // 歌詞URL: https://piapro.jp/t/Nixq
                    //     // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2FQBdL%2F20251215094303
                    //     lyricId: 126593,
                    //     lyricDiffId: 28630
                    //   },
                    // });

                    // TAKEOVER / Twinfield
                    this.player.createFromSongUrl("https://piapro.jp/t/E2i3/20251215092113", {
                        video: {
                            // 音楽地図訂正履歴
                            beatId: 4827298,
                            chordId: 2963759,
                            repetitiveSegmentId: 3086266,
                            
                            // 歌詞URL: https://piapro.jp/t/zxWP
                            // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2FE2i3%2F20251215092113
                            lyricId: 126533,
                            lyricDiffId: 28631
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
                const newChar = this.player.video.findChar(pos+150);
                const newBeat = this.player.findBeat(pos);
                if (newBeat && newBeat!=this.cur_beat) {
                    this.cur_beat=newBeat;
                    //console.log("beat");
                    if (this.onBeatUpdate) {
                        this.onBeatUpdate();
                    }
                }
                if (newChar && newChar!=this.cur_char) {
                    this.cur_char=newChar;
                    //console.log(this.cur_joined_word);
                    if (!this.cur_joined_word || this.cur_char.startTime >= this.cur_joined_word.endTime) {
                        this.joinLyrics(this.cur_char.parent, this.cur_beat);
                    }
                    console.log("Current Char: " + this.cur_char.text + " of text " + this.cur_joined_word.text);
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
        let new_duration = iWord.duration;
        let joined = iWord.text;
        iWord = iWord.next;
        const punctuation = ["!", ",", ".", "?", ";", "！", "、", "。", "？", "；"];

        while (iWord) {
            

            let flag = false;
            
            // Rule: append to current if it's a particle
            if (["P", "R", "X"].includes(iWord.pos)) flag = true;

            // Rule: append to current if it's punctuation (! , . ? ; and it's japanese variant)
            if (punctuation.includes(iWord.text)) flag = true;
            else if (iWord.startTime - start_word.startTime >= iBeat.duration) break; // else if because punctuation isnt pronounced so just join them


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
    getBeatDuration() {
        return this.cur_beat.duration;
    }
    getBPM() {
        if (!this.cur_beat || !this.cur_beat.duration) return 0;
        return Math.round(60000 / this.cur_beat.duration);
    }
}