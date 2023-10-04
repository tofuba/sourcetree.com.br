/**
 * Copyright (C) <ano>  Chifrudo <chifrudo@localhost.com.br>
 *
 * Este programa é um software livre: você pode redistribuí-lo e/ou
 * modificá-lo sob os termos da GNU General Public License conforme
 * publicada por a Free Software Foundation, seja a versão 3 da
 * Licença, ou (a seu critério) qualquer versão posterior.
 *
 * Este programa é distribuído na esperança de que seja útil,
 * mas SEM QUALQUER GARANTIA; mesmo sem a garantia implícita de
 * COMERCIABILIDADE ou ADEQUAÇÃO PARA UM FIM ESPECÍFICO. Veja a
 * Licença Pública Geral GNU para mais detalhes.
 *
 * Você deve ter recebido uma cópia da GNU General Public License
 * juntamente com este programa. Caso contrário, consulte
 * <https://www.gnu.org/licenses/>.
 */


/**
 * Quads tem 7 pilastras e 6 linhas.
 */
function resetQuadrants()
{
    window.quads = [];
    quads.rows = 5;
    quads.cols = 6;

    setQuadDimensions();
    createQuads();
}

/**
 *
 */
function Quadrant(row, left)
{
    this.left = left;
    this.top = (row-1) * quads.height;
    this.right = this.left + quads.width;
    this.bottom = this.top + quads.height;

    this.things = []
    this.numobjects = this.tolx = this.toly = 0;
}

/**
 * Quads tem 7 pilastras e 6 linhas.
 */
function createQuadrants()
{
    quads = [];
    quads.rows = 5;
    quads.cols = 6;

    setQuadDimensions();
    createQuads();
}

/**
 *
 */
function setQuadDimensions()
{
    quads.width = quads.rightdiff = Math.round(window.innerWidth / (quads.cols - 3));
    quads.height = Math.round(window.innerHeight / (quads.rows - 2));
    quads.delx = quads.width * -2;
}

/**
 *
 */
function createQuads()
{
    for (var i = 0; i < quads.cols; ++i)
    {
        addQuadCol((i - 2) * quads.width);
    }

    quads.leftmost = quads[0];
}

/**
 * Recentx é o .left das coisas adicionadas mais recentemente.
 */
function addQuadCol(left)
{
    for (var i = 0; i < quads.rows; ++i)
    {
        quads.push(new Quadrant(i, left));
    }

    quads.rightmost = quads[quads.length - 1];
}

/**
 *
 */
function shiftQuadCol()
{
    var old = [];

    if (!map.nodeletequads)
    {
        for (var i = quads.rows - 1; i >= 0; --i)
        {
            old.push(deleteQuad(quads.shift()));
        }
    }

    quads.leftmost = quads[0];
    quads.rightdiff = quads.width;
}

/**
 *
 */
function deleteQuad(quad)
{
    if (quad.element)
    {
        document.body.removeChild(quad.element);
    }

    return quad;
}

/**
 *
 */
function updateQuads(xdiff)
{
    quads.rightdiff += xdiff || 0;

    /**
     * if (quads.leftmost.left <= quads.delx)
     * {
     * }
     */

    while (quads.leftmost.left <= quads.delx)
    {
        addQuadCol(quads.rightmost.right);
        shiftQuadCol();
        spawnMap();
    }
}

/**
 *
 */
function determineAllQuadrants()
{
    for (var i = 0; i < quads.length; ++i)
    {
        quads[i].numthings = 0;
    }

    for (var j = 0; j < solids.length; ++j)
    {
        if (solids[j].moved != false)
        {
            determineThingQuadrants(solids[j]);
        }
    }

    /**
     * for (var k = 0; k < characters.length; ++k)
     * {
     *     determineThingQuadrants(characters[k]);
     * }
     */
}

/**
 *
 */
function determineThingQuadrants(me)
{
    me.numquads = 0;

    for (var i = 0, len = quads.length; i < len; ++i)
    {
        if (objectInQuadrant(me, quads[i]))
        {
            setThingInQuadrant(me, quads[i]);

            if (me.numquads > me.maxquads)
            {
                break;
            }
        }
    }
}

/**
 *
 */
function setThingInQuadrant(me, quad)
{
    me.quads[me.numquads] = quad;
    quad.things[quad.numthings] = me;

    ++me.numquads;
    ++quad.numthings;
}
