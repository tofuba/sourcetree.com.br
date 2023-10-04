TimeHandlr.js
==============

Uma biblioteca de eventos cronometrados derivada de Super Mario Bros.
Ele mantém uma listagem de funções a serem um procedimento em
determinados tempos limite e intervalos, separados dos métodos
nativos do Javascript. Isso tem duas aplicações principais:

<ol>
    <li>
        Forneça uma alternativa flexível para setTimeout e setInterval
        que respeite as pausas e recomeços no tempo (como nas pausas
        do programa).
    </li>
    <li>
        Forneça funções para 'circular' automaticamente entre certas
        classes em um objeto.
    </li>
</ol>

------------------------------------------------------------------------------------

Funções essenciais
------------------

<table>
    <tr>
        <th>
            Código
        </th>
        <th>
            Saída
        </th>
    </tr>
    <tr>
        <td>
            <code>
                window.MyEventHandler = new EventHandlr();</code><br><code>
                MyEventHandler.addEvent(function() { console.log("It's starting!"); });</code><br><code>
                MyEventHandler.addEvent(function() { console.log("It has ended.."); }, 49);</code><br><code>
                MyEventHandler.addEvent(function() { console.log("This won't be reached!"); }, 96);</code><br><code>
                MyEventHandler.addEventInterval(function() { console.log("Running..."); }, 7, 6);</code><br><code>
                for(var i = 0; i < 70; ++i)</code><br><code>
                    MyEventHandler.handleEvents();
            </code>
        </td>
        <td>
            <code>
                Está começando !</code><br><code>
                Correndo...</code><br><code>
                Correndo...</code><br><code>
                Correndo...</code><br><code>
                Correndo...</code><br><code>
                Correndo...</code><br><code>
                Correndo...</code><br><code>
                acabou..</code><br><code>
            </code>
        </td>
    </tr>
</table>

<table>
    <tr>
        <th>
            Plug
        </th>
        <th>
            Resultado
        </th>
    </tr>
    <tr>
        <td>
            <h3>
                Novo EventHandlr
            </h3>
            <code><strong>new EventHandlr</strong>();</code>
            <p>
                (ou)
            </p>
            <code>
                window.MyEventHandler = <strong>new EventHandlr</strong>({</code><br><code>
                    onSpriteCycleStart: "onadding",</code><br><code>
                    doSpriteCycleStart: "placed",</code><br><code>
                    cycleCheckValidity: "alive",</code><br><code>
                    timingDefault: 9</code><br><code>
                });
            </code>
        </td>
        <td>
            Cria um novo objeto EventHandlr com as configurações fornecidas.
            Os seguintes atributos (com as especificações entre parênteses)
            podem ser passados:
            <ul>
                <li>
                    Tempo comum.
                    <ul>
                        <li>
                            <code>time</code> (0): A que horas o programa começa. Só é útil se <code>events</code> também é passado.
                        </li>
                        <li>
                            <code>events</code> ({}): Uma lista pré-existente de eventos a serem um procedimento.
                        </li>
                        <li>
                            <code>timingDefault</code> (7): A quantidade comum de tiques entre ciclos cycleClass.
                        </li>
                    </ul>
                </li>
                <li>
                    Nomes de atributos usados por funções cycleClass.
                    <ul>
                        <li>
                            <code>cycles</code> ("cycle"): Em que armazenar os ciclos de um objeto, como me.cycles.
                        </li>
                        <li>
                            <code>className</code> ("className"): A string do nome da classe real a ser modificada.
                        </li>
                        <li>
                            <code>onSpriteCycleStart</code> ("onSpriteCycleStart"): O atributo sob o qual é armazenada a função para iniciar um ciclo.
                        </li>
                        <li>
                            <code>doSpriteCycleStart</code> ("doSpriteCycleStart"): O atributo booleano para verificar se um objeto deve iniciar um ciclo imediatamente.
                        </li>
                        <li>
                            <code>cycleCheckValidity</code> (null): O atributo booleano (opcional) para determinar se um objeto não deve mais ter um ciclo.
                        </li>
                    </ul>
                </li>
                <li>
                    Funções especiais para modificação de classes.
                    <ul>
                        <li>
                            <code>addClass</code>: Normalmente apenas adiciona uma classe a className.
                        </li>
                        <li>
                            <code>removeClass</code>: Normalmente usa apenas uma expressão regular rápida para remover uma classe de className.
                        </li>
                    </ul>
                </li>
            </ul>
        </td>
    </tr>
    <tr>
        <td>
            <h3>
                handleEvents
            </h3>
            <code><strong>handleEvents</strong>)</code>
        </td>
        <td>
            <p>
                Incrementa um contador do programa em um tick e faz o procedimento de todos os eventos agendados para o novo horário.
            </p>
            <code>
                MyEventHandler.addEvent(function() { console.log("Hi!"); });</code><br /><code>
                MyEventHandler.handleEvents();</code><br /><code>
                // Console logs: "Hi!"
            </code>
        </td>
    </tr>
    <tr>
        <td>
            <h3>
                addEvent
            </h3>
            <code><strong>addEvent</strong>(function,</code><br><code>
                                      time_delay=1</code><br><code>
                                      [, arguments...]);</code>
        </td>
        <td>
            <p>
                vai fazer o procedimento do <code>function</code> em <code>time_delay</code> ticks, passando quaisquer argumentos dados. Isso é equivalente a <code>setTimeout(function)</code>.
            </p>
            <code>
                MyEventHandler.addEvent(
                  function(name) {</code><br><code>
                    console.log("I, " + name + ", will show in seven ticks!"); },</code><br><code>
                    7, "Robert"</code><br><code>
                );
            </code>
        </td>
    </tr>
    <tr>
        <td>
            <h3>
                addEventInterval
            </h3>
            <code><strong>addEventInterval</strong>(function,</code><br><code>
                                              time_delay=1,</code><br><code>
                                              num_repeats</code><br><code>
                                              [, arguments...]);</code>
        </td>
        <td>
            <p>
                Vai fazer o procedimento do <code>function</code> em <code>time_delay</code> marca um <code>num_repeats</code> número de vezes, passando quaisquer argumentos dados. <code>num_repeats</code> pode ser uma função para avaliar ou um número típico. Isso é equivalente a <code>setInterval(function)</code>.
            </p>
            <code>
                MyEventHandler.addEventInterval(function(name)
                {
                    console.log("I, " + name + ", will show every seven ticks, fourteen times!");
                }, 7, 14, "Blake");
            </code>
        </td>
    </tr>
    <tr>
        <td>
            <h3>
                clearEvent
            </h3>
            <code><strong>clearEvent</strong>(event);</code>
        </td>
        <td>
            <p>
                Impede que um determinado evento seja um novo procedimento.
            </p>
            <code>
                var event = MyEventHandler.addEvent(
                    function()
                    {
                        console.log("This never shows!");
                    }
                );</code><br><code>
                MyEventHandler.clearEvent(event);
            </code>
        </td>
    </tr>
    <tr>
        <td>
            <h3>
                clearAllEvents
            </h3>
            <code><strong>clearAllEvents</strong>();</code>
        </td>
        <td>
            <p>
                Apaga completamente todos os eventos do agendador.
            </p>
            <code>
                var event = MyEventHandler.addEvent(
                    function()
                    {
                        console.log("This never shows!");
                    }
                );</code><br><code>
                var event = MyEventHandler.addEventInterval(
                    function()
                    {
                        console.log("This neither!");
                    }, 7, Infinity);</code><br><code>
                MyEventHandler.clearAllEvents();
            </code>
        </td>
    </tr>
