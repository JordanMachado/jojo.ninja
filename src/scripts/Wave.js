import Quad from './Quad';
export default class Wave
{
    constructor(geometry, camera, container)
    {
        this.container = container;

        const gridSize = 20;

        this.items = [];
        for (let y = 0; y < gridSize; y++)
        {
            for (let x = 0; x < gridSize; x++)
            {
                const quad = new Quad(geometry, camera);

                quad.transform3d.position.x = x - (gridSize / 2);
                quad.transform3d.position.y = y - (gridSize / 2);

                this.container.addChild(quad);
                this.items.push(quad);
            }
        }

        this.interval = setInterval(() =>
        {
            this.waves({ x: Math.random() * (10 + 10) - 10, y: Math.random() * (10 + 10) - 10 });
        }, 1500 + (Math.random() * 1000));
    }
    waves(center)
    {
        TweenLite.killTweensOf(this.wave);
        this.waving = true;
        const waveHeight = Math.random() * 5 + 2;
        const waveLength = Math.random() * 5 + 1;

        this.waveCenter = center;

        this.wave = {
            x: 0,
            y: waveHeight,
            z: waveLength,
        };
        const duration = 3;

        TweenLite.to(this.wave, duration, {
            x: 50,
            y: 0,
            onComplete: () =>
            {
                this.wave.x = 0;
                this.wave.y = 0;
                this.wave.z = 0;
                this.waving = false;
            },
        });
    }
    update()
    {
        for (let i = 0, len = this.items.length; i < len; i++)
        {
            const child = this.items[i];

            if (this.waving)
            {
                const distToWave = Math.sqrt(Math.pow(this.waveCenter.x - child.transform3d.position.x, 2) + Math.pow(this.waveCenter.y - child.transform3d.position.y, 2));
                const distToWaveFront = Math.sqrt(Math.pow(distToWave - this.wave.x, 2));
                let elevation = 0;

                if (distToWaveFront < this.wave.z)
                {
                    let tmp = 1.0 - (distToWaveFront / this.wave.z);

                    tmp = Math.pow(Math.sin(tmp), 2.0);
                    elevation += tmp * this.wave.y;
                }
                child.transform3d.position.z = elevation - 5;
            }
        }
    }
    hide()
    {
        for (let i = 0, len = this.items.length; i < len; i++)
        {
            const child = this.items[i];

            child.transform3d.visible = false;
        }
        clearInterval(this.interval);
    }
}
