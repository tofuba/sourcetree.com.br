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
 * Generator.js.
 *
 * Contém funções que geram mapas processualmente.
 * Para fazer: torne isso totalmente baseado em estado e contido.
 */

/**
 * jsperf.com/josh-random-number-generators.
 *
 * São apenas 7 linhas, quem se importa se é ~393 x mais lento que Math.random()? lulz.
 */
function resetSeed()
{
    /**
     * 1777771 é um numero é primo.
     */
    window.seeder = 1777771 / (window.seed = (round(random() * 10000000)));
    window.seedlast = .007;

    window.getSeed = function()
    {
        return seedlast = "0." + String(seeder / seedlast).substring(4).replace('.', '');
    }
}

/**
 * Geradores de seção.
 *
 * As coisas devem ser adicionadas em (aproximadamente) ordem classificada.
 * Se não estiverem, então as coisas devem ser resolvidas...
 * o que abre a possibilidade de algo ser adicionado duas vezes. Não é bom.
 */
function pushRandomSectionOverworld(xloc)
{
    /**
     * Preparações iniciais.
     */
    var bwidth = max(randTrue(117), 1), floorlev = 0;

    ++map.num_random_sections;
    pushPreFuncCollider(xloc, zoneDisableCheeps);
    map.had_floor = false;

    /**
     * Por parecer legal, seções menores podem ter sólidos diferentes
     * como pisos.
     */
    if (map.needs_floor || bwidth >= 14 || bwidth < 3 || randTrue())
    {
        pushPreFloor(xloc, 0, bwidth);
        map.had_floor = true;
    } else
    {
        /**
         * randTrue(2) * 8; desativado por causa do cano e da estranheza.
         */
        floorlev = 0;

        pushPreThing(Stone, xloc, floorlev, bwidth);
    }

    window.randcount_powerup = 3;

    /**
     * Se o trecho tiver 1 ou 2 quarteirões de largura e tiver piso,
     * pode ter pequenos cenários.
     */
    if (bwidth <= 3 && map.had_floor)
    {
        if (randTrue())
        {
            switch(randTrue(3))
            {
                case 0:
                    if (bwidth > 3)
                    {
                        pushPreScenery("HillSmall", xloc, 0);
                        break;
                    }

                case 1:
                    if (bwidth > 2)
                    {
                        pushPreScenery("Bush1", xloc + max(0, randTrue(bwidth - 2)) * 8, floorlev);
                        break;
                    }

                case 2:
                    pushPreScenery("PlantLarge", xloc + max(0, randTrue(bwidth - 2)) * 8, floorlev);
                    break;

                case 3:
                    pushPreScenery("PlantSmall", xloc + max(0, randTrue(bwidth - 2)) * 8, floorlev);
                    break;
            }
        }
    } else
    {
        /**
         * Caso contrário, crie a seção por blocos.
         */

        /**
         * Não coloque muita coisa na borda.
         */
        var maxwidth = bwidth - 2;
        var hadcloud = 0;
        var numenemychunks = 0;

        /**
         * Cada pedaço tem 3 blocos de largura.
         */
        for (var i = randTrue(2); i < maxwidth; i += 3)
        {
            if (!randTrue(7))
            {
                continue;
            }

            /**
             * Cada pedaço tem um obstáculo...
             */
            if (!randTrue(2))
            {
                pushRandomObstacle(xloc, i);
            } else
            {
                /**
                 * ...ou (talvez) um inimigo, que pode ter tijolos/blocos acima,
                 * junto com o cenário.
                 */

                map.hadObstacle = false;

                if (numenemychunks % 3 == 0 || randTrue())
                {
                    pushRandomChunkEnemy(xloc, i);
                    ++numenemychunks;
                }

                if (map.had_floor)
                {
                    pushRandomGroundScenery(xloc + i * 8, i, bwidth);
                }
            }

            if (!hadcloud && randTrue())
            {
                pushRandomSkyScenery(xloc + i * 8);
                hadcloud = true;
            } else
            {
                hadcloud = false;
            }
        }
    }

    prepareNextGeneratorStandard(xloc, bwidth, pushRandomSectionOverworld);
}

/**
 *
 */
function startRandomSectionBridge(xloc)
{
    pushPreFuncCollider(xloc - 24, zoneDisableCheeps);
    pushPreFuncCollider(xloc, zoneEnableCheeps);

    var bwidth = 5 + randTrue(4);
    var bheight = 24;
    var mwidth = bwidth - 4;

    map.needs_bridge = true;

    /**
     * fazer: lembrar qual é qual...
     */
    map.treelev = map.treeheight = 0;

    pushPreTree(xloc, 0, bwidth + 1);
    pushPreThing(Stone, xloc + 16, 8, 1, 1);
    pushPreThing(Stone, xloc + 24, 16, 1, 2);
    pushPreThing(Stone, xloc + 32, bheight, mwidth, bheight / 8);
    pushRandomSectionBridge(xloc + (bwidth - 1) * 8, bheight, true);

    spawnMap();
    map.had_floor = false;
}

/**
 *
 */
function pushRandomSectionBridge(xloc, bheight, nofirstcol)
{
    var bwidth;
    var next_no_unusuals = false;

    bheight = bheight || 24 + randTrue() * 16 - 8;

    /**
     * Pontes: longas, curtas, etc.
     */
    if (randTrue() || map.needs_bridge)
    {
        switch(randTrue(3))
        {
            /**
             * Ponte incomum.
             */
            case 0:
                /**
                 * switch(randTrue())
                 * {
                 */
                switch(randTrue())
                {
                    /**
                     * 1-4 plataformas mais curtas.
                     */
                    case 0:
                        var pnum = randTrue(3) + 1;
                        var bwidth = pnum * 4;

                        next_no_unusuals = true;

                        for (var i = 1; i <= pnum * 2; i += 2)
                        {
                            pushPreBridge(xloc + (i) * 16, bheight, 3);
                        }

                        break;

                    /**
                     * Uma largura de ponte menor.
                     */
                    case 1:
                        bwidth = randTrue(7) + 7;

                        var pDtB = DtB(bheight, 8);

                        if (!nofirstcol)
                        {
                            pushPreThing(Stone, xloc, bheight, 1, pDtB);
                        }

                        pushPreBridge(xloc + 8, bheight, bwidth - 1);
                        pushPreThing(Stone, xloc + bwidth * 8, bheight, 1, pDtB);
                        break;
                }

                break;

            /**
             * Ponte típica: uma série de longas pontes com pilastras de pedra entre elas.
             */
            default:
                map.needs_bridge = map.treeheight = 0;

                var sep = 17;
                var sepd2 = 8;
                var pDtB = DtB(bheight, 8);

                bwidth = (randTrue(3) + 3) * sep;

                for (var i=0; i < bwidth; i += sep)
                {
                    if (i || !nofirstcol)
                    {
                        pushPreThing(Stone, xloc + i * 8, bheight, 1, pDtB);
                    }

                    pushPreBridge(xloc + (i + 1) * 8, bheight, sep - 1);

                    /**
                     * Adicione uma criatura.
                     */
                    if (randTrue())
                    {
                        pushRandomSmallEnemy(xloc + (i + sepd2) * 8, bheight);
                    }

                    /**
                     * Adicione algumas moedas...
                     */
                    if (randTrue(2))
                    {
                        var big = randTrue();
                        var coinrowsize = 3 + randTrue(2);

                        pushRandomCoinRow(xloc + (i + sepd2) * 8, bheight + 32, coinrowsize);
                        pushRandomCoinRow(xloc + (i + sepd2) * 8, bheight + 40, getNextCoinRowSize(coinrowsize));
                    } else
                    {
                        /**
                         * ...ou talvez adicionar um bloco de cogumelo.
                         */

                        pushPreThing(Block, xloc + (i + sepd2) * 8, bheight + jumplev1, Mushroom);
                    }
                }

                pushPreThing(Stone, xloc + (bwidth) * 8, bheight, 1, pDtB);
                break;
        }
    } else
    {
        /**
         * Árvore.
         */

        bwidth = 10;
        pushPreTree(xloc + 16, randTrue() * 8, bwidth);
    }

    prepareNextGeneratorStandard(xloc, bwidth + 2, randTrue() ? pushRandomSectionBridge : pushRandomSectionOverworld, false, next_no_unusuals);
}

