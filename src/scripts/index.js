import style from 'styles/main.scss';
import domready from 'domready';
import assetsLoader from 'assets-loader';
import manifestModel from './manifests/manifest-model';
import manifestImage from './manifests/manifest-image';
import manifestAudio from './manifests/manifest-audio';
import Scene from './Scene';
import * as PIXI from 'pixi.js';
import gsap from 'gsap';
import raf from 'raf';
import FontFaceObserver from 'fontfaceobserver';
const loader = assetsLoader({
    assets: [].concat(manifestModel, manifestImage, manifestAudio),
});
const fonts = ['Didot', 'Espoir', 'Source Sans Pro'];
let fontLoaded = 0;
let resourcesLoaded = false;

window.getAsset = function (id)
{
    return loader.get(id);
};

console.warn = () =>
{

};

domready(() =>
{
    // TODO animation loader
    document.body.classList.add('loading');
    loader.on('error', function (error)
    {
        console.error(error);
    })
        .on('progress', function (progress)
        {
            // console.log((progress * 100).toFixed() + '%');
        })
        .on('complete', function (assets)
        {
            document.body.classList.remove('loading');
            window.assets = assets;
            // console.table(assets);
            if (fontLoaded === fonts.length)
            {
                init();
            }
            resourcesLoaded = true;
        })
        .start();
    loadFonts();
});
let scene;

function loadFonts()
{
    for (let i = 0; i < fonts.length; i++)
    {
        const font = new FontFaceObserver(fonts[i]);

        font.load().then(function ()
        {
            fontLoaded++;

            if (resourcesLoaded && fontLoaded === fonts.length)
            {
                init();
            }
        }, function ()
        {
            console.log('Font is not available');
        });
    }
}
function init()
{
    scene = new Scene();
    resize();
    window.addEventListener('resize', resize);
    render();
}

function render()
{
    raf(render);
    scene.render();
}
function resize()
{
    scene.resize(window.innerWidth, window.innerHeight);
}
