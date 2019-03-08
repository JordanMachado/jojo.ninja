const createQuad = (size) =>
{
    const positions = [];
    const uvs = [];
    const indices = [];
    const verletpoints = [];
    let column,
        row;

    column = row = size;
    const halfSize = (row - 1) / 2;

    for (var y = 0; y < column; y++)
    {
        for (var x = 0; x < row; x++)
        {
            positions.push(x - halfSize, y - halfSize, 0);
            uvs.push(x / (row - 1), y / (column - 1));

            let pin  = false;

            if (y === row - 1 && x === 0 || y === row - 1 && x === row - 1)
            {
                pin = true;
            }

            if (y === 0 && x === 0 || y === 0 && x === row - 1)
            {
                pin = true;
            }
            verletpoints.push({
                x: x - halfSize,
                y: y - halfSize,
                z: 0,
                pinned: pin,
            });
        }
    }

    const quads = row - 1;
    const rowSize = (quads + 1);

    for (var y = 0; y < quads; ++y)
    {
        const rowOffset0 = (y + 0) * rowSize;
        const rowOffset1 = (y + 1) * rowSize;

        for (var x = 0; x < quads; ++x)
        {
            const offset0 = rowOffset0 + x;
            const offset1 = rowOffset1 + x;

            indices.push(offset0, offset0 + 1, offset1);
            indices.push(offset1, offset0 + 1, offset1 + 1);
        }
    }

    return {
        positions,
        uvs,
        indices,
        verletpoints,
    };
};

export default createQuad;