/**
 *
 */
function pushRandomSectionPreCastle(xloc, num)
{
    var bwidth = randTrue(35) + 35;
    var maxwidth = bwidth - 3;
    var havewall = false;
    var chunk;
    var i;

    num = num || 0;
    pushPreFloor(xloc, 0, bwidth);
    hadcloud = false;

    /**
     * Os pedaços podem ser:
     *
     * Largura pequena (3).
     * Canhão, Pedra, Tubulação.
     * Largura média (7).
     * Koopa, HammerBro, Bricks com HammerBro.
     * Nada (apenas cenário).
     */
    for (i = randTrue(3); i < maxwidth; i += chunk || 3)
    {
        switch(randTrue(3))
        {
            /**
             * Largura pequena.
             */
            case 0:
                chunk = 3;

                switch(randTrue(2))
                {
                    /**
                     * Canhão.
                     */
                    case 0:
                        var height = randTrue(2) + 1;
                        pushPreThing(Cannon, xloc + (i + randTrue(2)) * 8, height * 8, height);
                        break;

                    /**
                     * Pedra.
                     */
                    case 1:
                        var height;

                        for (var j = 0; j < chunk; ++j)
                        {
                            if (randTrue())
                            {
                                continue;
                            }

                            height = randTrue(3) + 1;
                            pushPreThing(Stone, xloc + (i + j) * 8, height * 8, 1, height);
                        }

                        break;

                    /**
                     * Cano.
                     */
                    case 2:
                        pushPrePipe(xloc + (i + randTrue()) * 8, 0, (2 + randTrue(2)) * 8, true);
                        break;
                }

                break;

            /**
             * Largura média.
             */
            case 1:
                chunk = 7;
                havewall = true;

                switch(randTrue(2))
                {
                    /**
                     * Koopa.
                     */
                    case 0:
                        pushPreThing(Koopa, xloc + (i + randTrue(7)) * 8, 12 + randTrue(3) * 8, randTrue(), true);
                        break;

                    /**
                     * HammerBro.
                     */
                    case 1:
                        if (randTrue())
                        {
                            pushPreThing(HammerBro, xloc + (i + randTrue(7)) * 8, 12 + randTrue(3) * 2);
                        }

                        break;

                    /**
                     * Tijolos w/HammerBro.
                     */
                    case 2:
                        chunk = 10;
                        havewall = false;

                        for (var j = 1; j < 8; ++j)
                        {
                            for (var k = jumplev1; k <= jumplev2; k += 32)
                            {
                                /**
                                 * Maior chance de conseguir um item (essa parte é muito difícil).
                                 */
                                pushPreThing(Brick, xloc + (i + j) * 8, k, getRandomBrickItem(false, randTrue()));
                            }
                        }

                        var height1 = randTrue() ? jumplev1 : jumplev2;
                            height2 = (height == jumplev1) ? jumplev2 : jumplev1;

                        if (randTrue(2))
                        {
                            pushPreThing(HammerBro, xloc + (i + randTrue(3)) * 8, height1 + 12);
                        }

                        if (randTrue(2))
                        {
                            pushPreThing(HammerBro, xloc + (i + 4 + randTrue(3)) * 8, height2 + 12);
                        }

                        break;
                }

                break;
        }

        if (havewall && chunk >= 7)
        {
            pushPreScenery("CastleWall", xloc + (i + randTrue()) * 8, 0, chunk - randTrue(2));

            if (randTrue())
            {
                pushPreThing(Brick, xloc + (i + randTrue(chunk)) * 8, jumplev1, randTrue() ? Mushroom : getRandomBrickItem(false, randTrue()));
            }
        }

        /**
         * E o cenário.
         */
        for (var k = 0; k < chunk; k += 3)
        {
            if (randTrue(2))
            {
                pushRandomGroundScenery(xloc + (i + k) * 8, 0);
            }

            if (!hadcloud && randTrue())
            {
                pushRandomSkyScenery(xloc + (i + k) * 8);
                hadcloud = true;
            } else
            {
                hadcloud = false;
            }
        }
    }

    /**
     * Se o último pedaço acabar.
     */
    pushPreFloor(xloc + bwidth * 8, 0, i + 3 - bwidth);

    var next = 4 + randTrue(3);

    if (num >= 3)
    {
        endCastleOutsideRandom(xloc + (bwidth + next + 1) * 8, true);
    } else
    {
        pushRandomSectionPreCastle(xloc + (bwidth + next) * 8, num + 1);
    }

    spawnMap();
}

/**
 *
 */
function endCastleOutsideRandom(xloc)
{
    var leadwidth = 9;
    var nextwidth;
    var i;

    /**
     * A liderança pode ser:
     */
    switch(randTrue())
    {
        /**
         * Sem piso, com todas as pilastras flutuantes.
         */
        case 0:
            for (i = 1 + randTrue(); i < leadwidth; i += 2)
            {
                pushPreThing(Stone, xloc + i * 8, (i - randTrue()) * 8, 1, 1 + randTrue());
            }

            pushPreThing(Stone, xloc + leadwidth * 8, (leadwidth - 1) * 8, 2);
            nextwidth = 12;
            break;

        /**
         * Andar, com algumas pilastras.
         */
        case 1:
            pushPreFloor(xloc, 0, leadwidth + 2);

            for (i = 1, hadlast = false; i < leadwidth; ++i)
            {
                /**
                 * Ou coloque uma coluna...
                 */
                if (!hadlast || randTrue(2) || i == leadwidth - 1)
                {
                    pushPreThing(Stone, xloc + i * 8, i * 8, 1, i);
                    hadlast = true;
                } else
                {
                    /**
                     * ...ou um pipe.
                     */

                    hadlast = false;
                    pushPrePipe(xloc + i * 8, 0, max(i - randTrue(2), 2) * 8, true);
                    ++i;
                }
            }

            pushPreThing(Stone, xloc + leadwidth * 8, 72, 2, 9);
            nextwidth = 7;
            break;
    }

    pushPreFloor(xloc + (leadwidth + 2) * 8, 0, round(gamescreen.width / 8));
    endCastleOutside(xloc + (leadwidth + nextwidth) * 8 + 4, 0, true, round(gamescreen.width / 8));
}

/**
 *
 */
