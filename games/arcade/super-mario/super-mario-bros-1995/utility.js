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
 * Utility.js.
 * Contém todas as funções auxiliares necessárias que não estão em toned.js.
 */

/**
 * Coisas gerais.
 */
 
/**
 * Recursivamente desce sub-objetos de obj.
 * Caminhos é ["path", "to", "target"], onde num é a distância ao
 * longo do caminho.
 */
function followPath(obj, path, num)
{
    if (path[num] != null && obj[path[num]] != null)
    {
        return followPath(obj[path[num]], path, ++num);
    }

    return obj;
}

/**
 * Caro - use apenas na compensação.
 */
function clearAllTimeouts()
{
    var id = setTimeout(function()
    {
    });

    while (id--)
    {
        clearTimeout(id);
    }
}

/**
 * Largura e altura são dadas como número de pixels (para dimensionar;
 * tamanho unitário).
 */
function getCanvas(width, height, stylemult)
{
    var canv = createElement("canvas", {
        width: width,
        height: height
    });

    /**
     * Se necessário, faça o estilo visual dessa coisa.
     */
    if (stylemult)
    {
        /**
         * stylemult é 1, mas pode ser outra coisa (normalmente unitize).
         */
        stylemult = stylemult || unitsize;

        proliferate(canv.style, {
            width: (width * stylemult) + "px",
            height: (height * stylemult) + "px"
        });
    }

    /**
     * Para velocidade.
     */
    canv.getContext("2d", { willReadFrequently: true }).webkitImageSmoothingEnabled = false

    return canv;
}

/**
 *
 */
function step(num)
{
    unpause();
    upkeep();
    pause();

    if (num > 0)
    {
        step(num - 1);
    }
}

/**
 *
 */
function fastforward(num)
{
    window.speed = max(0, parseInt(num || 0)) + 1;
}

/**
 *
 */
function toggleFastFWD(num)
{
    if (!window.fastforwarding)
    {
        fastforward(2);

        window.fastforwarding = true;
    } else
    {
        fastforward(0);

        window.fastforwarding = false;
    }
}

/**
 *
 */
function specifyTimer(timerin)
{
    /**
     * Use apenas se você não estiver preocupado em perder os benefícios de
     * requestAnimationFrame. Além disso, isso não deixa o desempenho muito
     * bom. Funciona melhor com janelas menores.
     */
    timer = timerin;

    requestAnimationFrame = function(func)
    {
        window.setTimeout(func, timer);
    };
}

/**
 *
 */
function changeUnitsize(num)
{
    if (!num)
    {
        return;
    }

    resetUnitsize(num);

    function setter(arr)
    {
        for (i in arr)
        {
            updateSize(arr[i]);
            updatePosition(arr[i]);
        }
    }

    setter(solids);
    setter(characters);
}

/**
 * num = 1 normalmente.
 * 1 = floor(0->2) = 50% de chance.
 * 2 = floor(0->3) = 67% de chance.
 * 3 = floor(0->4) = 75% de chance.
 */
function randTrue(num)
{
    return floor(getSeed() * ((num || 1) + 1));

    /**
     * return floor(random() * ((num || 1) + 1));
     */
}

/**
 *
 */
function randSign(num)
{
    return randTrue(num) * 2 - 1;
}

/**
 *
 */
function randBoolJS(num)
{
    return floor(random() * 2);
}

/**
 * Funções auxiliares básicas de posicionamento de objetos.
 */
function updatePosition(me)
{
    /**
     * if (!me.nomove)
     * {
     *     shiftHoriz(me, me.xvel * realtime);
     * }
     *
     * if (!me.nofall)
     * {
     *     shiftVert(me, me.yvel * realtime);
     * }
     */

    if (!me.nomove)
    {
        shiftHoriz(me, me.xvel);
    }

    if (!me.nofall)
    {
        shiftVert(me, me.yvel);
    }
}

/**
 *
 */
function updateSize(me)
{
    me.unitwidth = me.width * unitsize;
    me.unitheight = me.height * unitsize;
    me.spritewidthpixels = me.spritewidth * unitsize;
    me.spriteheightpixels = me.spriteheight * unitsize;

    var canvas;

    if (canvas = me.canvas)
    {
        canvas.width = me.spritewidthpixels;
        canvas.height = me.spriteheightpixels;

        /**
         * me.context = canvas.getContext("2d", { willReadFrequently: true });
         */

        refillThingCanvas(me);
    }
}

