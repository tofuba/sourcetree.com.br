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
 *
 */
var loadstart;

/**
 * Melhorias de segurança.
 */
var isLocal;

/**
 * Referências.
 */
var elemGame;
var game;
var body;
var elemSelect;


/**
 *
 */
function start()
{
    /**
     * Não comece duas vezes.
     */
    if (window.loadstart)
    {
        return;
    }

    window.loadstart = true;

    /**
     * Saber se isso está sendo um procedimento local.
     */
    setLocalStatus();

    /**
     * Referências rápidas da interface da pessoa.
     */
    setReferences();

    /**
     * Seleção de mapa.
     */
    setMapSelector();

    /**
     * Editor de camadas.
     */
    setLevelEditor();

    /**
     * Opções.
     */
    setOptions();

    /**
     * Menu de mapeamento de teclas.
     */
    setKeyMappingMenu();

    /**
     * Faça muitos amigos.
     */
    setCheats();
}

/**
 *
 */
function setLocalStatus()
{
    /**
     * Esse é o código origiral do jogo.
     *     window.isLocal = window.location.origin == "file://";
     *
     * Foi substituido por:
     *     window.isLocal = true;
     *
     * Porquê por alguma razão o firefox faz um bloqueio em modificações
     * do objeto `window` na DOM. Está trocando de fase normalmente, mas
     * existe muitas falhas lógicas ou falhas por falta de suporte que
     * simplesmente não vou corrigir !
     */
    window.isLocal = true;
}

/**
 *
 */
function setReferences()
{
    /**
     * Defina as referências do programa (elemGame não é o mesmo
     * que o campo de conteúdo).
     */
    window.elemGame = document.getElementById("game");
    window.game = window.elemGame.contentWindow;

    /**
     * Os programas locais podem não permitir travessuras contentWindow.
     */
    if (!isLocal)
    {
        window.game.parentwindow = window;
    }

    window.body = document.body;
    window.elemSelect = document.getElementById("in_mapselect");
}

/**
 *
 */
function setMapSelector(timed)
{
    /**
     * Se isso não estiver pronto e não estiver tentado antes, vamos
     * tentar novamente.
     */
    if (!window.elemSelect && !timed)
    {
        setTimeout(function()
        {
            setMapSelector(true);
        }, 350);
    }

    /**
     * Obtenha HTML de cada um dos blocos das 32 camadas em sequências.
     */
    var innerHTML = "",
        i,
        j;

    for (i = 1; i <= 8; ++i)
    {
        for (j = 1; j <= 4; ++j)
        {
            innerHTML += createAdderMap(i, j);
        }
    }

    /**
     * Adicione esse HTML a #in_mapselect, juntamente com um grande
     * para mapas aleatórios.
     */
    elemSelect.innerHTML += innerHTML + createAdderBigMap("Map Generator!", "setGameMapRandom");

    /**
     * Se isso não for local, é possível responder aos mapas de
     * carregamento do jogo. Consulte: load.js.
     */
    if (!isLocal)
    {
        /**
         * Isso permitirá onMapLoad.
         */
        game.parentwindow = window;

        /**
         * Se o jogo já tiver um mapa, defina a classe a ser carregada.
         */
        var elem;

        for (i = 1; i <= 8; ++i)
        {
            for (j = 1; j <= 4; ++j)
            {
                if (game["World" + i + String(j)] && (elem = document.getElementById("maprect" + i + "," + j)))
                {
                    elem.className = "maprect";
                }
            }
        }
    }
}

/**
 *
 */
function createAdderMap(i, j)
{
    var adder = "";

    adder += "<div class='maprectout'>";
    adder += "    <div id='maprect" + i + "," + j;
    adder += "' class='maprect" +  (isLocal ? "" : " off") + "' onclick='setGameMap(" + i + "," + j + ")'>";
    adder += i + "-" + j;
    adder += "    </div>";
    adder += "</div>";

    return adder;
}

/**
 *
 */
function createAdderBigMap(name, onclick, giant)
{
    var adder = "";

    adder += "<div class='maprectout'>";
    adder += "    <div class='maprect big " + (giant ? "giant" : "" ) + "' onclick='" + onclick + "()'>";
    adder += name;
    adder += "    </div>";
    adder += "</div>";

    return adder;
}

/**
 *
 */
function setGameMap(one, two)
{
    /**
     * Se ainda não foi carregado, não faça nada.
     */
    if (document.getElementById("maprect" + one + "," + two).className != "maprect")
    {
        return;
    }

    /**
     * Caso contrário, vá para o mapa.
     */
    game.postMessage({
        type: "setMap",
        map: [one, two]
    }, "*");

    game.focus();
}