function startRandomSectionCastle(xloc)
{
    xloc += 32;

    var cwidth = randTrue(7) + 3;
    var moat = randTrue(4) + 3;
    var floorlev = randTrue(4);

    /**
     * Partida inicial.
     */
    pushPreFloor(xloc, 24, cwidth);
    pushPreThing(Stone, xloc, 88, cwidth, 3);

    fillPreWater(xloc + cwidth * 8, 0, moat * 2);
    pushPreThing(Podoboo, xloc + cwidth * 8 + max(0, randTrue(moat - 3) * 8), -32);
    pushRandomSectionCastle(xloc + (cwidth + moat) * 8, 0);

    spawnMap();
}

/**
 *
 */
function pushRandomSectionCastle(xloc, num)
{
    var cwidth;
    var nextwidth;

    switch(randTrue(3))
    {
        /**
         * Plataformas - cada uma está caindo ou é um gerador.
         */
        case 0:
            cwidth = 1 + randTrue(2);
            nextwidth = cwidth * 64 - 8;

            for (var i = 0; i < cwidth; ++i)
            {
                /**
                 * Plataforma caindo na lava.
                 */
                if (randTrue())
                {
                    makeCeilingCastle(xloc + i * 64, 8);
                    fillPreWater(xloc + i * 64, 0, 16);
                    pushPreThing(Platform, xloc + i * 64 + 8 + randTrue(2) * 8, 8 + randTrue(max(i + 2, 4)) * 8, 4, moveFalling);
                } else
                {
                    /**
                     * Gerador de plataforma.
                     */

                    pushPreFloor(xloc + i * 64 - 8, 8, 1);
                    pushPrePlatformGenerator(xloc + i * 64 + 24, 4, 1.75);
                    pushPreFloor(xloc + i * 64 + 64, 8, 1);
                }
            }

            break;

        /**
         * poços Podoboo.
         */
        case 1:
            cwidth = 2 * (1 + randTrue());

            var platoff;
            var platheight;
            var platwidth;

            nextwidth = cwidth * 64 - 8;
            makeCeilingCastle(xloc, cwidth * 8);
            fillPreWater(xloc, 0, cwidth * 16);

            for (var i = 0; i < cwidth; ++i)
            {
                platoff = xloc + i * 64;
                platheight = randTrue(max(i + 1, 2 + randTrue(2))) * 8;
                platwidth = 2 + randTrue(3);

                /**
                 * Algo para pousar.
                 */
                switch(randTrue(2))
                {
                    /**
                     * Chão.
                     */
                    case 0:
                        pushPreFloor(platoff + randTrue(3) * 8, platheight, platwidth);
                        break;

                    /**
                     * Pedra.
                     */
                    case 1:
                        pushPreThing(Stone, platoff + randTrue(3) * 8, platheight, platwidth);
                        break;

                    /**
                     * Plataforma (deslizando).
                     */
                    case 2:
                        platoff += 8 + randTrue() * 8;
                        pushPreThing(Platform, platoff, randTrue(3) * 8, 4, [moveSliding, platoff, platoff + 56 + randTrue(2) * 8, 2]);
                        break;
                }

                /**
                 * Bloco em cima.
                 */
                if (!randTrue(2) && platwidth % 2 == 1)
                {
                    pushPreThing(Block, platoff + platwidth * 4 - 8, platheight + 40, Mushroom);
                }

                /**
                 * Podoboo depois.
                 */
                if (platwidth <= 4)
                {
                    pushPreThing(Podoboo, platoff + (platwidth + 1) * 8, -32);
                }
            }

            break;

        /**
         * Piso tradicional.
         */
        case 2:
            var chunk;

            cwidth = 14 + randTrue(21);
            nextwidth = cwidth * 8 - 8;
            ceilheight = 1;

            pushPreFloor(xloc, 0, cwidth);

            switch(randTrue())
            {
                /**
                 * Divisão em jumplev1.
                 */
                case 0:
                    ceilheight = 3;
                    makeCeilingCastle(xloc, cwidth, ceilheight);

                    for (var i = 1 + randTrue(); i < cwidth - 6; ++i)
                    {
                        chunk = min(7, cwidth - i);
                        pushPreThing(Stone, xloc + i * 8, jumplev1, chunk);

                        if (randTrue())
                        {
                            pushPreThing(CastleBlock, xloc + (i + chunk - 4) * 8, 0, [6, randTrue()], true);
                        }

                        pushPreThing(CastleBlock, xloc + (i + chunk) * 8, jumplev1, 6, randTrue());

                        if (randTrue())
                        {
                            pushPreThing(CastleBlock, xloc + (i + chunk + 4) * 8, jumplev2 + 8, [6, randTrue()], true);
                        }

                        i += chunk;
                    }

                    break;

                /**
                 * Estações de coisas giratórias.
                 */
                case 1:
                    makeCeilingCastle(xloc, cwidth, ceilheight);

                    var floorlev = randTrue();
                    var off = randTrue();

                    pushPreThing(Stone, xloc, floorlev * 8, cwidth, floorlev);

                    for (var i = randTrue(2); i < cwidth - 3; i += 4)
                    {
                        /**
                         * Abaixo.
                         */
                        pushPreThing(Stone, xloc + (i + off) * 8, 16 + floorlev * 8, 3, 2);
                        pushPreThing(CastleBlock, xloc + (i + off + 1) * 8, 24 + floorlev * 8, randTrue(2) ? 6 : 0, randSign());

                        /**
                         * Acima.
                         */
                        pushPreThing(Stone, xloc + (i + off) * 8, 80, 3, 2);

                        if (i < cwidth - 5)
                        {
                            pushPreThing(CastleBlock, xloc + (i + off + 1) * 8, 64, randTrue(2) ? 6 : 0, randSign());
                        }

                        i += 1 + randTrue(3);
                    }

                    /**
                     * nextwidth -= 8;
                     */
                    break;
            }

            break;

        /**
         * Túnel.
         */
        case 3:
            cwidth = 21 + randTrue(21);
            nextwidth = cwidth * 8 - 8;

            var floorheight = 1 + randTrue(3);
            var ceilheight = 11 - floorheight - 4;

            pushPreFloor(xloc, 8 * floorheight, cwidth);
            makeCeilingCastle(xloc, cwidth, ceilheight);

            for (var i = 0; i < cwidth; i += 8)
            {
                /**
                 * Inimigo.
                 */
                if (randTrue())
                {
                    pushRandomEnemy(xloc + i * 8, floorheight * 8, 0);

                    if (randTrue())
                    {
                        pushRandomEnemy(xloc + i * 8 + 12, floorheight * 8, 0);

                        if (randTrue())
                        {
                            pushRandomEnemy(xloc + i * 8 + 24, floorheight * 8, 0);
                        }
                    }
                }
            }

            break;
    }

    var next = (num <= 280 ? pushRandomSectionCastle : endCastleInsideRandom);

    pushPreThing(GenerationStarter, xloc + nextwidth, ceilmax + 20, next, num + nextwidth / 8);
    spawnMap();
}

/**
 *
 */
function endCastleInsideRandom(xloc)
{
    var num = 2 + randTrue(2);
    var each = 5;
    var bottom = randTrue() * 8;
    var top = bottom + 24 + randTrue() * 8;
    var width;

    pushPreFloor(xloc, bottom, num * each);

    for (var i = 0; i < num; ++i)
    {
        width = max(2, randTrue(each - 2));
        pushPreFloor(xloc + ((i + 1) * each * 8), top, width);
    }

    var end = xloc + num * each * 8;
    var extra = randTrue(7) * 8;

    fillPreWater(end, 0, extra/* * 2*/);

    /**
     * endCastleInsideFinal(end + extra);
     */
    endCastleInsideRandomFinal(end + extra);
    spawnMap();
}

