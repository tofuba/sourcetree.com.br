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
 * mario.js.
 * Inicia tudo.
 */

/**
 *
 */
function FullScreenMario()
{
    var time_start = Date.now();

    /**
     * Obrigado !
     */
    ensureLocalStorage();

    /**
     * Eu mantenho esta mini-biblioteca bonitinha para
     * algumas funções úteis.
     */
    TonedJS(true);

    /**
     * É útil manter as referências da base.
     */
    window.body = document.body;
    window.bodystyle = body.style;

    /**
     * xxx.
     */
    window.verbosity = {
        Maps: false,
        Sounds: false,
    };

    window.requestAnimationFrame = window.requestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(func)
        {
            setTimeout(func, timer);
        };

    window.cancelAnimationFrame = window.cancelAnimationFrame ||
        window.webkitCancelRequestAnimationFrame ||
        window.mozCancelRequestAnimationFrame ||
        window.oCancelRequestAnimationFrame ||
        window.msCancelRequestAnimationFrame ||
        clearTimeout;

    window.Uint8ClampedArray = window.Uint8ClampedArray ||
        window.Uint8Array ||
        Array;

    /**
     * Reiniciar tudo pode demorar um pouco.
     */
    resetMeasurements();
    resetLibrary();
    resetEvents();
    resetCanvas();
    resetMaps();
    resetScenery();
    resetTriggers();
    resetSeed();
    resetSounds();

    window.luigi = (localStorage && localStorage.luigi == "true");

    /**
     * Com tudo pronto, configure o mapa para World11.
     */
    window.gameon = true;
    setMap(1, 1);

    log("Levou " + (Date.now() - time_start) + " milissegundos para iniciar.");
}

/**
 * Para fazer: adicione um polyfill real.
 */
function ensureLocalStorage()
{
    var ls_ok = false;

    try
    {
        if (!window.hasOwnProperty("localStorage"))
        {
            window.localStorage = {
                crappy: true
            };
        }

        /**
         * Alguns navegadores (principalmente o IE) não o permitem
         * em uma máquina local.
         */
        if (window.localStorage)
        {
            ls_ok = true;
        }
    } catch(err)
    {
        ls_ok = false;
    }

    if (!ls_ok)
    {
        var nope = document.body.innerText = "Parece que seu navegador não permite localStorage!";
        throw nope;
    }
}

/**
 * Procedimentos básicos de reinicialização.
 */
function resetMeasurements()
{
    resetUnitsize(4);
    resetTimer(1000 / 60);

    window.jumplev1 = 32;
    window.jumplev2 = 64;

    /**
     * O piso está 88 espaços (11 blocos) abaixo do yloc = camada 0.
     */
    window.ceillev = 88;

    /**
     * O piso está 104 espaços (13 blocos) abaixo do topo da tela (yloc = -16).
     */
    window.ceilmax = 104;

    window.castlev = -48;
    window.paused = true;

    resetGameScreen();

    if (!window.parentwindow)
    {
        window.parentwindow = false;
    }
}

/**
 * O tamanho da unidade é mantido como uma medida de quanto
 * expandir (normalmente 4).
 */
function resetUnitsize(num)
{
    window.unitsize = num;

    for (var i = 2; i <= 64; ++i)
    {
        window["unitsizet" + i] = unitsize * i;
        window["unitsized" + i] = unitsize / i;
    }

    /**
     * Normalmente 2.
     */
    window.scale = unitsized2;

    /**
     * Normalmente 0.48.
     */
    window.gravity = round(12 * unitsize) / 100;
}

/**
 *
 */
function resetTimer(num)
{
    num = roundDigit(num, .001);

    window.timer = window.timernorm = num;
    window.timert2 = num * 2;
    window.timerd2 = num / 2;
    window.fps = window.fps_target = roundDigit(1000 / num, .001);
    window.time_prev = Date.now();
}

/**
 *
 */
function resetGameScreen()
{
    window.gamescreen = new getGameScreen();
}

/**
 *
 */
function getGameScreen()
{
    resetGameScreenPosition(this);

    /**
     * Middlex é estático e usado apenas para rolar para a direita.
     */
    this.middlex = (this.left + this.right) / 2;

    /**
     * this.middlex = (this.left + this.right) / 3;
     */

    /**
     * Esta é a parte inferior da tela - água, canos, etc. vá até aqui.
     */
    window.botmax = this.height - ceilmax;

    if (botmax < unitsize)
    {
        body.innerHTML = "<div><br>Sua tela não é alta o suficiente. Torne-o mais alto e, em seguida, atualize.</div>";
    }

    /**
     * A distância em que as coisas faz a conclusão ao cair.
     */
    this.deathheight = this.bottom + 48;
}

/**
 *
 */
function resetGameScreenPosition(me)
{
    me = me || window.gamescreen;
    me.left = me.top = 0;
    me.bottom = innerHeight;
    me.right = innerWidth;
    me.height = innerHeight / unitsize;
    me.width = innerWidth / unitsize;
    me.unitheight = innerHeight;
    me.unitwidth = innerWidth;
}