/**
 * Consulte load.js.
 */
function onMapLoad(one, two)
{
    var elem = document.getElementById("maprect" + one + "," + two);

    if(elem)
    {
        elem.className = "maprect";
    }
}

/**
 *
 */
function setGameMapRandom()
{
    game.postMessage({
        type: "setMap",
        map: ["Random", "Overworld"]
    }, "*");

    game.focus();
}

/**
 *
 */
function setLevelEditor()
{
    var out = document.getElementById("in_editor"),
        blurb = "Por que usar o Editor ?<br>";

    button = createAdderBigMap("Faça seus<br>próprios níveis !", "startEditor", true);
    out.innerHTML += blurb + button + "<br>Você pode salvá-los como arquivos de texto quando terminar.";
}

/**
 *
 */
function startEditor()
{
    game.postMessage({
        type: "startEditor"
    }, "*");

    game.focus();
}

/**
 * Preenche o menu de opções com vários divs, cada um com um onclick
 * de toggleGame('XYZ').
 */
function setOptions()
{
    var out = document.getElementById("in_options");
    var options = [
        "Mute",
        "Luigi",
        "FastFWD"
    ];

    var output = "";
    var option;
    var i;

    for (i in options)
    {
        option = options[i];

        output += "<div class='maprectout' onclick='toggleGame(\"" + option + "\")'>"
        output += "    <div class='maprect big larger'>";
        output += "        Alternar " + option;
        output += "    </div>";
        output += "</div>";
        output += "<br>";
    }

    out.innerHTML += output + "<br>Mais em breve !";
}

/**
 * Preenche o menu de mapeamento de chaves com div e entrada
 * para alterar as chaves.
 */
function setKeyMappingMenu()
{
    var out = document.getElementById("in_keymapping");
    var keys = [
        "Up",
        "Down",
        "Left",
        "Right",
        "Sprint",
        "Pause",
        "Mute"
    ];

    var output = "";
    var key;
    var low;
    var i;

    for (i in keys)
    {
        key = keys[i];
        low = key.toLowerCase();

        output += "<div class='maprectout'>";
        output += "    <div class='maprect big larger'>" + key;
        output += "        <input onkeydown='setKey(event)' type='text' id='" + low + "' readonly>";
        output += "    </div>";
        output += "</div>";
        output += "<br>";
    }

    output += "<br>";
    out.innerHTML += output;
}

/**
 *
 */
function setKey(event)
{
    game.postMessage({
        type: "setKey",
        action: event.target.id,
        keyCode: event.keyCode
    }, "*");

    /**
     * Mostre o keyCode usado na interface da pessoa.
     */
    event.target.value = event.keyCode;
}

/**
 * toggleGame('XYZ') envia uma mensagem para o jogo para alternar XYZ.
 */
function toggleGame(me)
{
    game.postMessage({
        type: "toggleOption",
        option: me
    }, "*");
}

/**
 *
 */
function setCheats()
{
    var i;

    console.log("Olá, obrigado por jogar Super Mario Bros ! Vejo que está usando o console.");
    console.log("Não há realmente nenhuma maneira de impedi-lo de brincar, então se você quiser saber os truques comuns, entre \"displayCheats()\" aqui.");
    console.log("Se desejar, vá em frente e dê uma olhada no código-fonte. Existem algumas surpresas com as quais você pode se divertir...");
    console.log("http://localhost/html-games/super-mario");

    window.cheats = {
        Change_Map: "game.setMap([#,#] or #,#);",
        Change_Map_Location: "game.shiftToLocation(#);",
        Fast_Forward: "game.fastforward(amount; 1 by default);",
        Life: "game.gainLife(# amount or Infinity)",
        Low_Gravity: "game.player.gravity = game.gravity /= 2;",
        Lulz: "game.lulz();",
        Random_Map: "game.setMapRandom();",
        Shroom: "game.playerShroom(game.player)",
        Star_Power: "game.playerStar(game.player)",
        Unlimited_Time: "game.data.time.amount = Infinity;",
    }

    cheatsize = 0;

    for (var i in cheats)
    {
        cheatsize = Math.max(cheatsize, i.length);
    }
}

/**
 *
 */
function displayCheats()
{
    console.log("A propósito, eles são armazenados no objeto global 'cheats'.");

    for (i in cheats)
    {
        printCheat(i, cheats[i]);
    }

    return "Have fun!";
}

/**
 *
 */
function printCheat(name, text)
{
    for (i = cheatsize - name.length; i > 0; --i)
    {
        name += ".";
    }

    console.log(name.replace("_", " ") + "...... " + text);
}