/**
 *
 */
function endCastleInsideRandomFinal(xloc)
{
    fillPreWater(xloc, 0, 16);
    pushPreFloor(xloc + 24, 24, 3);
    endCastleInside(xloc + 48, 2);

    if (randTrue())
    {
        pushPreThing(Podoboo, xloc + 72 + randTrue(3) * 8, -32);
    }

    if (randTrue())
    {
        fillPreThing(Brick, xloc + 56 + randTrue(3) * 8, 64, 3 + randTrue(3), 1, 8);
    }

    if (randTrue())
    {
        pushPreThing(CastleBlock, xloc + 56 + randTrue(2) * 8, 24, [6, randSign()], true);
    }

    spawnMap();
}

/**
 * Returns [Name, Text2].
 */
function placeRandomCastleNPC(xloc)
{
    var npc = pushPreThing(Toad, xloc + 194, 12).object;

    npc.text = [
        pushPreText({innerHTML: "OBRIGADO " + window.player.title.toUpperCase() + "!"}, xloc + 160, 66).object,
        pushPreText({innerHTML: "LOL VOCÊ PENSOU QUE HAVERIA ALGO AQUI NÃO É !"}, xloc + 148, 50).object
    ];
}

/**
 *
 */
function pushRandomCoinRow(xloc, yloc, size)
{
    if (!size)
    {
        return;
    }

    if (size == 3)
    {
        xloc += 8;
    }

    var pattern;

    if (randTrue(2))
    {
        switch(size)
        {
            case 3:
                pattern = [1, 0, 1];
                break;

            case 4:
                switch(randTrue())
                {
                    case 0:
                        pattern = [1, 0, 0, 1];
                        break;

                    case 1:
                        pattern = [0, 1, 1, 0];
                        break;
                }

                break;

            case 5:
                switch(randTrue())
                {
                    case 0:
                        pattern = [1, 0, 1, 0, 1];
                        break;

                    case 1:
                        pattern = [0, 1, 0, 1, 0];
                        break;
                }

                break;
        }
    } else
    {
        pattern = arrayOf(true, size);
    }

    for (var i = 0; i < size; ++i)
    {
        if (pattern[i])
        {
            pushPreThing(Coin, xloc + i * 8, yloc);
        }
    }
}

/**
 *
 */
function getNextCoinRowSize(prev)
{
    switch(prev)
    {
        case 3:
            return 5;

        case 5:
            return 3;

        default:
            return prev;
    }
}

/**
 *
 */
function pushRandomSectionTrees(xloc)
{
    var treewidth, treeheight;

    switch(randTrue(7))
    {
        case 0:
            /**
             * Árvore base - bem abaixo, com árvores variáveis subindo de baixo.
             */
            treewidth = randTrue(14) + 7;
            treeheight = randTrue(3);
            map.treefunc(xloc, treeheight * 8, treewidth);

            var minwidth;
            var topheight;

            for (var i = randTrue(2); i < treewidth - 2; i += minwidth - 1)
            {
                if (randTrue(2))
                {
                    pushRandomSmallEnemy(xloc + i * 8, treeheight * 8);
                }

                if (randTrue(2))
                {
                    minwidth = 3 + (randTrue(3) ? 0 : randTrue(4));
                    topheight = min(9, treeheight + randTrue(7) + 3) * 8;
                    map.treefunc(xloc + i * 8, topheight, minwidth);

                    if (randTrue())
                    {
                        pushRandomSmallEnemy(xloc + i * 8, topheight * 8);
                    }

                    i += minwidth - 1;
                    pushRandomSmallEnemy(xloc + i * 8, treeheight * 8);
                }
            }

            break;

        case 1:
            /**
             * Coisas especiais: balanças e geradores de plataforma.
             */
            treewidth = 14;
            treeheight = 7;

            switch(randTrue())
            {
                default:
                    treewidth = 4 + randTrue(2);
                    pushPrePlatformGenerator(xloc + 8 * (randTrue() + 1), treewidth, -1);
                    treewidth += randTrue(3) + 3;
                    break;

                /**
                 * Balanças desativadas porque podem impossibilitar a continuação.
                 *
                 * case 1:
                 *     treewidth = 7 + randTrue(2);
                 *
                 *     var left = 7 + randTrue(7);
                 *     var right = 21 - left;
                 *
                 *     pushPreScale(xloc + 8 + (randTrue() + 3), 64 + randTrue(3) * 8, treewidth + 3, [5 + randTrue(2), left, right]);
                 *     treeheight = randTrue(4);
                 *     treewidth += 3 + randTrue(3);
                 *     break;
                 *
                 * case 0:
                 */
            }

            break;

        default:
            /**
             * Uma árvore típica.
             */
            treewidth = 4 + randSign() + randTrue();
            treeheight = min(randTrue(2) + 4 + randSign(2), map.treelev + 4);

            var treex = xloc - randTrue() * 8;

            if (treeheight == map.treelev)
            {
                treeheight += randSign();
            }

            map.treefunc(treex, treeheight * 8, treewidth);

            if (treewidth > 3 || randTrue())
            {
                if (randTrue(3))
                {
                    pushRandomSmallEnemy(treex + (randTrue() + 1) * 8, treeheight * 8);
                }
            } else if (randTrue(2))
            {
                for (var i = 1; i < treewidth - 1; ++i)
                {
                    /**
                     * if (randTrue(3))
                     */
                    pushPreThing(Coin, treex + 1 + i * 8, (treeheight + 1) * 8 - 1);
                }
            }

            break;
    }

    var func;

    if (++map.sincechange > 7 && randTrue())
    {
        func = map.randtype;
        map.sincechange = 0
    } else
    {
        func = pushRandomSectionTrees;
    }

    pushPreThing(GenerationStarter, xloc + (treewidth + randSign()) * 8, ceilmax + 20, func);
    spawnMap();
    map.treelev = treeheight;
}

/**
 *
 */
function pushRandomSmallEnemy(xloc, yloc, canjump)
{
    /**
     * pushPreThing(Beetle, xloc, yloc + 8.5);
     */
    switch(randTrue(7))
    {
        case 1:
        case 2:
        case 3:
            pushPreThing(Koopa, xloc, yloc + 12, true, canjump);
            break;

        case 7:
            pushPreThing(Beetle, xloc, yloc + 8.5);
            break;

        default:
            pushPreThing(Goomba, xloc, yloc + 8);
            break;
    }
}

/**
 *
 */