/**
 * Os eventos são feitos com TimeHandlr.js.
 * Isso ajuda a fazer com que o tempo obedeça às pausas e torna os
 * ciclos de classes muito mais fáceis.
 */
function resetEvents()
{
    window.TimeHandler = new TimeHandlr({
        onSpriteCycleStart: "onadding",
        doSpriteCycleStart: "placed",
        cycleCheckValidity: "alive",
        timingDefault: 9
    });
}

/**
 * Os sons são feitos com AudioPlayr.js.
 */
function resetSounds()
{
    window.sounds = {};
    window.theme = false;
    window.muted = (localStorage && localStorage.muted == "true");

    window.AudioPlayer = new AudioPlayr({
        directory: "Sounds",

        getVolumeLocal: function()
        {
            return .49;
        },

        getThemeDefault: function()
        {
            return area.theme;
        },

        library: {
            Sounds: [
                "Bowser Falls",
                "Bowser Fires",
                "Break Block",
                "Bump",
                "Coin",
                "Ending",
                "Fireball",
                "Firework",
                "Flagpole",
                "Gain Life",
                "Game Over 2",
                "Game Over",
                "Hurry",
                "Into the Tunnel",
                "Jump Small",
                "Jump Super",
                "Kick",
                "Level Complete",
                "Player Dies",
                "Pause",
                "Pipe",
                "Power Down",
                "Powerup Appears",
                "Powerup",
                "Stage Clear",
                "Vine Emerging",
                "World Clear",
                "You Dead"
            ],

            Themes: [
                "Castle",
                "Overworld",
                "Underwater",
                "Underworld",
                "Star",
                "Sky",
                "Hurry Castle",
                "Hurry Overworld",
                "Hurry Underwater",
                "Hurry Underworld",
                "Hurry Star",
                "Hurry Sky"
            ]
        }
    });
}

/**
 * Os quadrantes são feitos com QuadsKeepr.js.
 * Isso começa com 7 pilastras e 6 linhas (cada uma tem 1 de cada lado
 * para preenchimento).
 */
function resetQuadrants()
{
    window.QuadsKeeper = new QuadsKeepr({
        num_rows: 5,
        num_cols: 6,
        screen_width: window.innerWidth,
        screen_height: window.innerHeight,
        tolerance: unitsized2,
        onUpdate: spawnMap,
        onCollide: false
    });
}

/**
 * Variáveis relativas ao estado do programa.
 * Isso é chamado em setMap para redefinir tudo.
 */
function resetGameState(nocount)
{
    /**
     * O HTML é redefinido aqui.
     */
    clearAllTimeouts();

    /**
     * Também redefina os dados.
     */
    resetData();

    window.nokeys = window.spawning
        = window.spawnon
        = window.notime
        = window.editing
        = window.qcount
        = window.lastscroll
        = 0;

    window.paused = window.gameon
        = window.speed
        = 1;

    /**
     * A mudança de local não deve apagar o contador de programas
     * (para históricos importantes).
     */
    if (!nocount)
    {
        window.gamecount = 0;
    }

    /**
     * E quadrantes.
     */
    resetQuadrants();

    /**
     * Mantenha um histórico de teclas pressionadas.
     */
    window.gamehistory = [];

    /**
     * Áudio claro.
     */
    AudioPlayer.pause();
}

/**
 *
 */
function scrollWindow(x, y)
{
    x = x || 0;
    y = y || 0;

    var xinv = -x;
    var yinv = -y;

    gamescreen.left += x;
    gamescreen.right += x;
    gamescreen.top += y;
    gamescreen.bottom += y;

    shiftAll(characters, xinv, yinv);
    shiftAll(solids, xinv, yinv);
    shiftAll(scenery, xinv, yinv);
    shiftAll(QuadsKeeper.getQuadrants(), xinv, yinv);
    shiftElements(texts, xinv, yinv);

    QuadsKeeper.updateQuadrants(xinv);

    if (window.playediting)
    {
        scrollEditor(x, y);
    }
}

/**
 *
 */
function shiftAll(stuff, x, y)
{
    for (var i = stuff.length - 1; i >= 0; --i)
    {
        shiftBoth(stuff[i], x, y);
    }
}

/**
 *
 */
function shiftElements(stuff, x, y)
{
    for (var i = stuff.length - 1, elem; i >= 0; --i)
    {
        elem = stuff[i];
        elementShiftLeft(elem, x);
        elementShiftTop(elem, y);
    }
}

/**
 * Semelhante ao scrollWindow, mas salva o programa x-loc.
 */
function scrollPlayer(x, y, see)
{
    var saveleft = player.left;
    var savetop = player.top;

    y = y || 0;

    scrollWindow(x, y);
    setLeft(player, saveleft, see);
    setTop(player, savetop + y * unitsize, see);

    QuadsKeeper.updateQuadrants();
}

/**
 * Log de chamadas se window.verbosity tiver o tipo ativado.
 */
function mlog(type)
{
    if (verbosity[type])
    {
        log.apply(console, arguments);
    }
}
