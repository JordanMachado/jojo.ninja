// point structure

// x:0,
// y:0,
// z:0,
// oldx:0,
// oldy:0,
// oldz:0,
// pinned:false
export default class Verlet
{
    constructor(gravity = 0.01, friction = 0.9)
    {
        this.points = [];
        this.sticks = [];
        this.gravity = gravity;
        this.time = 0;
        this.friction = friction;
        this.force = {
            x: 0,
            y: 0,
            z: 0,
        };
    }
    setPoints(points)
    {
        for (let i = 0; i < points.length; i++)
        {
            const point = points[i];

            this.points.push(point);
            point.force = {
                x: 0,
                y: 0,
                z: 0,
            };
            point.ori = {
                x: point.x,
                y: point.y,
                z: point.z,
            };
            if (!point.oldx)
            {
                point.oldx = point.x;
            }
            if (!point.oldy)
            {
                point.oldy = point.y;
            }
            if (!point.oldz)
            {
                point.oldz = point.z;
            }
        }
    }
    addPoint(point)
    {
        this.points.push(point);
        point.force = {
            x: 0,
            y: 0,
            z: 0,
        };
        point.ori = {
            x: point.x,
            y: point.y,
            z: point.z,
        };
        if (!point.oldx)
        {
            point.oldx = point.x;
        }
        if (!point.oldy)
        {
            point.oldy = point.y;
        }
        if (!point.oldz)
        {
            point.oldz = point.z;
        }
    }
    addStick(p0, p1)
    {
        this.sticks.push({
            p0,
            p1,
            length: this.distance(p1, p0),
        });
    }
    distance(a, b)
    {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dz = b.z - a.z;

        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    updatePoints()
    {
        for (let i = 0; i < this.points.length; i++)
        {
            const p = this.points[i];

            if (!p.pinned)
            {
                let vx = (p.x - p.oldx) + p.force.x;
                // let vx = (p.x - p.oldx)- this.gravity
                // let vy = (p.y - p.oldy);
                let vy = (p.y - p.oldy) - this.gravity + p.force.y;
                let vz = (p.z - p.oldz) + p.force.z;

                // if(p.y < -5|| p.y > 10) {
                //
                vy = vy * this.friction;
                // }
                //
                // if(p.x < -8 || p.x > 8) {
                //
                vx = vx * this.friction;
                // }
                //
                // if(p.z < -8 || p.z > 8) {
                //
                vz = vz * this.friction;
                // }

                //
                // if(Math.abs(vy) <= 0.0005) {
                //   continue;
                // }

                p.oldx = p.x;
                p.oldy = p.y;
                p.oldz = p.z;
                p.x += vx;
                p.y += vy;
                p.z += vz;
            }
        }
    }
    updateStiks()
    {
        for (let i = 0; i < this.sticks.length; i++)
        {
            const s = this.sticks[i];
            const dx = s.p1.x - s.p0.x;
            const dy = s.p1.y - s.p0.y;
            const dz = s.p1.z - s.p0.z;
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            const diff = s.length - distance;
            const percent = diff / distance / 2;

            const offsetX = dx * percent;
            const offsetY = dy * percent;
            const offsetZ = dz * percent;

            if (!s.p0.pinned)
            {
                s.p0.x -= offsetX;
                s.p0.y -= offsetY;
                s.p0.z -= offsetZ;
            }
            if (!s.p1.pinned)
            {
                s.p1.x += offsetX;
                s.p1.y += offsetY;
                s.p1.z += offsetZ;
            }
        }
    }
    applyMouse(mouse)
    {
        for (let i = 0; i < this.points.length; i++)
        {
            const p = this.points[i];
            const dist = this.distance(p.ori, mouse);
            // console.log(dist);

            if (dist < 0.4)
            {
                p.force.x -= ((p.force.x - mouse.x) * 0.5) * 0.05;
                p.force.y -= ((p.force.y - mouse.y) * 0.5) * 0.05;
                p.force.z -= 0.01;
            }
            else
            {
                p.force.x *= 0.9;
                p.force.y *= 0.9;
                p.force.z *= 0.9;
            }
        }
    }
    update(mouse)
    {
        this.time += 0.1;
        if (mouse)
        { this.applyMouse(mouse); }
        this.updatePoints();
        this.updateStiks();
    }
    getBuffer()
    {
        const buffer = [];
        const arr = new Float32Array(this.points.length * 3);

        for (let i = 0; i < this.points.length; i++)
        {
            buffer.push(this.points[i].x, this.points[i].y, this.points[i].z);
        }
        arr.set(buffer);

        return arr;
    }
}
