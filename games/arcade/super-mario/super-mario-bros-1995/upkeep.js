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
 * Upkeep.js.
 * Contém funções associadas à manutenção.
 */

/**
 *
 */
function upkeep()
{
    if (window.paused)
    {
        return;
    }

    /**
     * window.nextupk = requestAnimationFrame(upkeep);
     */
    window.nextupk = setTimeout(upkeep, timer);

    /**
     * Consulte utility.js::fastforward.
     */
    for (var i = window.speed; i > 0; --i)
    {
        /**
         * Ajuste para diferenças de desempenho.
         */
        adjustFPS();

        /**
         * Manutenção de quadrantes.
         */
        QuadsKeeper.determineAllQuadrants(solids);

        /**
         * Manutenção de sólidos.
         */
        maintainSolids();

        /**
         * Manutenção do grafema.
         */
        maintainCharacters();

        /**
         * Específico da pessoa.
         */
        maintainPlayer();

        /**
         * Manutenção de textos, se houver.
         */
        if (texts.length)
        {
            maintainTexts();
        }

        /**
         * Manutenção de eventos.
         */
        TimeHandler.handleEvents();

        /**
         * handleEvents();
         */
        refillCanvas();
    }
}

/**
 *
 */
function adjustFPS()
{
    window.time_now = now();

    var time_diff = time_now - time_prev;
    var fps_actual = roundDigit(1000 / time_diff, .001);

    window.fps = roundDigit((.7 * fps) + (.3 * fps_actual), .01);
    window.realtime = fps_target / fps;
    window.time_prev = time_now;
}

/**
 *
 */
function pause(big)
{
    if (paused && !window.nextupk)
    {
        return;
    }

    cancelAnimationFrame(nextupk);

    AudioPlayer.pause();
    paused = true;

    if (big)
    {
        AudioPlayer.play("Pause");
    }
}

/**
 *
 */
function unpause()
{
    if (!paused)
    {
        return;
    }

    window.nextupk = requestAnimationFrame(upkeep);
    paused = false;

    AudioPlayer.resume();
}

/**
 * Sólidos por si só não fazem muito.
 */
function maintainSolids(update)
{
    for (var i = 0, solid; i < solids.length; ++i)
    {
        solid = solids[i];

        if (solid.alive)
        {
            if (solid.movement)
            {
                solid.movement(solid);
            }
        }

        if (!solid.alive || solid.right < QuadsKeeper.getDelX())
        {
            deleteThing(solid, solids, i);
        }
    }
}

/**
 *
 */
function maintainCharacters(update)
{
    var delx = gamescreen.right + QuadsKeeper.getOutDifference();
    var character;
    var i;

    for (i = 0; i < characters.length; ++i)
    {
        character = characters[i];

        /**
         * Gravidade.
         */
        if (!character.resting)
        {
            if (!character.nofall)
            {
                character.yvel += character.gravity || map.gravity;
            }

            character.yvel = min(character.yvel, map.maxyvel);
        } else
        {
            character.yvel = 0;
        }

        /**
         * Atualização de posição e detecção de colisão.
         */
        updatePosition(character);

        QuadsKeeper.determineThingQuadrants(character);
        character.under = character.undermid = false;
        determineThingCollisions(character);

        /**
         * Testes de repouso.
         */
        if (character.resting)
        {
            if (!characterOnResting(character, character.resting))
            {
                /**
                 * Necessário para plataformas móveis.
                 */
                character.resting = false;
            } else
            {
                /**
                 * character.jumping =.
                 */

                character.yvel = false;
                setBottom(character, character.resting.top);
            }
        }

        /**
         * Movimento ou remoção.
         * Para fazer: repense isso.
         *
         * Bom para desempenho se gamescreen.bottom - gamescreen.top for
         * salvo na tela e atualizado no turno. Para fazer: é necessário
         * map.shifting ?
         */
        if (character.alive)
        {
            if (character.type != "player" && !map.shifting && (character.numquads == 0 || character.left > delx) && !character.outerok)
            {
                /**
                 * (character.top > gamescreen.bottom - gamescreen.top || character.left < + quads.width * -1))
                 * {
                 * }
                 */
                deleteThing(character, characters, i);
            } else
            {
                if (!character.nomove && character.movement)
                {
                    character.movement(character);
                }

                /**
                 * if (update)
                 * {
                 *     updateDisplay(character);
                 * }
                 */
            }
        } else if (!map.shifting)
        {
            deleteThing(character, characters, i);
        }
    }
}