/**
 *
 */
function reduceHeight(me, dy, see)
{
    me.top += dy;
    me.height -= dy / unitsize;

    if (see)
    {
        updateSize(me);
    }
}

/**
 *
 */
function shiftBoth(me, dx, dy)
{
    if (!me.noshiftx)
    {
        shiftHoriz(me, dx);
    }

    if (!me.noshifty)
    {
        shiftVert(me, dy);
    }
}

/**
 *
 */
function shiftHoriz(me, dx)
{
    me.left += dx;
    me.right += dx;
}

/**
 *
 */
function shiftVert(me, dy)
{
    me.top += dy;
    me.bottom += dy;
}

/**
 *
 */
function setLeft(me, left)
{
    me.left = left;
    me.right = me.left + me.width * unitsize;
}

/**
 *
 */
function setRight(me, right)
{
    me.right = right;
    me.left = me.right - me.width * unitsize;
}

/**
 *
 */
function setTop(me, top)
{
    me.top = top;
    me.bottom = me.top + me.height * unitsize;
}

/**
 *
 */
function setBottom(me, bottom)
{
    me.bottom = bottom;
    me.top = me.bottom - me.height * unitsize;
}

/**
 *
 */
function setWidth(me, width, spriter, updater)
{
    me.width = width;
    me.unitwidth = width * unitsize;

    if (spriter)
    {
        me.spritewidth = width;
        me.spritewidthpixels = width * unitsize;
    }

    if (updater)
    {
        updateSize(me);
        setThingSprite(me);
    }
}

/**
 *
 */
function setHeight(me, height, spriter, updater)
{
    me.height = height;
    me.unitheight = height * unitsize;

    if (spriter)
    {
        me.spriteheight = height;
        me.spriteheightpixels = height * unitsize;
    }

    if (updater)
    {
        updateSize(me);
        setThingSprite(me);
    }
}

/**
 *
 */
function setSize(me, width, height, spriter, updater)
{
    if (width)
    {
        setWidth(me, width, spriter);
    }

    if (height)
    {
        setHeight(me, height, spriter);
    }

    if (updater)
    {
        updateSize(me);
        setThingSprite(me);
    }
}

/**
 *
 */
function setMidX(me, left, see)
{
    setLeft(me, left + me.width * unitsized2, see);
}

/**
 *
 */
function getMidX(me)
{
    return me.left + me.width * unitsized2;
}

/**
 *
 */
function setMidY(me, top, see)
{
    setTop(me, top + me.height * unitsized2, see);
}

/**
 *
 */
function setMidXObj(me, object, see)
{
    setLeft(me, (object.left + object.width * unitsized2) - (me.width * unitsized2), see);
}

/**
 *
 */
function slideToXLoc(me, xloc, maxspeed, see)
{
    maxspeed = maxspeed || Infinity;

    var midx = getMidX(me);

    if (midx < xloc)
    {
        /**
         * Eu estou na posição esquerda.
         */
        shiftHoriz(me, min(maxspeed, (xloc - midx)), see);
    } else
    {
        /**
         * Eu estou na posição direita.
         */
        shiftHoriz(me, max(-maxspeed, (xloc - midx)), see);
    }
}

/**
 *
 */
function updateLeft(me, dx)
{
    me.left += dx;
    me.right = me.left + me.width * unitsize;
}

/**
 *
 */
function updateRight(me, dx)
{
    me.right += dx;
    me.left = me.right - me.width * unitsize;
}

/**
 *
 */
function updateTop(me, dy)
{
    me.top += dy;
    me.bottom = me.top + me.height * unitsize;
}

/**
 *
 */
function updateBottom(me, dy)
{
    me.bottom += dy;
    me.top = me.bottom - me.height * unitsize;
}

/**
 * Aumenta a altura, mantendo o fundo igual.
 * dy vem como fatorado para o tamanho da unidade.
 * Exemplo:
 *     increaseHeightTop(me, unitsized4).
 */
function increaseHeightTop(me, dy, spriter)
{
    me.top -= dy;
    me.height += dy / unitsize;
    me.unitheight = me.height * unitsize;
}

/**
 * Colisões.
 */