function pushRandomSectionUnderworld(xloc)
{
    /**
     * Preparações iniciais.
     */
    var bwidth = max(randTrue(117), 1);
    var each = 14;
    var maxwidth = bwidth - (bwidth % each);
    var divwidth = floor(bwidth / each);
    var i;
    var j;

    pushPreFloor(xloc, 0, bwidth);
    window.randcount_powerup = 3;

    /**
     * Menor/normal.
     */
    if (bwidth < each)
    {
        switch(randTrue())
        {
            /**
             * Chunk inimigo.
             */
            case 0:
                for (i = 0; i < bwidth - 2; i += 3)
                {
                    pushRandomChunkEnemy(xloc + i * 8, 0, i);
                }

                break;

            case 1:
                for (i = 0; i < bwidth - 2; i += 3)
                {
                    /**
                     * Cada pedaço tem um obstáculo...
                     */
                    if (!randTrue(2))
                    {
                        pushRandomObstacle(xloc, i);
                    } else if (i % 3 == 0)
                    {
                        /**
                         * ...ou (talvez) um inimigo, que pode ter tijolos/blocos acima.
                         */
                        pushRandomChunkEnemy(xloc, i);
                    }
                }

                break;
        }
    } else
    {
        /**
         * Maior/incomum.
         */

        for (i = 1; i < maxwidth; i += each)
        {
            switch(randTrue(5))
            {
                /**
                 * Só tem coisas rabiscadas.
                 */
                case 0:
                    pushRandomUnderworldSquigglies(xloc + i * 8, each);
                    makeCeiling(xloc + i * 8, each);
                    break;

                /**
                 * Faça rabiscos com um preenchimento no topo.
                 */
                case 1:
                    var diff = 1 + randTrue();
                    var lev = 4 + randTrue(7);

                    i += diff;

                    /**
                     * pushRandomUnderworldSquigglies(xloc + i * 8, each - 2, lev - 3, true);
                     */
                    for (j = 0; j < each; j += 1 + randTrue() / 2)
                    {
                        if (randTrue())
                        {
                            pushRandomSmallEnemy(xloc + (i + j) * 8, 0);
                        }
                    }

                    fillPreThing(Brick, xloc + i * 8, lev * 8, each - 1, 12 - lev, 8, 8);
                    i -= diff;
                    break;

                /**
                 * Crie um túnel.
                 */
                case 2:
                    createTunnel(xloc + (i + 2) * 8, each - 4, Brick);
                    break;

                /**
                 * Canos.
                 */
                case 3:
                    pushUnderworldPipes(xloc + (i + 2) * 8, each - 2);
                    makeCeiling(xloc + (i + 1) * 8, each);
                    break;

                /**
                 * Pedras.
                 */
                case 4:
                    pushUnderworldStones(xloc + (i + 2) * 8, each - 2);
                    makeCeiling(xloc + (i + 1) * 8, each);
                    break;

                /**
                 * Chunk inimigos, com raros.
                 */
                case 5:
                    for (j = 0; j < each - 4; j += 3)
                    {
                        pushRandomChunkEnemy(xloc + (i + j) * 8, j);
                    }

                    break;

                case 6:
                    for (j = 0; j < bwidth - 2; j += 3)
                    {
                        /**
                         * Cada pedaço tem um obstáculo...
                         */
                        if (!randTrue(2))
                        {
                            pushRandomObstacle(xloc + (i + j) * 8, j);
                        } else
                        {
                            /**
                             * ...ou (talvez) um inimigo, que pode ter tijolos/blocos acima.
                             */

                            if (i % 3 == 0 || randTrue())
                            {
                                pushRandomChunkEnemy(xloc + (i + j) * 8, j);
                                ++numenemychunks;
                            }
                        }
                    }

                    break;
            }
        }
    }

    prepareNextGeneratorStandard(xloc, bwidth, pushRandomSectionUnderworld, true);
    spawnMap();
}

/**
 *
 */
function pushRandomUnderworldSquigglies(xloc, maxwidth, maxheight, nocoins)
{
    maxheight = maxheight || Infinity;

    var bottom = 3 + randTrue(2);
    var top = min(maxheight, bottom + 1 + randTrue(4));
    var lev = (bottom == 1) ? top : (randTrue(2) ? bottom : top);
    var diff = 1 + top - bottom;
    var had_brick = false;
    var coincap = top + 16;

    for (var i = 0; i < maxwidth; ++i)
    {
        /**
         * Continue no lev.
         */
        if (randTrue())
        {
            /**
             * fillPreThing(Brick, xloc + i * 8, lev * 8, 3, 1, 8);
             */
            for (var j = 0; j < 3; ++j)
            {
                pushPreThing(Brick, xloc + (i + j) * 8, lev * 8, randTrue() ? null : getRandomBrickItem());
            }

            if (!nocoins && randTrue(2))
            {
                fillPreThing(Coin, xloc + 1 + i * 8, min(coincap, (lev + randTrue(4) + 1)) * 8 - 1, 3 + randTrue(), 1, 8);
            }

            if (!had_brick)
            {
                if (randTrue())
                {
                    pushPreThing(Block, xloc + (i + 3) * 8, lev * 8, getRandomBlockItem());
                } else
                {
                    pushPreThing(Brick, xloc + (i + 3) * 8, lev * 8);
                }

                had_brick = true;
            }

            i += 3;
        } else
        {
            /**
             * Trocar.
             */

            fillPreThing(Brick, xloc + i * 8, bottom * 8, 1, diff, 8, 8);
            lev = (lev == top) ? bottom : top;
            had_brick = false;
        }

        if (i % 3 == 1 || (randTrue() && i < maxwidth - 3))
        {
            pushRandomSmallEnemy(xloc + i * 8, 0, false);
        }

        /**
         * if (i % 3 == 1 || (randTrue() && i < maxwidth - 3))
         * {
         *     pushRandomEnemy(xloc + i * 8, 0, i, true);
         * }
         */
    }
}

/**
 *
 */
function pushUnderworldPipes(xloc, width)
{
    var maxwidth = width - 4;
    var had_ok = false;
    var out;
    var lev;
    var i;

    for (i = 0; i < maxwidth; i += 4)
    {
        switch(randTrue())
        {
            /**
             * Apenas um cachimbo normal e pequeno.
             */
            case 0:
                out = randTrue();
                addPipeRandom(xloc + (i + out) * 8, 0, (2 + randTrue(2)) * 8);
                i += (1 - out);
                had_ok = true;
                break;

            /**
             * Um cano grande, com um tijolo antes dele, se necessário.
             */
            case 1:
                out = randTrue() || !had_ok;
                lev = 4 + randTrue(4);

                if (out)
                {
                    pushPreThing(Brick, xloc + i * 8, max(lev - 4, (3 + randTrue())) * 8, getRandomBrickItem(false));
                }

                addPipeRandom(xloc + (i + out) * 8, 0, lev * 8);
                had_ok = false;
                break;
        }
    }

    for (i; i < width - 1; ++i)
    {
        if (randTrue())
        {
            pushRandomChunkEnemy(xloc + i * 8, 0);
        }
    }
}

/**
 *
 */
function pushUnderworldStones(xloc, width)
{
    var maxwidth = width - 4;
    var had_ok = false;
    var out;
    var lev;
    var i;

    for (i = 0; i < maxwidth; i += 2)
    {
        switch(randTrue())
        {
            /**
             * Apenas um cachimbo normal e pequeno.
             */
            case 0:
                out = randTrue();
                lev = 2 + randTrue(2);
                pushPreThing(Stone, xloc + (i + out) * 8, lev * 8, 1, lev);
                i += (1 - out);
                had_ok = true;
                break;

            /**
             * Um cachimbo grande, com um tijolo antes dele, se necessário.
             */
            case 1:
                out = randTrue() || !had_ok;
                lev = 4 + randTrue(4);

                if (out)
                {
                    pushPreThing(Brick, xloc + i * 8, max(lev - 4, (3 + randTrue())) * 8, getRandomBrickItem(false));
                }

                pushPreThing(Stone, xloc + (i + out) * 8, lev * 8, 1, lev);
                had_ok = false;
                break;
        }
    }

    for (i; i < width - 1; i += 3)
    {
        if (randTrue())
        {
            pushRandomChunkEnemy(xloc + i * 8, 0);
        }
    }
}