/**
 *
 */
function maintainPlayer(update)
{
    if (!player.alive)
    {
        return;
    }

    /**
     * A pessoa está caindo.
     */
    if (player.yvel > 0)
    {
        if (!map.underwater)
        {
            player.keys.jump = 0;
        }

        /**
         * Pulando ?
         */
        if (!player.jumping)
        {
            /**
             * Remando? (de cair de um sólido).
             */
            if (map.underwater)
            {
                if (!player.paddling)
                {
                    switchClass(player, "paddling", "paddling");
                    player.padding = true;
                }
            } else
            {
                addClass(player, "jumping");
                player.jumping = true;
            }
        }

        /**
         * A pessoa caiu muito.
         */
        if (!player.piping && !player.dying && player.top > gamescreen.deathheight)
        {
            /**
             * Se o mapa tiver um local de saída (mundo da nuvem),
             * transporte para lá.
             */
            if (map.exitloc)
            {
                /**
                 * Mapas aleatórios vão fingir que ele tem.
                 */
                if (map.random)
                {
                    goToTransport(["Random", "Overworld", "Down"]);
                    playerDropsIn();

                    return;
                }

                /**
                 * Caso contrário, apenas mude para o local.
                 */
                return shiftToLocation(map.exitloc);
            }

            /**
             * Caso contrário, como a pessoa está abaixo da tela do programa.
             */
            clearPlayerStats();
            killPlayer(player, 2);
        }
    }

    /**
     * A pessoa está se movendo para a direita.
     */
    if (player.xvel > 0)
    {
        if (player.right > gamescreen.middlex)
        {
            /**
             * Se Player estiver à direita do meio da tela do programa,
             * mova a tela do programa.
             */
            if (player.right > gamescreen.right - gamescreen.left)
            {
                player.xvel = min(0, player.xvel);
            }
        }
    } else if(player.left < 0)
    {
        /**
         * A pessoa está se movendo para a esquerda.
         */

        /**
         * Impedir que a pessoa vá para a esquerda.
         */
        player.xvel = max(0, player.xvel);
    }

    /**
     * A pessoa está acertando algo (pare de pular).
     */
    if (player.under)
    {
        player.jumpcount = 0;
    }

    /**
     * Scrolloffset é o quão longe está a direita da pessoa do meio.
     * É multiplicado por 0 ou 1 para map.canscroll.
     *
     * window.scrolloffset = (map.canscroll || (map.random && !map.noscroll)) * (player.right - gamescreen.middlex);
     */
    window.scrolloffset = (map.canscroll) * (player.right - gamescreen.middlex);

    if (scrolloffset > 0 && !map.shifting)
    {
        scrollWindow(lastscroll = round(min(player.scrollspeed, scrolloffset)));
    } else
    {
        lastscroll = 0;
    }
}

/**
 * A verificação de remoção é feita por um intervalo definido em shiftToLocation.
 * Isso simplesmente faz velocidade.
 */
function maintainTexts()
{
    var element;
    var me;
    var i;

    for (i = texts.length - 1; i >= 0; --i)
    {
        me = texts[i];
        element = me.element || me;

        if (me.xvel)
        {
            elementShiftLeft(element, me.xvel);
        }

        if (me.yvel)
        {
            elementShiftTop(element, me.yvel);
        }
    }
}