function determineThingCollisions(me)
{
    if (me.nocollide)
    {
        return;
    } else if (!me.resting || me.resting.yvel == 0)
    {
        me.resting = false;
    }

    /**
     * Cur é cada quadrante em que este objeto está, e other é cada
     * outro objeto neles.
     */
    var cur;
    var others;
    var other;
    var contents;
    var i;
    var j;
    var leni;
    var lenj;

    /**
     * A menos que seja instruído a não fazê-lo, certifique-se de que isso
     * não se sobreponha. As sobreposições são, na verdade, adicionadas
     * algumas linhas abaixo, sob colisões para sólidos.
     */
    if (!me.skipoverlaps)
    {
        checkOverlap(me);
    }

    /**
     * Para cada quadrante a coisa está em:
     */
    for (i = 0, leni = me.numquads; i < leni; ++i)
    {
        cur = me.quadrants[i];
        others = cur.things;

        /**
         * Para cada outra coisa nesse quadrante:
         */
        for (j = 0, lenj = cur.numthings; j < lenj; ++j)
        {
            other = others[j];

            if (me == other)
            {
                /**
                 * A remoção evita colisões duplas.
                 */
                break;
            }

            if (!other.alive || other.scenery || other.nocollide)
            {
                /**
                 * Não removido em manutenção.
                 */
                continue;
            }

            /**
             * A verificação .hidden é necessária. Tente o início de 2-1
             * sem ele. visual_scenery também é necessário por causa de
             * Pirhanas (nada mais usa isso).
             */
            if (objectsTouch(me, other) && (me.player || (!other.hidden || !(other.visual_scenery && other.visual_scenery.hidden)) || solidOnCharacter(other, me)))
            {
                /**
                 * As colisões de personagens são simples.
                 */
                if (other.character)
                {
                    /**
                     * if (charactersTouch(me, other)).
                     */
                    objectsCollided(me, other);
                } else if(!me.nocollidesolid)
                {
                    /**
                     * Colisões para sólidos, um pouco menos (sobreposições).
                     */
                    objectsCollided(me, other);

                    if (!me.skipoverlaps && !other.skipoverlaps && characterOverlapsSolid(me, other))
                    {
                        me.overlaps.push(other);
                    }
                }
            }
        }
    }

    if (me.undermid)
    {
        me.undermid.bottomBump(me.undermid, me);
    } else if (me.under instanceof Thing)
    {
        me.under.bottomBump(me.under, me);
    }
}

/**
 * Dê uma etiqueta sólida para sobreposição.
 * Remover tag quando sobreposições = [].
 */
function checkOverlap(me)
{
    if (me.overlapdir)
    {
        if ((me.overlapdir < 0 && me.right <= me.ocheck.left + unitsizet2) || me.left >= me.ocheck.right - unitsizet2)
        {
            me.overlapdir = 0;
            me.overlaps = [];
        } else
        {
            shiftHoriz(me, me.overlapdir, true);
        }
    } else if(me.overlaps.length > 0)
    {
        /**
         * mid = me.omid é o ponto médio do que está sendo sobreposto.
         */
        var overlaps = me.overlaps;
        var right = {right: -Infinity};
        var left = {left: Infinity};
        var mid = 0;
        var over;
        var i;

        me.overlapfix = true;

        for (i in overlaps)
        {
            over = overlaps[i];
            mid += getMidX(over);

            if (over.right > right.right)
            {
                right = over;
            }

            if (over.left < left.left)
            {
                left = over;
            }
        }

        mid /= overlaps.length;

        if (getMidX(me) >= mid - unitsized16)
        {
            /**
             * À direita do meio: viaje até a direita.
             */
            me.overlapdir = unitsize;
            me.ocheck = right;
        } else
        {
            /**
             * À esquerda do meio: viaje até a esquerda.
             */
            me.overlapdir = -unitsize;
            me.ocheck = left;
        }
    }
}

/**
 *
 */
function characterOverlapsSolid(me, solid)
{
    return me.top <= solid.top && me.bottom > solid.bottom;
}

/**
 * Propositalmente só olha para toly; horizontal usa 1 tamanho
 * de unidade.
 */
function objectsTouch(one, two)
{
    if (one.right - unitsize > two.left && one.left + unitsize < two.right)
    {
        if (one.bottom >= two.top && one.top <= two.bottom)
        {
            return true;
        }
    }

    return false;
}

/**
 * Usado para verificar novamente objectsTouch.
 */
function charactersTouch(one, two)
{
    if (one.bottom <= two.top + unitsizet2 || one.top + unitsizet2 >= two.bottom)
    {
        return false;
    }

    return true;
}

/**
 * Sem tolerância! Apenas unitsize.
 */
