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
 * toned.js.
 *
 * Uma minibiblioteca que uso para algumas funções curtas e úteis.
 * Passe em true para dar todas as funções para window.
 */

/**
 *
 */
function TonedJS(give_window)
{
    var toned = {
        /**
         * Travessuras de objetos.
         */

        /**
         * Entregue todos os membros da variável de envio ao receptor.
         *
         * Exemplo: give(toned, window);
         */
        giveSup: function(donor, recipient)
        {
            recipient = recipient || {};

            for (var i in donor)
            {
                recipient[i] = donor[i];
            }

            return recipient;
        },

        /**
         * Como giveSup/erior, mas não substitui membros pré-existentes.
         */
        giveSub: function(donor, recipient)
        {
            recipient = recipient || {};

            for (var i in donor)
            {
                if (!recipient.hasOwnProperty(i))
                {
                    recipient[i] = donor[i];
                }
            }

            return recipient;
        },

        /**
         * Prolifera todos os membros que estão fazendo um envio para o
         * receptor recursivamente. Isso é mais inteligente do que
         * giveSup & giveSub.
         */
        proliferate: function(recipient, donor, no_override)
        {
            var setting;
            var i;

            /**
             * Para cada atributo de quem está fazendo o envio.
             */
            for (i in donor)
            {
                /**
                 * Se no_override for especificado, não substitua se já existir.
                 */
                if (no_override && recipient.hasOwnProperty(i))
                {
                    continue;
                }

                /**
                 * Se for um objeto, recurse em uma nova versão dele.
                 */
                if (typeof(setting = donor[i]) == "object" && setting != null)
                {
                    if (!recipient.hasOwnProperty(i))
                    {
                        recipient[i] = setting instanceof Array ? [] : {};
                    }

                    proliferate(recipient[i], setting, no_override);
                } else
                {
                    /**
                     * Primitivas regulares são fáceis de copiar de outra forma.
                     */
                    recipient[i] = setting;
                }
            }

            return recipient;
        },

        /**
         * Obtem a primeira chave ou valor do objeto, dependendo
         * da chave de captura.
         */
        getFirst: function(obj, grabkey)
        {
            for (var i in obj)
            {
                return grabkey ? i : obj[i];
            }
        },

        /**
         * Pega a última chave ou valor do objeto, dependendo da
         * chave de captura.
         */
        getLast: function(obj, grabkey)
        {
            for (var i in obj)
            {
            }

            return grabkey ? i : obj[i];
        },

        /**
         * Segue um caminho dentro de um objeto recursivamente
         * Path é ["path", "to", "target"], onde num é a distância ao longo
         * do caminho.
         *
         * Num deve ser fornecido no início, por motivos de alta performance.
         * Para fazer: permitir uma versão de função ?
         */
        followPath: function(obj, path, num)
        {
            if (path[num] != null && obj[path[num]] != null)
            {
                return followPath(obj[path[num]], path, ++num);
            }

            return obj;
        },

        /**
         * Modificações de elementos HTML.
         */

        /**
         * Cria um elemento e usa proliferate em todos os outros argumentos.
         *     * createElement() // (apenas retorna um novo div).
         *     * createElement("div", {width: "350px", style: {class: "Toned"}});
         */
        createElement: function(type)
        {
            var elem = document.createElement(type || "div");
            var i = arguments.length;

            while(--i > 0)
            {
                /**
                 * Porque negativo.
                 */
                proliferate(elem, arguments[i]);
            }

            return elem;
        },

        /**
         * Expressões simples para adicionar/remover classes.
         */

        /**
         *
         */
        classAdd: function(me, strin)
        {
            me.className += " " + strin;
        },

        /**
         *
         */
        classRemove: function(me, strout)
        {
            me.className = me.className.replace(new RegExp(" " + strout, "gm"), "");
        },

        /**
         * Mudança de posição.
         */
        elementSetPosition: function(me, left, top)
        {
            if (left == undefined)
            {
                left = me.left;
            }

            if (top == undefined)
            {
                top = me.top;
            }

            proliferate(me, {
                left: left,
                top: top,
                style: {
                    marginLeft: left + "px",
                    marginTop: top + "px"
                }
            });
        },

        /**
         *
         */
        elementShiftLeft: function(me, left)
        {
            if (!me.left)
            {
                me.left = Number(me.style.marginLeft.replace("px", ""));
            }

            me.style.marginLeft = round(me.left += left) + "px";
        },

        /**
         *
         */
        elementShiftTop: function(me, top)
        {
            if (!me.top)
            {
                me.top = Number(me.style.marginLeft.replace("px", ""));
            }

            me.style.marginTop = round(me.top += top) + "px";
        },

        /**
         * Remover um elemento se estiver na camada mais alta ou na base.
         */
        removeChildSafe: function(child, container)
        {
            if (!child)
            {
                return;
            }

            container = container || document.body;

            if (container.contains(child))
            {
                container.removeChild(child);
            }
        },

        /**
         * Tenta encontrar a camada mais alta, mais próximo com esta tag.
         */
        findParentOfType: function(child, type)
        {
            var parent = child.parentElement;

            if (!parent || parent.nodeName == type)
            {
                return parent;
            }

            return findParentType(parent, type);
        },

        /**
         * Limpa todos os eventos de timer de setTimeout e setInterval.
         */
        clearAllTimeouts: function()
        {
            var id = setTimeout(function()
            {
            });

            while(id--)
            {
                clearTimeout(id);
            }
        },

        /**
         * Modificação de sequências de grafemas.
         */

        /**
         * Remove os espaços em branco iniciais e finais (obrigado, IE<=8).
         */
        stringTrim: function(me)
        {
            return me.replace(/^\s+|\s+$/g,''); 
        },

        /**
         * Semelhante a arrayOf.
         */
        stringOf: function(me, n)
        {
            return (n == 0) ? '' : new Array(1 + (n || 1)).join(me);
        },

        /**
         * Verifica se um palheiro contém uma agulha.
         */
        stringHas: function(haystack, needle)
        {
            return haystack.indexOf(needle) != -1;
        },

        /**
         * Versão sem distinção entre maiúsculas e minúsculas de stringHas.
         */
        stringHasI: function(haystack, needle)
        {
            return haystack.toLowerCase().indexOf(needle.toLowerCase()) != -1;
        },

        /**
         * Coloca em maiúsculas apenas os primeiros 1 ou n grafemas de
         * uma sequência de grafemas.
         */
        capitalizeFirst: function(str, n)
        {
            n = n || 1;

            return str.substr(0,n).toUpperCase() + str.substr(n).toLowerCase();
        },

        /**
         * Modificação de vetores.
         */

        /**
         * É bom ter vetores X-dimensionais.
         */
        ArrayD: function(dim)
        {
            /**
             * 1-dimensionais são fáceis.
             */
            if (arguments.length == 1)
            {
                return new Array(dim);
            }

            /**
             * Caso contrário, recurse.
             */
            var rargs = arrayMake(arguments);
            var me = new Array(dim);
            var i;

            rargs.shift();

            for (i = dim - 1; i >= 0; --i)
            {
                me[i]= ArrayD.apply(this, rargs);
            }

            return me;
        },

        /**
         * Semelhante a stringOf.
         */
        arrayOf: function(me, n)
        {
            n = n || 1;

            var arr = new Array(n);

            while(n--)
            {
                arr[n] = me;
            }

            return arr;
        },

        /**
         * Olhando para você, argumentos de função.
         */
        arrayMake: function(me)
        {
            return Array.prototype.slice.call(me);
        },

        /**
         * (7, 10) = [7, 8, 9, 10].
         */
        arrayRange: function(a, b)
        {
            var len = 1 + b - a;
            var arr = new Array(len);
            var val = a;
            var i = 0;

            while(i < len)
            {
                arr[i++] = val++;
            }

            return arr;
        },

        /**
         *
         */
        arrayShuffle: function(arr, start, end)
        {
            start = start || 0;
            end = end || arr.length;

            for (var i = start, temp, sloc; i <= end; ++i)
            {
                sloc = randInt(i+1);
                temp = arr[i];

                arr[i] = arr[sloc];
                arr[sloc] = temp;
            }

            return arr;
        },

        /**
         * O(n^2) remoção.
         */
        removeDuplicates: function(arr)
        {
            var output = [];
            var me;
            var hasdup;
            var len;
            var i;
            var j;

            for (i = 0, len = arr.length; i < len; ++i)
            {
                me = arr[i];
                hasdup = false;

                for (j = 0; j < i; ++j)
                {
                    if (arr[j] == me)
                    {
                        hasdup = true;
                        break;
                    }
                }

                if (!hasdup)
                {
                    output.push(me);
                }
            }

            return output;
        },

        /**
         * Modificações numéricas.
         */

        /**
         * Converter ('7',3,1) para '117'.
         */
        makeDigit: function(num, size, fill)
        {
            num = String(num);

            return stringOf(fill || 0, max(0, size - num.length)) + num;
        },

        roundDigit: function(n, d)
        {
            return Number(d ? ~~(0.5 + (n / d)) * d : round(n));
        },

        /**
         * Geralmente é mais rápido armazenar referências a funções
         * matemáticas comuns.
         */
        sign: function(n)
        {
            return n ? n < 0 ? -1 : 1 : 0;
        },

        /**
         *
         */
        round: function(n)
        {
            return ~~(0.5 + n);
        },

        max: Math.max,
        min: Math.min,
        abs: Math.abs,
        pow: Math.pow,
        ceil: Math.ceil,
        floor: Math.floor,
        random: Math.random,

        /**
         * Retorna um número entre [0, n).
         */
        randInt: function(n)
        {
            return floor(Math.random() * (n || 1));
        },

        /**
         * Positivos são verdadeiros, negativos são falsos.
         */
        signBool: function(n)
        {
            return n > 0 ? true : false;
        },

        /**
         * etc.
         */

        /**
         * É bom poder logar sem passar pelo console.
         */
        log: console.log.bind(console),

        /**
         * Tempo.
         */
        now: Date.now
    };

    if (give_window)
    {
        toned.giveSub(toned, window);
    }

    return toned;
}
