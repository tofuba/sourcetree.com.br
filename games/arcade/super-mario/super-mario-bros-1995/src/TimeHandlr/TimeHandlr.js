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
 * TimeHandlr.js
 *
 * Uma biblioteca de eventos cronometrados derivada de Super Mario.
 * Este tem duas funções:
 *     1. Forneça uma alternativa flexível para setTimeout e setInterval
 *        que respeite as pausas e recomeços no tempo (como nas pausas
 *        do programa).
 *
 *     2. Forneça funções para 'circular' automaticamente entre
 *        certas classes em um objeto.
 */

/**
 *
 */
function TimeHandlr(settings)
{
    "use strict";

    /**
     * Variáveis de membro.
     */
    var version = "1.0";

    /**
     * O tempo de jogo atual (alcançado mais recentemente).
     */
    var time;

    /**
     * Um int->event tabela hash de eventos a serem um procedimento.
     */
    var events;

    /**
     * Nomes de atributo normal, para que possam ser substituídos.
     */
    var cycles;
    var className;
    var onSpriteCycleStart;
    var doSpriteCycleStart;
    var cycleCheckValidity;

    /**
     * Separações de tempo comum.
     */
    var timingDefault;

    /**
     * Alteração de função.
     */
    var addClass;
    var removeClass;

    /**
     * Simples obtém.
     */

    this.getTime = function()
    {
        return time;
    };

    this.getEvents = function()
    {
        return events;
    };

    /**
     * Adição de evento (simples).
     *
     * Uso de amostra:
     *     addEvent(
     *         function(name, of, arguments) { ... },
     *         time_until_execution,
     *         arg1,
     *         arg2,
     *         arg3
     *     );
     */

    /**
     * Público: addEvent.
     * Equivalente a setTimeout.
     * Adiciona uma função para procedimento em um determinado momento,
     * com argumentos.
     */
    var addEvent = this.addEvent = function(func, time_exec)
    {
        /**
         * Certifique-se de que func é realmente uma função.
         */
        if (!(func instanceof Function))
        {
            console.warn("Tentativa de adicionar um evento que não é uma função.");
            console.log(arguments);

            return false;
        }

        time_exec = time_exec || 1;

        /**
         * Pegue os argumentos a serem passados para a função,
         * excluindo func e time_exec.
         */
        var args = arrayMake(arguments);
            args.splice(0,2);

        /**
         * Crie o evento, acompanhando os horários de início e término.
         */
        var event = {
            func: func,
            time_exec: time + time_exec,
            time_repeat: time_exec,
            args: args,
            repeat: 1
        };

        /**
         * Adicione o evento aos eventos e retorne-o.
         */
        insertEvent(event, event.time_exec);

        return event;
    };

    /**
     * Público: addEventInterval.
     * Equivalente a setInterval.
     * Semelhante ao addEvent, mas será repetido um número
     * especificado de vezes. O atraso de tempo até o procedimento
     * é igual ao tempo entre os procedimentos subsequentes.
     */
    var addEventInterval = this.addEventInterval = function(func, time_exec, num_repeats)
    {
        /**
         * Certifique-se de que func é realmente uma função.
         */
        if (!(func instanceof Function))
        {
            console.warn("Tentativa de adicionar um evento que não é uma função.");
            console.log(arguments);

            return false;
        }

        time_exec = time_exec || 1;
        num_repeats = num_repeats || 1;

        /**
         * Pegue os argumentos a serem passados, removendo func,
         * time_exec, e num_repeats.
         */
        var args = arrayMake(arguments);
            args.splice(0, 3);

        /**
         * Crie o evento, acompanhando os horários de início e
         * término e as repetições.
         */
        var event = {
            func: func,
            time_exec: time + time_exec,
            time_repeat: time_exec,
            args: args,
            repeat: num_repeats
        };

        /**
         * Estes podem precisar ter uma referência ao evento da função.
         */
        func.event = event;

        /**
         * Adicione o evento aos eventos e retorne-o.
         */
        insertEvent(event, event.time_exec);

        return event;
    };

    // Public: addEventIntervalSynched
    // Delays the typical addEventInterval until it's synched with time
    // (this goes by basic modular arithmetic)
    var addEventIntervalSynched = this.addEventIntervalSynched = function(func, time_exec, num_repeats, me, settings)
    {
        var calctime = time_exec * settings.length;
        var entry = ceil(time / calctime) * calctime;
        var scope = this;

        var addfunc = function(scope, args, me)
        {
            me.startcount = time;

            return addEventInterval.apply(scope, args);
        };

        time_exec = time_exec || 1;
        num_repeats = num_repeats || 1;

        /**
         * Se não houver diferença nos tempos, você está
         * pronto para ir.
         */
        if (entry == time)
        {
            return addfunc(scope, arguments, me);
        } else
        {
            /**
             * Caso contrário, deve ser adiado até a hora certa.
             */

            var dt = entry - time;

            addEvent(addfunc, dt, scope, arguments, me);
        }
    };

    /**
     * Alternador rápido para adicionar um evento em
     * um determinado momento. Uma matriz deve existir
     * para que vários eventos possam ocorrer ao mesmo
     * tempo.
     */
    function insertEvent(event, time)
    {
        /**
         * Se ainda não tiver um vetor, o evento será o único conteúdo.
         */
        if (!events[time])
        {
            return events[time] = [event];
        }

        /**
         * Caso contrário, empurre-o para lá.
         */
        events[time].push(event);

        return events[time];
    }

    /**
     * Remoção de eventos (simples).
     */

    /**
     * Público: clearEvent.
     * Faz com que um evento não aconteça novamente.
     */
    var clearEvent = this.clearEvent = function(event)
    {
        if (!event)
        {
            return;
        }

        /**
         * Dizer para não repetir mais é o suficiente.
         */
        event.repeat = 0;
    };

    /**
     * Público: clearAllEvents.
     * Cancela completamente todos os eventos.
     */
    var clearAllEvents = this.clearAllEvents = function()
    {
        events = {};
    };

    /**
     * Dado um objeto, limpe seu ciclo de classe com um
     * determinado nome.
     */
    var clearClassCycle = this.clearClassCycle = function(me, name)
    {
        if (!me[cycles] || !me[cycles][name])
        {
            return;
        }

        var cycle = me[cycles][name];
            cycle[0] = false;
            cycle.length = false;

        delete me[cycles][name];
    };

    /**
     * Dado um objeto, limpe todos os seus ciclos de classe.
     */
    var clearAllCycles = this.clearAllCycles = function(me)
    {
        var cycles = me[cycles];
        var name;
        var cycle;

        for (name in cycles)
        {
            cycle = cycles[name];
            cycle[0] = false;
            cycle.length = 1;

            delete cycles[name];
        }
    };

    /**
     * Ciclos de Sprite (avançado).
     *
     * Funções para correr o atributo [className] de um determinado
     * objeto por meio de um vetor de nomes. Uso de amostra:
     *     addSpriteCycle(
     *         me,
     *         [
     *             "run_one",
     *             "run_two",
     *             "run_three"
     *         ]
     *         "running",
     *         7
     *     );
     *
     * Observação: Eles exigem modificadores da pessoa, como os
     * fornecidos por SuperMarioBros.
     */

    /**
     * Público: addSpriteCycle.
     * Define um ciclo de sprite (configurações) para um objeto sob o nome.
     */
    var addSpriteCycle = this.addSpriteCycle = function(me, settings, name, timing)
    {
        /**
         * Certifique-se de que o objeto tenha um suporte para ciclos.
         */
        if (!me[cycles])
        {
            me[cycles] = {};
        }

        /**
         * ...e nada anteriormente existente para esse nome.
         */
        clearClassCycle(me, name);

        var timingIsFunc = typeof(timing) == "function";

        name = name || 0;

        /**
         * Defina o ciclo sob me[cycles][name].
         */
        var cycle = me[cycles][name] = setSpriteCycle(me, settings, timingIsFunc ? 0 : timing);

        /**
         * Se houver uma função de temporização, torne-a o alterador
         * do contador.
         */
        if (cycle.event && timingIsFunc)
        {
            cycle.event.count_changer = timing;
        }

        /**
         * Faça o procedimento imediatamente do primeiro ciclo
         * da classe e, em seguida, devolve.
         */
        cycleClass(me, settings);

        return cycle;
    };

    /**
     * Público: addSpriteCycleSynched.
     * Atrasa o típico addSpriteCycle até que seja sincronizado com o tempo.
     * (Observação: muito semelhante ao addSpriteCycle e provavelmente
     * poderia ser combinado).
     */
    var addSpriteCycleSynched = this.addSpriteCycleSynched = function(me, settings, name, timing)
    {
        /**
         * Certifique-se de que o objeto tenha um suporte para ciclos...
         */
        if (!me[cycles])
        {
            me[cycles] = {};
        }

        /**
         * ...e nada anteriormente existente para esse nome.
         */
        clearClassCycle(me, name);

        /**
         * Defina o ciclo sob me[cycles][name].
         */
        name = name || 0;

        var cycle = me[cycles][name] = setSpriteCycle(me, settings, timing, true);

        /**
         * Faça o procedimento imediatamente o primeiro ciclo de
         * aula e depois retorne.
         */
        cycleClass(me, settings);

        return cycle;
    };

    /**
     * Inicializa um ciclo de sprite para um objeto.
     */
    function setSpriteCycle(me, settings, timing, synched)
    {
        /**
         * Comece antes do início do ciclo.
         */
        settings.loc = settings.oldclass = -1;

        /**
         * Avise o objeto para iniciar o ciclo quando necessário.
         */
        var func = synched ? addEventIntervalSynched : addEventInterval;

        me[onSpriteCycleStart] = function()
        {
            func(cycleClass, timing || timingDefault, Infinity, me, settings);
        };

        /**
         * Se já deve começar, faça isso.
         */
        if (me[doSpriteCycleStart])
        {
            me[onSpriteCycleStart]();
        }

        return settings;
    }

    /**
     * Move um objeto de sua classe atual no ciclo do sprite
     * para o próximo.
     */
    function cycleClass(me, settings)
    {
        /**
         * Se algo não passou por uma validação, retorne true para parar.
         */
        if (!me || !settings || !settings.length)
        {
            return true;
        }

        if (cycleCheckValidity != null && !me[cycleCheckValidity])
        {
            return true;
        }

        /**
         * Livre-se da classe anterior, das configurações (normalmente -1).
         */
        if (settings.oldclass != -1 && settings.oldclass !== "")
        {
            removeClass(me, settings.oldclass);
        }

        /**
         * Mover para o próximo local nas configurações, como uma
         * lista circular.
         */
        settings.loc = ++settings.loc % settings.length;

        /**
         * Current é o sprite, bool ou função que está sendo adicionada
         * e/ou está em procedimento no momento.
         */
        var current = settings[settings.loc];

        /**
         * Se não for falso ou inexistente, (faça o procedimento se
         * necessário e) obtenha-o como o próximo nome.
         */
        if (current)
        {
            var name = current instanceof Function ? current(me, settings) : current;

            /**
             * Se o próximo nome for uma sequência de grafemas, defina-a
             * como a classe antiga e adicione-a.
             */
            if (typeof(name) == "string")
            {
                settings.oldclass = name;
                addClass(me, name);

                return false;
            } else
            {
                /**
                 * Para objetos diferentes de sequências de grafemas, retorne
                 * true (para parar) se o nome avaliado for false.
                 */

                return (name === false);
            }
        } else
        {
            /**
             * Caso contrário, como current era falso, retorne true (para
             * parar) se for === false.
             */

            return (current === false);
        }
    }

    /**
     * Modificação de eventos.
     */

    /**
     * Público: handleEvents.
     * Incrementa o tempo e faz o procedimento de todos os eventos
     * no novo events[time].
     */
    this.handleEvents = function()
    {
        ++time;

        var events_current = events[time];

        if (!events_current)
        {
            /**
             * Se não houver nada para fazer o procedimento,
             * não se preocupe.
             */

            return;
        }

        var event;
        var len;
        var i;

        /**
         * Para cada evento programado atualmente:
         */
        for (i = 0, len = events_current.length; i < len; ++i)
        {
            event = events_current[i];

            /**
             * Chame a função, usando apply para passar os argumentos
             * dinamicamente. Se o procedimento retornar true, está pronto;
             * caso contrário, verifique se deve ir novamente.
             */
            if (event.repeat > 0 && !event.func.apply(this, event.args))
            {
                /**
                 * Se ele tiver um trocador de contador (e precisar se
                 * modificar), faça isso.
                 */
                if (event.count_changer)
                {
                    event.count_changer(event);
                }

                /**
                 * Se a repetição for uma função, fazer o procedimento para
                 * determina se deve repetir.
                 */
                if (event.repeat instanceof Function)
                {
                    /**
                     * Ligar e depois chamar é o que realmente faz o
                     * procedimento da função.
                     */
                    if ((event.repeat.bind(event))())
                    {
                        event.count += event.time_repeat;
                        insertEvent(event, event.time_exec);
                    }
                } else if(--event.repeat > 0)
                {
                    /**
                     * Caso contrário, é um número: diminua-o e, se for > 0, repita.
                     */

                    event.time_exec += event.time_repeat;
                    insertEvent(event, event.time_exec);
                }
            }
        }

        /**
         * Depois que todos esses eventos forem concluídos,
         * ignore os cubos.
         */
        delete events[time];
    };

    /**
     * Funções utilitárias.
     */

    /**
     * Olhando para você, argumentos de função.
     */
    function arrayMake(args)
    {
        return Array.prototype.slice.call(args);
    }

    /**
     * Expressões simples para adicionar/remover classes.
     */
    function classAdd(me, strin)
    {
        me.className += " " + strin;
    }

    function classRemove(me, strout)
    {
        me.className = me.className.replace(new RegExp(" " + strout, "gm"), "");
    }

    /**
     * Referência rápida para matemática.
     */
    var ceil = Math.ceil;

    /**
     * Reiniciar.
     */

    function reset(settings)
    {
        time = settings.time || 0;
        events = settings.events || {};

        /**
         * Nomes de atributos.
         */
        cycles = settings.cycles || "cycles";
        className = settings.className || "className";
        onSpriteCycleStart = settings.onSpriteCycleStart || "onSpriteCycleStart";
        doSpriteCycleStart = settings.doSpriteCycleStart || "doSpriteCycleStart";
        cycleCheckValidity = settings.cycleCheckValidity;

        /**
         * Números de tempo.
         */
        timingDefault = settings.timingDefault || 7;

        /**
         * Modificadores de função.
         */
        addClass = settings.addClass || window.addClass || classAdd;
        removeClass = settings.removeClass || window.removeClass || classRemove;
    }

    reset(settings || {});
}