function objectInQuadrant(one, quad)
{
    if (one.right + unitsize >= quad.left && one.left - unitsize <= quad.right)
    {
        if (one.bottom + unitsize >= quad.top && one.top - unitsize <= quad.bottom)
        {
            return true;
        }
    }

    return false;
}

/**
 *
 */
function objectsCollided(one, two)
{
    /**
     * Suponha que se houver um sólido, são dois. (sólidos não colidem
     * uns com os outros).
     */
    if (one.solid)
    {
        if (!two.solid)
        {
            return objectsCollided(two, one);
        }
    }

    /**
     * Os sólidos mais altos são especiais.
     */
    if (two.up && one != two.up)
    {
        return characterTouchesUp(one, two);
    }

    /**
     * Caso contrário, colisões regulares.
     */
    if (two.solid || one.player)
    {
        two.collide(one, two);
    } else
    {
        one.collide(two, one);
    }
}

/**
 * Vê se o ponto médio de um está à esquerda de dois.
 */
function objectToLeft(one, two)
{
    return (one.left + one.right) / 2 < (two.left + two.right) / 2;
}

/**
 * PARA FAZER: Renove-os.
 */
function objectOnTop(one, two)
{
    if (one.type == "solid" && two.yvel > 0)
    {
        return false;
    }

    if (one.yvel < two.yvel && two.type != "solid")
    {
        return false;
    }

    if (one.player && one.bottom < two.bottom && two.group == "enemy")
    {
        return true;
    }

    return (
        (
            one.left + unitsize < two.right &&
            one.right - unitsize > two.left
        ) &&
        (
            one.bottom - two.yvel <= two.top + two.toly ||
            one.bottom <= two.top + two.toly + abs(one.yvel - two.yvel)
        )
    );
}

/**
 * Como objectOnTop, mas usado mais especificamente para characterOnSolid
 * e characterOnResting.
 */
function objectOnSolid(one, two)
{
    return (
        (
            one.left + unitsize < two.right &&
            one.right - unitsize > two.left
        ) &&
        (
            one.bottom - one.yvel <= two.top + two.toly ||
            one.bottom <= two.top + two.toly + abs(one.yvel - two.yvel)
        )
    );
}

/**
 *
 */
function solidOnCharacter(solid, me)
{
    if (me.yvel >= 0)
    {
        return false;
    }

    me.midx = getMidX(me);

    return me.midx > solid.left && me.midx < solid.right &&
        (
            solid.bottom - solid.yvel <= me.top + me.toly - me.yvel
        );
}

/**
 * Isso faria com que os koopas inteligentes ficassem nas bordas de
 * maneira mais inteligente. Não é possível usar objectOnTop para isso,
 * caso contrário, a pessoa caminhará nas paredes.
 */
function characterOnSolid(me, solid)
{
    return (
        me.resting == solid ||
        (
            objectOnSolid(me, solid) &&
            me.yvel >= 0 &&
            me.left + me.xvel + unitsize != solid.right &&
            me.right - me.xvel - unitsize != solid.left
        )
    );

    /**
     * me.left - me.xvel + unitsize != solid.right && me.right + me.xvel - unitsize != solid.left));
     * me.left - me.xvel + unitsize != solid.right && me.right - me.xvel - unitsize != solid.left));
     */
}

/**
 *
 */
function characterOnResting(me, solid)
{
    /**
     * return objectOnSolid(me, solid) &&
     *     me.left - me.xvel + unitsize != solid.right &&
     *     me.right - me.xvel - unitsize != solid.left;
     */
    return objectOnSolid(me, solid) &&
        me.left + me.xvel + unitsize != solid.right &&
        me.right - me.xvel - unitsize != solid.left;
}

/**
 *
 */