/**
 *
 */
function pushRandomSectionUnderwater(xloc)
{
    /**
     * Preparações iniciais.
     *
     * var bwidth = max(randTrue(117), 1);
     */
    var bwidth = max(randTrue(117), 7);

    bwidth -= bwidth % 3;
    pushPreFloor(xloc, 0, bwidth);
    pushPreScenery("Water", xloc, ceilmax - 21, bwidth * 8 / 3, 1)
    pushPreThing(WaterBlock, xloc, ceilmax, bwidth * 8);
    window.randcount_powerup = 3;

    /**
     * Cada pedaço tem 4 blocos de largura, não os 3 normais.
     */
    for (var i = 0; i < bwidth; i += 4)
    {
        switch(randTrue(21))
        {
            case 0:
                if (i < bwidth -2)
                {
                    pushRandomObstacle(xloc, i);
                    break;
                }

            case 1:
                pushRandomEnemy(xloc, 0, i, true);
                break;

            default:
                switch(randTrue(7))
                {
                    case 0:
                        /**
                         * Abertura em pedra: pelo menos 5 blocos de altura, de 11.
                         */
                        var topblock = randTrue() + 2;
                        var botblock = randTrue() + 2;

                        /**
                         * Baixo.
                         */
                        pushPreThing(Stone, xloc + i * 8, botblock * 8, randTrue(3) + 1, botblock);

                        /**
                         * Alto.
                         */
                        pushPreThing(Stone, xloc + i * 8, ceillev, randTrue(3) + 1, topblock);

                        break;

                    case 1:
                        /**
                         * Especificação de pedra simples.
                         */

                        if (randTrue())
                        {
                            pushPreThing(Stone, xloc + i * 8, jumplev1, 4);
                        }

                        if (randTrue())
                        {
                            pushPreThing(Stone, xloc + i * 8, jumplev2, 4);
                        }

                        break;

                    case 2:
                        /**
                         * Algumas moedas.
                         */
                        fillPreThing(Coin, xloc + (i + randTrue()) * 8 + 1, (randTrue(8) + 1) * 8 - 1, 3, 1, 8);
                        break;

                    default:
                        if (map.had_coral)
                        {
                            map.had_coral = false;
                            break;
                        }

                        map.had_coral = true;

                        /**
                         * Coral sentado no chão ou em um jumplev.
                         * Se estiver em um jumplev, tem >=1 pedras com ele.
                         *
                         * var pheight = jumplev1 * (1 + randTrue());
                         * var cheight = 3;
                         */
                        var pwidth = randTrue(3) + 2;
                        var pheight = jumplev1 * (1 + randTrue(2));
                        var cheight = 3;
                        var cx = xloc + i * 8;
                        var cy;

                        if (pheight == jumplev1 * 3)
                        {
                            var ontop = true;
                            pheight -= 8;
                        }

                        pushPreThing(Stone, xloc + i * 8, pheight, pwidth);

                        if (!ontop && (randTrue(3) || pwidth <= 3))
                        {
                            /**
                             * Acima da pedra.
                             */
                            cy = pheight + cheight * 8;
                        } else
                        {
                            /**
                             * Abaixo da pedra.
                             */
                            cy = pheight - 8;
                        }

                        if (randTrue())
                        {
                            /**
                             * Começo de pedra.
                             */
                            pushPreThing(Coral, cx, cy, cheight);
                        }

                        if (randTrue() && pwidth > 3 && pheight < 64)
                        {
                            /**
                             * Fim de pedra.
                             */
                            pushPreThing(Coral, cx + (pwidth - 1) * 8, cy, cheight);
                        }

                        if (pwidth >= 3)
                        {
                            i += (pwidth - 3);
                        }

                        break;
                }

                break;
        }

        if (map.countCheep > 1)
        {
            pushPreThing(CheepCheep, xloc + i * 8, randTrue(80) + 8, randTrue());
            map.countCheep = 0;
        }

        if (map.countBlooper > 7)
        {
            pushPreThing(Blooper, xloc + i * 8, randTrue(80) + 8);
            map.countBlooper = 0;
        }

        if (randTrue(7))
        {
            ++map.countCheep;
        }

        if (randTrue(3))
        {
            ++map.countBlooper;
        }
    }

    if (++map.sincechange < 3)
    {
        var tonext = prepareNextGeneratorStandard(xloc, bwidth, pushRandomSectionUnderwater, false, true);

        pushPreScenery("Water", xloc + bwidth * 8, ceilmax - 21, (tonext + 1) * 8 / 3, 1)
        pushPreThing(WaterBlock, xloc + bwidth * 8, ceilmax, (tonext + 1) * 8);
    } else
    {
        endRandomSectionUnderwater(xloc + bwidth * 8);
    }
}

/**
 *
 */
function endRandomSectionUnderwater(xloc)
{
    /**
     * 1488 is xloc............1488.
     */
    pushPreFloor(xloc, 0, 19);
    pushPreScenery("Water", xloc, ceilmax - 21, 10.5 * 8 / 3, 1);
    pushPreThing(WaterBlock, xloc, ceilmax, 10.5 * 15);

    /**
     * 88.
     */
    pushPreThing(Stone, xloc, 8, 5, 1);

    /**
     * 96.
     */
    pushPreThing(Stone, xloc + 8, 16, 4, 1);

    /**
     * 04.
     */
    pushPreThing(Stone, xloc + 16, 24, 3, 1);

    /**
     * 12.
     */
    pushPreThing(Stone, xloc + 24, 32, 2, 1);

    /**
     * 12.
     */
    pushPreThing(Stone, xloc + 24, 88, 2, 4);

    /**
     * 20.
     */
    pushPreThing(PipeSide, xloc + 32, 48, ["Random", randTrue() ?  "Overworld" : "Underworld", "Up"]);

    /**
     * 28.
     */
    pushPreThing(Stone, xloc + 40, 88, 14, 11);

    map.scrollblockerok = true;
    pushPreThing(ScrollBlocker, xloc + 56, 80, true);
    spawnMap();
}

/**
 *
 */
function startRandomSectionSky(xloc)
{
    pushPreThing(Stone, xloc, 0, 78);

    pushPreThing(Platform, xloc + 88, 24, 6, [collideTransport]);
    pushRandomSectionSky(xloc + 80, 1);
    spawnMap();
}

/**
 *
 */
function pushRandomSectionSky(xloc, num)
{
    if (num++ > 7)
    {
        fillPreThing(Coin, xloc + 8, 8, 3, 1, 8);

        return spawnMap();
    }

    var cwidth = 0;

    /**
     * Seção curta.
     */
    if (num % 2)
    {
        fillPreThing(Coin, xloc + 1, 71, 3, 1, 8);
        cwidth = 32;
    } else
    {
        /**
         * Seção longa.
         */

        switch(randTrue(num))
        {
            /**
             * Duas nuvens duplas com 7 moedas no meio.
             */
            case 3:
                pushPreThing(Stone, xloc + 8, 48, 1, 2);
                fillPreThing(Coin, xloc + 25, 63, 7, 1, 8);
                pushPreThing(Stone, xloc + 88, 48, 1, 2);
                cwidth = 104;
                break;

            /**
             * Nuvens alternadas, com moedas no topo.
             */
            case 4:
            case 5:
            case 6:
                pushPreThing(Stone, xloc + 8, 56, 2);

                for (var i = 0; i <= 7; i += 2)
                {
                    pushPreThing(Stone, xloc + (i + 5) * 8, 56);
                    fillPreThing(Coin, xloc + (i + 5) * 8 + 1, 63, 2, 1, 8);
                }

                cwidth = 104;
                break;

            /**
             * Trecho típico de 16 moedas seguido de uma nuvem.
             */
            default:
                fillPreThing(Coin, xloc + 1, 55 + randTrue() * 8, 16, 1, 8);
                cwidth = 128;
                break;
        }
    }

    pushPreThing(GenerationStarter, xloc + cwidth, ceilmax + 20, pushRandomSectionSky, num);
    spawnMap();
}

