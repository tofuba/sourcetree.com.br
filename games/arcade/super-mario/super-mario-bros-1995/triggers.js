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
 * Triggers.js.
 * Mantém o controle de acionadores, que consistem principalmente
 * em pressionamentos de teclas e mensagens, que seriam de uma IU
 * index.html.
 */

/**
 *
 */
function resetTriggers()
{
    /**
     * Faça o objeto de controles.
     */
    window.controls = new Controls({
        /**
         * [a] ~> esquerda.
         */
        left: [
            37,
            65,

            "AXIS_LEFT",
            "DPAD_LEFT"
        ],

        /**
         * [d] ~> direita.
         */
        right: [
            39,
            68,

            "AXIS_RIGHT",
            "DPAD_RIGHT"
        ],

        /**
         * [w] ~> cima.
         */
        up: [
            38,
            87,
            32,

            "FACE_1",
            "DPAD_UP",
            "LEFT_BOTTOM_SHOULDER"
        ],

        /**
         * [s] ~> baixo.
         */
        down: [
            40,
            83,

            "AXIS_DOWN",
            "DPAD_DOWN"
        ],

        /**
         * [shift, ctrl, f] ~> fogo.
         */
        sprint: [
            16,
            17,
            70,

            "FACE_1"
        ],

        /**
         * [p].
         */
        pause: [
            80,

            "START_FORWARD"
        ],

        /**
         * [m].
         */
        mute: [
            77
        ],

        /**
         * [q].
         */
        q: [
            81
        ],

        /**
         * [l].
         */
        l: [
            76
        ],
    });

    /**
     * Gamepad.js suporte para joysticks e controladores.
     */
    window.gamepad = new Gamepad();

    gamepad.bind(Gamepad.Event.BUTTON_DOWN, ControlsPipe("keydown", true));
    gamepad.bind(Gamepad.Event.BUTTON_UP, ControlsPipe("keyup", false));
    gamepad.bind(Gamepad.Event.AXIS_CHANGED, function(event)
    {
        var value = event.value;
        var value_abs = abs(value);

        /**
         * Não permita tremidinhas.
         */
        if (value_abs < 0.1)
        {
            return;
        }

        /**
         * Dependendo do eixo usado...
         */
        switch(event.axis)
        {
            /**
             * Modificação esquerda, vertical.
             */
            case "LEFT_STICK_Y":
            case "RIGHT_STICK_Y":
                /**
                 * Se realmente tiver uma direção, vá para cima ou para baixo.
                 */
                if (value_abs > 0.5)
                {
                    keydown(value > 0 ? "DPAD_DOWN" : "DPAD_UP");
                } else
                {
                    /**
                     * Não tem uma direção, então os dois não estão pressionados.
                     */
                    keyup("DPAD_UP");
                    keyup("DPAD_DOWN");
                }

                break;

            /**
             * Modificação esquerda, horizontal.
             */
            case "LEFT_STICK_X":
            case "RIGHT_STICK_X":
                /**
                 * Se realmente tiver uma direção, vá para a esquerda ou
                 * para a direita.
                 */
                if (value_abs > 0.5)
                {
                    keydown(value < 0 ? "DPAD_LEFT" : "DPAD_RIGHT");
                } else
                {
                    /**
                     * Não tem uma direção, então os dois não estão pressionados.
                     */
                    keyup("DPAD_UP");
                    keyup("DPAD_DOWN");
                }

                break;
        }
    });

    gamepad.init();

    /**
     * Defina os principais eventos na base.
     */
    proliferate(body, {
        onkeydown: ControlsPipe("keydown", true),
        onkeyup: ControlsPipe("keyup", false),
        oncontextmenu: contextmenu,
        onmousedown: mousedown
    });

    /**
     * Definir gatilhos de interface da pessoa.
     */
    setMessageTriggers();
}

/**
 * Tabela de hash para onkeydown e onkeyup.
 */