function characterTouchedSolid(me, solid)
{
    if (solid.up == me)
    {
        return;
    }

    /**
     * O aluno em cima do sólido.
     */
    if (characterOnSolid(me, solid))
    {
        if (solid.hidden)
        {
            return;
        }

        me.resting = solid;

        /**
         * xxx.
         */
        if (me.player && map.underwater)
        {
            removeClass(me, "paddling");
        }
    } else if (solidOnCharacter(solid, me))
    {
        /**
         * O sólido em cima do aluno.
         */

        var mid = me.left + me.width * unitsize / 2;

        if (mid > solid.left && mid < solid.right)
        {
            me.undermid = solid;
        } else if (solid.hidden)
        {
            return;
        }

        if (!me.under)
        {
            me.under = [solid];
        } else
        {
            me.under.push(solid);
        }

        /**
         * Para fazer: torne isso não tão obviamente codificado.
         */
        if (me.player)
        {
            setTop(me, solid.bottom - me.toly + solid.yvel, true);
        }

        me.yvel = solid.yvel;

        if (me.player)
        {
            me.keys.jump = 0;
        }
    }

    if (solid.hidden)
    {
        return;
    }

    /**
     * Grafemas batendo na lateral.
     * .midx é dado por solidOnCharacter.
     */
    if (!characterNotBumping(me, solid) && !objectOnTop(me, solid) && !objectOnTop(solid, me) && !me.under && me != solid.up)
    {
        if (me.right <= solid.right)
        {
            /**
             * À esquerda do sólido.
             */
            me.xvel = min(me.xvel, 0);
            shiftHoriz(me, max(solid.left + unitsize - me.right, -unitsized2), true);
        } else if(me.left >= solid.left)
        {
            /**
             * À direita do sólido.
             */
            me.xvel = max(me.xvel, 0);
            shiftHoriz(me, min(solid.right - unitsize - me.left, unitsized2), true);
        }

        /**
         * Os não-jogadores são instruídos a virar.
         */
        if (!me.player)
        {
            me.moveleft = !me.moveleft;

            if (me.group == "item")
            {
                me.collide(solid, me);
            }
        } else if (solid.actionLeft)
        {
            /**
             * Pessoas usa solid.actionLeft (Exemplo. Pipe -> intoPipeHoriz).
             */

            solid.actionLeft(me, solid, solid.transport);
        }
    }
}

/**
 * Realmente apenas para koopas.
 */
function characterNotBumping(me, solid)
{
    if (me.top + me.toly + abs(me.yvel) > solid.bottom)
    {
        return true;
    }

    return false;
}

/**
 *
 */
function characterTouchesUp(me, solid)
{
    switch(me.group)
    {
        case "item": 
            me.moveleft = getMidX(me) <= getMidX(solid) + unitsized2;
            characterHops(me);
            break;

        case "coin":
            me.animate(me);
            break;

        default:
            me.death(me, 2);
            scoreEnemyBelow(me);
            break;
    }
}

/**
 *
 */
function characterHops(me)
{
    me.yvel = -1.4 * unitsize;
    me.resting = false;
}

/**
 *
 */
function characterIsAlive(me)
{
    return !(!me || me.dead || !me.alive);
}

/**
 * Pontuação nos inimigos.
 */
function scorePlayerShell(player, shell)
{
    /**
     * A pessoa estrela recebe 200.
     */
    if (player.star)
    {
        return score(shell, 200, true);
    }

    /**
     * Plugs anal no ar causam 8.000 pontos.
     */
    if (!shell.resting)
    {
        return score(shell, 8000, true);
    }

    /**
     * Peeking shells também são mais.
     */
    if (shell.peeking)
    {
        return score(shell, 1000, true);
    }

    /**
     * Os pontos regulares são apenas 100.
     */
    return score(shell, 100, true);
}

/**
 *
 */
function scoreEnemyStomp(enemy)
{
    var amount = 100;

    switch (enemy.type.split(" ")[0])
    {
        case "koopa":
            amount = enemy.fly ? 400 : 100;
            break;

        case "bulletbill":
            amount = 200;
            break;

        case "cheepcheep":
            amount = 200;
            break;

        case "hammerbro":
            amount = 1000;
            break;

        case "lakitu":
            amount = 800;
            break;

        default:
            amount = 100;
            break;
    }

    /**
     * scoreEnemyFin(enemy, amount);
     */
}

/**
 *
 */
function scoreEnemyFire(enemy)
{
    var amount = 200;

    switch (enemy.type.split(" ")[0])
    {
        case "goomba":
            amount = 100;
            break;

        case "hammerbro":
            amount = 1000;
            break;

        case "bowser":
            amount = 5000;
            break;

        default:
            amount = 200;
            break;
    }

    scoreEnemyFin(enemy, amount);
}

/**
 *
 */
function scoreEnemyStar(enemy)
{
    var amount = 200;

    switch (enemy.type.split(" ")[0])
    {
        case "goomba":
            amount = 100;
            break;

        case "hammerbro":
            amount = 1000;
            break;

        default:
            amount = 200;
            break;
    }

    scoreEnemyFin(enemy, amount);

    AudioPlayer.play("Kick");
}

/**
 *
 */
