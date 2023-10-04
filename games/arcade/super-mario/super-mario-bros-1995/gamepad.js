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
(function(exports)
{
    'use strict';

    /**
     * Uma função nula - não faz nada, não retorna nada.
     */
    var nullFunction = function()
    {
    };

    /**
     * A plataforma nula, que não suporta nada.
     */
    var nullPlatform = {
        getType: function()
        {
            return 'null';
        },

        isSupported: function()
        {
            return false;
        },

        update: nullFunction
    };

    /**
     * Essa estratégia usa uma função de timer para chamar uma
     * função de atualização. A função timer (re)start pode ser
     * fornecida ou a estratégia reverte para uma das variantes
     * window.*requestAnimationFrame.
     *
     * @class AnimFrameUpdateStrategy
     * @constructor
     * @param {Function} [requestAnimationFrame] função a ser usada para criação de timer.
     * @module Gamepad
     */
    var AnimFrameUpdateStrategy = function(requestAnimationFrame)
    {
        var that = this;
        var win = window;

        this.update = nullFunction;
        this.requestAnimationFrame = requestAnimationFrame ||
            win.requestAnimationFrame ||
            win.webkitRequestAnimationFrame ||
            win.mozRequestAnimationFrame;

        /**
         * Este método chama a atualização (da pessoa) e se reinicia.
         *
         * @method tickFunction
         */
        this.tickFunction = function()
        {
            that.update();
            that.startTicker();
        };

        /**
         * (Re)Starts the ticker.
         *
         * @method startTicker
         */
        this.startTicker = function()
        {
            that.requestAnimationFrame.apply(win, [that.tickFunction]);
        };
    };

    /**
     * Inicia a estratégia de atualização usando a função fornecida.
     *
     * @method start
     * @param {Function} updateFunction a função a ser chamada a cada atualização.
     */
    AnimFrameUpdateStrategy.prototype.start = function(updateFunction)
    {
        this.update = updateFunction || nullFunction;
        this.startTicker();
    };

    /**
     * Essa estratégia dá a pessoa a capacidade de chamar a função
     * de atualização interna da biblioteca mediante solicitação. Use
     * esta estratégia se você já tiver uma função de timer em procedimento
     * por requestAnimationFrame e precisar de um controle preciso sobre
     * quando os gamepads são atualizados.
     *
     * @class ManualUpdateStrategy
     * @constructor
     * @module Gamepad
     */
    var ManualUpdateStrategy = function()
    {
    };

    /**
     * Chama a função de atualização no estado iniciado.
     * Não faz nada de outra forma.
     *
     * @method update
     */
    ManualUpdateStrategy.prototype.update = nullFunction;

    /**
     * Inicia a estratégia de atualização usando a função dada.
     *
     * @method start
     * @param {Function} updateFunction a função a ser chamada a cada atualização.
     */
    ManualUpdateStrategy.prototype.start = function(updateFunction)
    {
        this.update = updateFunction || nullFunction;
    };

    /**
     * Esta plataforma é para ambientes baseados em webkit que precisam ser
     * pesquisados para atualizações.
     *
     * @class WebKitPlatform
     * @constructor
     * @param {Object} ouvinte o ouvinte para fornecer os callbacks _connect e _disconnect.
     * @param {Function} gamepadGetter a função de votação para retornar um vetor de gamepads conectados.
     * @module Gamepad
     */
    var WebKitPlatform = function(listener, gamepadGetter)
    {
        this.listener = listener;
        this.gamepadGetter = gamepadGetter;
        this.knownGamepads = [];
    };

    /**
     * Fornece um objeto de plataforma que retorna true para is isSupported() se válido.
     *
     * @method factory
     * @static
     * @param {Object} ouvinte o ouvinte a usar.
     * @return {Object} um objeto de plataforma.
     */
    WebKitPlatform.factory = function(listener)
    {
        var platform = nullPlatform;
        var navigator = window && window.navigator;

        if (navigator)
        {
            if (typeof(navigator.webkitGamepads) !== 'undefined')
            {
                platform = new WebKitPlatform(listener, function()
                {
                    return navigator.webkitGamepads;
                });
            } else if (typeof(navigator.webkitGetGamepads) !== 'undefined')
            {
                platform = new WebKitPlatform(listener, function()
                {
                    return navigator.webkitGetGamepads();
                });
            }
        }

        return platform;
    };

    /**
     * @method getType()
     * @static
     * @return {String} 'WebKit'
     */
    WebKitPlatform.getType = function()
    {
        return 'WebKit';
    },

    /**
     * @method getType()
     * @return {String} 'WebKit'
     */
    WebKitPlatform.prototype.getType = function()
    {
        return WebKitPlatform.getType();
    },

    /**
     * @method isSupported
     * @return {Boolean} true
     */
    WebKitPlatform.prototype.isSupported = function()
    {
        return true;
    };

    /**
     * Consulta os gamepads atualmente conectados e relata
     * quaisquer alterações.
     *
     * @method update
     */
    WebKitPlatform.prototype.update = function()
    {
        var that = this;
        var gamepads = Array.prototype.slice.call(this.gamepadGetter(), 0);
        var gamepad;
        var i;

        for (i = this.knownGamepads.length - 1; i >= 0; i--)
        {
            gamepad = this.knownGamepads[i];

            if (gamepads.indexOf(gamepad) < 0)
            {
                this.knownGamepads.splice(i, 1);
                this.listener._disconnect(gamepad);
            }
        }

        for (i = 0; i < gamepads.length; i++)
        {
            gamepad = gamepads[i];

            if (gamepad && (that.knownGamepads.indexOf(gamepad) < 0))
            {
                that.knownGamepads.push(gamepad);
                that.listener._connect(gamepad);
            }
        }
    };

    /**
     * Esta plataforma é para ambientes baseados em mozilla que
     * fornecem atualizações de gamepad por meio de eventos.
     *
     *
     * @class FirefoxPlatform
     * @constructor
     * @module Gamepad
     */
    var FirefoxPlatform = function(listener)
    {
        this.listener = listener;

        window.addEventListener('gamepadconnected', function(e)
        {
            listener._connect(e.gamepad);
        });

        window.addEventListener('gamepaddisconnected', function(e)
        {
            listener._disconnect(e.gamepad);
        });
    };

    /**
     * Fornece um objeto de plataforma que retorna true para is isSupported()
     * se válido.
     *
     * @method factory
     * @static
     * @param {Object} listener the listener to use
     * @return {Object} a platform object
     */
    FirefoxPlatform.factory = function(listener)
    {
        var platform = nullPlatform;

        if (window && (typeof(window.addEventListener) !== 'undefined'))
        {
            platform = new FirefoxPlatform(listener);
        }

        return platform;
    };

    /**
     * @method getType()
     * @static
     * @return {String} 'Firefox'
     */
    FirefoxPlatform.getType = function()
    {
        return 'Firefox';
    },

    /**
     * @method getType()
     * @return {String} 'Firefox'
     */
    FirefoxPlatform.prototype.getType = function()
    {
        return FirefoxPlatform.getType();
    },

    /**
     * @method isSupported
     * @return {Boolean} true
     */
    FirefoxPlatform.prototype.isSupported = function()
    {
        return true;
    };

    /**
     * Não faz nada na plataforma Firefox.
     *
     * @method update
     */
    FirefoxPlatform.prototype.update = nullFunction;

    /**
     * Fornece interface simples e suporte multiplataforma para
     * a API do gamepad.
     *
     * Você pode alterar os parâmetros deadzone e maximizeThreshold para
     * se adequar ao seu gosto, mas as especificações geralmente devem
     * funcionar bem.
     *
     * @class Gamepad
     * @constructor
     * @param {Object} [updateStrategy] uma estratégia de atualização, padronizando para.
     *     {{#crossLink "AnimFrameUpdateStrategy"}}{{/crossLink}}
     * @module Gamepad
     * @author {{ nome_do_autor(); }}
     */
    var Gamepad = function(updateStrategy)
    {
        this.updateStrategy = updateStrategy || new AnimFrameUpdateStrategy();
        this.gamepads = [];
        this.listeners = {};
        this.platform = nullPlatform;
        this.deadzone = 0.03;
        this.maximizeThreshold = 0.97;
    };

    /**
     * As estratégias de atualização disponíveis.
     *
     * @property UpdateStrategies
     * @param {AnimFrameUpdateStrategy} AnimFrameUpdateStrategy
     * @param {ManualUpdateStrategy} ManualUpdateStrategy
     */
    Gamepad.UpdateStrategies = {
        AnimFrameUpdateStrategy: AnimFrameUpdateStrategy,
        ManualUpdateStrategy: ManualUpdateStrategy
    };

    /**
     * Lista de fábricas de plataformas suportadas.
     * Plataformas atualmente disponíveis:
     *
     * {{#crossLink "WebKitPlatform"}}{{/crossLink}},
     * {{#crossLink "FirefoxPlatform"}}{{/crossLink}},
     * @property PlatformFactories
     * @type {Array}
     */
    Gamepad.PlatformFactories = [
        WebKitPlatform.factory,
        FirefoxPlatform.factory
    ];

    /**
     * Lista de tipos de controlador suportados.
     *
     * @property Type
     * @param {String} Type.PLAYSTATION Playstation controller
     * @param {String} Type.LOGITECH Logitech controller
     * @param {String} Type.XBOX XBOX controller
     * @param {String} Type.UNKNOWN Unknown controller
     */
    Gamepad.Type = {
        PLAYSTATION: 'playstation',
        LOGITECH: 'logitech',
        XBOX: 'xbox',
        UNKNOWN: 'unknown'
    };

    /**
     * Lista de eventos que você pode esperar da biblioteca.
     *
     * CONNECTED, DISCONNECTED e UNSUPPORTED os eventos incluem
     * o gamepad em questão e o tick fornece a lista de todos os
     * gamepads conectados.
     *
     * BUTTON_DOWN e BUTTON_UP. Os eventos fornecem uma alternativa
     * aos estados do botão de pesquisa em cada tick.
     *
     * AXIS_CHANGED é chamado se um valor de algum eixo específico mudar.
     */
    Gamepad.Event = {
        /**
         * Acionado quando um novo controlador se conecta.
         *
         * @event connected
         * @param {Object} device
         */
        CONNECTED: 'connected',

        /**
         * Chamado quando um controlador incompatível se conecta.
         *
         * @event unsupported
         * @param {Object} device
         * @deprecated não é mais usado. Qualquer controlador é suportado.
         */
        UNSUPPORTED: 'unsupported',

        /**
         * Acionado quando um controlador se desconecta.
         *
         * @event disconnected
         * @param {Object} device
         */
        DISCONNECTED: 'disconnected',

        /**
         * Chamado regularmente com as informações mais recentes
         * dos controladores.
         *
         * @event tick
         * @param {Array} gamepads
         */
        TICK: 'tick',

        /**
         * Chamado quando um botão do gamepad é pressionado.
         *
         * @event button-down
         * @param {Object} event
         * @param {Object} event.gamepad O objeto gamepad.
         * @param {String} event.control Nome do controle.
         */
        BUTTON_DOWN: 'button-down',

        /**
         * Chamado quando um botão do gamepad é liberado.
         *
         * @event button-up
         * @param {Object} event
         * @param {Object} event.gamepad O objeto gamepad.
         * @param {String} event.control Nome do controle.
         */
        BUTTON_UP: 'button-up',

        /**
         * Chamado quando o valor do eixo do gamepad é alterado.
         *
         * @event axis-changed
         * @param {Object} event
         * @param {Object} event.gamepad O objeto gamepad.
         * @param {String} event.axis Nome Axis.
         * @param {Number} event.value Novo Valor Axis.
         */
        AXIS_CHANGED: 'axis-changed'
    };

    /**
     * Lista de nomes de botões comum.
     * O índice é o índice de botão comum de acordo com a especificação.
     *
     * @property StandardButtons
     */
    Gamepad.StandardButtons = [
        'FACE_1',
        'FACE_2',
        'FACE_3',
        'FACE_4',
        'LEFT_TOP_SHOULDER',
        'RIGHT_TOP_SHOULDER',
        'LEFT_BOTTOM_SHOULDER',
        'RIGHT_BOTTOM_SHOULDER',
        'SELECT_BACK',
        'START_FORWARD',
        'LEFT_STICK',
        'RIGHT_STICK',
        'DPAD_UP',
        'DPAD_DOWN',
        'DPAD_LEFT',
        'DPAD_RIGHT',
        'HOME'
    ];

    /**
     * Lista de nomes de eixo comum.
     * O índice é o índice de eixo comum de acordo com a especificação.
     *
     * @property StandardAxes.
     */
    Gamepad.StandardAxes = [
        'LEFT_STICK_X',
        'LEFT_STICK_Y',
        'RIGHT_STICK_X',
        'RIGHT_STICK_Y'
    ];

    var getControlName = function(names, index, extraPrefix)
    {
        return (index < names.length) ? names[index] : extraPrefix + (index - names.length + 1);
    };

    /**
     * O mapeamento comum que representa o mapeamento conforme
     * a definição. Cada botão e eixo são mapeados para o mesmo
     * índice.
     *
     * @property StandardMapping.
     */
    Gamepad.StandardMapping = {
        env: {
        },

        buttons: {
            byButton: [
                0,
                1,
                2,
                3,
                4,
                5,
                6,
                7,
                8,
                9,
                10,
                11,
                12,
                13,
                14,
                15,
                16
            ]
        },

        axes: {
            byAxis: [
                0,
                1,
                2,
                3
            ]
        }
    };

    /**
     * O mapeamento de vários gamepads que diferem do mapeamento comum
     * em diferentes plataformas também unifica seus botões e eixos.
     *
     * Cada mapeamento deve ter um objeto 'env', que descreve o ambiente
     * no qual o mapeamento está ativo. Quanto mais entradas esse ambiente
     * tiver, mais específico ele será.
     *
     * Os mapeamentos são expressos para botões e eixos. Botões podem se
     * referir a eixos se forem notificados como tal.
     *
     * @property Mappings
     */
    Gamepad.Mappings = [
        /**
         * Controle de PS3 no Firefox.
         */
        {
            env: {
                platform: FirefoxPlatform.getType(),
                type: Gamepad.Type.PLAYSTATION
            },

            buttons: {
                byButton: [
                    14,
                    13,
                    15,
                    12,
                    10,
                    11,
                    8,
                    9,
                    0,
                    3,
                    1,
                    2,
                    4,
                    6,
                    7,
                    5,
                    16
                ]
            },

            axes: {
                byAxis: [
                    0,
                    1,
                    2,
                    3
                ]
            }
        },

        /**
         * Gamepad Logitech no WebKit.
         */
        {
            env: {
                platform: WebKitPlatform.getType(),
                type: Gamepad.Type.LOGITECH
            },

            buttons: {
                /**
                 * Questão: isso não pode estar certo - LEFT/RIGHT_STICK
                 * têm os mesmos mapeamentos que HOME/DPAD_UP.
                 */
                byButton: [
                    1,
                    2,
                    0,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8,
                    9,
                    10,
                    11,
                    11,
                    12,
                    13,
                    14,
                    10
                ]
            },

            axes: {
                byAxis: [
                    0,
                    1,
                    2,
                    3
                ]
            }
        },

        /**
         * Gamepad Logitech no Firefox.
         */
        {
            env: {
                platform: FirefoxPlatform.getType(),
                type: Gamepad.Type.LOGITECH
            },

            buttons: {
                byButton: [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    -1,
                    -1,
                    6,
                    7,
                    8,
                    9,
                    11,
                    12,
                    13,
                    14,
                    10
                ],

                byAxis: [
                    -1,
                    -1,
                    -1,
                    -1,
                    -1,
                    -1,
                    [
                        2,
                        0,
                        1
                    ],
                    [
                        2,
                        0,
                        -1
                    ]
                ]
            },

            axes: {
                byAxis: [
                    0,
                    1,
                    3,
                    4
                ]
            }
        }
    ];

    /**
     * Inicializa o gamepad.
     *
     * Normalmente, você deseja vincular os eventos primeiro e, em
     * seguida, inicializá-lo.
     *
     * @method init
     * @return {Boolean} true se uma plataforma de suporte foi detectada, false caso contrário.
     */
    Gamepad.prototype.init = function()
    {
        var platform = Gamepad.resolvePlatform(this);
        var that = this;

        this.platform = platform;
        this.updateStrategy.start(function()
        {
            that._update();
        });

        return platform.isSupported();
    };

    /**
     * Vincula um ouvinte a um evento de gamepad.
     *
     * @method bind
     * @param {String} event Evento ao qual se vincular, um dos Gamepad.Event..
     * @param {Function} listener Ouvinte a ser chamado quando determinado evento ocorre.
     * @return {Gamepad} Self.
     */
    Gamepad.prototype.bind = function(event, listener)
    {
        if (typeof(this.listeners[event]) === 'undefined')
        {
            this.listeners[event] = [];
        }

        this.listeners[event].push(listener);

        return this;
    };

    /**
     * Remove o ouvinte de determinado tipo.
     *
     * Se nenhum tipo for fornecido, todos os ouvintes serão removidos.
     * Se nenhum ouvinte for fornecido, todos os ouvintes de determinado
     * tipo serão removidos.
     *
     * @method unbind
     * @param {String} [type] Tipo de ouvinte a ser removido.
     * @param {Function} [listener] A função de ouvinte a ser removida.
     * @return {Boolean} A desvinculação do ouvinte foi bem-sucedida.
     */
    Gamepad.prototype.unbind = function(type, listener)
    {
        if (typeof(type) === 'undefined')
        {
            this.listeners = {};

            return;
        }

        if (typeof(listener) === 'undefined')
        {
            this.listeners[type] = [];

            return;
        }

        if (typeof(this.listeners[type]) === 'undefined')
        {
            return false;
        }

        for (var i = 0; i < this.listeners[type].length; i++)
        {
            if (this.listeners[type][i] === listener)
            {
                this.listeners[type].splice(i, 1);

                return true;
            }
        }

        return false;
    };

    /**
     * Retorna o número de gamepads conectados.
     *
     * @method count
     * @return {Number}
     */
    Gamepad.prototype.count = function()
    {
        return this.gamepads.length;
    };

    /**
     * Faz o envio de um evento interno com dados fornecidos.
     *
     * @method _fire
     * @param {String} event Evento para enviar, um dos Gamepad.Event..
     * @param {*} data Dados a serem passados para o ouvinte.
     * @private
     */
    Gamepad.prototype._fire = function(event, data)
    {
        if (typeof(this.listeners[event]) === 'undefined')
        {
            return;
        }

        for (var i = 0; i < this.listeners[event].length; i++)
        {
            this.listeners[event][i].apply(this.listeners[event][i], [data]);
        }
    };

    /**
     * @method getNullPlatform.
     * @static
     * @return {Object} uma plataforma que não suporta nada.
     */
    Gamepad.getNullPlatform = function()
    {
        return Object.create(nullPlatform);
    };

    /**
     * Resolve plataforma.
     *
     * @method resolvePlatform.
     * @static
     * @param listener {Object} o ouvinte para lidar com _connect() ou chamadas _disconnect().
     * @return {Object} Uma instância de plataforma.
     */
    Gamepad.resolvePlatform = function(listener)
    {
        var platform = nullPlatform;
        var i;

        for (i = 0; !platform.isSupported() && (i < Gamepad.PlatformFactories.length); i++)
        {
            platform = Gamepad.PlatformFactories[i](listener);
        }

        return platform;
    };

    /**
     * Registra determinado gamepad.
     *
     * @method _connect
     * @param {Object} gamepad Gamepad para conectar.
     * @private
     */
    Gamepad.prototype._connect = function(gamepad)
    {
        var mapping = this._resolveMapping(gamepad);
        var count;
        var i;

        /**
         * gamepad.mapping = this._resolveMapping(gamepad);
         */
        gamepad.state = {};
        gamepad.lastState = {};
        gamepad.updater = [];

        count = mapping.buttons.byButton.length;

        for (i = 0; i < count; i++)
        {
            this._addButtonUpdater(gamepad, mapping, i);
        }

        count = mapping.axes.byAxis.length;

        for (i = 0; i < count; i++)
        {
            this._addAxisUpdater(gamepad, mapping, i);
        }

        this.gamepads[gamepad.index] = gamepad;
        this._fire(Gamepad.Event.CONNECTED, gamepad);
    };

    /**
     * Adiciona um atualizador para um controle de botão.
     *
     * @method _addButtonUpdater
     * @private
     * @param {Object} gamepad o gamepad para o qual criar o atualizador.
     * @param {Object} mapping o mapeamento no qual trabalhar.
     * @param {Number} index índice de botões.
     */
    Gamepad.prototype._addButtonUpdater = function(gamepad, mapping, index)
    {
        var updater = nullFunction;
        var controlName = getControlName(Gamepad.StandardButtons, index, 'EXTRA_BUTTON_');
        var getter = this._createButtonGetter(gamepad, mapping.buttons, index);
        var that = this;

        var buttonEventData = {
            gamepad: gamepad,
            control: controlName
        };

        gamepad.state[controlName] = 0;
        gamepad.lastState[controlName] = 0;

        updater = function()
        {
            var value = getter();
            var lastValue = gamepad.lastState[controlName];
            var isDown = value > 0.5;
            var wasDown = lastValue > 0.5;

            gamepad.state[controlName] = value;

            if (isDown && !wasDown)
            {
                that._fire(Gamepad.Event.BUTTON_DOWN, Object.create(buttonEventData));
            } else if (!isDown && wasDown)
            {
                that._fire(Gamepad.Event.BUTTON_UP, Object.create(buttonEventData));
            }

            if ((value !== 0) && (value !== 1) && (value !== lastValue))
            {
                that._fireAxisChangedEvent(gamepad, controlName, value);
            }

            gamepad.lastState[controlName] = value;
        };

        gamepad.updater.push(updater);
    };

    /**
     * Adiciona um atualizador para um controle de eixo.
     *
     * @method _addAxisUpdater
     * @private
     * @param {Object} gamepad o gamepad para o qual criar o atualizador.
     * @param {Object} mapping o mapeamento no qual trabalhar.
     * @param {Number} index índice de eixo.
     */
    Gamepad.prototype._addAxisUpdater = function(gamepad, mapping, index)
    {
        var updater = nullFunction;
        var controlName = getControlName(Gamepad.StandardAxes, index, 'EXTRA_AXIS_');
        var getter = this._createAxisGetter(gamepad, mapping.axes, index);
        var that = this;

        gamepad.state[controlName] = 0;
        gamepad.lastState[controlName] = 0;

        updater = function()
        {
            var value = getter();
            var lastValue = gamepad.lastState[controlName];

            gamepad.state[controlName] = value;

            if ((value !== lastValue))
            {
                that._fireAxisChangedEvent(gamepad, controlName, value);
            }

            gamepad.lastState[controlName] = value;
        };

        gamepad.updater.push(updater);
    };

    /**
     * Envia um evento AXIS_CHANGED.
     *
     * @method _fireAxisChangedEvent.
     * @private
     * @param {Object} gamepad o gamepad para notificar para.
     * @param {String} controlName nome do controle que altera seu valor.
     * @param {Number} value o novo valor.
     */
    Gamepad.prototype._fireAxisChangedEvent = function(gamepad, controlName, value)
    {
        var eventData = {
            gamepad: gamepad,
            axis: controlName,
            value: value
        };

        this._fire(Gamepad.Event.AXIS_CHANGED, eventData);
    };

    /**
     * Cria um getter de acordo com a entrada de mapeamento para o
     * índice específico. Entradas suportadas atualmente:
     *
     * buttons.byButton[index]: Number := Index into gamepad.buttons; -1 tests byAxis
     * buttons.byAxis[index]: Array := [Index into gamepad.axes; Zero Value, One Value]
     *
     * @method _createButtonGetter
     * @private
     * @param {Object} gamepad o gamepad para o qual criar um getter.
     * @param {Object} buttons a entrada de mapeamentos para os botões.
     * @param {Number} index a entrada do botão específico.
     * @return {Function} um getter retornando o valor para o botão solicitado.
     */
    Gamepad.prototype._createButtonGetter = (function()
    {
        var nullGetter = function()
        {
            return 0;
        };

        var createRangeGetter = function(valueGetter, from, to)
        {
            var getter = nullGetter;

            if (from < to)
            {
                getter = function()
                {
                    var range = to - from;
                    var value = valueGetter();

                    value = (value - from) / range;

                    return (value < 0) ? 0 : value;
                };
            } else if (to < from)
            {
                getter = function()
                {
                    var range = from - to;
                    var value = valueGetter();

                    value = (value - to) / range;

                    return (value > 1) ? 0 : (1 - value);
                };
            }

            return getter;
        };

        var isArray = function(thing)
        {
            return Object.prototype.toString.call(thing) === '[object Array]';
        };

        return function(gamepad, buttons, index)
        {
            var getter = nullGetter;
            var entry;
            var that = this;

            entry = buttons.byButton[index];

            if (entry !== -1)
            {
                if ((typeof(entry) === 'number') && (entry < gamepad.buttons.length))
                {
                    getter = function()
                    {
                        return gamepad.buttons[entry];
                    };
                }
            } else if (buttons.byAxis && (index < buttons.byAxis.length))
            {
                entry = buttons.byAxis[index];

                if (isArray(entry) && (entry.length == 3) && (entry[0] < gamepad.axes.length))
                {
                    getter = function()
                    {
                        var value = gamepad.axes[entry[0]];

                        return that._applyDeadzoneMaximize(value);
                    };

                    getter = createRangeGetter(getter, entry[1], entry[2]);
                }
            }

            return getter;
        };
    })();

    /**
     * Cria um getter de acordo com a entrada de mapeamento para o
     * índice específico. Entradas suportadas atualmente:
     *
     * axes.byAxis[index]: Number := Index into gamepad.axes; -1 ignored.
     *
     * @method _createAxisGetter
     * @private
     * @param {Object} gamepad o gamepad para o qual criar um getter.
     * @param {Object} axes a entrada de mapeamentos para os eixos.
     * @param {Number} index a entrada do eixo específico.
     * @return {Function} um getter retornando o valor para o eixo solicitado.
     */
    Gamepad.prototype._createAxisGetter = (function()
    {
        var nullGetter = function()
        {
            return 0;
        };

        return function(gamepad, axes, index)
        {
            var getter = nullGetter;
            var entry;
            var that = this;

            entry = axes.byAxis[index];

            if (entry !== -1)
            {
                if ((typeof(entry) === 'number') && (entry < gamepad.axes.length))
                {
                    getter = function()
                    {
                        var value = gamepad.axes[entry];

                        return that._applyDeadzoneMaximize(value);
                    };
                }
            }

            return getter;
        };
    })();

    /**
     * Desconecta de determinado gamepad.
     *
     * @method _disconnect
     * @param {Object} gamepad Gamepad para desconectar.
     * @private
     */
    Gamepad.prototype._disconnect = function(gamepad)
    {
        var newGamepads = [];
        var i;

        if (typeof(this.gamepads[gamepad.index]) !== 'undefined')
        {
            delete this.gamepads[gamepad.index];
        }

        for (i = 0; i < this.gamepads.length; i++)
        {
            if (typeof(this.gamepads[i]) !== 'undefined')
            {
                newGamepads[i] = this.gamepads[i];
            }
        }

        this.gamepads = newGamepads;
        this._fire(Gamepad.Event.DISCONNECTED, gamepad);
    };

    /**
     * Resolve o tipo de controlador de seu id.
     *
     * @method _resolveControllerType.
     * @param {String} id Controller id.
     * @return {String} Tipo de controlador, um dos Gamepad.Type.
     * @private
     */
    Gamepad.prototype._resolveControllerType = function(id)
    {
        id = id.toLowerCase();

        if (id.indexOf('playstation') !== -1)
        {
            return Gamepad.Type.PLAYSTATION;
        } else if (id.indexOf('logitech') !== -1 || id.indexOf('wireless gamepad') !== -1)
        {
            return Gamepad.Type.LOGITECH;
        } else if (id.indexOf('xbox') !== -1 || id.indexOf('360') !== -1)
        {
            return Gamepad.Type.XBOX;
        } else
        {
            return Gamepad.Type.UNKNOWN;
        }
    };

    /**
     * @method _resolveMapping.
     * @private
     * @param {Object} gamepad o gamepad para o qual resolver o mapeamento.
     * @return {Object} um objeto de mapeamento para o gamepad fornecido.
     */
    Gamepad.prototype._resolveMapping = function(gamepad)
    {
        var mappings = Gamepad.Mappings;
        var mapping = null;

        var env = {
            platform: this.platform.getType(),
            type: this._resolveControllerType(gamepad.id)
        };

        var i;
        var test;

        for (i = 0; !mapping && (i < mappings.length); i++)
        {
            test = mappings[i];

            if (Gamepad.envMatchesFilter(test.env, env))
            {
                mapping = test;
            }
        }

        return mapping || Gamepad.StandardMapping;
    };

    /**
     * @method envMatchesFilter.
     * @static
     * @param {Object} filtre o objeto de filtro que descreve as propriedades para corresponder.
     * @param {Object} env o objeto de ambiente que corresponde ao filtro.
     * @return {Boolean} true se env for coberto pelo filtro.
     */
    Gamepad.envMatchesFilter = function(filter, env)
    {
        var result = true;
        var field;

        for (field in filter)
        {
            if (filter[field] !== env[field])
            {
                result = false;
            }
        }

        return result;
    };

    /**
     * Atualiza os controladores, disparando eventos TICK.
     *
     * @method _update
     * @private
     */
    Gamepad.prototype._update = function()
    {
        this.platform.update();

        this.gamepads.forEach(function(gamepad)
        {
            if (gamepad)
            {
                gamepad.updater.forEach(function(updater)
                {
                    updater();
                });
            }
        });

        if (this.gamepads.length > 0)
        {
            this._fire(Gamepad.Event.TICK, this.gamepads);
        }
    },

    /**
     * Aplica zona escura e maximização.
     *
     * Você pode alterar os limites por meio dos membros deadzone
     * e maximizeThreshold.
     *
     * @method _applyDeadzoneMaximize.
     * @param {Number} value Valor a modificar.
     * @param {Number} [deadzone] Deadzone para aplicar.
     * @param {Number} [maximizeThreshold] A partir de qual valor maximizar o valor.
     * @private
     */
    Gamepad.prototype._applyDeadzoneMaximize = function(value, deadzone, maximizeThreshold)
    {
        deadzone = typeof(deadzone) !== 'undefined' ? deadzone : this.deadzone;
        maximizeThreshold = typeof(maximizeThreshold) !== 'undefined' ? maximizeThreshold : this.maximizeThreshold;

        if (value >= 0)
        {
            if (value < deadzone)
            {
                value = 0;
            } else if (value > maximizeThreshold)
            {
                value = 1;
            }
        } else
        {
            if (value > -deadzone)
            {
                value = 0;
            } else if (value < -maximizeThreshold)
            {
                value = -1;
            }
        }

        return value;
    };

    exports.Gamepad = Gamepad;
})(((typeof(module) !== 'undefined') && module.exports) || window);
