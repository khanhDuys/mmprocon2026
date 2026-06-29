My submission for Magical Mirai programming contest 2026

# How to install
Firstly, you need to clone it first via
```
git clone https://github.com/khanhDuys/mmprocon2026.git
cd mmprocon2026
```
then install dependencies via
```
npm install
```
to run the dev server:
```
npm run dev
```

# Development stuff
Well, this is my first submission to the magical mirai programming contests, I would say that I haven't done enough as I wanted to (partly because my mentor just out-of-the-blue gave us an assignment that makes us read and analyze 20 research papers in 4 days, yikes) Mostly because I kinda took on all of the work myself instead of finding someone to collab with. <br>
All of the code and art is done by me, the art is done in Blender aswell as Aseprite. <br>
The font used is Mona12, a font that's open source and free and you really can do anything with it (except for reselling), and is under OFL-1.1 license. <br>
#About lyrics
If we used IChar or IWord, it would be too fast for the sunflowers to catch up, that's why I joined the words via TextAliveManager.js. <br>

```
// Rule: append to current if it's a particle
if (["P", "R", "X"].includes(iWord.pos)) flag = true;

// Rule: append to current if it's punctuation (! , . ? ; and it's japanese variant)
if (punctuation.includes(iWord.text)) flag = true;
else if (iWord.startTime - start_word.startTime >= iBeat.duration) break; // else if because punctuation isnt pronounced so just join them
```
The words are joined via punctuation (except for & because that's pronounced 'and'), and if it's a particle, adverb, or other. Those are joined so that the word division isn't weird(?) and enough time for the sunflowers to catch up. <br>

# About the sky
The sky is coded by me, since three.js default sky is far too realistic and not stylized. I can't go over throughly since I still have that assignment to do (rip) <br>
The clouds uses an Fractal Brownian Motion to generate the noise patterns for it. <br>
The beat bars are coded as follow:
```
    float beatLevel = step(0., dir.y + 0.05) - max(0., dir.y);
    float beatProgress = uBeatDuration > 0.0 ? clamp(uSinceLastBeat / uBeatDuration, 0.0, 1.0) : fract(uTime);
    float decay = smoothstep(0.65, 0.0, beatProgress);
    float rise = pow(smoothstep(0.9, 1.0, beatProgress), 4.0);
    float beatHeight = max(decay, rise) * uBarHeight;
    float beatLimit = step(1.0 - uBarHeight - beatHeight - sin(barAngleGrad * PI * 2. * uBarRevolutions - uTime * uBarSpeed - uBPMCount * 0.0001) * uRevolutionWeight, beatLevel);
    float beatBar = barShape * beatLimit * 0.25;
```
beatLimit is the grayscale map that dictates how the bars bounce to the music and how high they are, and they are also driving by a sine function to have those waves, the waves speed is also affected by the current bpm count that is given by TextAliveManager.js aswell <br>
beatBar is the grayscale map that is the mask of bars that span from top to bottom, each bar is seperated an equal distance. <br>
Multiplying both of them is just essentially an intersection of both sets (sets here being beatLimit and beatBar) <br>

The sky gradient and cloud is then dithered by a special dithering technique that I read off of nojoule's double dithering technique here: https://godotshaders.com/shader/double-dither-stylized-transparency-shadows-retro-masks/ <br>
Essentially what it does is it takes an 8x8 bayer matrix (that I generated off a script in the script folder) and another one but offsetted by 1 unit in the x coordinate, then it combines the two bayer matrices by taking the max(a, b) <br>
Although, the clouds are dithered a way that makes the dithering texture parellel to the clouds itself via this piece of code:
```
    vec2 cloudCell = floor(uv * uCloudDitherScale);
    cloudColor = doubleDither(cloudColor, cloudCell, uDitherBands);
```
# About the miku model
This is by-far the most time taking element that I have made for this project (And maybe the first model of the magical mirai 2026 Miku itself) <br>
Though I really time crunched at the end, so that's why the uvs are a bit unorthodox. <br>
The model is fully rigged (Forward-kinematics though), and fully modeled (except for some ribbons that wouldn't be really needed) <br>
The design was really complex and hard for me to model (why wata (╥﹏╥)), since the orthogonal projected views in the concept art didn't include each specific layers, so I had some artistic liberty. <br>
And of course, there will be somethings that I can't really solve (or is maybe impossible in three.js). Specfically, there are some transparent veils of fabric on Miku, (like her collar, or wrist on her gloves, etc). The transparency I can't really import, because the model requires double sided to render alpha cards (such as the sunflower, the wings, leaves, the butterfly charm, ...), but double sided will mess with other stuff. If I tried to have double-sided with transparency, some reason the whole model will have an inverted normals look (If you imported the .glb file in the public folder on .glb online viewers, you will encounter the same thing). So I had to forgo the transparency and made it opaque. <br>