function scoreEnemyBelow(enemy)
{
    var amount = 100;

    switch (enemy.type.split(" ")[0])
    {
        case "hammerbro":
            amount = 1000;
            break;

        default:
            amount = 100;
            break;
    }

    scoreEnemyFin(enemy, amount);
}

/**
 *
 */
function scoreEnemyFin(enemy, amount)
{
    score(enemy, amount, true);
}

/**
 * Ações gerais.
 */

/**
 *
 */
function moveSimple(me)
{
    if (me.direction != me.moveleft)
    {
        if (me.moveleft)
        {
            me.xvel = -me.speed;

            if (!me.noflip)
            {
                unflipHoriz(me);
            }
        } else
        {
            if (!me.noflip)
            {
                flipHoriz(me);
            }

            me.xvel = me.speed; 
        }

        me.direction = me.moveleft;
    }
}

/**
 *
 */
function moveSmart(me)
{
    moveSimple(me);

    if (me.yvel == 0 && (!me.resting || (offResting(me))))
    {
        if (me.moveleft)
        {
            shiftHoriz(me, unitsize, true);
        } else
        {
            shiftHoriz(me, -unitsize, true);
        }

        me.moveleft = !me.moveleft;
    }
}

/**
 *
 */
function offResting(me)
{
    if (me.moveleft)
    {
        return me.right - unitsize < me.resting.left;
    } else
    {
        return me.left + unitsize > me.resting.right;
    }
}

/**
 *
 */
function moveJumping(me)
{
    moveSimple(me);

    if (me.resting)
    {
        me.yvel = -abs(me.jumpheight);
        me.resting = false;
    }
}

/**
 * Flutuante: a versão vertical.
 * Exemplo de uso no Mundo 1-3.
 * [moveFloating, 30, 72] desliza para cima e para baixo entre 30 e 72.
 */
function moveFloating(me)
{
    setPlatformEndpoints(me);
    me.begin = map.floor * unitsize - me.begin;
    me.end = map.floor * unitsize - me.end;
    (me.movement = moveFloatingReal)(me);
}

/**
 *
 */
function moveFloatingReal(me)
{
    if (me.top < me.end)
    {
        me.yvel = min(me.yvel + unitsized32, me.maxvel);
    } else if (me.bottom > me.begin)
    {
        me.yvel = max(me.yvel - unitsized32, -me.maxvel);
    }

    movePlatformNorm(me);
}

/**
 * Deslizar: a versão horizontal.
 * Exemplo de uso no Mundo 3-3.
 * [moveSliding, 228, 260] desliza para frente e para trás entre 228 e 260.
 */
function moveSliding(me)
{
    setPlatformEndpoints(me);
    (me.movement = moveSlidingReal)(me);
}

/**
 *
 */
function moveSlidingReal(me)
{
    if (gamescreen.left + me.left < me.begin)
    {
        me.xvel = min(me.xvel + unitsized32, me.maxvel);
    } else if (gamescreen.left + me.right > me.end)
    {
        me.xvel = max(me.xvel - unitsized32, -me.maxvel);
    }

    movePlatformNorm(me);
}

/**
 * Certifique-se de begin < end trocando, se não for assim.
 */
function setPlatformEndpoints(me)
{
    if (me.begin > me.end)
    {
        var temp = me.begin;
            me.begin = me.end;
            me.end = temp;
    }
}

/**
 *
 */
function collideTransport(me, solid)
{
    characterTouchedSolid(me, solid);

    if (solid != me.resting)
    {
        return;
    }

    solid.movement = movePlatformNorm;
    solid.collide = characterTouchedSolid;
    solid.xvel = unitsized2;
}

/**
 * Para fazer: make me.collide e stage w/functions.
 * Para fazer: divida isso em .partner e outros enfeites.
 */
function moveFalling(me)
{
    if (me != player.resting)
    {
        return me.yvel = 0;
    }

    /**
     * Já que a pessoa já está em cima dele.
     */
    shiftVert(me, me.yvel += unitsized8);
    setBottom(player, me.top);

    /**
     * Após um limite de velocidade.
     */
    if (me.yvel >= unitsize * 2.8)
    {
        me.freefall = true;
        me.movement = moveFreeFalling;
    }
}

/**
 *
 */