/**
 *
 */
function prepareNextGeneratorStandard(xloc, bwidth, func, allow_platforms, no_unusuals)
{
    /**
     * Como o mundo acaba.
     */
    var nextdist = 0;
    var nofancy = 0;

    if (!no_unusuals)
    {
        switch(randTrue(7))
        {
            /**
             * Mola para a próxima área.
             */
            case 0:
                if (bwidth > 7 && map.underwater && !randTrue(7))
                {
                    nextdist = randTrue(3) + 7;
                    pushPreThing(Springboard, xloc + (bwidth - 1) * 8, 14.5);
                } else
                {
                    nofancy = true;
                }

                break;

            /**
             * Escadaria de pedra.
             */
            case 1:
                var numpoles = max(1, randTrue(7));

                nextdist = numpoles + randTrue(3);
                pushPreFloor(xloc + bwidth * 8, 0, numpoles);

                for (var j = 1; j <= numpoles; ++j)
                {
                    pushPreThing(Stone, xloc + (bwidth + j - 1) * 8, j * 8, 1, j);
                }

                /**
                 * Pode haver uma escada de saída.
                 */
                if (randTrue())
                {
                    numpoles = max(1, randTrue(numpoles));
                    pushPreFloor(xloc + (bwidth + nextdist + numpoles - 1) * 8, 0, numpoles);

                    for (var k = 0; k < numpoles; ++k)
                    {
                        pushPreThing(Stone, xloc + (bwidth + nextdist + numpoles + k - 1) * 8, (numpoles - k) * 8, 1, numpoles - k);
                    }

                    nextdist += numpoles + numpoles - 2;
                }

                break;

            default:
                if (allow_platforms && randTrue())
                {
                    nextdist = randTrue(1) + 4;
                    pushPrePlatformGenerator(xloc + (bwidth + 1.5) * 8, (nextdist - 2) * 2, randSign());
                } else
                {
                    nofancy = true;
                }

                break;
        }
    } else
    {
        nextdist = 1;
    }

    if (nofancy || !nextdist || nextdist < 1)
    {
        nextdist = randTrue(3) + 1;
    }

    /**
     * Água desativada porque não é legal nessa seção do super mario.
     * Pode haver água entre as coisas.
     *
     * if (map.had_floor && randTrue())
     * {
     *     //
     *     // Isso superestima a água, mas normalmente está tudo bem.
     *     //
     *     fillPreWater(xloc + bwidth * 8, 0, nextdist * 4);
     *
     *     map.needs_floor = true;
     * } else
     * {
     *     map.needs_floor = false;
     * }
     */

    if (func == pushRandomSectionOverworld && (map.num_random_sections >= 3 + randTrue(7)))
    {
        func = pushRandomSectionPreCastle;
    }

    if (!no_unusuals && ++map.sincechange > 3)
    {
        func = getRandomNextSection();
        map.sincechange = 0;

        /**
         * pushPreThing(zoneToggler, xloc + bwidth * 8, ceilmax + 40, zoneDisableCheeps);
         */
        pushPreFuncCollider(xloc, zoneDisableCheeps);

        /**
         * pushPreThing(zoneToggler, xloc, ceilmax + 40, zoneDisableLakitu);
         */
    }

    pushPreThing(GenerationStarter, xloc + (bwidth + nextdist) * 8, ceilmax + 20, func);

    /**
     * console.log(xloc + (bwidth + nextdist) * 8);
     */
    spawnMap();

    return nextdist;
}

/**
 *
 */
function getRandomNextSection()
{
    switch(randTrue())
    {
        case 0:
            map.treeheight = 0;
            return pushRandomSectionTrees;

        case 1:
            return startRandomSectionBridge;
    }
}

/**
 *
 */
function pushRandomChunkEnemy(xloc, i, noRares)
{
    pushRandomEnemy(xloc, 0, i, noRares);

    if (randTrue(2))
    {
        pushRandomSolidRow(xloc + i * 8, jumplev1, randTrue(2) + 1);

        if (randTrue())
        {
            pushRandomEnemy(xloc, jumplev1, i + 1, true);
        }

        if (randTrue())
        {
            pushRandomSolidRow(xloc + i * 8, jumplev2, randTrue(2) + 1);

            if (randTrue())
            {
                pushRandomEnemy(xloc, jumplev2, i + 1, true);
            }
        }
    }
}

/**
 *
 */
function pushRandomEnemy(xloc, yloc, i, noRares)
{
    switch(randTrue(14))
    {
        case 0:
        case 1:
            fillPreThing(Beetle, xloc + i * 8, yloc + 8.5, randTrue(2), 1, 12);
            break;

        case 3:
            if (!noRares)
            {
                switch(randTrue(4))
                {
                    case 0:
                        pushPreThing(HammerBro, xloc + i * 8, yloc + 12);

                        if (randTrue())
                        {
                            pushPreThing(HammerBro, xloc + i * 8 + 16, yloc + 40);
                        }

                        break;

                    case 1:
                        if (map.randname != "Underworld")
                        {
                            pushPreThing(Lakitu, xloc + i * 8, yloc + 80, true);
                            break;
                        }

                    case 2:
                        pushPreThing(Blooper, xloc + i * 8, yloc + 40);
                        break;
                }

                break;
            }

            break;

        default:
            if (!randTrue(3))
            {
                return;
            }

            switch(randTrue(3))
            {
                case 1:
                    fillPreThing(Koopa, xloc + i * 8, yloc + 12, randTrue(2), 1, 12, 0, randTrue() || map.onlysmartkoopas, randTrue());
                    break;

                default:
                    fillPreThing(Goomba, xloc + i * 8, yloc + 8, randTrue(2), 1, 12);
                    break;
            }

            break;
    }
}

/**
 *
 */
function addPipeRandom(xloc, yloc, height)
{
    var transport;

    if (height <= 24 || randTrue(2))
    {
        transport = false;
    } else
    {
        transport = getRandomTransport();
    }

    pushPrePipe(xloc, yloc, height, randTrue(7), transport);
}

/**
 *
 */
function getRandomTransport()
{
    var nextloc;
    var direction;
    var locpos;
    var loctypes = [
        [
            "Overworld",
            "Up"
        ],
        [
            "Underworld",
            "Down"
        ],
        [
            "Underwater",
            "Up"
        ]
    ];

    locpos = randTrue(loctypes.length - 1);

    if (loctypes[locpos][0] == map.randname)
    {
        locpos = (locpos + randTrue(loctypes.length - 2) + 1) % (loctypes.length);
    }

    nextloc = loctypes[locpos][0];
    direction = loctypes[locpos][1];

    return ["Random", nextloc, direction];
}

/**
 *
 */
