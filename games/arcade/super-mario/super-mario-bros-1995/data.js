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
 * Algumas funções para armazenar e exibir ~dados persistentes.
 *
 * "use strict";
 */

/**
 * window.data armazena as referências a dados e elementos.
 */
function resetData()
{
    /**
     * Verifique se não há exibição de dados já.
     */
    var check;

    if (check = document.getElementById("data_display"))
    {
        body.removeChild(check);
    }

    if (!window.data)
    {
        window.data = new Data();

        /**
         * setDataDisplay();
         */
    }
}

/**
 * Mantém as informações exibidas na tela.
 */
function Data()
{
    this.playerpower = 1;

    /**
     * Usado apenas para aleatório.
     */
    this.traveled = this.traveledold = 0;

    this.scorelevs = [
        100,
        200,
        400,
        500,
        800,
        1000,
        2000,
        4000,
        5000,
        8000
    ];

    this.score = new DataObject(0, 6, "SCORE");
    this.time = new DataObject(350, 3, "TIME");
    this.world = new DataObject(0, 0, "WORLD");
    this.coins = new DataObject(0, 0, "COINS");
    this.lives = new DataObject(3, 1, "LIVES");
    this.time.dir = -1;
    this.scoreold = 0;
}

/**
 * Mantém uma referência ao elemento HTML real em exibição.
 */
function DataObject(amount, length, name)
{
    this.amount = amount;
    this.length = length;
    this.name = name;
    this.element = createElement("td", {className: "indisplay"});
}

/**
 * Configura a exibição de dados na tela.
 */
function setDataDisplay()
{
    var display = createElement("table", {
        id: "data_display",
        className: "display",
        style: {
            width: (gamescreen.right + 14) + "px"
        }
    });

    var elems = [
        "score",
        "coins",
        "world",
        "time",
        "lives"
    ];

    body.appendChild(display);
    data.display = display;

    for (var i in elems)
    {
        display.appendChild(data[elems[i]].element);
        updateDataElement(data[elems[i]]);
    }

    body.appendChild(data.display);
}

/**
 * Limpar a tela significa simplesmente removêr da base.
 */
function clearDataDisplay()
{
    body.removeChild(data_display);
}

/**
 *
 */
function toggleLuigi()
{
    window.luigi = !window.luigi;
    localStorage.luigi = window.luigi;

    window.player.title = (window.luigi) ? "Luigi" : "Mario";
    setThingSprite(window.player);
}

/**
 * Inicia o intervalo de tempo de atualização dos dados.
 * 1 segundo jogo é sobre 25 * 16.667 = 416.675ms.
 */
function startDataTime()
{
    TimeHandler.addEventInterval(updateDataTime, 25, Infinity, data.time);
}

/**
 *
 */
function updateDataTime(me)
{
    /**
     * Se a direção do tempo não estiver correta (mapa aleatório),
     * verifique o tempo.
     */
    if(me.dir != 1)
    {
        if (me.amount == 100)
        {
            playCurrentThemeHurry();
        } else if(me.amount <= 0)
        {
            killPlayer(player, true);
        }
    }

    /**
     * Se o tempo ainda estiver ativado, altere-o em 1.
     */
    if (!notime)
    {
        map.time = me.amount += me.dir;
        updateDataElement(me);
    }
}

/**
 * Atualiza um DataObject típico para seu valor.
 */
function updateDataElement(me)
{
    var text = me.name + "<br>" + (me.amount == "Infinity" ? "Inf" : me.amount);

    me.element.innerHTML = text;

    /**
     * if (text.length > 14)
     * {
     *     me.element.style.width = "490px";
     * } else
     */
    me.element.style.width = "";
}

/**
 *
 */
function score(me, amount, appears)
{
    /**
     * Não faça valores negativos.
     */
    if (amount <= 0)
    {
        return;
    }

    /**
     * Se estiver na forma 'score(X)', devolve 'score(player, x)'.
     */
    if (arguments.length == 1)
    {
        return score(player, me);
    }

    /**
     * Mantenha a pontuação alta em localStorage, porque não.
     */
    localStorage.highscore = max(localStorage.highscore, data.score.amount += amount);

    /**
     * Se aparecer, adicione o elemento.
     */
    if (appears)
    {
        var text = addText(amount, me.left, me.top);
            text.yvel = -unitsized4;

        TimeHandler.addEvent(killScore, 49, text);
    }

    while (data.score > 10000)
    {
        /**
         * Nunca se sabe...
         */

        gainLife();
        data.score.amount = data.score.amount % 10000;
    }

    updateDataElement(data.score);
}

/**
 *
 */
function killScore(text)
{
    if (body.contains(text))
    {
        body.removeChild(text);
    }

    killNormal(text);
    deleteThing(text, texts, texts.indexOf(text));
}

/**
 *
 */
function findScore(lev)
{
    if (lev < data.scorelevs.length)
    {
        return data.scorelevs[lev];
    }

    gainLife();

    return -1;
}

/**
 *
 */
function gainLife(num, nosound)
{
    data.lives.amount += typeof(num) == "number" ? num : 1;

    if (!nosound)
    {
        AudioPlayer.play("Gain Life");
    }

    updateDataElement(data.lives);
}

/**
 *
 */
function setLives(num)
{
    data.lives.amount = Number(num);
    updateDataElement(data.lives);
}

/**
 *
 */
function storePlayerStats()
{
    data.playerpower = player.power;
}

/**
 *
 */
function clearPlayerStats()
{
    data.playerpower = player.power = 1;
}