function moveFallingScale(me)
{
    /**
     * Se a pessoa estiver descansando nele.
     */
    if (player.resting == me)
    {
        shiftScaleStringVert(me, me.string, me.yvel += unitsized16);
        shiftScaleStringVert(me.partner, me.partner.string, -me.yvel);

        me.tension += me.yvel;
        me.partner.tension -= me.yvel;
    } else if (me.yvel > 0)
    {
        /**
         * Caso contrário, se eu ou a pessoa tiver um yvel positivo,
         * diminua a velocidade.
         */

        shiftScaleStringVert(me, me.string, me.yvel -= unitsized32);
        shiftScaleStringVert(me.partner, me.partner.string, -me.yvel);

        me.tension -= me.yvel;
        me.partner.tension += me.yvel;
    }

    /**
     * Se a plataforma obter.
     */
    if (me.partner.tension <= 0)
    {
        me.collide = me.partner.collide = characterTouchedSolid;

        /**
         * Continue caindo em um ritmo crescente.
         */
        me.movement = me.partner.movement = moveFreeFalling;
    }
}

/**
 *
 */
function moveFreeFalling(me)
{
    shiftVert(me, me.yvel += unitsized16);

    if (me.yvel > unitsizet2)
    {
        me.movement = function(me)
        {
            shiftVert(me, me.yvel);
        }
    }
}

/**
 *
 */
function shiftScaleStringVert(me, string, yvel)
{
    shiftVert(me, yvel);
    string.bottom = me.top;
    string.height = (string.bottom - string.top) / unitsize;
    updateSize(string);
}

/**
 *
 */
function setClass(me, strin)
{
    me.className = strin; setThingSprite(me);
}

/**
 *
 */
function setClassInitial(me, strin)
{
    me.className = strin;
}

/**
 *
 */
function addClass(me, strin)
{
    me.className += " " + strin;

    setThingSprite(me);
}

/**
 *
 */
function removeClass(me, strout)
{
    me.className = me.className.replace(new RegExp(" " + strout,"gm"),'');

    setThingSprite(me);
}

/**
 *
 */
function switchClass(me, strout, strin)
{
    removeClass(me, strout);
    addClass(me, strin);
}

/**
 *
 */
function removeClasses(me)
{
    var strings;
    var arr;
    var i;
    var j;

    for (i = 1; i < arguments.length; ++i)
    {
        arr = arguments[i];

        if (!(arr instanceof Array))
        {
            arr = arr.split(" ");
        }

        for (j = arr.length - 1; j >= 0; --j)
        {
            removeClass(me, arr[j]);
        }
    }
}

/**
 *
 */
function addClasses(me, strings)
{
    var arr = strings instanceof Array ? strings : strings.split(" ");

    for (var i = arr.length - 1; i >= 0; --i)
    {
        addClass(me, arr[i]);
    }
}

/**
 * Usado no Editor.
 */

/**
 *
 */
function addElementClass(element, strin)
{
    element.className += " " + strin;
}

/**
 *
 */
function removeElementClass(element, strin)
{
    element.className = element.className.replace(new RegExp(" " + strin,"gm"), '');
}

/**
 *
 */
function flipHoriz(me)
{
    addClass(me, "flipped");
}

/**
 *
 */
function flipVert(me)
{
    addClass(me, "flip-vert");
}

/**
 *
 */
function unflipHoriz(me)
{
    removeClass(me, "flipped");
}

/**
 *
 */
function unflipVert(me)
{
    removeClass(me, "flip-vert");
}

/**
 * Remoção.
 */

/**
 * Gerenciamento de cubos Javascript.
 */
function deleteThing(me, array, arrayloc)
{
    array.splice(arrayloc, 1);

    if (me.ondelete)
    {
        me.ondelete();
    }
}

/**
 *
 */
function switchContainers(me, outer, inner)
{
    outer.splice(outer.indexOf(me), 1);
    inner.push(me);
}

/**
 *
 */
function containerForefront(me, container)
{
    container.splice(container.indexOf(me), 1);
    container.unshift(me);
}

/**
 *
 */
function killNormal(me)
{
    if (!me)
    {
        return;
    }

    me.hidden = me.dead = true;
    me.alive = me.resting = me.movement = false;

    TimeHandler.clearAllCycles(me);
}

/**
 *
 */
function killFlip(me, extra)
{
    flipVert(me);
    me.bottomBump = function()
    {
    };

    me.nocollide = me.dead = true;
    me.resting = me.movement = me.speed = me.xvel = me.nofall = false;
    me.yvel = -unitsize;

    TimeHandler.addEvent(function(me)
    {
        killNormal(me);
    }, 70 + (extra || 0));
}