function Controls(pipes, gamepadPipes)
{
    /**
     * Pipes é uma lista de quais ações são canalizadas por quais
     * códigos de grafemas.
     */
    this.pipes = pipes;

    /**
     * As ações são canalizadas para o keydown ou keyup correspondente
     * por meio do ControlsPipe correspondente.
     */
    var keydown = this.keydown = {
        /**
         * Esquerda.
         */
        left: function(keys)
        {
            keys.run = -1;
            keys.left_down = true;
        },

        /**
         * Direita.
         */
        right: function(keys)
        {
            keys.run = 1;

            /**
             * Independente de mudanças player.keys.run.
             */
            keys.right_down = true;
        },

        /**
         * Subir/Pular.
         */
        up: function(keys)
        {
            keys.up = true;

            /**
             * if (player.canjump && !player.crouching && (player.resting || map.underwater)).
             */
            if (player.canjump && (player.resting || map.underwater))
            {
                keys.jump = 1;
                player.canjump = keys.jumplev = 0;

                /**
                 * Para fazer: a pessoa pode fazer um som de salto durante
                 * a primavera e durante as cenas do cano ?
                 */
                AudioPlayer.play(player.power > 1 ? "Jump Super" : "Jump Small");

                if (map.underwater)
                {
                    setTimeout(function()
                    {
                        player.jumping = keys.jump = false;
                    }, timer * 14);
                }
            }
        },

        /**
         * Abaixar/Agachar.
         */
        down: function(keys)
        {
            keys.crouch = true;
        },

        /**
         * Corrida/Fogo.
         */
        sprint: function(keys)
        {
            if (player.power == 3 && keys.sprint == 0 && !keys.crouch)
            {
                player.fire();
            }

            keys.sprint = 1;
        },

        /**
         * Pausar.
         */
        pause: function(keys)
        {
            if (!paused && !(window.editing && !editor.playing))
            {
                setTimeout(function()
                {
                    pause(true);
                }, 140);
            }
        },

        /**
         * Mute / Unmute.
         */
        mute: function(keys)
        {
            AudioPlayer.toggleMute();
        },

        /**
         * q.
         */
        q: function(keys)
        {
            if (++qcount > 28)
            {
                maxlulz();
            }

            switch(qcount)
            {
                case 7:
                    lulz();
                    break;

                case 14:
                    superlulz();
                    break;

                case 21:
                    hyperlulz();
                    break;
            }
        },

        /**
         *
         */
        l: function(keys)
        {
            toggleLuigi();
        }
    };

    /**
     *
     */
    var keyup = this.keyup = {
        /**
         * Esquerda.
         */
        left: function(keys)
        {
            keys.run = 0;
            keys.left_down = false;
        },

        /**
         * Direita.
         */
        right: function(keys)
        {
            keys.run = 0;
            keys.right_down = false;
        },

        /**
         * Alto.
         */
        up: function(keys)
        {
            if (!map.underwater)
            {
                keys.jump = keys.up = 0;
            }

            player.canjump = true;
        },

        /**
         * Baixo.
         */
        down: function(keys)
        {
            keys.crouch = 0;
            removeCrouch();
        },

        /**
         * Fogo.
         */
        sprint: function(keys)
        {
            keys.sprint = 0;
        },

        /**
         * Pausar (Se Pressionado).
         */
        pause: function(keys)
        {
            unpause(true);
        },
    }

    var tag;
    var codes;
    var code;
    var i;

    /**
     * Mapeie cada código de grafema em canos para o evento de tecla
     * correspondente. Para cada etiqueta ("up", "down"...).
     */
    for (tag in pipes)
    {
        /**
         * Para cada matriz de códigos de grafemas, como 38 (alto) ou 40 (baixo).
         */
        codes = pipes[tag];

        for (i in codes)
        {
            code = codes[i];

            /**
             * Esse código redireciona para a tag equivalente (38 -> "alto").
             */
            keydown[code] = keydown[tag];
            keyup[code] = keyup[tag];
        }
    }
}

/**
 * Gera um canal para o nome fornecido.
 * Por exemplo, ControlsPipe("keydown") canos para Controls.keydown.
 */
function ControlsPipe(name, strict)
{
    var responses = controls[name];

    return function(event)
    {
        if ((strict && ((player && player.dead) || window.paused)) || window.nokeys)
        {
            return;
        }

        /**
         * Permitir que isso seja usado como keyup(37) ou keyup({which: 37}).
         */
        if (typeof(event) != "number" || event.which || event.control)
        {
            event = event.which || event.control;
        }

        /**
         * Se houver uma resposta conhecida para esse código de grafema,
         * faça-o.
         */
        if (responses[event])
        {
            responses[event](player.keys);
        } else
        {
            /**
             * Caso contrário, só enviar se verbosity[name] for verdadeiro.
             */
            mlog(name, "Could not", name,  event);
        }

        /**
         * Registre isso na história.
         */
        window.gamehistory[gamecount] = [keydown, event];
    };
}

/**
 *
 */
function keydown(event)
{
    if ((player && player.dead) || window.paused || window.nokeys)
    {
        return;
    }

    var responses = controls["keydown"];

    /**
     * Permitir que isso seja usado como keyup(37) ou keyup({which: 37}).
     */
    if (typeof(event) === "object" || event.which)
    {
        event = event.which;
    }

    if (responses[event])
    {
        responses[event](player.keys);
    }

    window.gamehistory[gamecount] = [keydown, event];
}

/**
 *
 */