function getAfterSkyTransport()
{
    switch(randTrue(3))
    {
        case 0:
            return [
                "Random",
                "Underworld",
                "Down"
            ];

        default: 
            return [
                "Random",
                "Overworld" + (body.className.indexOf("Night" != -1) ? " Night" : ""),
                "Down"
            ];
    }
}

/**
 *
 */
function pushRandomObstacle(xloc, i)
{
    var num = randTrue(3);

    if (num > 1)
    {
        map.hadPipe = false;
    }

    switch(num)
    {
        /**
         * Adicionando um cano.
         */
        case 0:
        case 1:
            if (i > 1)
            {
                /**
                 * O cano mais alto possível terá 40 unidades (5 blocos) de altura,
                 * o que é mais alto do que a pessoa pode pular. É por isso que
                 * só é alcançado ( if map.hadObstacle = true ).
                 */
                addPipeRandom(xloc + i * 8, 0, (randTrue(2 + (map.hadObstacle == true && map.hadPipe == false && i > 7)) + 2) * 8);
                map.hadObstacle = map.hadPipe = true;
                break;
            }

        /**
         * Adicionando algumas pedras verticais.
         */
        case 2:
            var height;

            for (var j = 0; j < 2; ++j)
            {
                if (randTrue() || i < 1)
                {
                    continue;
                }

                height = randTrue(2) + 2;
                pushPreThing(Stone, xloc + (i + j) * 8, height * 8, 1, height);
            }

            break;

        /**
         * Coisas diversas.
         */
        default:
            var j = randTrue(2);

            switch(randTrue(7))
            {
                case 0:
                    var height = randTrue(2) + 1;

                    pushPreThing(Cannon, xloc + (i + j) * 8, height * 8, height);

                    if (height == 1 && randTrue(2) && j != 2)
                    {
                        /**
                         * durpliact.
                         */
                        var newheight = randTrue() + 2;

                        pushPreThing(Cannon, xloc + (i + j) * 8, height * 8 + newheight * 8, newheight);
                    }

                    map.hadObstacle = true;
                    break;

                case 1:
                    if (!map.underwater)
                    {
                        if (randTrue())
                        {
                            if (!map.underwater && randTrue(2))
                            {
                                pushPreThing(Brick, xloc + i * 8, jumplev1);
                            }

                            pushPreThing(Block, xloc + (i + 1) * 8, jumplev1, [Mushroom, 1], true);

                            if (!map.underwater && randTrue(2))
                            {
                                pushPreThing(Brick, xloc + (i + 2) * 8, jumplev1);
                            }

                            map.hadObstacle = true;
                        }

                        break;
                    }

                case 2:
                    /**
                     * Se não estiver debaixo d'água, adicione um cano em jumplev1.
                     */
                    if (!map.underwater)
                    {
                        var offx = randTrue();

                        if (!offx)
                        {
                            pushPreThing(Brick, xloc + i * 8, jumplev1, getRandomBrickItem());
                        }

                        pushPreThing(Stone, xloc + (i + offx) * 8, jumplev1, 2);
                        addPipeRandom(xloc + (i + offx) * 8, jumplev1, 24 + randTrue() * 8);

                        if (offx)
                        {
                            pushPreThing(Brick, xloc + i * 8, jumplev1, getRandomBrickItem());
                        }

                        break;
                    }
            }

            break;
    }
}

/**
 *
 */
function pushRandomSolidRow(xloc, yloc, len)
{
    for (var i = 0; i < len; ++i)
    {
        if (randTrue(2))
        {
            pushPreThing(Brick, xloc + i * 8, yloc, getRandomBrickItem(map.randname == "Overworld" && yloc == jumplev2));
        } else
        {
            pushPreThing(Block, xloc + i * 8, yloc, getRandomBlockItem());
        }
    }
}

/**
 *
 */
function getRandomBrickItem(higher, something)
{
    if (higher && !randTrue(14))
    {
        return [Vine, ["Random", "Sky", "Vine"]];
    }

    return (something || !randTrue(7)) ? (randTrue(3) ? Coin : Star) : false;
}

/**
 *
 */
function getRandomBlockItem()
{
    ++randcount_powerup;

    if (randcount_powerup <= 7)
    {
        return false;
    }

    return randTrue(7) ? false : Mushroom
}

/**
 *
 */
function pushRandomGroundScenery(xloc, curblock, bwidth)
{
    switch(randTrue(7))
    {
        case 2:
            if (bwidth - curblock > 4)
            {
                pushPreScenery("Bush3", xloc, 0);
                break;
            }

        case 1:
            if (bwidth - curblock > 2)
            {
                pushPreScenery("Bush2", xloc, 0);
                break;
            }

        case 0:
            pushPreScenery("Bush1", xloc, 0);
            break;

        case 3:
            if (bwidth - curblock > 4)
            {
                pushPreScenery("HillLarge", xloc, 0);
                break;
            }

        case 4:
            pushPreScenery("HillSmall", xloc, 0);
            break;

        case 5:
            pushPreScenery("PlantLarge", xloc, 0);
            break;

        case 6:
            pushPreScenery("PlantSmall", xloc, 0);
            break;

        case 7:
            pushPreScenery("Fence", xloc, 0, randTrue(2) + 1);
            break;
    }
}

/**
 *
 */
function pushRandomSkyScenery(xloc)
{
    switch(randTrue(2))
    {
        case 0:
            pushPreScenery("Cloud1", xloc, (randTrue(5) + 5) * 8);
            break;

        case 1:
            pushPreScenery("Cloud2", xloc, (randTrue(4) + 6) * 8);
            break;

        case 2:
            pushPreScenery("Cloud3", xloc, (randTrue(3) + 7) * 8);
            break;
    }
}

/**
 *
 */
function addDistanceCounter()
{
    counter = createElement("div", {
        className: "indisplay counter randomdisplay",
        innerText: data.traveledold + " blocks traveled"
    });

    body.appendChild(counter);

    TimeHandler.addEventInterval(function(counter)
    {
        data.traveled = max(0,Math.round((player.right + gamescreen.left) / unitsizet8) - 3);
        counter.innerText = (data.traveledold + data.traveled) + " blocks traveled";
    }, 3, Infinity, counter);
}

/**
 *
 */
function addSeedDisplay()
{
    /**
     * counter = createElement("div", {
     *     className: "indisplay seed randomdisplay",
     *     innerText: "This map's seed is " + seed
     * });
     *
     * body.appendChild(counter);
     */
}

/**
 *
 */
function createTunnel(xloc, width, btype)
{
    var top = randTrue(2) + 3;
    var bottom = randTrue(2) + 2;
    var hadenemy = false;

    for (var i = 0; i < width; ++i)
    {
        fillPreThing(btype, xloc + i * 8, 8, 1, bottom, 8, 8);

        if (!randTrue(3) && !hadenemy)
        {
            pushRandomSmallEnemy(xloc + i * 8, bottom * 8);
        } else
        {
            hadenemy = false;
        }

        fillPreThing(btype, xloc + i * 8, 96 - top * 8, 1, top, 8, 8);
    }

    /**
     * fillPreThing(btype, xloc, 8, width, bottom, 8, 8);
     * fillPreThing(btype, xloc, 96 - top * 8, width, top, 8, 8);
     */
}

/**
 * Remoção dos elementos anteriores.
 */
function removeRandomDisplays()
{
    var elems = body.getElementsByClassName("randomdisplay");
    var i;

    for (i = elems.length - 1; i >= 0; --i)
    {
        body.removeChild(elems[i]);
    }
}
