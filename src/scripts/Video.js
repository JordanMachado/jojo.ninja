import * as PIXI from 'pixi.js';
import Signal from 'signals';

// console.log(PIXI);
// PIXI.VideoBaseTexture.prototype._isSourceReady = function _isSourceReady()
// {
//     // return this.source.readyState === 3 || this.source.readyState === 4;
// };
//
// PIXI.VideoBaseTexture.prototype.resourceUpdated = function resourceUpdated()
// {
//     if (!this.count)
//     {
//         this.count = 1;
//     }
//     else
//     {
//         this.count += 1;
//     }
//     if (this.count % 2 === 0)
//     {
//         this.dirtyId++;
//     }
// };

export default class VideoManager
{
    constructor()
    {
        this.ready = new Signal();
        this.video = document.createElement('video');
        this.video.muted = true;
        this.video.loop = true;
        // this.video.style.display = none;
        // document.body.appendChild(this.video);

        this.texture = PIXI.Texture.from(this.video);

        this.texture.baseTexture.resource.autoUpdate = false;

        this.video.addEventListener('canplay', () =>
        {
            this.video.play();
            this.ready.dispatch();
        });
    }
    setSource(src)
    {
        this.video.src = src;
    }
}