/**
 * Para fazer: elimine isso em addEvent.
 */
function generalMovement(me, dx, dy, cleartime)
{
    var move = setInterval(function()
    {
        shiftVert(me, dy);
        shiftHoriz(me, dx);
    }, timer);

    setTimeout(function()
    {
        clearInterval(move);
    }, cleartime);
}

/**
 *
 */
function blockBumpMovement(me)
{
    var dir = -3;
    var dd = .5;

    /**
     * Pendência: addEventInterval ?
     */
    var move = setInterval(function()
    {
        shiftVert(me, dir);
        dir += dd;

        if (dir == 3.5)
        {
            clearInterval(move);
            me.up = false;
        }

        /**
         * Para moedas.
         */
        determineThingCollisions(me);
    }, timer);
}

/**
 *
 */
function emergeUp(me, solid)
{
    AudioPlayer.play("Powerup Appears");

    flipHoriz(me);
    me.nomove = me.nocollide
        = me.alive
        = me.nofall
        = me.emerging
        = true;

    switchContainers(me, characters, scenery);

    /**
     * Comece a subir.
     */
    var move = setInterval(function()
    {
        shiftVert(me, -unitsized8);

        /**
         * Pare quando o fundo estiver grande.
         */
        if (me.bottom <= solid.top)
        {
            clearInterval(move);
            switchContainers(me, scenery, characters);

            me.nocollide = me.nomove
                = me.moveleft
                = me.nofall
                = me.emerging
                = false;

            /**
             * Se tiver uma função para chamar depois de estar completamente
             * fora (vines), faça-o.
             */
            if (me.emergeOut)
            {
                me.emergeOut(me, solid);
            }

            /**
             * Se houver movimento, não o faça de primeira.
             */
            if (me.movement)
            {
                me.movementsave = me.movement;
                me.movement = moveSimple;

                /**
                 * Espere até que esteja fora do sólido.
                 */
                me.moving = TimeHandler.addEventInterval(function(me, solid)
                {
                    if (me.resting != solid)
                    {
                        TimeHandler.addEvent(function(me)
                        {
                            me.movement = me.movementsave;
                        }, 1, me);

                        return true;
                    }
                }, 1, Infinity, me, solid);
            }
        }
    }, timer);
}

/**
 *
 */
function flicker(me, cleartime, interval)
{
    var cleartime = round(cleartime) || 49;
    var interval = round(interval) || 3;

    me.flickering = true;

    TimeHandler.addEventInterval(function(me)
    {
        me.hidden = !me.hidden;
    }, interval, cleartime, me);

    TimeHandler.addEvent(function(me)
    {
        me.flickering = me.hidden = false;
    }, cleartime * interval + 1, me);
}

/**
 * Procedimento de todos os grafemas exceto a pessoa.
 * Usado em endCastleOutside/Inside.
 * Também faz o procedimento de todos os sólidos em movimento.
 */
function killOtherCharacters()
{
    var thing;
    var i;

    if (window.characters)
    {
        for (i = characters.length - 1; i >= 0; --i)
        {
            thing = characters[i];

            if (!thing.nokillend)
            {
                deleteThing(thing, characters, i);
            } else if (thing.killonend)
            {
                thing.killonend(thing);
            }
        }
    }

    if (window.solids)
    {
        for (i = solids.length - 1; i >= 0; --i)
        {
            if (solids[i].killonend)
            {
                deleteThing(solids[i], solids, i);
            }
        }
    }
}

/**
 *
 */
function lookTowardPlayer(me, big)
{
    /**
     * A pessoa está à esquerda.
     */
    if (player.right <= me.left)
    {
        if (!me.lookleft || big)
        {
            me.lookleft = true;
            me.moveleft = false;

            unflipHoriz(me);
        }
    } else if (player.left >= me.right)
    {
        /**
         * A pessoa está à direita.
         */

        if (me.lookleft || big)
        {
            me.lookleft = false;
            me.moveleft = true;

            flipHoriz(me);
        }
    }
}

/**
 *
 */
function lookTowardThing(me, thing)
{
    /**
     * É à esquerda.
     */
    if (thing.right <= me.left)
    {
        me.lookleft = true;
        me.moveleft = false;

        unflipHoriz(me);
    } else if(thing.left >= me.right)
    {
        /**
         * É para a direita.
         */

        me.lookleft = false;
        me.moveleft = true;

        flipHoriz(me);
    }
}