</table>


Ciclo de Classe
---------------

<table>
    <tr>
        <th>
            Código
        </th>
        <th>
            Saída
        </th>
    </tr>
    <tr>
        <td>
            <code>
                window.MyEventHandler = new EventHandlr();</code><br><code>
                var me = { className: "myclass", doSpriteCycleStart: true};</code><br><code>
                var log = function log = console.log.bind(console);</code><br><code>
                MyEventHandler.addSpriteCycle(me, ["one", "two", "three"]);</code><br><code>
                MyEventHandler.addEventInterval(log, 7, Infinity, me);</code><br><code>
                log(me.className, "(starting)");</code><br><code>
                for(var i = 0; i < 49; ++i)</code><br><code>
                    MyEventHandler.handleEvents();
            </code>
        </td>
        <td>
            <code>
                myclass one (starting)</code><br><code>
                myclass two</code><br><code>
                myclass three</code><br><code>
                myclass one</code><br><code>
                myclass two</code><br><code>
                myclass three</code><br><code>
                myclass one</code><br><code>
                myclass two
            </code>
        </td>
    </tr>
</table>

<table>
    <tr>
        <th>
            Plug
        </th>
        <th>
            Saída
        </th>
    </tr>
    <tr>
        <td>
            <h3>
                addSpriteCycle
            </h3>
            <code><strong>addSpriteCycle</strong>(me, classnames[, cyclename[, cycletime]])</code>
        </td>
        <td>
            <p>
                Inicializa um ciclo de <code>.className</code>s para um objeto. O objeto irá correr continuamente através deles até que <code>clearAllCycles</code> ou <code>clearClassCycle</code> são chamados.
            </p>
            <code>
                var me = { className: "myclass", doSpriteCycleStart: true};</code><br><code>
                MyEventHandler.addSpriteCycle(me, ["one", "two", "three"]);
            </code>
        </td>
    </tr>
    <tr>
        <td>
            <h3>
                addSpriteCycleSynched
            </h3>
            <code><strong>addSpriteCycleSynched</strong>(me, classnames[, cyclename[, cycletime]])</code>
        </td>
        <td>
            <p>
                Espera para ligar <code>addSpriteCycle</code> até que esteja sincronizado com o tempo (usando aritmética modular). Chamar vários deles em momentos diferentes resultará na sincronização dos eventos.
            </p>
            <code>
                var me = { className: "myclass", doSpriteCycleStart: true};</code><br><code>
                MyEventHandler.addSpriteCycleSynched(me, ["one", "two", "three"]);
            </code>
        </td>
    </tr>
</table>
