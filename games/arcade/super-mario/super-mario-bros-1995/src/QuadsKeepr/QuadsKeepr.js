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
 * O código real !
 */

/**
 *
 */
function QuadsKeepr(settings)
{
    "use strict";

    /**
     * Variáveis de membro.
     */
    var version = "1.0";

    /**
     * Quadrantes, listados como um vetor complexo.
     */
    var quadrants;

    /**
     * Quadrantes, listados por pilastras.
     */
    var columns;

    /**
     * Quantos quadrantes, linhas e pilastras.
     */
    var num_quads;
    var num_rows;
    var num_cols;

    /**
     * Tamanhos da tela inteira.
     */
    var screen_width;
    var screen_height;

    /**
     * Tamanhos de cada cada quadrante.
     */
    var quad_width;
    var quad_height;

    /**
     * Quão longe de um quadrante ainda contará como estando nele.
     */
    var tolerance;

    /**
     * Quando remover uma pilastra.
     */
    var delx;

    /**
     * Quão longe à direita a pilastra de desova deve ir.
     */
    var out_difference;

    /**
     * Os quads mais à esquerda e à direita (para verificação delx).
     */
    var leftmost;
    var rightmost;

    /**
     * Nomes sob os quais as Coisas externas devem armazenar informações
     * do Quadrante.
     */
    var thing_left;
    var thing_top;
    var thing_right;
    var thing_bottom;
    var thing_num_quads;
    var thing_max_quads;
    var thing_quadrants;

    /**
     * Chamadas de retorno para...
     */

    /**
     * Quando os quadrantes são atualizados.
     */
    var onUpdate;

    /**
     * Quando duas Coisas se tocam (não usado... ainda!).
     */
    var onCollide;

    /**
     * Público fica.
     */
    this.getQuadrants = function()
    {
        return quadrants;
    }

    this.getNumQuads = function()
    {
        return num_quads;
    }

    this.getNumRows = function()
    {
        return num_rows;
    }

    this.getNumCols = function()
    {
        return num_cols;
    }

    this.getQuadWidth = function()
    {
        return quad_width;
    }

    this.getQuadHeight = function()
    {
        return quad_height;
    }

    this.getDelX = function()
    {
        return delx;
    }

    this.getOutDifference = function()
    {
        return out_difference;
    }

    /**
     * Criação e inicialização de quadrantes.
     */

    /**
     * Público: resetQuadrants.
     */
    var resetQuadrants = this.resetQuadrants = function resetQuadrants()
    {
        /**
         * Limpe os vetors de membros.
         */
        quadrants.length = 0;
        columns.length = 0;

        /**
         * Crie os próprios quadrantes.
         */
        for (var i = 0; i < num_cols; ++i)
        {
            addQuadCol((i - 2) * quad_width);
        }

        /**
         * Grave o quad mais à esquerda.
         */
        leftmost = quadrants[0];
    }

    /**
     * Inicializador de quadrantes.
     */
    function Quadrant(row, left)
    {
        /**
         * Atualização de posição.
         */
        this.left = left;
        this.top = (row - 1) * quad_height;
        this.right = this.left + quad_width;
        this.bottom = this.top  + quad_height;

        /**
         * Acompanhando as coisas contidas.
         */
        this.things = [];
        this.numobjects = this.tolx = this.toly = 0;
    }

    /**
     * Embaralhamento de quadrantes.
     */

    /**
     * Público: update.
     * Adiciona novas pilastras à direita, se necessário.
     */
    this.updateQuadrants = function(xdiff)
    {
        xdiff = xdiff || 0;
        out_difference += xdiff;

        /**
         * Quantas vezes forem necessárias, enquanto a mais à
         * esquerda estiver fora de campo.
         */
        while (leftmost.left <= delx)
        {
            /**
             * Exclua as pilastras ofensivas.
             */
            shiftQuadCol();

            /**
             * Adicione um novo aqui.
             */
            addQuadCol(rightmost.right);

            /**
             * Se houver um retorno de chamada para isso, faça
             * um novo procedimento.
             */
            if (onUpdate)
            {
                onUpdate();
            }
        }
    }

    /**
     * Adicione uma nova pilastra de quadrante à direita de
     * uma localização x.
     */
    function addQuadCol(xloc)
    {
        var column = [];

        /**
         * Crie um número num_rows de quadrantes...
         */
        for (var i = 0; i < num_rows; ++i)
        {
            /**
             * (mais à direita tem que ser rastreado de qualquer forma).
             */
            rightmost = new Quadrant(i, xloc);

            /**
             * Colocando cada um na pilastra e na lista principal.
             */
            column.push(rightmost);
            quadrants.push(rightmost);
        }

        /**
         * Adicione a pilastra à lista principal de pilastras.
         */
        columns.push(column);
    }

    /**
     * Remover a pilastra de quadrantes mais à esquerda.
     */
    function shiftQuadCol()
    {
        /**
         * Remover a primeira pilastra é fácil.
         */
        columns.shift();

        /**
         * Removendo os primeiros quadrantes num_rows, um pouco menos.
         */
        for (var i = 0; i < num_rows; ++i)
        {
            quadrants.shift();
        }

        /**
         * Redefina o quadrante mais à esquerda e o out_difference.
         */
        leftmost = quadrants[0];
        out_difference = quad_width;
    }

    /**
     * Alteração de coisas.
     */

    /**
     * Público: determineAllQuadrants.
     * Define as coisas (em qualquer número de matrizes) contra
     * todos os quadrantes.
     */
    this.determineAllQuadrants = function()
    {
        var i;
        var len;

        /**
         * Defina cada quadrante para não ter nada nele.
         */
        for (i = 0; i < num_quads; ++i)
        {
            quadrants[i].numthings = 0;
        }

        /**
         * Para cada argumento, defina cada uma de suas Coisas.
         */
        for (i = 0, len = arguments.length; i < len; ++i)
        {
            determineThingArrayQuadrants(arguments[i]);
        }
    }

    /**
     * Chama determineThingQuadrants em cada membro de um vetor.
     */
    function determineThingArrayQuadrants(things)
    {
        for (var i = 0, len = things.length; i < len; ++i)
        {
            determineThingQuadrants(things[i]);
        }
    }

    /**
     * Público: determineThingQuadrants.
     * Verifica e define os quadrantes corretos para uma Coisa.
     */
    var determineThingQuadrants = this.determineThingQuadrants = function(thing)
    {
        thing[thing_num_quads] = 0;

        /**
         * Verifique cada quadrante para colisão.
         * (fazer: determinar matematicamente isso).
         */
        for (var i = 0; i < num_quads; ++i)
        {
            if (thingInQuadrant(thing, quadrants[i]))
            {
                setThingInQuadrant(thing, quadrants[i], i);

                if (thing[thing_num_quads] > thing[thing_max_quads])
                {
                    return;
                }
            }
        }
    }

    /**
     * Deixe uma Coisa e um Quadrante saberem que estão relacionados.
     * Isso pressupõe que a coisa já tem um vetor [thing_quadrants].
     */
    function setThingInQuadrant(thing, quadrant, num_quad)
    {
        /**
         * Coloque o Quadrante na Coisa.
         */
        thing[thing_quadrants][thing[thing_num_quads]] = quadrant;
        ++thing[thing_num_quads];

        /**
         * Coloque a Coisa no Quadrante.
         */
        quadrant.things[quadrant.numthings] = thing;
        ++quadrant.numthings;
    }

    /**
     * Verifica se uma coisa está em um quadrante.
     */
    function thingInQuadrant(thing, quadrant)
    {
        return thing[thing_right] + tolerance >= quadrant.left &&
            thing[thing_left] - tolerance <= quadrant.right &&
            thing[thing_bottom] + tolerance >= quadrant.top &&
            thing[thing_top] - tolerance <= quadrant.bottom;
    }

    /**
     * Reiniciando.
     */
    function reset(settings)
    {
        quadrants = [];
        columns = [];

        /**
         * Isso permite variações no que é dado.
         */

        /**
         * || 4;
         */
        num_quads = settings.num_quads;

        /**
         * || 2;
         */
        num_rows = settings.num_rows;

        /**
         * || 2;
         */
        num_cols = settings.num_cols;

        /**
         * (se num_quads for dado).
         */
        if (num_quads)
        {
            if (num_rows)
            {
                num_cols = num_quads / num_rows;
            }

            if (num_cols)
            {
                num_rows = num_quads / num_cols;
            }
        } else
        {
            /**
             * (se num_quads não for dado).
             */

            if (!num_rows)
            {
                num_rows = 2;
            }

            if (!num_cols)
            {
                num_cols = 2;
            }

            num_quads = num_rows * num_cols;
        }

        screen_width = settings.screen_width || 640;
        screen_height = settings.screen_height || 480;

        quad_width = screen_width / (num_cols - 3);
        quad_height = screen_height / (num_rows - 2);

        tolerance = settings.tolerance || 0;
        delx = settings.delx || quad_width * -2;
        out_difference = quad_width;

        thing_left = settings.thing_left || "left";
        thing_right = settings.thing_right || "right";
        thing_top = settings.thing_top || "top";
        thing_bottom = settings.thing_bottom || "bottom";
        thing_num_quads = settings.thing_num_quads || "numquads";
        thing_max_quads = settings.thing_max_quads || "maxquads";
        thing_quadrants = settings.thing_quadrants || "quadrants";

        onUpdate = settings.onUpdate;
        onCollide = settings.onCollide;

        resetQuadrants();
    }

    reset(settings || {});
}
