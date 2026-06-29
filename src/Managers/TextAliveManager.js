import { Player } from 'textalive-app-api';

export class TextAliveManager {
    constructor() {
        this.isSongReady = false;
        this.cur_char = null;
        this.cur_joined_word = null;
        this.cur_beat = null;
        this.onLyricUpdate = null;
        this.onBeatUpdate = null;
        this.onStarSpawn = null;
        this.starLookaheadMs = 2000;
        this.starMinDurationMs = 1000;
        this.returnPosition = null;
        this.delay = 150; 

        this.songs = [
            { name: "こたえて / imie", url: "https://piapro.jp/t/6W2N/20251215164617", video: { beatId: 4827293, chordId: 2963754, repetitiveSegmentId: 3086261, lyricId: 126519, lyricDiffId: 28645 } },
            { name: "アフター・ザ・カーテン / Rulmry", url: "https://piapro.jp/t/zoqO/20251214200738", video: { beatId: 4827294, chordId: 2963755, repetitiveSegmentId: 3086262, lyricId: 126591, lyricDiffId: 28627 } },
            { name: "シャッターチャンス / 夜未アガリ", url: "https://piapro.jp/t/PNpQ/20251209170719", video: { beatId: 4827295, chordId: 2963756, repetitiveSegmentId: 3086263, lyricId: 126542, lyricDiffId: 28628 } },
            { name: "世界最後の音楽隊 / 夏山よつぎ×ど～ぱみん", url: "https://piapro.jp/t/B3yJ/20251215061727", video: { beatId: 4827296, chordId: 2963757, repetitiveSegmentId: 3086264, lyricId: 126594, lyricDiffId: 28629 } },
            { name: "トリツクロジー / 鶴三", url: "https://piapro.jp/t/QBdL/20251215094303", video: { beatId: 4827297, chordId: 2963758, repetitiveSegmentId: 3086265, lyricId: 126593, lyricDiffId: 28630 } },
            { name: "TAKEOVER / Twinfield", url: "https://piapro.jp/t/E2i3/20251215092113", video: { beatId: 4827298, chordId: 2963759, repetitiveSegmentId: 3086266, lyricId: 126533, lyricDiffId: 28631 } }
        ];
        this.appInstance = null;
        this.pendingSongIndex = null;

        this.player = new Player({
            app: { token: "IWXbptrqdOIVSU7K" },
            valenceArousalEnabled: true
        });
        this.initListeners();
    }
    loadSong(index) {
        this.pendingSongIndex = index;
        if (this.appInstance) {
            this.createSong(index);
        }
    }
    createSong(index) {
        const song = this.songs[index];
        if (!song) return;
        this.player.createFromSongUrl(song.url, { video: song.video });
    }
    initListeners() {
        this.player.addListener({
            onAppReady: (app) => {
                if (!app.managed) {
                    this.appInstance = app;
                    if (this.pendingSongIndex !== null) {
                        this.createSong(this.pendingSongIndex);
                    }
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
                    if (this.onBeatUpdate) {
                        this.onBeatUpdate();
                    }
                }
                if (newChar && newChar!=this.cur_char) {
                    this.cur_char=newChar;
                    if (!this.cur_joined_word || this.cur_char.startTime >= this.cur_joined_word.endTime) {
                        this.joinLyrics(this.cur_char.parent, this.cur_beat);
                    }
                    console.log("Current Char: " + this.cur_char.text + " of text " + this.cur_joined_word.text);
                    if (this.onLyricUpdate) {
                        this.onLyricUpdate(this.cur_joined_word, this.cur_char);
                    }
                }
                if (this.cur_joined_word && this.cur_joined_word.isVerseEnd && !this.cur_joined_word.starSpawned && pos >= this.cur_joined_word.starSpawnTime) {
                    this.cur_joined_word.starSpawned = true;
                    if (this.onStarSpawn) {
                        this.onStarSpawn(this.cur_joined_word);
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
        
        const verseGapMs = 600;
        const isVerseEnd = (!end_word.next || (end_word.next.startTime - end_time >= verseGapMs)) && new_duration >= this.starMinDurationMs;

        this.cur_joined_word = {
            text: joined,
            endTime: end_time,
            duration: new_duration,
            firstChar: start_word.firstChar,
            lastChar: end_word.lastChar,
            isVerseEnd,
            starSpawnTime: isVerseEnd ? Math.max(start_word.startTime, end_time - this.starLookaheadMs) : -1,
            starSpawned: false
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