function keyup(event)
{
    if (window.nokeys)
    {
        return;
    }

    var responses = controls["keyup"];

    /**
     * Permitir que isso seja usado como keyup(37) ou keyup({which: 37}).
     */
    if (typeof(event) === "object" || event.which)
    {
        event = event.which;
    }

    if (responses[event])
    {
        responses[event](player.keys);
    }

    window.gamehistory[gamecount] = [keyup, event];
}

/**
 *
 */
function contextmenu(event)
{
    if (event.preventDefault)
    {
        event.preventDefault();
    }
}

/**
 *
 */
function mousedown(event)
{
    /**
     * Clique com o botão direito.
     */
    if (event.which == 3)
    {
        if (paused)
        {
            unpause();
        } else if ((!window.editor) || (!editing && !editor.playing))
        {
            pause(true);
        }

        if (event.preventDefault)
        {
            event.preventDefault();
        }
    }
}

/**
 *
 */
function scriptKeys(oldhistory)
{
    var i;
    var entry;

    for (i in oldhistory)
    {
        entry = oldhistory[i];

        TimeHandler.addEvent(entry[0], i, entry[1]);
        TimeHandler.addEvent(function()
        {
            alert(entry[0].name + ", " + entry[1]);
        }, i);
    }
}

/**
 *
 */
function lulz(options, timer)
{
    player.star = true;
    options = options || [Goomba];
    timer = timer || 7;

    TimeHandler.addEventInterval(function()
    {
        if (characters.length > 210)
        {
            return;
        }

        var lul = new Thing(options[randInt(options.length)], randBoolJS(), randBoolJS());

        lul.yvel = random() * -unitsizet4;
        lul.xvel = lul.speed = random() * unitsizet2 * randSign();
        addThing(lul, (32 * random() + 128) * unitsize, (88 * random()) * unitsize);
    }, timer, Infinity);
}

/**
 *
 */
function superlulz()
{
    lulz([
        Goomba,
        Koopa,
        Beetle,
        HammerBro,
        Lakitu,
        Podoboo,
        Blooper
    ]);
}

/**
 *
 */
function hyperlulz()
{
    lulz([Bowser], 21);
}

/**
 *
 */
function maxlulz()
{
    /**
     * Suspirar.
     *
     * window.palette = arrayShuffle(window.palette, 1);
     * clearAllSprites(true);
     */

    TimeHandler.addEventInterval(function(arr)
    {
        setAreaSetting(arr[randInt(arr.length)]);
    }, 7, Infinity, ["Overworld", "Underworld", "Underwater", "Sky", "Castle"]);
}

/**
 * Função para mapear uma nova chave para uma nova ação.
 */
function mapKeyToControl(action, keyCode)
{
    /**
     * verifique se esse mapeamento já existe.
     */
    if (window.controls.pipes[action].indexOf(keyCode) != -1)
    {
        return;
    }

    /**
     * Adicione a nova chave ao mapeamento atual.
     */
    window.controls.pipes[action].push(keyCode);

    var newPipes = window.controls.pipes;

    /**
     * Atualize os controles do programa.
     */
    window.controls = new Controls(newPipes);

    /**
     * Atualize os links entre os eventos e o programa.
     */
    proliferate(body, {
        onkeydown: ControlsPipe("keydown", true),
        onkeyup: ControlsPipe("keyup", false),
        oncontextmenu: contextmenu,
        onmousedown: mousedown
    });
}

/**
 * Gatilhos (de uma interface da pessoa).
 */
function setMessageTriggers()
{
    /**
     * Os plugs serão enviados por esses códigos.
     */
    var command_codes = {
        setMap: triggerSetMap,
        startEditor: function()
        {
            loadEditor();
        },

        toggleOption: function(data)
        {
            var name = "toggle" + data.option;
            console.log(name, window[name]);

            if (window[name])
            {
                window[name]();
            } else
            {
                log("Não foi possível alternar", name);
            }
        },

        /**
         *
         */
        setKey: function(data)
        {
            mapKeyToControl(data.action, data.keyCode);
        }
    };

    /**
     * Quando uma mensagem for recebida, envie-a para o código
     * do plug apropriado.
     */
    window.addEventListener("message", function(event)
    {
        var data = event.data;
        var type = data.type;

        /**
         * Se o tipo for conhecido, faça-o.
         */
        if (command_codes[type])
        {
            command_codes[type](data);
        } else
        {
            /**
             * Caso contrário, faça o envio.
             */
            console.log("Tipo de evento desconhecido recebido:", type, ".\n", data);
        }
    });
}

/**
 * A UI solicitou uma mudança de mapa.
 */
function triggerSetMap(data)
{
    clearPlayerStats();

    setMap.apply(this, data.map || []);
    setLives(3);
}
