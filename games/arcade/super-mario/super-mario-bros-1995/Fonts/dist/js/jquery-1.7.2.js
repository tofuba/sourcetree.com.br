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
(function(window, undefined)
{
    /**
     * Use o manual correto de acordo com o argumento da janela.
     */
    var document = window.document;
    var navigator = window.navigator;
    var location = window.location;

    var jQuery = (function()
    {
        /**
         * Definir uma cópia local do jQuery.
         */
        var jQuery = function(selector, context)
        {
            /**
             * O objeto jQuery é na verdade apenas o inicializador
             * init 'aprimorado'.
             */
            return new jQuery.fn.init(selector, context, rootjQuery);
        };

        /**
         * Mapear sobre jQuery em caso de substituição.
         */
        var _jQuery = window.jQuery;

        /**
         * Mapeie o $ em caso de substituição.
         */
        var _$ = window.$;

        /**
         * Uma referência central para a base jQuery(document).
         */
        var rootjQuery;

        /**
         * Uma maneira simples de verificar strings HTML ou strings de ID.
         * Prioritizar #id sobre <tag> para evitar XSS via location.hash (#9521).
         */
        var quickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/;

        /**
         * Verifique se uma string possui um grafema que não seja
         * um espaço em branco.
         */
        var rnotwhite = /\S/;

        /**
         * Usado para aparar espaços em branco.
         */
        var trimLeft = /^\s+/;
        var trimRight = /\s+$/;

        /**
         * Corresponde a uma tag independente.
         */
        var rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>)?$/;

        /**
         * JSON RegExp.
         */
        var rvalidchars = /^[\],:{}\s]*$/;
        var rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
        var rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
        var rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g;

        /**
         * Useragent RegExp.
         */
        var rwebkit = /(webkit)[ \/]([\w.]+)/;
        var ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/;
        var rmsie = /(msie) ([\w.]+)/;
        var rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/;

        /**
         * Corresponde à linha tracejada para camelizar.
         */
        var rdashAlpha = /-([a-z]|[0-9])/ig;
        var rmsPrefix = /^-ms-/;

        /**
         * Usado por jQuery.camelCase como retorno de chamada para replace().
         */
        var fcamelCase = function(all, letter)
        {
            return (letter + "").toUpperCase();
        };

        /**
         * Mantenha uma string UserAgent para uso com jQuery.browser.
         */
        var userAgent = navigator.userAgent;

        /**
         * Para combinar o mecanismo e a versão do navegador.
         */
        var browserMatch;

        /**
         * O adiado usado no DOM pronto.
         */
        var readyList;

        /**
         * O alternador de eventos pronto.
         */
        var DOMContentLoaded;

        /**
         * Salve uma referência para alguns métodos principais.
         */
        var toString = Object.prototype.toString;
        var hasOwn = Object.prototype.hasOwnProperty;
        var push = Array.prototype.push;
        var slice = Array.prototype.slice;
        var trim = String.prototype.trim;
        var indexOf = Array.prototype.indexOf;

        /**
         * [[Class]] -> pares de tipo.
         */
        var class2type = {};

        jQuery.fn = jQuery.prototype = {
            constructor: jQuery,
            init: function(selector, context, rootjQuery)
            {
                var match;
                var elem;
                var ret;
                var doc;

                /**
                 * Handle $(""), $(null), ou $(undefined).
                 */
                if (!selector)
                {
                    return this;
                }

                /**
                 * Handle $(DOMElement).
                 */
                if (selector.nodeType)
                {
                    this.context = this[0] = selector;
                    this.length = 1;

                    return this;
                }

                /**
                 * O elemento da base existe apenas uma vez, otimize
                 * sua localização.
                 */
                if (selector === "body" && !context && document.body)
                {
                    this.context = document;
                    this[0] = document.body;
                    this.selector = selector;
                    this.length = 1;

                    return this;
                }

                /**
                 * Lidar com sequências de grafemas HTML.
                 */
                if (typeof selector === "string")
                {
                    /**
                     * Estamos lidando com uma string HTML ou um ID ?
                     */
                    if (selector.charAt(0) === "<" && selector.charAt(selector.length - 1) === ">" && selector.length >= 3)
                    {
                        /**
                         * Suponha que as sequências de grafemas que começam e terminam
                         * com <> sejam HTML e pule a verificação de expressão regular.
                         */
                        match = [ null, selector, null ];
                    } else
                    {
                        match = quickExpr.exec(selector);
                    }

                    /**
                     * Verifique uma correspondência e se nenhum contexto foi
                     * especificado para #id.
                     */
                    if (match && (match[1] || !context))
                    {
                        /**
                         * HANDLE: $(html) -> $(array).
                         */
                        if (match[1])
                        {
                            context = context instanceof jQuery ? context[0] : context;
                            doc = (context ? context.ownerDocument || context : document);

                            /**
                             * Se uma única sequência de grafemas for passada e for uma única
                             * tag, faça um createElement e pule o resto
                             *
                             */
                            ret = rsingleTag.exec(selector);

                            if (ret)
                            {
                                if (jQuery.isPlainObject(context))
                                {
                                    selector = [document.createElement(ret[1])];
                                    jQuery.fn.attr.call(selector, context, true);
                                } else
                                {
                                    selector = [doc.createElement(ret[1])];
                                }
                            } else
                            {
                                ret = jQuery.buildFragment([match[1]], [doc]);
                                selector = (ret.cacheable ? jQuery.clone(ret.fragment) : ret.fragment).childNodes;
                            }

                            return jQuery.merge(this, selector);

                            /**
                             * HANDLE: $("#id").
                             */
                        } else
                        {
                            elem = document.getElementById(match[2]);

                            /**
                             * Verifique parentNode para capturar quando o Blackberry 4.6
                             * retornar pontos que não estão mais no manual #6963.
                             */
                            if (elem && elem.parentNode)
                            {
                                /**
                                 * Lide com o caso em que IE e Opera retornam itens por nome
                                 * em vez de ID.
                                 */
                                if (elem.id !== match[2])
                                {
                                    return rootjQuery.find(selector);
                                }

                                /**
                                 * Caso contrário, injetamos o elemento diretamente no objeto jQuery.
                                 */
                                this.length = 1;
                                this[0] = elem;
                            }

                            this.context = document;
                            this.selector = selector;

                            return this;
                        }

                        /**
                         * HANDLE: $(expr, $(...)).
                         */
                    } else if (!context || context.jquery)
                    {
                        return (context || rootjQuery).find(selector);

                        /**
                         * HANDLE: $(expr, context).
                         * (que é apenas equivalente a: $(context).find(expr).
                         */
                    } else
                    {
                        return this.constructor(context).find(selector);
                    }

                    /**
                     * HANDLE: $(function).
                     * Atalho para manual pronto.
                     */
                } else if (jQuery.isFunction(selector))
                {
                    return rootjQuery.ready(selector);
                }

                if (selector.selector !== undefined)
                {
                    this.selector = selector.selector;
                    this.context = selector.context;
                }

                return jQuery.makeArray(selector, this);
            },

            /**
             * Comece com um seletor vazio.
             */
            selector: "",

            /**
             * A versão atual do jQuery sendo usada.
             */
            jquery: "1.7.2",

            /**
             * O comprimento normal de um objeto jQuery é 0.
             */
            length: 0,

            /**
             * O número de elementos contidos no conjunto de elementos
             * correspondentes.
             */
            size: function()
            {
                return this.length;
            },

            toArray: function()
            {
                return slice.call(this, 0);
            },

            /**
             * Obtenha o elemento Nth no conjunto de elementos correspondentes
             * OU, Obtenha todo o elemento correspondente definido como um
             * vetor limpo.
             */
            get: function(num)
            {
                return num == null ?
                    /**
                     * Devolve um vetor 'limpo'.
                     */
                    this.toArray() :

                    /**
                     * Devolve apenas o objeto.
                     */
                    (num < 0 ? this[this.length + num] : this[num]);
            },

            /**
             * Obter um vetor de elementos e coloque-a na sequência.
             * (retornando o novo conjunto de elementos correspondentes).
             */
            pushStack: function(elems, name, selector)
            {
                /**
                 * Crie um novo conjunto de elementos correspondentes jQuery.
                 */
                var ret = this.constructor();

                if (jQuery.isArray(elems))
                {
                    push.apply(ret, elems);
                } else
                {
                    jQuery.merge(ret, elems);
                }

                /**
                 * Adicione o objeto antigo à sequência (como referência).
                 */
                ret.prevObject = this;
                ret.context = this.context;

                if (name === "find")
                {
                    ret.selector = this.selector + (this.selector ? " " : "") + selector;
                } else if (name)
                {
                    ret.selector = this.selector + "." + name + "(" + selector + ")";
                }

                /**
                 * Retorne o conjunto de elementos recém-obtido.
                 */
                return ret;
            },

            /**
             * Faça o procedimento de um retorno de chamada para cada elemento
             * no conjunto correspondente. (Você pode semear os argumentos com
             * um vetor de args, mas isso é usado apenas internamente.).
             */
            each: function(callback, args)
            {
                return jQuery.each(this, callback, args);
            },

            ready: function(fn)
            {
                /**
                 * Anexe os ouvintes.
                 */
                jQuery.bindReady();

                /**
                 * Adicionar o retorno de chamada.
                 */
                readyList.add(fn);

                return this;
            },

            eq: function(i)
            {
                i = +i;

                return i === -1 ?
                    this.slice(i) :
                    this.slice(i, i + 1);
            },

            first: function()
            {
                return this.eq(0);
            },

            last: function()
            {
                return this.eq(-1);
            },

            slice: function()
            {
                return this.pushStack(slice.apply(this, arguments),
                    "slice", slice.call(arguments).join(","));
            },

            map: function(callback)
            {
                return this.pushStack(jQuery.map(this, function(elem, i)
                {
                    return callback.call(elem, i, elem);
                }));
            },

            end: function()
            {
                return this.prevObject || this.constructor(null);
            },

            /**
             * Apenas para uso interno.
             * Comporta-se como um método de Vetor, não como um método jQuery.
             */
            push: push,
            sort: [].sort,
            splice: [].splice
        };

        /**
         * Forneça à função init o protótipo jQuery para instanciação
         * posterior.
         */
        jQuery.fn.init.prototype = jQuery.fn;
        jQuery.extend = jQuery.fn.extend = function()
        {
            var options;
            var name;
            var src;
            var copy;
            var copyIsArray;
            var clone;
            var target = arguments[0] || {};
            var i = 1;
            var length = arguments.length;
            var deep = false;

            /**
             * Lidar com uma situação de cópia avançada.
             */
            if (typeof target === "boolean")
            {
                deep = target;
                target = arguments[1] || {};

                /**
                 * Pule o booleano e o ponto.
                 */
                i = 2;
            }

            /**
             * Lidar com o caso quando o destino é uma sequência de grafemas
             * ou algo assim (possível em cópia avançada).
             */
            if (typeof target !== "object" && !jQuery.isFunction(target))
            {
                target = {};
            }

            /**
             * Estender o próprio jQuery se apenas um argumento for passado.
             */
            if (length === i)
            {
                target = this;
                --i;
            }

            for (; i < length; i++)
            {
                /**
                 * Lidar apenas com valores não nulos/indefinidos.
                 */
                if ((options = arguments[i]) != null)
                {
                    /**
                     * Estender o objeto base.
                     */
                    for (name in options)
                    {
                        src = target[name];
                        copy = options[name];

                        /**
                         * Evitar ciclos sem fim.
                         */
                        if (target === copy)
                        {
                            continue;
                        }

                        /**
                         * Recurse se estivermos mesclando objetos simples ou vetor.
                         */
                        if (deep && copy && (jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy))))
                        {
                            if (copyIsArray)
                            {
                                copyIsArray = false;
                                clone = src && jQuery.isArray(src) ? src : [];
                            } else
                            {
                                clone = src && jQuery.isPlainObject(src) ? src : {};
                            }

                            /**
                             * Nunca mova objetos originais, clone-os.
                             */
                            target[name] = jQuery.extend(deep, clone, copy);

                            /**
                             * Não traga valores indefinidos.
                             */
                        } else if (copy !== undefined)
                        {
                            target[name] = copy;
                        }
                    }
                }
            }

            /**
             * Retorne o objeto modificado.
             */
            return target;
        };

        jQuery.extend({
            noConflict: function(deep)
            {
                if (window.$ === jQuery)
                {
                    window.$ = _$;
                }

                if (deep && window.jQuery === jQuery)
                {
                    window.jQuery = _jQuery;
                }

                return jQuery;
            },

            /**
             * O DOM está pronto para ser usado ? Defina como verdadeiro
             * assim que ocorrer.
             */
            isReady: false,

            /**
             * Um contador para rastrear quantos itens esperar antes que o
             * evento pronto seja acionado. Veja #6781.
             */
            readyWait: 1,

            /**
             * Reter (ou liberar) o evento pronto.
             */
            holdReady: function(hold)
            {
                if (hold)
                {
                    jQuery.readyWait++;
                } else
                {
                    jQuery.ready(true);
                }
            },

            /**
             * Tratar quando o DOM estiver pronto.
             */
            ready: function(wait)
            {
                /**
                 * Uma retenção liberada ou um evento DOMready/load e ainda não está pronto.
                 */
                if ((wait === true && !--jQuery.readyWait) || (wait !== true && !jQuery.isReady))
                {
                    /**
                     * Certifique-se de que o cubo existe, pelo menos, caso o IE
                     * fique um pouco zeloso demais (bilhete nº 5443).
                     */
                    if (!document.body)
                    {
                        return setTimeout(jQuery.ready, 1);
                    }

                    /**
                     * Lembre-se que o DOM está pronto.
                     */
                    jQuery.isReady = true;

                    /**
                     * Se um evento DOM Ready normal for enviado, diminua e aguarde,
                     * se necessário.
                     */
                    if (wait !== true && --jQuery.readyWait > 0)
                    {
                        return;
                    }

                    /**
                     * Se houver funções vinculadas, para fazer o procedimento.
                     */
                    readyList.fireWith(document, [jQuery]);

                    /**
                     * Acionar quaisquer eventos prontos vinculados.
                     */
                    if (jQuery.fn.trigger)
                    {
                        jQuery(document).trigger("ready").off("ready");
                    }
                }
            },

            bindReady: function()
            {
                if (readyList)
                {
                    return;
                }

                readyList = jQuery.Callbacks("once memory");

                /**
                 * Capturar casos em que $(document).ready() é chamado após
                 * o evento do navegador já ter ocorrido.
                 */
                if (document.readyState === "complete")
                {
                    /**
                     * Alteração de forma assíncrona para permitir que os scripts
                     * tenham a oportunidade de atrasar o pronto.
                     */
                    return setTimeout(jQuery.ready, 1);
                }

                /**
                 * Mozilla, Opera e webkit nightlies atualmente suportam este evento.
                 */
                if (document.addEventListener)
                {
                    /**
                     * Use o prático retorno de chamada de evento.
                     */
                    document.addEventListener("DOMContentLoaded", DOMContentLoaded, false);

                    /**
                     * Um substituto para window.onload, que sempre funcionará.
                     */
                    window.addEventListener("load", jQuery.ready, false);

                    /**
                     * Se o modelo de evento do IE for usado.
                     */
                } else if (document.attachEvent)
                {
                    /**
                     * Garantir o envio antes do carregamento,
                     * talvez atrasado, mas seguro também para iframes.
                     */
                    document.attachEvent("onreadystatechange", DOMContentLoaded);

                    /**
                     * Um substituto para window.onload, que sempre funcionará.
                     */
                    window.attachEvent("onload", jQuery.ready);

                    /**
                     * Se IE e não um quadro.
                     * Verifique continuamente se o manual está pronto.
                     */
                    var toplevel = false;

                    try
                    {
                        toplevel = window.frameElement == null;
                    } catch(e)
                    {
                    }

                    if (document.documentElement.doScroll && toplevel)
                    {
                        doScrollCheck();
                    }
                }
            },

            /**
             * Consulte test/unit/core.js para obter detalhes sobre isFunction.
             * Desde a versão 1.3, métodos DOM e funções como alerta não são
             * suportados. Eles retornam false no IE (#2968).
             */
            isFunction: function(obj)
            {
                return jQuery.type(obj) === "function";
            },

            isArray: Array.isArray || function(obj)
            {
                return jQuery.type(obj) === "array";
            },

            isWindow: function(obj)
            {
                return obj != null && obj == obj.window;
            },

            isNumeric: function(obj)
            {
                return !isNaN(parseFloat(obj)) && isFinite(obj);
            },

            type: function(obj)
            {
                return obj == null ?
                    String(obj) :
                    class2type[toString.call(obj)] || "object";
            },

            isPlainObject: function(obj)
            {
                /**
                 * Deve ser um Objeto.
                 * Por causa do IE, também temos que verificar a presença da
                 * propriedade do inicializador. Certifique-se de que as bases
                 * DOM e objetos de janela também não passem.
                 */
                if (!obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow(obj))
                {
                    return false;
                }

                try
                {
                    /**
                     * Não obter propriedade do construtor deve ser Object.
                     */
                    if (obj.constructor && !hasOwn.call(obj, "constructor") && !hasOwn.call(obj.constructor.prototype, "isPrototypeOf"))
                    {
                        return false;
                    }
                } catch (e)
                {
                    /**
                     * IE8,9 Lançará exceções em certos objetos host #9897.
                     */
                    return false;
                }

                /**
                 * As propriedades próprias são enumeradas primeiro, portanto,
                 * para acelerar, se a última for própria, então todas as
                 * propriedades são próprias.
                 */

                var key;

                for (key in obj)
                {
                }

                return key === undefined || hasOwn.call(obj, key);
            },

            isEmptyObject: function(obj)
            {
                for (var name in obj)
                {
                    return false;
                }

                return true;
            },

            error: function(msg)
            {
                throw new Error(msg);
            },

            parseJSON: function(data)
            {
                if (typeof data !== "string" || !data)
                {
                    return null;
                }

                /**
                 * Certifique-se de que o espaço em branco inicial/final seja
                 * removido (o IE não pode lidar com isso).
                 */
                data = jQuery.trim(data);

                /**
                 * Tente analisar usando o analisador JSON nativo primeiro.
                 */
                if (window.JSON && window.JSON.parse)
                {
                    return window.JSON.parse(data);
                }

                /**
                 * Certifique-se de que os dados recebidos sejam JSON reais.
                 */
                if (rvalidchars.test(data.replace(rvalidescape, "@")
                    .replace(rvalidtokens, "]")
                    .replace(rvalidbraces, "")))
                {
                    return (new Function("return " + data))();
                }

                jQuery.error("Invalid JSON: " + data);
            },

            /**
             * Análise xml entre navegadores.
             */
            parseXML: function(data)
            {
                if (typeof data !== "string" || !data)
                {
                    return null;
                }

                var xml;
                var tmp;

                try
                {
                    if (window.DOMParser)
                    {
                        /**
                         * Normalização.
                         */
                        tmp = new DOMParser();
                        xml = tmp.parseFromString(data , "text/xml");
                    } else
                    {
                        /**
                         * IE.
                         */
                        xml = new ActiveXObject("Microsoft.XMLDOM");
                        xml.async = "false";
                        xml.loadXML(data);
                    }
                } catch(e)
                {
                    xml = undefined;
                }

                if (!xml || !xml.documentElement || xml.getElementsByTagName("parsererror").length)
                {
                    jQuery.error("Invalid XML: " + data);
                }

                return xml;
            },

            noop: function()
            {
            },

            /**
             * Avalia um script em um contexto global.
             * Soluções alternativas.
             */
            globalEval: function(data)
            {
                if (data && rnotwhite.test(data))
                {
                    /**
                     * Usamos o execScript no Internet Explorer.
                     * Usamos uma função anônima para que o contexto seja janela
                     * em vez de jQuery no Firefox.
                     */
                    (window.execScript || function(data)
                    {
                        window["eval"].call(window, data);
                    })(data);
                }
            },

            /**
             * Converter tracejado para camelCase; usado pelos módulos css e dados.
             * As Janelas esqueceu de colocar o prefixo do fornecedor (#9572).
             */
            camelCase: function(string)
            {
                return string.replace(rmsPrefix, "ms-").replace(rdashAlpha, fcamelCase);
            },

            nodeName: function(elem, name)
            {
                return elem.nodeName && elem.nodeName.toUpperCase() === name.toUpperCase();
            },

            /**
             * Args é apenas para uso interno.
             */
            each: function(object, callback, args)
            {
                var name;
                var i = 0;
                var length = object.length;
                var isObj = length === undefined || jQuery.isFunction(object);

                if (args)
                {
                    if (isObj)
                    {
                        for (name in object)
                        {
                            if (callback.apply(object[name], args) === false)
                            {
                                break;
                            }
                        }
                    } else
                    {
                        for (; i < length;)
                        {
                            if (callback.apply(object[i++], args) === false)
                            {
                                break;
                            }
                        }
                    }

                    /**
                     * Um estojo especial e rápido para o uso mais comum de cada.
                     */
                } else
                {
                    if (isObj)
                    {
                        for (name in object)
                        {
                            if (callback.call(object[name], name, object[name]) === false)
                            {
                                break;
                            }
                        }
                    } else
                    {
                        for (; i < length;)
                        {
                            if (callback.call(object[i], i, object[i++]) === false)
                            {
                                break;
                            }
                        }
                    }
                }

                return object;
            },

            /**
             * Use a função nativa String.trim sempre que possível.
             */
            trim: trim ?
                function(text)
                {
                    return text == null ? "" : trim.call(text);
                } :

                /**
                 * Caso contrário, use nossa própria funcionalidade de remoção.
                 */
                function(text)
                {
                    return text == null ? "" : text.toString().replace(trimLeft, "").replace(trimRight, "");
                },

            /**
             * Resultados é apenas para uso interno.
             */
            makeArray: function(array, results)
            {
                var ret = results || [];

                if (array != null)
                {
                    /**
                     * A janela, strings (e funções) também têm 'comprimento'.
                     * Lógica ligeiramente ajustada para lidar com as falhas #6930
                     * do Smartphone com RegExp.
                     */
                    var type = jQuery.type(array);

                    if (array.length == null || type === "string" || type === "function" || type === "regexp" || jQuery.isWindow(array))
                    {
                        push.call(ret, array);
                    } else
                    {
                        jQuery.merge(ret, array);
                    }
                }

                return ret;
            },

            inArray: function(elem, array, i)
            {
                var len;

                if (array)
                {
                    if (indexOf)
                    {
                        return indexOf.call(array, elem, i);
                    }

                    len = array.length;
                    i = i ? i < 0 ? Math.max(0, len + i) : i : 0;

                    for (; i < len; i++)
                    {
                        /**
                         * Ignorar o acesso em arrays esparsos.
                         */
                        if (i in array && array[i] === elem)
                        {
                            return i;
                        }
                    }
                }

                return -1;
            },

            merge: function(first, second)
            {
                var i = first.length;
                var j = 0;

                if (typeof second.length === "number")
                {
                    for (var l = second.length; j < l; j++)
                    {
                        first[i++] = second[j];
                    }
                } else
                {
                    while (second[j] !== undefined)
                    {
                        first[i++] = second[j++];
                    }
                }

                first.length = i;

                return first;
            },

            grep: function(elems, callback, inv)
            {
                var ret = [];
                var retVal;

                inv = !!inv;

                /**
                 * Percorra o vetor, salvando apenas os itens que passarem
                 * pela função da validação.
                 */
                for (var i = 0, length = elems.length; i < length; i++)
                {
                    retVal = !!callback(elems[i], i);

                    if (inv !== retVal)
                    {
                        ret.push(elems[i]);
                    }
                }

                return ret;
            },

            /**
             * arg é apenas para uso interno.
             */
            map: function(elems, callback, arg)
            {
                var value;
                var key;
                var ret = [];
                var i = 0;
                var length = elems.length;

                /**
                 * Objetos jquery são tratados como vetor.
                 */
                var isArray = elems instanceof jQuery || length !== undefined && typeof length === "number" && ((length > 0 && elems[0] && elems[length -1]) || length === 0 || jQuery.isArray(elems));

                /**
                 * Correr o vetor, traduzindo cada um dos itens para seus.
                 */
                if (isArray)
                {
                    for (; i < length; i++)
                    {
                        value = callback(elems[i], i, arg);

                        if (value != null)
                        {
                            ret[ret.length] = value;
                        }
                    }

                    /**
                     * Percorra todas as teclas do objeto,
                     */
                } else
                {
                    for (key in elems)
                    {
                        value = callback(elems[key], key, arg);

                        if (value != null)
                        {
                            ret[ret.length] = value;
                        }
                    }
                }

                /**
                 * Nivelar quaisquer vetor aninhados.
                 */
                return ret.concat.apply([], ret);
            },

            /**
             * Um contador GUID global para objetos.
             */
            guid: 1,

            /**
             * Vinculação de uma função a um contexto, opcionalmente aplicando
             * parcialmente quaisquer argumentos.
             */
            proxy: function(fn, context)
            {
                if (typeof context === "string")
                {
                    var tmp = fn[context];
                    context = fn;
                    fn = tmp;
                }

                /**
                 * Verificação rápida para determinar se o destino pode ser chamado,
                 * na especificação isso gera um TypeError, mas retornaremos apenas
                 * indefinido.
                 */
                if (!jQuery.isFunction(fn))
                {
                    return undefined;
                }

                /**
                 * Conexão simulada.
                 */
                var args = slice.call(arguments, 2);
                var proxy = function()
                {
                    return fn.apply(context, args.concat(slice.call(arguments)));
                };

                /**
                 * Defina o guid do modificador exclusivo para o mesmo do modificador
                 * original, para que possa ser removido.
                 */
                proxy.guid = fn.guid = fn.guid || proxy.guid || jQuery.guid++;

                return proxy;
            },

            /**
             * Método multifuncional para obter e definir valores para uma coleção.
             * O(s) valor(es) podem opcionalmente ser um procedimento se for uma
             * função.
             */
            access: function(elems, fn, key, value, chainable, emptyGet, pass)
            {
                var exec;
                var bulk = key == null;
                var i = 0;
                var length = elems.length;

                /**
                 * Define muitos valores.
                 */
                if (key && typeof key === "object")
                {
                    for (i in key)
                    {
                        jQuery.access(elems, fn, i, key[i], 1, emptyGet, value);
                    }

                    chainable = 1;

                    /**
                     * Define um valor.
                     */
                } else if (value !== undefined)
                {
                    /**
                     * Opcionalmente, os valores da função são procedimentos se
                     * exec for true.
                     */
                    exec = pass === undefined && jQuery.isFunction(value);

                    if (bulk)
                    {
                        /**
                         * Os procedimentos em massa só iteram ao fazer o procedimento
                         * de valores de função.
                         */
                        if (exec)
                        {
                            exec = fn;

                            fn = function(elem, key, value)
                            {
                                return exec.call(jQuery(elem), value);
                            };

                            /**
                             * Caso contrário, eles correm contra todo o grupo.
                             */
                        } else
                        {
                            fn.call(elems, value);
                            fn = null;
                        }
                    }

                    if (fn)
                    {
                        for (; i < length; i++)
                        {
                            fn(elems[i], key, exec ? value.call(elems[i], i, fn(elems[i], key)) : value, pass);
                        }
                    }

                    chainable = 1;
                }

                return chainable ?
                    elems :

                    /**
                     * Obter.
                     */
                    bulk ? fn.call(elems) : length ? fn(elems[0], key) : emptyGet;
            },

            now: function()
            {
                return (new Date()).getTime();
            },

            /**
             * O uso de jQuery.browser não é muito legal aqui.
             */
            uaMatch: function(ua)
            {
                ua = ua.toLowerCase();

                var match = rwebkit.exec( ua ) ||
                    ropera.exec(ua) ||
                    rmsie.exec(ua) ||
                    ua.indexOf("compatible") < 0 && rmozilla.exec(ua) ||
                    [];

                return {
                    browser: match[1] || "",
                    version: match[2] || "0"
                };
            },

            sub: function()
            {
                function jQuerySub(selector, context)
                {
                    return new jQuerySub.fn.init(selector, context);
                }

                jQuery.extend(true, jQuerySub, this);
                jQuerySub.superclass = this;
                jQuerySub.fn = jQuerySub.prototype = this();
                jQuerySub.fn.constructor = jQuerySub;
                jQuerySub.sub = this.sub;

                jQuerySub.fn.init = function init(selector, context)
                {
                    if (context && context instanceof jQuery && !(context instanceof jQuerySub))
                    {
                        context = jQuerySub(context);
                    }

                    return jQuery.fn.init.call(this, selector, context, rootjQuerySub);
                };

                jQuerySub.fn.init.prototype = jQuerySub.fn;
                var rootjQuerySub = jQuerySub(document);

                return jQuerySub;
            },

            browser: {}
        });

        /**
         * Preencher o mapa class2type.
         */
        jQuery.each("Boolean Number String Function Array Date RegExp Object".split(" "), function(i, name)
        {
            class2type["[object " + name + "]"] = name.toLowerCase();
        });

        browserMatch = jQuery.uaMatch(userAgent);

        if (browserMatch.browser)
        {
            jQuery.browser[browserMatch.browser] = true;
            jQuery.browser.version = browserMatch.version;
        }

        /**
         * Use jQuery.browser.webkit em seu lugar.
         */
        if (jQuery.browser.webkit)
        {
            jQuery.browser.safari = true;
        }

        /**
         * IE não corresponde a espaços sem próximo com \s.
         */
        if (rnotwhite.test("\xA0"))
        {
            trimLeft = /^[\s\xA0]+/;
            trimRight = /[\s\xA0]+$/;
        }

        /**
         * Todos os objetos jQuery devem apontar para esses.
         */
        rootjQuery = jQuery(document);

        /**
         * Funções de remoção para o método de manual pronto.
         */
        if (document.addEventListener)
        {
            DOMContentLoaded = function()
            {
                document.removeEventListener("DOMContentLoaded", DOMContentLoaded, false);
                jQuery.ready();
            };
        } else if (document.attachEvent)
        {
            DOMContentLoaded = function()
            {
                /**
                 * Certifique-se de que a base existe, pelo menos, caso o IE
                 * fique um pouco zeloso demais (bilhete nº 5443).
                 */
                if (document.readyState === "complete")
                {
                    document.detachEvent("onreadystatechange", DOMContentLoaded);
                    jQuery.ready();
                }
            };
        }

        /**
         * A verificação de pronto DOM para o Internet Explorer.
         */
        function doScrollCheck()
        {
            if (jQuery.isReady)
            {
                return;
            }

            try
            {
                /**
                 * Se for usado o IE.
                 */
                document.documentElement.doScroll("left");
            } catch(e)
            {
                setTimeout(doScrollCheck, 1);

                return;
            }

            /**
             * E fazer o procedimento de quaisquer funções de espera.
             */
            jQuery.ready();
        }

        return jQuery;
    })();

    /**
     * Sequência de grafemas para o cubo de formato de sinalizadores de objeto.
     */
    var flagsCache = {};

    /**
     * Converta sinalizadores formatados em sequências de grafemas em
     * formatados em objeto e armazene em cubos.
     */
    function createFlags(flags)
    {
        var object = flagsCache[flags] = {};
        var i;
        var length;

        flags = flags.split( /\s+/ );

        for (i = 0, length = flags.length; i < length; i++)
        {
            object[flags[i]] = true;
        }

        return object;
    }

    /**
     * Crie uma lista de retorno de chamada usando os seguintes parâmetros:
     *     flags:
     *         Uma lista opcional de sinalizadores separados por espaço que
     *         mudará o comportamento da lista de retorno de chamada.
     *
     * Normalmente, uma lista de retorno de chamada funcionará como uma
     * lista de retorno de chamada de evento e pode ser "enviada" várias
     * vezes. Possíveis sinalizadores:
     *     once:
     *         Garantirá que a lista de retorno de chamada possa ser enviada
     *         apenas uma vez (como um Adiado).
     *
     *     memory:
     *         Manterá o controle dos valores anteriores e chamará qualquer
     *         retorno de chamada adicionado após a lista ter sido enviada
     *         imediatamente com os últimos valores "em cubos" (como um
     *         Adiado).
     *
     *     unique:
     *         Garantirá que um retorno de chamada possa ser adicionado
     *         apenas uma vez (sem duplicatas na lista).
     *
     *     stopOnFalse:
     *         Interrompa as chamadas quando um retorno de chamada retornar falso.
     */
    jQuery.Callbacks = function(flags)
    {
        /**
         * Converter sinalizadores de formatado em string para formatado em objeto
         * (verificamos os cubos primeiro).
         */
        flags = flags ? ( flagsCache[ flags ] || createFlags( flags ) ) : {};

        /**
         * Lista de retorno de chamada real.
         */
        var list = [];

        /**
         * Pilha de chamas para listas repetíveis.
         */
        var stack = [];

        /**
         * Valor do último envio (para listas não esquecíveis).
         */
        var memory;

        /**
         * Flag para saber se a lista já foi enviada.
         */
        var fired;

        /**
         * Sinalize para saber se a lista está enviando no momento.
         */
        var firing;

        /**
         * Primeiro retorno de chamada para enviar (usado internamente
         * por add e fireWith).
         */
        var firingStart;

        /**
         * Fim do loop ao enviar.
         */
        var firingLength;

        /**
         * Índice de retorno de chamada atualmente em procedimento (modificado
         * por remover, se necessário).
         */
        var firingIndex;

        /**
         * Adicione um ou vários retornos de chamada à lista.
         */
        var add = function( args )
        {
            var i;
            var length;
            var elem;
            var type;
            var actual;

            for (i = 0, length = args.length; i < length; i++)
            {
                elem = args[i];
                type = jQuery.type(elem);

                if (type === "array")
                {
                    /**
                     * Inspecione recursivamente.
                     */
                    add( elem );
                } else if (type === "function")
                {
                    /**
                     * Adicionar se não estiver no modo exclusivo e o retorno
                     * de chamada não estiver ativado.
                     */
                    if (!flags.unique || !self.has(elem))
                    {
                        list.push(elem);
                    }
                }
            }
        };

        /**
         * Chamadas de retorno de fogo.
         */
        var fire = function(context, args)
        {
            args = args || [];
            memory = !flags.memory || [ context, args ];

            fired = true;
            firing = true;
            firingIndex = firingStart || 0;
            firingStart = 0;
            firingLength = list.length;

            for (; list && firingIndex < firingLength; firingIndex++)
            {
                if (list[ firingIndex ].apply( context, args ) === false && flags.stopOnFalse)
                {
                    /**
                     * Marcar como interrompido.
                     */
                    memory = true;

                    break;
                }
            }

            firing = false;

            if (list)
            {
                if (!flags.once)
                {
                    if (stack && stack.length)
                    {
                        memory = stack.shift();
                        self.fireWith(memory[0], memory[1]);
                    }
                } else if (memory === true)
                {
                    self.disable();
                } else
                {
                    list = [];
                }
            }
        };

        /**
         * Objetos Callbacks reais.
         */
        var self = {
            /**
             * Adicione um retorno de chamada ou uma coleção de retornos
             * de chamada à lista.
             */
            add: function()
            {
                if (list)
                {
                    var length = list.length;

                    add(arguments);

                    /**
                     * Precisamos adicionar os retornos de chamada ao lote de
                     * envios atual?
                     */
                    if (firing)
                    {
                        firingLength = list.length;

                        /**
                         * Com cubos, se não estamos enviando então
                         * devemos ligar imediatamente, a menos que
                         * o envio foi interrompido (stopOnFalse).
                         */
                    } else if (memory && memory !== true)
                    {
                        firingStart = length;
                        fire(memory[0], memory[1]);
                    }
                }

                return this;
            },

            /**
             * Remova um retorno de chamada da lista.
             */
            remove: function()
            {
                if (list)
                {
                    var args = arguments;
                    var argIndex = 0;
                    var argLength = args.length;

                    for (; argIndex < argLength ; argIndex++)
                    {
                        for (var i = 0; i < list.length; i++)
                        {
                            if (args[argIndex] === list[i])
                            {
                                /**
                                 * Handle firingIndex e firingLength.
                                 */
                                if (firing)
                                {
                                    if (i <= firingLength)
                                    {
                                        firingLength--;

                                        if (i <= firingIndex)
                                        {
                                            firingIndex--;
                                        }
                                    }
                                }

                                /**
                                 * Remova o elemento.
                                 */
                                list.splice( i--, 1 );

                                /**
                                 * Se tivermos alguma propriedade de unicidade então
                                 * só precisamos fazer isso uma vez.
                                 */
                                if (flags.unique)
                                {
                                    break;
                                }
                            }
                        }
                    }
                }

                return this;
            },

            /**
             * Controle se um determinado retorno de chamada está na lista.
             */
            has: function(fn)
            {
                if (list)
                {
                    var i = 0;
                    var length = list.length;

                    for (; i < length; i++)
                    {
                        if (fn === list[i])
                        {
                            return true;
                        }
                    }
                }

                return false;
            },

            /**
             * Remova todos os retornos de chamada da lista.
             */
            empty: function()
            {
                list = [];

                return this;
            },

            /**
             * Faça com que a lista não faça mais nada.
             */
            disable: function()
            {
                list = stack = memory = undefined;

                return this;
            },

            /**
             * Está desabilitado ?
             */
            disabled: function()
            {
                return !list;
            },

            /**
             * Bloqueie a lista em seu estado atual.
             */
            lock: function()
            {
                stack = undefined;

                if (!memory || memory === true)
                {
                    self.disable();
                }

                return this;
            },

            /**
             * Está bloqueado ?
             */
            locked: function()
            {
                return !stack;
            },

            /**
             * Chame todos os retornos de chamada com o contexto e os argumentos
             * fornecidos.
             */
            fireWith: function(context, args)
            {
                if (stack)
                {
                    if (firing)
                    {
                        if (!flags.once)
                        {
                            stack.push([context, args]);
                        }
                    } else if (!(flags.once && memory))
                    {
                        fire(context, args);
                    }
                }

                return this;
            },

            /**
             * Chame todos os retornos de chamada com os argumentos fornecidos.
             */
            fire: function()
            {
                self.fireWith( this, arguments );

                return this;
            },

            /**
             * Para saber se os callbacks já foram chamados pelo menos uma vez.
             */
            fired: function()
            {
                return !!fired;
            }
        };

        return self;
    };

    /**
     * Referência estática à fatia.
     */
    var sliceDeferred = [].slice;

    /**
     *
     */
    jQuery.extend({
        /**
         *
         */
        Deferred: function(func)
        {
            var doneList = jQuery.Callbacks("once memory");
            var failList = jQuery.Callbacks("once memory");
            var progressList = jQuery.Callbacks("memory");
            var state = "pending";
            var lists = {
                resolve: doneList,
                reject: failList,
                notify: progressList
            };

            var promise = {
                done: doneList.add,
                fail: failList.add,
                progress: progressList.add,

                state: function()
                {
                    return state;
                },

                /**
                 * Não é mais usado.
                 */
                isResolved: doneList.fired,
                isRejected: failList.fired,

                /**
                 *
                 */
                then: function(doneCallbacks, failCallbacks, progressCallbacks)
                {
                    deferred
                        .done(doneCallbacks)
                        .fail(failCallbacks)
                        .progress(progressCallbacks);

                    return this;
                },

                /**
                 *
                 */
                always: function()
                {
                    deferred.done.apply(deferred, arguments).fail.apply(deferred, arguments);

                    return this;
                },

                /**
                 *
                 */
                pipe: function(fnDone, fnFail, fnProgress)
                {
                    return jQuery.Deferred(function(newDefer)
                    {
                        jQuery.each({
                            done: [ fnDone, "resolve" ],
                            fail: [ fnFail, "reject" ],
                            progress: [ fnProgress, "notify" ]
                        },
                        function(handler, data)
                        {
                            var fn = data[0];
                            var action = data[1];
                            var returned;

                            if (jQuery.isFunction(fn))
                            {
                                deferred[handler](function()
                                {
                                    returned = fn.apply(this, arguments);

                                    if (returned && jQuery.isFunction(returned.promise))
                                    {
                                        returned.promise().then(newDefer.resolve, newDefer.reject, newDefer.notify);
                                    } else
                                    {
                                        newDefer[action + "With"](this === deferred ? newDefer : this, [returned]);
                                    }
                                });
                            } else
                            {
                                deferred[handler](newDefer[action]);
                            }
                        });
                    }).promise();
                },

                /**
                 * Obtenha uma promessa para este diferido.
                 * Se obj for fornecido, o aspecto de promessa será adicionado ao objeto.
                 */
                promise: function(obj)
                {
                    if (obj == null)
                    {
                        obj = promise;
                    } else
                    {
                        for (var key in promise)
                        {
                            obj[key] = promise[key];
                        }
                    }

                    return obj;
                }
            };

            var deferred = promise.promise({});
            var key;

            for (key in lists)
            {
                deferred[key] = lists[key].fire;
                deferred[key + "With"] = lists[key].fireWith;
            }

            /**
             * Lidar com estado.
             */
            deferred.done(function()
            {
                state = "resolved";
            }, failList.disable, progressList.lock).fail(function()
            {
                state = "rejected";
            }, doneList.disable, progressList.lock );

            /**
             * Chame a função fornecida, se houver.
             */
            if (func)
            {
                func.call(deferred, deferred);
            }

            /**
             * Tudo feito !
             */
            return deferred;
        },

        /**
         * Auxiliar diferido.
         */
        when: function(firstParam)
        {
            var args = sliceDeferred.call(arguments, 0);
            var i = 0;
            var length = args.length;
            var pValues = new Array(length);
            var count = length;
            var pCount = length;
            var deferred = length <= 1 && firstParam && jQuery.isFunction(firstParam.promise) ? firstParam : jQuery.Deferred();
            var promise = deferred.promise();

            function resolveFunc(i)
            {
                return function(value)
                {
                    args[i] = arguments.length > 1 ? sliceDeferred.call(arguments, 0) : value;

                    if (!(--count))
                    {
                        deferred.resolveWith(deferred, args);
                    }
                };
            }

            function progressFunc(i)
            {
                return function(value)
                {
                    pValues[i] = arguments.length > 1 ? sliceDeferred.call(arguments, 0) : value;
                    deferred.notifyWith(promise, pValues);
                };
            }

            if (length > 1)
            {
                for (; i < length; i++)
                {
                    if (args[i] && args[i].promise && jQuery.isFunction(args[i].promise))
                    {
                        args[i].promise().then(resolveFunc(i), deferred.reject, progressFunc(i));
                    } else
                    {
                        --count;
                    }
                }

                if (!count)
                {
                    deferred.resolveWith(deferred, args);
                }
            } else if ( deferred !== firstParam )
            {
                deferred.resolveWith(deferred, length ? [firstParam] : []);
            }

            return promise;
        }
    });

    /**
     *
     */
    jQuery.support = (function()
    {
        var support;
        var all;
        var a;
        var select;
        var opt;
        var input;
        var fragment;
        var tds;
        var events;
        var eventName;
        var i;
        var isSupported;
        var div = document.createElement("div");
        var documentElement = document.documentElement;

        /**
         * Testes preliminares.
         */
        div.setAttribute("className", "t");
        div.innerHTML = "   <link/><table></table><a href='/a' style='top:1px;float:left;opacity:.55;'>a</a><input type='checkbox'/>";

        all = div.getElementsByTagName("*");
        a = div.getElementsByTagName("a")[0];

        /**
         * Não é possível obter suporte de teste básico.
         */
        if (!all || !all.length || !a)
        {
            return {};
        }

        /**
         * Primeiro lote de testes de suportes.
         */
        select = document.createElement("select");
        opt = select.appendChild(document.createElement("option"));
        input = div.getElementsByTagName("input")[0];

        support = {
            /**
             * O IE remove os espaços em branco iniciais quando .innerHTML é usado.
             */
            leadingWhitespace: (div.firstChild.nodeType === 3),

            /**
             * Certifique-se de que os elementos da base não sejam inseridos
             * automaticamente. O IE irá inseri-los em tabelas vazias.
             */
            tbody: !div.getElementsByTagName("tbody").length,

            /**
             * Certifique-se de que os elementos do link sejam serializados
             * corretamente por innerHTML. Isso requer um elemento wrapper no IE.
             */
            htmlSerialize: !!div.getElementsByTagName("link").length,

            /**
             * Obtenha as informações de estilo de getAttribute.
             * (O IE usa .cssText).
             */
            style: /top/.test( a.getAttribute("style") ),

            /**
             * Certifique-se de que os URLs não sejam modificados.
             * (IE normaliza normalmente).
             */
            hrefNormalized: ( a.getAttribute("href") === "/a" ),

            /**
             * Certifique-se de que a opacidade do elemento existe.
             * (O IE usa o filtro em vez disso). Use um regex para
             * solucionar uma falha do WebKit. Ver #5145.
             */
            opacity: /^0.55/.test( a.style.opacity ),

            /**
             * Verifique a existência do flutuador de estilo.
             * (IE usa styleFloat em vez de cssFloat).
             */
            cssFloat: !!a.style.cssFloat,

            /**
             * Certifique-se de que, se nenhum valor for especificado para
             * uma caixa de seleção. Que a especificação é "on". (WebKit a
             * especificação é "" em vez disso).
             */
            checkOn: (input.value === "on"),

            /**
             * Certifique-se de que uma opção selecionada na especificação tenha
             * uma propriedade selecionada funcional. (A especificação do WebKit
             * é false em vez de true, IE também, se estiver em um optgroup).
             */
            optSelected: opt.selected,

            /**
             * Teste setAttribute na classe camelCase. Se funcionar, precisamos
             * de attrFixes ao fazer get/setAttribute (ie6/7).
             */
            getSetAttribute: div.className !== "t",

            /**
             * Testes para suporte a enctype em um form(#6743).
             */
            enctype: !!document.createElement("form").enctype,

            /**
             * Garante que a clonagem de um elemento html5 não cause falhas.
             * Onde outerHTML é indefinido, isso ainda funciona.
             */
            html5Clone: document.createElement("nav").cloneNode( true ).outerHTML !== "<:nav></:nav>",

            /**
             * Será definido posteriormente.
             */
            submitBubbles: true,
            changeBubbles: true,
            focusinBubbles: false,
            deleteExpando: true,
            noCloneEvent: true,
            inlineBlockNeedsLayout: false,
            shrinkWrapBlocks: false,
            reliableMarginRight: true,
            pixelMargin: true
        };

        /**
         * jQuery.boxModel não é mais usado em 1.3, use jQuery.support.boxModel.
         */
        jQuery.boxModel = support.boxModel = (document.compatMode === "CSS1Compat");

        /**
         * Certifique-se de que o status verificado está clonado corretamente.
         */
        input.checked = true;
        support.noCloneChecked = input.cloneNode( true ).checked;

        /**
         * Certifique-se de que as opções dentro das seleções desabilitadas
         * não estejam marcadas como desabilitadas. (WebKit marca-os como
         * disabled).
         */
        select.disabled = true;
        support.optDisabled = !opt.disabled;

        /**
         * Teste para ver se é possível remover um expando de um elemento.
         * Falha no Internet Explorer.
         */
        try
        {
            delete div.test;
        } catch(e)
        {
            support.deleteExpando = false;
        }

        if (!div.addEventListener && div.attachEvent && div.fireEvent)
        {
            div.attachEvent("onclick", function()
            {
                /**
                 * A clonagem de um nó não deve copiar nenhum
                 * modificadores de eventos vinculados (o IE faz isso).
                 */
                support.noCloneEvent = false;
            });

            div.cloneNode(true).fireEvent("onclick");
        }

        /**
         * Verifique se um rádio mantém seu valor
         * depois de ser anexado ao DOM.
         */
        input = document.createElement("input");
        input.value = "t";
        input.setAttribute("type", "radio");
        support.radioValue = input.value === "t";

        input.setAttribute("checked", "checked");

        /**
         * #11217 - WebKit perde o cheque quando o nome está depois
         * do atributo marcado.
         */
        input.setAttribute( "name", "t" );

        div.appendChild( input );
        fragment = document.createDocumentFragment();
        fragment.appendChild( div.lastChild );

        /**
         * WebKit não clona o estado verificado corretamente em fragmentos.
         */
        support.checkClone = fragment.cloneNode(true).cloneNode(true).lastChild.checked;

        /**
         * Verifique se uma caixa de seleção desconectada manterá sua marca
         * valor de true após anexado ao DOM (IE6/7).
         */
        support.appendChecked = input.checked;

        fragment.removeChild(input);
        fragment.appendChild(div);

        /**
         * Nós nos preocupamos apenas com o caso em que sistemas de eventos
         * fora da especificação são usados, nomeadamente no IE. A falha aqui
         * nos ajuda a evitar uma chamada de avaliação (em setAttribute) que
         * pode causar CSP para obter.
         */
        if (div.attachEvent)
        {
            for (i in { submit: 1, change: 1, focusin: 1 })
            {
                eventName = "on" + i;
                isSupported = ( eventName in div );

                if (!isSupported)
                {
                    div.setAttribute(eventName, "return;");
                    isSupported = (typeof div[eventName] === "function");
                }

                support[i + "Bubbles"] = isSupported;
            }
        }

        fragment.removeChild(div);

        /**
         * Elementos nulos para evitar falhas no IE.
         */
        fragment = select = opt = div = input = null;

        /**
         * Faça o procedimento de testes que precisam de uma base
         * no documento pronto.
         */
        jQuery(function()
        {
            var container;
            var outer;
            var inner;
            var table;
            var td;
            var offsetSupport;
            var marginDiv;
            var conMarginTop;
            var style;
            var html;
            var positionTopLeftWidthHeight;
            var paddingMarginBorderVisibility;
            var paddingMarginBorder;
            var body = document.getElementsByTagName("body")[0];

            if (!body)
            {
                /**
                 * Retorne para documentos de conjunto de quadros que
                 * não têm uma base.
                 */
                return;
            }

            conMarginTop = 1;
            paddingMarginBorder = "padding: 0; margin: 0; border:";
            positionTopLeftWidthHeight = "position: absolute; top: 0; left: 0; width: 1px; height: 1px;";
            paddingMarginBorderVisibility = paddingMarginBorder + "0; visibility: hidden;";
            style = "style='" + positionTopLeftWidthHeight + paddingMarginBorder + "5px solid #000;";
            html = "<div " + style + "display:block;'><div style='" + paddingMarginBorder + "0; display: block; overflow: hidden;'></div></div>" +
                "<table " + style + "' cellpadding='0' cellspacing='0'>" +
                "<tr><td></td></tr></table>";

            container = document.createElement("div");
            container.style.cssText = paddingMarginBorderVisibility + "width: 0; height: 0; position: static; top: 0; margin-top:" + conMarginTop + "px";
            body.insertBefore( container, body.firstChild );

            /**
             * Construa o elemento de teste.
             */
            div = document.createElement("div");
            container.appendChild( div );

            /**
             * Verifique se as células da tabela ainda têm offsetWidth/Height
             * quando são definidas para display:none e ainda há outras células
             * de tabela visíveis em um linha da tabela; em caso afirmativo,
             * offsetWidth/Height não são confiáveis para uso quando determinando
             * se um elemento foi oculto diretamente usando display:none (ainda é
             * seguro usar compensações se um elemento da camada mais alta para
             * hidden; use óculos de segurança e consulte o bug #4512 para obter
             * mais informações). (apenas o IE 8 falha neste teste).
             */
            div.innerHTML = "<table><tr><td style='" + paddingMarginBorder + "0; display: none;'></td><td>t</td></tr></table>";
            tds = div.getElementsByTagName("td");
            isSupported = (tds[0].offsetHeight === 0);

            tds[0].style.display = "";
            tds[1].style.display = "none";

            /**
             * Verifique se as células vazias da tabela ainda têm
             * offsetWidth/Height. (IE <= 8 falha neste teste).
             */
            support.reliableHiddenOffsets = isSupported && (tds[0].offsetHeight === 0);

            /**
             * Verifique se div com largura explícita e sem margem direita
             * incorretamente obtém a margem direita calculada com base na
             * largura do contêiner. Para mais informações ver bug #3333.
             * Falha no WebKit antes das noites de fevereiro de 2011.
             *
             * WebKit falha 13343 - getComputedStyle retorna valor com falhas
             * para margem direita.
             */
            if (window.getComputedStyle)
            {
                div.innerHTML = "";
                marginDiv = document.createElement("div");
                marginDiv.style.width = "0";
                marginDiv.style.marginRight = "0";

                div.style.width = "2px";
                div.appendChild(marginDiv);
                support.reliableMarginRight = (
                    parseInt(
                        (
                            window.getComputedStyle(marginDiv, null) || {
                                marginRight: 0
                            }
                        ).marginRight, 10
                    ) || 0
                ) === 0;
            }

            if (typeof div.style.zoom !== "undefined")
            {
                /**
                 * Verifique se os elementos de nível de bloco nativo agem como
                 * bloco inline, elementos ao definir sua exibição para 'inline'
                 * e dar a eles layout.
                 *
                 * (IE < 8 faz isso).
                 */
                div.innerHTML = "";
                div.style.width = div.style.padding = "1px";
                div.style.border = 0;
                div.style.overflow = "hidden";
                div.style.display = "inline";
                div.style.zoom = 1;

                support.inlineBlockNeedsLayout = (div.offsetWidth === 3);

                /**
                 * Verifique se os elementos com layout encolhem as camadas
                 * mais baixas.
                 *
                 * (IE 6 faz isso).
                 */
                div.style.display = "block";
                div.style.overflow = "visible";
                div.innerHTML = "<div style='width: 5px;'></div>";
                support.shrinkWrapBlocks = ( div.offsetWidth !== 3 );
            }

            div.style.cssText = positionTopLeftWidthHeight + paddingMarginBorderVisibility;
            div.innerHTML = html;

            outer = div.firstChild;
            inner = outer.firstChild;
            td = outer.nextSibling.firstChild.firstChild;

            offsetSupport = {
                doesNotAddBorder: (inner.offsetTop !== 5),
                doesAddBorderForTableAndCells: (td.offsetTop === 5)
            };

            inner.style.position = "fixed";
            inner.style.top = "20px";

            /**
             * o safari subtrai a largura de borda da camada mais alta aqui,
             * que é 5px.
             */
            offsetSupport.fixedPosition = (inner.offsetTop === 20 || inner.offsetTop === 15);
            inner.style.position = inner.style.top = "";

            outer.style.overflow = "hidden";
            outer.style.position = "relative";

            offsetSupport.subtractsBorderForOverflowNotVisible = (inner.offsetTop === -5);
            offsetSupport.doesNotIncludeMarginInBodyOffset = (body.offsetTop !== conMarginTop);

            if (window.getComputedStyle)
            {
                div.style.marginTop = "1%";
                support.pixelMargin = (window.getComputedStyle(div, null) || { marginTop: 0 }).marginTop !== "1%";
            }

            if (typeof container.style.zoom !== "undefined")
            {
                container.style.zoom = 1;
            }

            body.removeChild(container);
            marginDiv = div = container = null;

            jQuery.extend(support, offsetSupport);
        });

        return support;
    })();

    /**
     *
     */
    var rbrace = /^(?:\{.*\}|\[.*\])$/;
    var rmultiDash = /([A-Z])/g;

    /**
     *
     */
    jQuery.extend({
        cache: {},

        /**
         * Por favor, use com cuidado.
         */
        uuid: 0,

        /**
         * Único para cada cópia do jQuery na página.
         * Não dígitos removidos para corresponder rinlinejQuery.
         */
        expando: "jQuery" + (jQuery.fn.jquery + Math.random()).replace(/\D/g, ""),

        /**
         * Os elementos a seguir lançam exceções incapturáveis se você
         * tentar adicionar propriedades expandindo eles.
         */
        noData: {
            "embed": true,

            /**
             * Remover todos os objetos, exceto Flash (que lida com expandos).
             */
            "object": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
            "applet": true
        },

        /**
         *
         */
        hasData: function(elem)
        {
            elem = elem.nodeType ? jQuery.cache[elem[jQuery.expando]] : elem[jQuery.expando];

            return !!elem && !isEmptyDataObject(elem);
        },

        /**
         * pvt - Somente para uso interno.
         */
        data: function(elem, name, data, pvt)
        {
            if (!jQuery.acceptData(elem))
            {
                return;
            }

            var privateCache;
            var thisCache;
            var ret;
            var internalKey = jQuery.expando;
            var getByName = typeof name === "string";

            /**
             * Temos que lidar com nós DOM e objetos JS de forma diferente
             * porque IE6-7 não é possível GC referências de objeto corretamente
             * através do limite DOM-JS.
             */
            var isNode = elem.nodeType;

            /**
             * Somente nós DOM precisam do cubo jQuery global; Os dados do
             * objeto JS são anexado diretamente ao objeto para que o GC possa
             * ocorrer automaticamente.
             */
            var cache = isNode ? jQuery.cache : elem;

            /**
             * Apenas definir um ID para objetos JS se seu cubo já existir permite
             * o código para atalho no mesmo caminho de um nó DOM sem cubos.
             */
            var id = isNode ? elem[ internalKey ] : elem[ internalKey ] && internalKey;
            var isEvents = name === "events";

            /**
             * Evite fazer mais trabalho do que o necessário ao tentar obter
             * dados em um objeto que não possui nenhum dado.
             */
            if ((!id || !cache[id] || (!isEvents && !pvt && !cache[id].data)) && getByName && data === undefined)
            {
                return;
            }

            if (!id)
            {
                /**
                 * Somente nós DOM precisam de um novo ID exclusivo para cada
                 * elemento, pois seus dados acaba no cubo global.
                 */
                if (isNode)
                {
                    elem[internalKey] = id = ++jQuery.uuid;
                } else
                {
                    id = internalKey;
                }
            }

            if (!cache[id])
            {
                cache[id] = {};

                /**
                 * Evita expor metadados jQuery em objetos JS simples quando
                 * o objeto é serializado usando JSON.stringify.
                 */
                if (!isNode)
                {
                    cache[id].toJSON = jQuery.noop;
                }
            }

            /**
             * Um objeto pode ser passado para jQuery.data em vez de um par
             * chave/valor; isso é copiado superficialmente para o cubo
             * existente.
             */
            if (typeof name === "object" || typeof name === "function")
            {
                if (pvt)
                {
                    cache[id] = jQuery.extend(cache[id], name);
                } else {
                    cache[id].data = jQuery.extend(cache[id].data, name);
                }
            }

            privateCache = thisCache = cache[id];

            /**
             * jQuery data() é armazenado em um objeto separado dentro do cubo
             * de dados interno do objeto para evitar colisões importantes entre
             * os dados internos e os dados definidos pela pessoa.
             */
            if (!pvt)
            {
                if (!thisCache.data)
                {
                    thisCache.data = {};
                }

                thisCache = thisCache.data;
            }

            if (data !== undefined)
            {
                thisCache[jQuery.camelCase(name)] = data;
            }

            /**
             * As pessoas não devem tentar inspecionar o objeto de eventos
             * internos usando jQuery.data, ele não está documentado e está
             * sujeito a alterações.
             */
            if (isEvents && !thisCache[name])
            {
                return privateCache.events;
            }

            /**
             * Verifique os nomes de propriedades de dados convertidos em
             * camelo e não convertidos. Se uma propriedade de dados foi
             * especificada.
             */
            if (getByName)
            {
                /**
                 * Primeiro, tente encontrar dados de propriedade como estão.
                 */
                ret = thisCache[name];

                /**
                 * Teste para dados de propriedade nulos|indefinidos.
                 */
                if (ret == null)
                {
                    /**
                     * Tente encontrar a propriedade camelCased.
                     */
                    ret = thisCache[jQuery.camelCase(name)];
                }
            } else
            {
                ret = thisCache;
            }

            return ret;
        },

        /**
         * pvt - Somente para uso interno.
         */
        removeData: function(elem, name, pvt)
        {
            if (!jQuery.acceptData(elem))
            {
                return;
            }

            var thisCache;
            var i;
            var l;

            /**
             * Referência à chave interna do cubo de dados.
             */
            var internalKey = jQuery.expando;

            /**
             *
             */
            var isNode = elem.nodeType;

            /**
             * Consulte jQuery.data para obter mais informações.
             */
            var cache = isNode ? jQuery.cache : elem;

            /**
             * Consulte jQuery.data para mais informações.
             */
            var id = isNode ? elem[internalKey] : internalKey;

            /**
             * Se já não houver nenhuma entrada de cubos para este objeto,
             * não há propósito em continuar.
             */
            if (!cache[id])
            {
                return;
            }

            if (name)
            {
                thisCache = pvt ? cache[id] : cache[id].data;

                if (thisCache)
                {
                    /**
                     * Suporta vetor ou nomes de sequências de grafemas separados
                     * por espaço para chaves de dados.
                     */
                    if (!jQuery.isArray(name))
                    {
                        /**
                         * Tente a sequência de grafemas como uma chave antes de
                         * qualquer modificação.
                         */
                        if (name in thisCache)
                        {
                            name = [name];
                        } else
                        {
                            /**
                             * Faça a divisão da versão camel case por espaços,
                             * a menos que exista uma chave com os espaços.
                             */
                            name = jQuery.camelCase(name);

                            if (name in thisCache)
                            {
                                name = [name];
                            } else
                            {
                                name = name.split(" ");
                            }
                        }
                    }

                    for (i = 0, l = name.length; i < l; i++)
                    {
                        delete thisCache[name[i]];
                    }

                    /**
                     * Se não houver dados em cubos, queremos continuar e deixar
                     * que o próprio objeto de cubos seja removido.
                     */
                    if (!(pvt ? isEmptyDataObject : jQuery.isEmptyObject)(thisCache))
                    {
                        return;
                    }
                }
            }

            /**
             * Consulte jQuery.data para mais informações.
             */
            if (!pvt)
            {
                delete cache[id].data;

                /**
                 * Não faça a remoção do cubo da camada mais alta, a menos que o
                 * objeto de dados interno tinha sido a única coisa que restava
                 * nele.
                 */
                if (!isEmptyDataObject(cache[id]))
                {
                    return;
                }
            }

            /**
             * Os navegadores que falham na remoção do expando também se recusam
             * a remover o expando na janela, mas permitirá isso em todos os
             * outros objetos JS; outros navegadores não se emporta.
             *
             * Certifique-se de que `cubo` não seja um objeto de janela #10080.
             */
            if (jQuery.support.deleteExpando || !cache.setInterval)
            {
                delete cache[id];
            } else
            {
                cache[id] = null;
            }

            /**
             * Removemos o cubo e precisamos remover o expando no nó para evitar
             * pesquisas falsas no cubo para entradas que não existem mais.
             */
            if (isNode)
            {
                /**
                 * IE não nos permite remover propriedades expando de nós,
                 * nem tem uma função removeAttribute nos nós do Documento;
                 * devemos lidar com todos esses casos.
                 */
                if (jQuery.support.deleteExpando)
                {
                    delete elem[internalKey];
                } else if (elem.removeAttribute)
                {
                    elem.removeAttribute(internalKey);
                } else
                {
                    elem[internalKey] = null;
                }
            }
        },

        /**
         * Apenas para uso interno.
         */
        _data: function(elem, name, data)
        {
            return jQuery.data(elem, name, data, true);
        },

        /**
         * Um método para determinar se um nó DOM pode lidar com a
         * expansão de dados.
         */
        acceptData: function(elem)
        {
            if (elem.nodeName)
            {
                var match = jQuery.noData[elem.nodeName.toLowerCase()];

                if (match)
                {
                    return !(match === true || elem.getAttribute("classid") !== match);
                }
            }

            return true;
        }
    });

    /**
     *
     */
    jQuery.fn.extend({
        /**
         *
         */
        data: function(key, value)
        {
            var parts;
            var part;
            var attr;
            var name;
            var l;
            var elem = this[0];
            var i = 0;
            var data = null;

            /**
             * Obtém todos os valores.
             */
            if (key === undefined)
            {
                if (this.length)
                {
                    data = jQuery.data(elem);

                    if (elem.nodeType === 1 && !jQuery._data(elem, "parsedAttrs"))
                    {
                        attr = elem.attributes;

                        for (l = attr.length; i < l; i++)
                        {
                            name = attr[i].name;

                            if (name.indexOf("data-") === 0)
                            {
                                name = jQuery.camelCase(name.substring(5));
                                dataAttr(elem, name, data[name]);
                            }
                        }

                        jQuery._data(elem, "parsedAttrs", true);
                    }
                }

                return data;
            }

            /**
             * Define vários valores.
             */
            if (typeof key === "object")
            {
                return this.each(function()
                {
                    jQuery.data(this, key);
                });
            }

            parts = key.split(".", 2);
            parts[1] = parts[1] ? "." + parts[1] : "";
            part = parts[1] + "!";

            return jQuery.access(this, function(value)
            {
                if (value === undefined)
                {
                    data = this.triggerHandler("getData" + part, [parts[0]]);

                    /**
                     * Tente buscar quaisquer dados armazenados internamente
                     * primeiro.
                     */
                    if (data === undefined && elem)
                    {
                        data = jQuery.data(elem, key);
                        data = dataAttr(elem, key, data);
                    }

                    return data === undefined && parts[1] ? this.data(parts[0]) : data;
                }

                parts[1] = value;
                this.each(function()
                {
                    var self = jQuery(this);

                    self.triggerHandler("setData" + part, parts);
                    jQuery.data(this, key, value);
                    self.triggerHandler("changeData" + part, parts);
                });
            }, null, value, arguments.length > 1, null, false);
        },

        /**
         *
         */
        removeData: function(key)
        {
            return this.each(function()
            {
                jQuery.removeData(this, key);
            });
        }
    });

    /**
     *
     */
    function dataAttr(elem, key, data)
    {
        /**
         * Se nada foi encontrado internamente, tente buscar qualquer
         * dados do atributo data-* do HTML5.
         */
        if (data === undefined && elem.nodeType === 1)
        {
            var name = "data-" + key.replace(rmultiDash, "-$1").toLowerCase();
                data = elem.getAttribute(name);

            if (typeof data === "string")
            {
                try
                {
                    data = data === "true"
                        ?
                            true
                        :
                            data === "false"
                            ?
                                false
                            :
                                data === "null"
                                ?
                                    null
                                :
                                    jQuery.isNumeric(data)
                                    ?
                                        +data
                                    :
                                        rbrace.test(data)
                                        ?
                                            jQuery.parseJSON(data)
                                        :
                                            data;
                } catch(e)
                {
                }

                /**
                 * Certifique-se de definir os dados para que não sejam
                 * alterados posteriormente.
                 */
                jQuery.data(elem, key, data);
            } else
            {
                data = undefined;
            }
        }

        return data;
    }

    /**
     * Verifica se um objeto de cubos está vazio.
     */
    function isEmptyDataObject(obj)
    {
        for(var name in obj)
        {
            /**
             * Se o objeto de dados públicos estiver vazio, o privado
             * ainda estará vazio.
             */
            if (name === "data" && jQuery.isEmptyObject(obj[name]))
            {
                continue;
            }

            if (name !== "toJSON")
            {
                return false;
            }
        }

        return true;
    }

    /**
     *
     */
    function handleQueueMarkDefer(elem, type, src)
    {
        var deferDataKey = type + "defer";
        var queueDataKey = type + "queue";
        var markDataKey = type + "mark";
        var defer = jQuery._data(elem, deferDataKey);

        if (defer && (src === "queue" || !jQuery._data(elem, queueDataKey)) && (src === "mark" || !jQuery._data(elem, markDataKey)))
        {
            /**
             * Dê espaço para callbacks codificados para enviar primeiro
             * e, eventualmente, marcar/enfileirar algo mais no elemento.
             */
            setTimeout(function()
            {
                if(!jQuery._data(elem, queueDataKey) && !jQuery._data(elem, markDataKey))
                {
                    jQuery.removeData(elem, deferDataKey, true);
                    defer.fire();
                }
            }, 0);
        }
    }

    /**
     *
     */
    jQuery.extend({
        /**
         *
         */
        _mark: function(elem, type)
        {
            if (elem)
            {
                type = (type || "fx") + "mark";
                jQuery._data(elem, type, (jQuery._data(elem, type) || 0) + 1);
            }
        },

        /**
         *
         */
        _unmark: function(force, elem, type)
        {
            if (force !== true)
            {
                type = elem;
                elem = force;
                force = false;
            }

            if (elem)
            {
                type = type || "fx";

                var key = type + "mark";
                var count = force ? 0 : ((jQuery._data(elem, key) || 1) - 1);

                if (count)
                {
                    jQuery._data(elem, key, count);
                } else
                {
                    jQuery.removeData(elem, key, true);
                    handleQueueMarkDefer(elem, type, "mark");
                }
            }
        },

        /**
         *
         */
        queue: function(elem, type, data)
        {
            var q;

            if (elem)
            {
                type = (type || "fx") + "queue";
                q = jQuery._data(elem, type);

                /**
                 * Acelere o desenfileiramento saindo rapidamente se for
                 * apenas uma pesquisa.
                 */
                if (data)
                {
                    if (!q || jQuery.isArray(data))
                    {
                        q = jQuery._data(elem, type, jQuery.makeArray(data));
                    } else
                    {
                        q.push(data);
                    }
                }

                return q || [];
            }
        },

        /**
         *
         */
        dequeue: function(elem, type)
        {
            type = type || "fx";

            var queue = jQuery.queue(elem, type);
            var fn = queue.shift();
            var hooks = {};

            /**
             * Se a fila fx for retirada da fila, sempre remova a sentinela
             * de progresso.
             */
            if (fn === "inprogress")
            {
                fn = queue.shift();
            }

            if (fn)
            {
                /**
                 * Adicione uma sentinela de progresso para evitar que a fila fx
                 * seja desenfileirado automaticamente.
                 */
                if (type === "fx")
                {
                    queue.unshift("inprogress");
                }

                jQuery._data(elem, type + ".run", hooks);
                fn.call(elem, function()
                {
                    jQuery.dequeue(elem, type);
                }, hooks);
            }

            if (!queue.length)
            {
                jQuery.removeData(elem, type + "queue " + type + ".run", true);
                handleQueueMarkDefer(elem, type, "queue");
            }
        }
    });

    /**
     *
     */
    jQuery.fn.extend({
        /**
         *
         */
        queue: function(type, data)
        {
            var setter = 2;

            if (typeof type !== "string")
            {
                data = type;
                type = "fx";
                setter--;
            }

            if (arguments.length < setter)
            {
                return jQuery.queue(this[0], type);
            }

            return data === undefined ?
                this :
                this.each(function()
                {
                    var queue = jQuery.queue(this, type, data);

                    if (type === "fx" && queue[0] !== "inprogress")
                    {
                        jQuery.dequeue(this, type);
                    }
                });
        },

        /**
         *
         */
        dequeue: function(type)
        {
            return this.each(function()
            {
                jQuery.dequeue( this, type );
            });
        },

        /**
         * Baseado no plugin de Clint Helfers, com permissão.
         */
        delay: function(time, type)
        {
            time = jQuery.fx ? jQuery.fx.speeds[time] || time : time;
            type = type || "fx";

            return this.queue(type, function(next, hooks)
            {
                var timeout = setTimeout(next, time);

                hooks.stop = function()
                {
                    clearTimeout(timeout);
                };
            });
        },

        /**
         *
         */
        clearQueue: function(type)
        {
            return this.queue(type || "fx", []);
        },

        /**
         * Obtenha uma promessa resolvida quando filas de um determinado
         * tipo são esvaziados (fx é o tipo comum).
         */
        promise: function(type, object)
        {
            if (typeof type !== "string")
            {
                object = type;
                type = undefined;
            }

            type = type || "fx";

            var defer = jQuery.Deferred();
            var elements = this;
            var i = elements.length;
            var count = 1;
            var deferDataKey = type + "defer";
            var queueDataKey = type + "queue";
            var markDataKey = type + "mark";
            var tmp;

            function resolve()
            {
                if (!(--count))
                {
                    defer.resolveWith(elements, [elements]);
                }
            }

            while (i--)
            {
                if ((tmp = jQuery.data(elements[i], deferDataKey, undefined, true) ||
                    (jQuery.data(elements[i], queueDataKey, undefined, true) ||
                     jQuery.data(elements[i], markDataKey, undefined, true)) &&
                     jQuery.data(elements[i], deferDataKey, jQuery.Callbacks("once memory"), true)))
                {
                    count++;
                    tmp.add(resolve);
                }
            }

            resolve();

            return defer.promise(object);
        }
    });

    /**
     *
     */
    var rclass = /[\n\t\r]/g;
    var rspace = /\s+/;
    var rreturn = /\r/g;
    var rtype = /^(?:button|input)$/i;
    var rfocusable = /^(?:button|input|object|select|textarea)$/i;
    var rclickable = /^a(?:rea)?$/i;
    var rboolean = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i;
    var getSetAttribute = jQuery.support.getSetAttribute;
    var nodeHook;
    var boolHook;
    var fixSpecified;

    /**
     *
     */
    jQuery.fn.extend({
        /**
         *
         */
        attr: function(name, value)
        {
            return jQuery.access(this, jQuery.attr, name, value, arguments.length > 1);
        },

        /**
         *
         */
        removeAttr: function(name)
        {
            return this.each(function()
            {
                jQuery.removeAttr(this, name);
            });
        },

        /**
         *
         */
        prop: function(name, value)
        {
            return jQuery.access(this, jQuery.prop, name, value, arguments.length > 1);
        },

        /**
         *
         */
        removeProp: function(name)
        {
            name = jQuery.propFix[ name ] || name;
            return this.each(function()
            {
                /**
                 * try/catch lida com casos em que o IE hesita (como remover
                 * uma propriedade na janela).
                 */
                try
                {
                    this[name] = undefined;
                    delete this[name];
                } catch(e)
                {
                }
            });
        },

        /**
         *
         */
        addClass: function(value)
        {
            var classNames;
            var i;
            var l;
            var elem;
            var setClass;
            var c;
            var cl;

            if (jQuery.isFunction(value))
            {
                return this.each(function(j)
                {
                    jQuery(this).addClass(value.call(this, j, this.className));
                });
            }

            if (value && typeof value === "string")
            {
                classNames = value.split(rspace);

                for (i = 0, l = this.length; i < l; i++)
                {
                    elem = this[i];

                    if (elem.nodeType === 1)
                    {
                        if (!elem.className && classNames.length === 1)
                        {
                            elem.className = value;
                        } else
                        {
                            setClass = " " + elem.className + " ";

                            for (c = 0, cl = classNames.length; c < cl; c++)
                            {
                                if (!~setClass.indexOf(" " + classNames[c] + " "))
                                {
                                    setClass += classNames[c] + " ";
                                }
                            }

                            elem.className = jQuery.trim(setClass);
                        }
                    }
                }
            }

            return this;
        },

        /**
         *
         */
        removeClass: function(value)
        {
            var classNames;
            var i;
            var l;
            var elem;
            var className;
            var c;
            var cl;

            if (jQuery.isFunction(value))
            {
                return this.each(function(j)
                {
                    jQuery(this).removeClass(value.call(this, j, this.className));
                });
            }

            if ((value && typeof value === "string") || value === undefined)
            {
                classNames = (value || "").split(rspace);

                for (i = 0, l = this.length; i < l; i++)
                {
                    elem = this[i];

                    if (elem.nodeType === 1 && elem.className)
                    {
                        if (value)
                        {
                            className = (" " + elem.className + " ").replace(rclass, " ");

                            for (c = 0, cl = classNames.length; c < cl; c++)
                            {
                                className = className.replace(" " + classNames[ c ] + " ", " ");
                            }

                            elem.className = jQuery.trim(className);
                        } else
                        {
                            elem.className = "";
                        }
                    }
                }
            }

            return this;
        },

        /**
         *
         */
        toggleClass: function(value, stateVal)
        {
            var type = typeof value;
            var isBool = typeof stateVal === "boolean";

            if (jQuery.isFunction(value))
            {
                return this.each(function(i)
                {
                    jQuery(this).toggleClass(value.call(this, i, this.className, stateVal), stateVal);
                });
            }

            return this.each(function()
            {
                if (type === "string")
                {
                    /**
                     * Alternar nomes de classes individuais.
                     */
                    var className;
                    var i = 0;
                    var self = jQuery(this);
                    var state = stateVal;
                    var classNames = value.split(rspace);

                    while ((className = classNames[i++]))
                    {
                        /**
                         * Verifique cada className fornecido, lista separada
                         * por espaço.
                         */
                        state = isBool ? state : !self.hasClass(className);
                        self[state ? "addClass" : "removeClass"](className);
                    }
                } else if (type === "undefined" || type === "boolean")
                {
                    if (this.className)
                    {
                        /**
                         * Armazenar className se definido.
                         */
                        jQuery._data(this, "__className__", this.className);
                    }

                    /**
                     * Alternar inteiro className.
                     */
                    this.className = this.className || value === false ? "" : jQuery._data(this, "__className__") || "";
                }
            });
        },

        /**
         *
         */
        hasClass: function(selector)
        {
            var className = " " + selector + " ";
            var i = 0;
            var l = this.length;

            for (; i < l; i++)
            {
                if (this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf(className) > -1)
                {
                    return true;
                }
            }

            return false;
        },

        /**
         *
         */
        val: function(value)
        {
            var hooks;
            var ret;
            var isFunction;
            var elem = this[0];

            if (!arguments.length)
            {
                if (elem)
                {
                    hooks = jQuery.valHooks[elem.type] || jQuery.valHooks[elem.nodeName.toLowerCase()];

                    if (hooks && "get" in hooks && (ret = hooks.get(elem, "value")) !== undefined)
                    {
                        return ret;
                    }

                    ret = elem.value;

                    return typeof ret === "string"
                        ?
                            /**
                             * lidar com os casos de sequências de grafemas mais
                             * comuns.
                             */
                            ret.replace(rreturn, "")
                        :
                            /**
                             * Lidar com casos em que o valor é nulo/undef ou
                             * número.
                             */
                            ret == null ? "" : ret;
                }

                return;
            }

            isFunction = jQuery.isFunction( value );

            return this.each(function(i)
            {
                var self = jQuery(this);
                var val;

                if (this.nodeType !== 1)
                {
                    return;
                }

                if (isFunction)
                {
                    val = value.call(this, i, self.val());
                } else
                {
                    val = value;
                }

                /**
                 * Tratar nulo/indefinido como ""; converter números em
                 * sequências de grafemas.
                 */
                if (val == null)
                {
                    val = "";
                } else if (typeof val === "number")
                {
                    val += "";
                } else if (jQuery.isArray(val))
                {
                    val = jQuery.map(val, function (value)
                    {
                        return value == null ? "" : value + "";
                    });
                }

                hooks = jQuery.valHooks[this.type] || jQuery.valHooks[this.nodeName.toLowerCase()];

                /**
                 * Se definido retornar indefinido, volte para a
                 * configuração normal.
                 */
                if (!hooks || !("set" in hooks) || hooks.set(this, val, "value") === undefined)
                {
                    this.value = val;
                }
            });
        }
    });

    /**
     *
     */
    jQuery.extend({
        valHooks: {
            option: {
                get: function(elem)
                {
                    /**
                     * attributes.value é indefinido no Blackberry,
                     * mas usa .value. Ver #6932.
                     */
                    var val = elem.attributes.value;

                    return !val || val.specified ? elem.value : elem.text;
                }
            },

            select: {
                get: function(elem)
                {
                    var value;
                    var i;
                    var max;
                    var option;
                    var index = elem.selectedIndex;
                    var values = [];
                    var options = elem.options;
                    var one = elem.type === "select-one";

                    /**
                     * Nada foi selecionado.
                     */
                    if (index < 0)
                    {
                        return null;
                    }

                    /**
                     * Percorra todas as opções selecionadas.
                     */
                    i = one ? index : 0;
                    max = one ? index + 1 : options.length;

                    for (; i < max; i++)
                    {
                        option = options[i];

                        /**
                         * Não retorne opções desabilitadas ou em um optgroup
                         * desabilitado.
                         */
                        if (option.selected && (jQuery.support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null) && (!option.parentNode.disabled || !jQuery.nodeName(option.parentNode, "optgroup")))
                        {
                            /**
                             * Obtenha o valor específico para a opção.
                             */
                            value = jQuery(option).val();

                            /**
                             * Não precisamos de um vetor para um select.
                             */
                            if (one)
                            {
                                return value;
                            }

                            /**
                             * Multi-Selects retornam um vetor.
                             */
                            values.push(value);
                        }
                    }

                    /**
                     * Correção de falha #2551 -- select.val() com falhas
                     * no IE depois de form.reset().
                     */
                    if (one && !values.length && options.length)
                    {
                        return jQuery(options[index]).val();
                    }

                    return values;
                },

                /**
                 *
                 */
                set: function(elem, value)
                {
                    var values = jQuery.makeArray(value);

                    jQuery(elem).find("option").each(function()
                    {
                        this.selected = jQuery.inArray(jQuery(this).val(), values) >= 0;
                    });

                    if (!values.length)
                    {
                        elem.selectedIndex = -1;
                    }

                    return values;
                }
            }
        },

        /**
         *
         */
        attrFn: {
            val: true,
            css: true,
            html: true,
            text: true,
            data: true,
            width: true,
            height: true,
            offset: true
        },

        /**
         *
         */
        attr: function(elem, name, value, pass)
        {
            var ret;
            var hooks;
            var notxml;
            var nType = elem.nodeType;

            /**
             * Não obtenha/defina atributos em nós de texto,
             * comentário e atributo.
             */
            if (!elem || nType === 3 || nType === 8 || nType === 2)
            {
                return;
            }

            if (pass && name in jQuery.attrFn)
            {
                return jQuery(elem)[name](value);
            }

            /**
             * Fallback para prop quando os atributos não são suportados.
             */
            if (typeof elem.getAttribute === "undefined")
            {
                return jQuery.prop(elem, name, value);
            }

            notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

            /**
             * Todos os atributos são minúsculos.
             * Pegue o plug necessário se houver um definido.
             */
            if (notxml)
            {
                name = name.toLowerCase();
                hooks = jQuery.attrHooks[name] || (rboolean.test(name) ? boolHook : nodeHook);
            }

            if (value !== undefined)
            {
                if (value === null)
                {
                    jQuery.removeAttr(elem, name);
                    return;
                } else if (hooks && "set" in hooks && notxml && (ret = hooks.set(elem, value, name)) !== undefined)
                {
                    return ret;
                } else
                {
                    elem.setAttribute(name, "" + value);

                    return value;
                }
            } else if (hooks && "get" in hooks && notxml && (ret = hooks.get(elem, name)) !== null)
            {
                return ret;
            } else
            {
                ret = elem.getAttribute(name);

                /**
                 * Atributos inexistentes retornam nulo, normalizamos
                 * para indefinido.
                 */
                return ret === null ? undefined : ret;
            }
        },

        /**
         *
         */
        removeAttr: function(elem, value)
        {
            var propName;
            var attrNames;
            var name;
            var l;
            var isBool;
            var i = 0;

            if (value && elem.nodeType === 1)
            {
                attrNames = value.toLowerCase().split(rspace);
                l = attrNames.length;

                for (; i < l; i++)
                {
                    name = attrNames[i];

                    if (name)
                    {
                        propName = jQuery.propFix[name] || name;
                        isBool = rboolean.test(name);

                        /**
                         * Consulte #9699 para explicação desse ponto (colocar
                         * primeiro, depois remover). Não faça isso para atributos
                         * booleanos (consulte #10870).
                         */
                        if (!isBool)
                        {
                            jQuery.attr(elem, name, "");
                        }

                        elem.removeAttribute(getSetAttribute ? name : propName);

                        /**
                         * Defina a propriedade correspondente como false para
                         * atributos booleanos.
                         */
                        if (isBool && propName in elem)
                        {
                            elem[propName] = false;
                        }
                    }
                }
            }
        },

        /**
         *
         */
        attrHooks: {
            type: {
                /**
                 *
                 */
                set: function(elem, value)
                {
                    /**
                     * Não podemos permitir que a propriedade type seja alterada
                     * (uma vez que causa falhas no IE).
                     */
                    if (rtype.test(elem.nodeName) && elem.parentNode)
                    {
                        jQuery.error("type property can't be changed");
                    } else if (!jQuery.support.radioValue && value === "radio" && jQuery.nodeName(elem, "input"))
                    {
                        /**
                         * Definir o tipo em um botão de opção após o valor
                         * redefine o valor no IE6-9. Redefina o valor para sua
                         * especificação caso o tipo seja definido após o valor.
                         * Isto é para a criação de elementos.
                         */
                        var val = elem.value;
                            elem.setAttribute("type", value);

                        if (val)
                        {
                            elem.value = val;
                        }

                        return value;
                    }
                }
            },

            /**
             * Use a propriedade value para retrocompatibilidade.
             * Use o nodeHook para elementos de botão em IE6/7 (#1954).
             */
            value: {
                /**
                 *
                 */
                get: function(elem, name)
                {
                    if (nodeHook && jQuery.nodeName(elem, "button"))
                    {
                        return nodeHook.get(elem, name);
                    }

                    return name in elem ? elem.value : null;
                },

                /**
                 *
                 */
                set: function(elem, value, name)
                {
                    if (nodeHook && jQuery.nodeName(elem, "button"))
                    {
                        return nodeHook.set(elem, value, name);
                    }

                    /**
                     * Não retorna para que setAttribute também seja usado.
                     */
                    elem.value = value;
                }
            }
        },

        /**
         *
         */
        propFix: {
            tabindex: "tabIndex",
            readonly: "readOnly",
            "for": "htmlFor",
            "class": "className",
            maxlength: "maxLength",
            cellspacing: "cellSpacing",
            cellpadding: "cellPadding",
            rowspan: "rowSpan",
            colspan: "colSpan",
            usemap: "useMap",
            frameborder: "frameBorder",
            contenteditable: "contentEditable"
        },

        /**
         *
         */
        prop: function(elem, name, value)
        {
            var ret;
            var hooks;
            var notxml;
            var nType = elem.nodeType;

            /**
             * Não obtenha/defina propriedades em nós de texto,
             * comentário e atributo.
             */
            if (!elem || nType === 3 || nType === 8 || nType === 2)
            {
                return;
            }

            notxml = nType !== 1 || !jQuery.isXMLDoc(elem);

            if (notxml)
            {
                /**
                 * Melhorar nome e anexar plugs.
                 */
                name = jQuery.propFix[name] || name;
                hooks = jQuery.propHooks[name];
            }

            if (value !== undefined)
            {
                if (hooks && "set" in hooks && (ret = hooks.set(elem, value, name)) !== undefined)
                {
                    return ret;
                } else
                {
                    return (elem[name] = value);
                }
            } else
            {
                if (hooks && "get" in hooks && (ret = hooks.get(elem, name)) !== null)
                {
                    return ret;
                } else
                {
                    return elem[name];
                }
            }
        },

        /**
         *
         */
        propHooks: {
            tabIndex: {
                /**
                 *
                 */
                get: function(elem)
                {
                    /**
                     * elem.tabIndex nem sempre devolve o valor correto quando
                     * não foi definido explicitamente
                     */
                    var attributeNode = elem.getAttributeNode("tabindex");

                    return attributeNode && attributeNode.specified
                        ?
                            parseInt(attributeNode.value, 10)
                        :
                            rfocusable.test(elem.nodeName) || rclickable.test(elem.nodeName) && elem.href ? 0 : undefined;
                }
            }
        }
    });

    /**
     * Adicione tabIndex propHook a attrHooks para compatibilidade
     * com versões anteriores (casos diferentes são intencionais).
     */
    jQuery.attrHooks.tabindex = jQuery.propHooks.tabIndex;

    /**
     * Plug para atributos booleanos.
     */
    boolHook = {
        /**
         *
         */
        get: function(elem, name)
        {
            /**
             * Alinhe os atributos booleanos com as propriedades
             * correspondentes. Devolve ao atributo presença onde
             * alguns booleanos não são suportados.
             */
            var attrNode;
            var property = jQuery.prop(elem, name);

            return property === true || typeof property !== "boolean" && (attrNode = elem.getAttributeNode(name)) && attrNode.nodeValue !== false ? name.toLowerCase() : undefined;
        },

        /**
         *
         */
        set: function(elem, value, name)
        {
            var propName;

            if (value === false)
            {
                /**
                 * Remova os atributos booleanos quando definido como falso.
                 */
                jQuery.removeAttr(elem, name);
            } else
            {
                /**
                 * value é verdadeiro, pois sabemos que neste ponto é do tipo
                 * booleano e não falso. Defina atributos booleanos com o mesmo
                 * nome e defina a propriedade DOM.
                 */
                propName = jQuery.propFix[name] || name;

                if (propName in elem)
                {
                    /**
                     * Apenas defina o IDL especificamente se ele já
                     * existir no elemento.
                     */
                    elem[propName] = true;
                }

                elem.setAttribute(name, name.toLowerCase());
            }

            return name;
        }
    };

    /**
     * O IE6/7 não oferece suporte à obtenção/configuração de
     * alguns atributos com get/setAttribute.
     */
    if (!getSetAttribute)
    {
        fixSpecified = {
            name: true,
            id: true,
            coords: true
        };

        /**
         * Use isso para qualquer atributo no IE6/7.
         * Isso melhora quase todas as falhas do IE6/7.
         */
        nodeHook = jQuery.valHooks.button = {
            /**
             *
             */
            get: function(elem, name)
            {
                var ret;
                    ret = elem.getAttributeNode(name);

                return ret && (fixSpecified[name] ? ret.nodeValue !== "" : ret.specified) ? ret.nodeValue : undefined;
            },

            /**
             *
             */
            set: function(elem, value, name)
            {
                /**
                 * Defina o existente ou crie um novo nó de atributo.
                 */
                var ret = elem.getAttributeNode(name);

                if (!ret)
                {
                    ret = document.createAttribute(name);
                    elem.setAttributeNode(ret);
                }

                return (ret.nodeValue = value + "");
            }
        };

        /**
         * Aplique o nodeHook ao tabindex.
         */
        jQuery.attrHooks.tabindex.set = nodeHook.set;

        /**
         * Definir largura e altura para automático em vez de 0 em
         * vazio string(Falha #8150). Isto é para remoções.
         */
        jQuery.each(["width", "height"], function(i, name)
        {
            jQuery.attrHooks[name] = jQuery.extend(jQuery.attrHooks[name],
            {
                set: function(elem, value)
                {
                    if (value === "")
                    {
                        elem.setAttribute(name, "auto");

                        return value;
                    }
                }
            });
        });

        /**
         * Defina contenteditable como false em removals(#10429). Definir
         * como string vazia gera uma falha como um valor não muito válido.
         */
        jQuery.attrHooks.contenteditable = {
            get: nodeHook.get,
            set: function(elem, value, name)
            {
                if (value === "")
                {
                    value = "false";
                }

                nodeHook.set(elem, value, name);
            }
        };
    }

    /**
     * Alguns atributos requerem uma chamada especial no IE.
     */
    if (!jQuery.support.hrefNormalized)
    {
        jQuery.each(["href", "src", "width", "height"], function(i, name)
        {
            jQuery.attrHooks[name] = jQuery.extend(jQuery.attrHooks[name],
            {
                get: function(elem)
                {
                    var ret = elem.getAttribute(name, 2);

                    return ret === null ? undefined : ret;
                }
            });
        });
    }

    /**
     *
     */
    if (!jQuery.support.style)
    {
        jQuery.attrHooks.style = {
            /**
             *
             */
            get: function(elem)
            {
                /**
                 * Retorno indefinido no caso de string vazia. Normalize para
                 * letras minúsculas, já que o IE coloca nomes de propriedades
                 * css em letras maiúsculas.
                 */
                return elem.style.cssText.toLowerCase() || undefined;
            },

            /**
             *
             */
            set: function(elem, value)
            {
                return (elem.style.cssText = "" + value);
            }
        };
    }

    /**
     * O Safari envia a propriedade selecionada comum de uma opção.
     * Acessar a propriedade selectedIndex da camada mais alta melhora isso.
     */
    if (!jQuery.support.optSelected )
    {
        jQuery.propHooks.selected = jQuery.extend(jQuery.propHooks.selected,
        {
            get: function(elem)
            {
                var parent = elem.parentNode;

                if (parent)
                {
                    parent.selectedIndex;

                    /**
                     * Certifique-se de que também funciona com optgroups,
                     * consulte #5701.
                     */
                    if (parent.parentNode)
                    {
                        parent.parentNode.selectedIndex;
                    }
                }

                return null;
            }
        });
    }

    /**
     * Codificação de tipo de chamada do IE6/7.
     */
    if (!jQuery.support.enctype)
    {
        jQuery.propFix.enctype = "encoding";
    }

    /**
     * Getter/setter de rádios e caixas de seleção.
     */
    if (!jQuery.support.checkOn)
    {
        jQuery.each(["radio", "checkbox"], function()
        {
            jQuery.valHooks[this] = {
                get: function(elem)
                {
                    /**
                     * Lide com o caso em que no Webkit "" é retornado em
                     * vez de "on" se um valor não for especificado.
                     */
                    return elem.getAttribute("value") === null ? "on" : elem.value;
                }
            };
        });
    }

    /**
     *
     */
    jQuery.each(["radio", "checkbox"], function()
    {
        jQuery.valHooks[this] = jQuery.extend(jQuery.valHooks[this],
        {
            set: function(elem, value)
            {
                if (jQuery.isArray(value))
                {
                    return (elem.checked = jQuery.inArray(jQuery(elem).val(), value) >= 0);
                }
            }
        });
    });

    /**
     *
     */
    var rformElems = /^(?:textarea|input|select)$/i;
    var rtypenamespace = /^([^\.]*)?(?:\.(.+))?$/;
    var rhoverHack = /(?:^|\s)hover(\.\S+)?\b/;
    var rkeyEvent = /^key/;
    var rmouseEvent = /^(?:mouse|contextmenu)|click/;
    var rfocusMorph = /^(?:focusinfocus|focusoutblur)$/;
    var rquickIs = /^(\w*)(?:#([\w\-]+))?(?:\.([\w\-]+))?$/;

    /**
     *
     */
    var quickParse = function(selector)
    {
        var quick = rquickIs.exec(selector);

        if (quick)
        {
            /**
             *    0    1   2     3.
             * [ _, tag, id, class ].
             */
            quick[1] = ( quick[1] || "" ).toLowerCase();
            quick[3] = quick[3] && new RegExp( "(?:^|\\s)" + quick[3] + "(?:\\s|$)" );
        }

        return quick;
    };

    /**
     *
     */
    var quickIs = function(elem, m)
    {
        var attrs = elem.attributes || {};

        return (
            (!m[1] || elem.nodeName.toLowerCase() === m[1]) &&
            (!m[2] || (attrs.id || {}).value === m[2]) &&
            (!m[3] || m[3].test( (attrs[ "class" ] || {}).value ))
        );
    };

    /**
     *
     */
    var hoverHack = function(events)
    {
        return jQuery.event.special.hover ? events : events.replace( rhoverHack, "mouseenter$1 mouseleave$1" );
    };

    /**
     * Funções auxiliares para gerenciamento de eventos -- não
     * fazem parte da interface pública. Adereços à biblioteca
     * addEvent para muitas das ideias.
     */
    jQuery.event = {
        /**
         *
         */
        add: function(elem, types, handler, data, selector)
        {
            var elemData;
            var eventHandle;
            var events;
            var t;
            var tns;
            var type;
            var namespaces;
            var handleObj;
            var handleObjIn;
            var quick;
            var handlers;
            var special;

            /**
             * Não anexe eventos a noData ou nós de texto/comentário (permita
             * objetos simples).
             */
            if (elem.nodeType === 3 || elem.nodeType === 8 || !types || !handler || !(elemData = jQuery._data(elem)))
            {
                return;
            }

            /**
             * O chamador pode passar um objeto de dados personalizados
             * no lugar do modificador.
             */
            if (handler.handler)
            {
                handleObjIn = handler;
                handler = handleObjIn.handler;
                selector = handleObjIn.selector;
            }

            /**
             * Certifique-se de que o modificador tenha um ID exclusivo,
             * usado para localizá-lo/removê-lo posteriormente.
             */
            if (!handler.guid)
            {
                handler.guid = jQuery.guid++;
            }

            /**
             * Inicie a estrutura de eventos do elemento e o modificador
             * principal, se este for o primeiro.
             */
            events = elemData.events;

            if (!events)
            {
                elemData.events = events = {};
            }

            eventHandle = elemData.handle;

            if (!eventHandle)
            {
                elemData.handle = eventHandle = function(e)
                {
                    /**
                     * Descarte o segundo evento de um jQuery.event.trigger() e
                     * quando um evento é chamado após o descarregamento de
                     * uma página.
                     */
                    return typeof jQuery !== "undefined" && (!e || jQuery.event.triggered !== e.type) ?
                        jQuery.event.dispatch.apply( eventHandle.elem, arguments ) :
                        undefined;
                };

                /**
                 * Adicione elem como uma propriedade do identificador fn para
                 * evitar uma passagem de cubos com eventos não nativos do IE.
                 */
                eventHandle.elem = elem;
            }

            /**
             * Modifique vários eventos separados por um espaço.
             *
             * jQuery(...).bind("mouseover mouseout", fn);
             */
            types = jQuery.trim(hoverHack(types)).split(" ");

            for (t = 0; t < types.length; t++)
            {
                tns = rtypenamespace.exec(types[t]) || [];
                type = tns[1];
                namespaces = (tns[2] || "").split(".").sort();

                /**
                 * Se o evento mudar de tipo, use os modificadores de eventos
                 * especiais para o tipo alterado.
                 */
                special = jQuery.event.special[ type ] || {};

                /**
                 * Se o seletor for definido, determine o tipo de API de
                 * evento especial, caso contrário, o tipo fornecido.
                 */
                type = (selector ? special.delegateType : special.bindType) || type;

                /**
                 * Atualização especial com base no novo tipo de redefinição.
                 */
                special = jQuery.event.special[type] || {};

                /**
                 * handleObj é passado para todos os modificadores de eventos.
                 */
                handleObj = jQuery.extend({
                    type: type,
                    origType: tns[1],
                    data: data,
                    handler: handler,
                    guid: handler.guid,
                    selector: selector,
                    quick: selector && quickParse( selector ),
                    namespace: namespaces.join(".")
                }, handleObjIn );

                /**
                 * Inicie a fila do modificador de eventos se formos os primeiros.
                 */
                handlers = events[type];

                if (!handlers)
                {
                    handlers = events[type] = [];
                    handlers.delegateCount = 0;

                    /**
                     * Use apenas addEventListener/attachEvent se o modificador de
                     * eventos especiais retornar falso.
                     */
                    if (!special.setup || special.setup.call(elem, data, namespaces, eventHandle) === false)
                    {
                        /**
                         * Vincule o modificador de eventos global ao elemento.
                         */
                        if (elem.addEventListener)
                        {
                            elem.addEventListener(type, eventHandle, false);
                        } else if (elem.attachEvent)
                        {
                            elem.attachEvent("on" + type, eventHandle);
                        }
                    }
                }

                if (special.add)
                {
                    special.add.call(elem, handleObj);

                    if (!handleObj.handler.guid)
                    {
                        handleObj.handler.guid = handler.guid;
                    }
                }

                /**
                 * Adicione à lista de modificadores do elemento,
                 * delegações na frente.
                 */
                if (selector)
                {
                    handlers.splice(handlers.delegateCount++, 0, handleObj);
                } else
                {
                    handlers.push(handleObj);
                }

                /**
                 * Acompanhe quais eventos já foram usados, para
                 * otimização de eventos.
                 */
                jQuery.event.global[ type ] = true;
            }

            /**
             * Anule o elemento para evitar envios de cubos no IE.
             */
            elem = null;
        },

        /**
         *
         */
        global: {},

        /**
         * Desanexar um evento ou conjunto de eventos de um elemento.
         */
        remove: function(elem, types, handler, selector, mappedTypes)
        {
            var elemData = jQuery.hasData(elem) && jQuery._data(elem);
            var t;
            var tns;
            var type;
            var origType;
            var namespaces;
            var origCount;
            var j;
            var events;
            var special;
            var handle;
            var eventType;
            var handleObj;

            if (!elemData || !(events = elemData.events))
            {
                return;
            }

            /**
             * Uma vez para cada type.namespace em tipos; tipo pode ser omitido.
             */
            types = jQuery.trim(hoverHack(types || "")).split(" ");

            for (t = 0; t < types.length; t++)
            {
                tns = rtypenamespace.exec(types[t]) || [];
                type = origType = tns[1];
                namespaces = tns[2];

                /**
                 * Desvincule todos os eventos (neste namespace, se
                 * fornecido) para o elemento.
                 */
                if (!type)
                {
                    for (type in events)
                    {
                        jQuery.event.remove(elem, type + types[t], handler, selector, true);
                    }

                    continue;
                }

                special = jQuery.event.special[type] || {};
                type = (selector? special.delegateType : special.bindType) || type;
                eventType = events[type] || [];
                origCount = eventType.length;
                namespaces = namespaces ? new RegExp("(^|\\.)" + namespaces.split(".").sort().join("\\.(?:.*\\.)?") + "(\\.|$)") : null;

                /**
                 * Remova os eventos correspondentes..
                 */
                for (j = 0; j < eventType.length; j++)
                {
                    handleObj = eventType[ j ];

                    if ((mappedTypes || origType === handleObj.origType) &&
                        (!handler || handler.guid === handleObj.guid) &&
                        (!namespaces || namespaces.test( handleObj.namespace)) &&
                        (!selector || selector === handleObj.selector || selector === "**" && handleObj.selector))
                    {
                        eventType.splice(j--, 1);

                        if (handleObj.selector)
                        {
                            eventType.delegateCount--;
                        }

                        if (special.remove)
                        {
                            special.remove.call(elem, handleObj);
                        }
                    }
                }

                /**
                 * Remova o modificador de eventos genéricos se removemos algo
                 * e não existem mais modificadores (evita o potencial de
                 * recursão sem fim durante a remoção de modificadores de
                 * eventos especiais).
                 */
                if (eventType.length === 0 && origCount !== eventType.length)
                {
                    if (!special.teardown || special.teardown.call(elem, namespaces) === false)
                    {
                        jQuery.removeEvent(elem, type, elemData.handle);
                    }

                    delete events[type];
                }
            }

            /**
             * Remova o expanso se não for mais usado.
             */
            if (jQuery.isEmptyObject(events))
            {
                handle = elemData.handle;

                if (handle)
                {
                    handle.elem = null;
                }

                /**
                 * removeData também verifica se está vazio e limpa o expando
                 * se estiver vazio, portanto, use-o em vez de remover.
                 */
                jQuery.removeData(elem, ["events", "handle"], true);
            }
        },

        /**
         * Eventos que são seguros para bases se nenhum modificador
         * estiver conectado. Eventos DOM nativos não devem ser adicionados,
         * eles podem ter modificadores embutidos.
         */
        customEvent: {
            "getData": true,
            "setData": true,
            "changeData": true
        },

        /**
         *
         */
        trigger: function(event, data, elem, onlyHandlers)
        {
            /**
             * Não faça eventos em nós de texto e comentários.
             */
            if (elem && (elem.nodeType === 3 || elem.nodeType === 8))
            {
                return;
            }

            /**
             * Objeto de evento ou tipo de evento.
             */
            var type = event.type || event;
            var namespaces = [];
            var cache;
            var exclusive;
            var i;
            var cur;
            var old;
            var ontype;
            var special;
            var handle;
            var eventPath;
            var bubbleType;

            /**
             * foco/desfoque se transforma em foco/saída; garantir que não
             * os estamos removendo agora.
             */
            if (rfocusMorph.test(type + jQuery.event.triggered))
            {
                return;
            }

            if (type.indexOf("!") >= 0)
            {
                /**
                 * Eventos exclusivos são acionados apenas para o
                 * evento exato (sem namespaces).
                 */
                type = type.slice(0, -1);
                exclusive = true;
            }

            if (type.indexOf(".") >= 0)
            {
                /**
                 * Técnica com namespace; crie um regexp para corresponder
                 * ao tipo de evento em handle().
                 */
                namespaces = type.split(".");
                type = namespaces.shift();
                namespaces.sort();
            }

            if ((!elem || jQuery.event.customEvent[type]) && !jQuery.event.global[type])
            {
                /**
                 * Nenhum modificador jQuery para este tipo de evento e
                 * ele não pode ter modificadores embutidos.
                 */
                return;
            }

            /**
             * O chamador pode passar um evento, objeto ou apenas uma
             * sequência de grafemas do tipo de evento.
             */
            event = typeof event === "object" ?
                /**
                 * Objeto jQuery.Event.
                 */
                event[ jQuery.expando ] ? event :

                /**
                 * Objecto literal.
                 */
                new jQuery.Event(type, event):

                /**
                 * Apenas o tipo de evento (string).
                 */
                new jQuery.Event(type);

            event.type = type;
            event.isTrigger = true;
            event.exclusive = exclusive;
            event.namespace = namespaces.join( "." );
            event.namespace_re = event.namespace? new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.)?") + "(\\.|$)") : null;
            ontype = type.indexOf( ":" ) < 0 ? "on" + type : "";

            /**
             * Lidar com um envio global.
             */
            if (!elem)
            {
                /**
                 * Questão: Pare de enviar para os cubos de dados; remova
                 * eventos globais e sempre anexe ao documento.
                 */
                cache = jQuery.cache;

                for (i in cache)
                {
                    if (cache[i].events && cache[i].events[type])
                    {
                        jQuery.event.trigger(event, data, cache[i].handle.elem, true);
                    }
                }

                return;
            }

            /**
             * Limpe o evento caso ele esteja sendo reutilizado.
             */
            event.result = undefined;

            if (!event.target)
            {
                event.target = elem;
            }

            /**
             * Clone todos os dados recebidos e anexe o evento, criando
             * a lista de argumentos do modificador.
             */
            data = data != null ? jQuery.makeArray(data) : [];
            data.unshift(event);

            /**
             * Permita que eventos especiais sejam desenhados fora das linhas.
             */
            special = jQuery.event.special[type] || {};

            if (special.trigger && special.trigger.apply(elem, data) === false)
            {
                return;
            }

            /**
             * Determine o caminho de propagação do evento com antecedência, de
             * acordo com as especificações de eventos do W3C (#9951). Bolha para
             * o documento, depois para a janela; procure um proprietário
             * globalDocument var (#9724).
             */
            eventPath = [[elem, special.bindType || type]];

            if (!onlyHandlers && !special.noBubble && !jQuery.isWindow(elem))
            {
                bubbleType = special.delegateType || type;
                cur = rfocusMorph.test(bubbleType + type) ? elem : elem.parentNode;
                old = null;

                for (; cur; cur = cur.parentNode)
                {
                    eventPath.push([cur, bubbleType]);
                    old = cur;
                }

                /**
                 * Adicione janela apenas se tivermos que documentar
                 * (por exemplo, não obj simples ou DOM separado).
                 */
                if (old && old === elem.ownerDocument)
                {
                    eventPath.push([old.defaultView || old.parentWindow || window, bubbleType]);
                }
            }

            /**
             * Acione modificadores no caminho do evento.
             */
            for (i = 0; i < eventPath.length && !event.isPropagationStopped(); i++)
            {
                cur = eventPath[i][0];
                event.type = eventPath[i][1];
                handle = (jQuery._data(cur, "events") || {} )[event.type] && jQuery._data(cur, "handle");

                if (handle)
                {
                    handle.apply(cur, data);
                }

                /**
                 * Observe que esta é uma função JS simples e não um
                 * modificador jQuery.
                 */
                handle = ontype && cur[ontype];

                if (handle && jQuery.acceptData(cur) && handle.apply(cur, data) === false)
                {
                    event.preventDefault();
                }
            }

            event.type = type;

            /**
             * Se ninguém impediu a ação comum.
             */
            if (!onlyHandlers && !event.isDefaultPrevented())
            {
                if ((!special._default || special._default.apply(elem.ownerDocument, data) === false) && !(type === "click" && jQuery.nodeName(elem, "a")) && jQuery.acceptData(elem))
                {
                    /**
                     * Chame um método DOM nativo no destino com o mesmo nome
                     * do evento. Não é possível usar uma verificação .isFunction()
                     * aqui porque o IE6/7 falha nesse teste. Não faça ações comum
                     * na janela, é onde as variáveis globais estão (#6170). IE <9
                     * fecha em foco/desfoque para elemento oculto (#1486).
                     */
                    if (ontype && elem[type] && ((type !== "focus" && type !== "blur") || event.target.offsetWidth !== 0) && !jQuery.isWindow(elem))
                    {
                        /**
                         * Não acione novamente um evento onEXAMPLE quando
                         * chamamos seu método EXAMPLE().
                         */
                        old = elem[ontype];

                        if (old)
                        {
                            elem[ontype] = null;
                        }

                        /**
                         * Impedir o novo acionamento do mesmo evento, pois já
                         * o mencionamos acima.
                         */
                        jQuery.event.triggered = type;
                        elem[type]();

                        jQuery.event.triggered = undefined;

                        if (old)
                        {
                            elem[ontype] = old;
                        }
                    }
                }
            }

            return event.result;
        },

        /**
         *
         */
        dispatch: function(event)
        {
            /**
             * Crie um jQuery.Event gravável a partir do objeto de evento nativo.
             */
            event = jQuery.event.fix(event || window.event);

            var handlers = ((jQuery._data(this, "events") || {})[event.type] || []);
            var delegateCount = handlers.delegateCount;
            var args = [].slice.call(arguments, 0);
            var run_all = !event.exclusive && !event.namespace;
            var special = jQuery.event.special[event.type] || {};
            var handlerQueue = [];
            var i;
            var j;
            var cur;
            var jqcur;
            var ret;
            var selMatch;
            var matched;
            var matches;
            var handleObj;
            var sel;
            var related;

            /**
             * Use o jQuery.Event melhorado em vez do evento nativo
             * (somente leitura).
             */
            args[0] = event;
            event.delegateTarget = this;

            /**
             * Chame o plug preDispatch para o tipo mapeado e deixe-o
             * sair, se desejar.
             */
            if (special.preDispatch && special.preDispatch.call(this, event) === false)
            {
                return;
            }

            /**
             * Determine modificadores que devem ser um procedimento se houver
             * eventos em delegações. Evite o borbulhar do botão esquerdo do
             * mouse em Firefox (#3861).
             */
            if (delegateCount && !(event.button && event.type === "click"))
            {
                /**
                 * Pré-gerar um único objeto jQuery para reutilização com .is().
                 */
                jqcur = jQuery(this);
                jqcur.context = this.ownerDocument || this;

                for (cur = event.target; cur != this; cur = cur.parentNode || this)
                {
                    /**
                     * Não processe eventos em elementos desabilitados (#6911, #8165).
                     */
                    if (cur.disabled !== true)
                    {
                        selMatch = {};
                        matches = [];
                        jqcur[0] = cur;

                        for (i = 0; i < delegateCount; i++)
                        {
                            handleObj = handlers[i];
                            sel = handleObj.selector;

                            if (selMatch[sel] === undefined)
                            {
                                selMatch[sel] = (
                                    handleObj.quick ? quickIs(cur, handleObj.quick) : jqcur.is(sel)
                                );
                            }

                            if (selMatch[sel])
                            {
                                matches.push(handleObj);
                            }
                        }

                        if (matches.length)
                        {
                            handlerQueue.push({ elem: cur, matches: matches });
                        }
                    }
                }
            }

            /**
             * Adicione os modificadores restantes (associados diretamente).
             */
            if (handlers.length > delegateCount)
            {
                handlerQueue.push({ elem: this, matches: handlers.slice(delegateCount) });
            }

            /**
             * Faça o procedimento das delegações primeiro; eles podem querer
             * terminar a propagação abaixo de nós.
             */
            for (i = 0; i < handlerQueue.length && !event.isPropagationStopped(); i++)
            {
                matched = handlerQueue[ i ];
                event.currentTarget = matched.elem;

                for (j = 0; j < matched.matches.length && !event.isImmediatePropagationStopped(); j++)
                {
                    handleObj = matched.matches[j];

                    /**
                     * O evento acionado deve ser:
                     *     1) não exclusivo e não ter namespace ou,
                     *     2) têm namespace(s) em um subconjunto ou iguais aos
                     *        do evento vinculado (ambos não podem ter namespace).
                     */
                    if (run_all || (!event.namespace && !handleObj.namespace) || event.namespace_re && event.namespace_re.test(handleObj.namespace))
                    {
                        event.data = handleObj.data;
                        event.handleObj = handleObj;

                        ret = ((jQuery.event.special[handleObj.origType] || {}).handle || handleObj.handler)
                                .apply(matched.elem, args);

                        if (ret !== undefined)
                        {
                            event.result = ret;

                            if (ret === false)
                            {
                                event.preventDefault();
                                event.stopPropagation();
                            }
                        }
                    }
                }
            }

            /**
             * Chame o plug postDispatch para o tipo mapeado.
             */
            if (special.postDispatch)
            {
                special.postDispatch.call(this, event);
            }

            return event.result;
        },

        /**
         * Inclui alguns adereços de evento compartilhados por KeyEvent
         * e MouseEvent. attrChange attrName relatedNode srcElement não
         * são normalizados, não-W3C, não tem mais uso, serão removidos
         * na versão 1.8.
         */
        props: "attrChange attrName relatedNode srcElement altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),

        /**
         *
         */
        fixHooks: {},

        /**
         *
         */
        keyHooks: {
            props: "char charCode key keyCode".split(" "),
            filter: function(event, original)
            {
                /**
                 * Adicione which para eventos-chave.
                 */
                if (event.which == null)
                {
                    event.which = original.charCode != null ? original.charCode : original.keyCode;
                }

                return event;
            }
        },

        /**
         *
         */
        mouseHooks: {
            props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
            filter: function(event, original)
            {
                var eventDoc;
                var doc;
                var body;
                var button = original.button;
                var fromElement = original.fromElement;

                /**
                 * Calcule a páginaX/Y se estiver ausente e o clienteX/Y disponível.
                 */
                if (event.pageX == null && original.clientX != null)
                {
                    eventDoc = event.target.ownerDocument || document;
                    doc = eventDoc.documentElement;
                    body = eventDoc.body;

                    event.pageX = original.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
                    event.pageY = original.clientY + (doc && doc.scrollTop || body && body.scrollTop  || 0) - (doc && doc.clientTop || body && body.clientTop || 0);
                }

                /**
                 * Adicione relatedTarget, se necessário.
                 */
                if (!event.relatedTarget && fromElement)
                {
                    event.relatedTarget = fromElement === event.target ? original.toElement : fromElement;
                }

                /**
                 * Adicionar qual para clicar:
                 *     1 === left;
                 *     2 === middle;
                 *     3 === right.
                 *
                 * Observação: botão não é normalizado, então não o use.
                 */
                if (!event.which && button !== undefined)
                {
                    event.which = (button & 1 ? 1 : (button & 2 ? 3 : (button & 4 ? 2 : 0)));
                }

                return event;
            }
        },

        /**
         *
         */
        fix: function(event)
        {
            if (event[jQuery.expando])
            {
                return event;
            }

            /**
             * Crie uma cópia gravável do objeto de evento e normalize
             * algumas propriedades.
             */
            var i;
            var prop;
            var originalEvent = event;
            var fixHook = jQuery.event.fixHooks[event.type] || {};
            var copy = fixHook.props ? this.props.concat(fixHook.props) : this.props;

            event = jQuery.Event(originalEvent);

            for (i = copy.length; i;)
            {
                prop = copy[--i];
                event[prop] = originalEvent[prop];
            }

            /**
             * Melhora a propriedade de destino, se necessário
             * (#1925, IE 6/7/8 & Safari2).
             */
            if (!event.target)
            {
                event.target = originalEvent.srcElement || document;
            }

            /**
             * O destino não deve ser um nó de texto (#504, Safari).
             */
            if (event.target.nodeType === 3)
            {
                event.target = event.target.parentNode;
            }

            /**
             * Para eventos de mouse/tecla; adicione metaKey se não
             * estiver lá (#3368, IE6/7/8).
             */
            if (event.metaKey === undefined)
            {
                event.metaKey = event.ctrlKey;
            }

            return fixHook.filter? fixHook.filter(event, originalEvent) : event;
        },

        /**
         *
         */
        special: {
            /**
             *
             */
            ready: {
                /**
                 * Certifique-se de que o evento pronto esteja configurado.
                 */
                setup: jQuery.bindReady
            },

            /**
             *
             */
            load: {
                /**
                 * Impedir que eventos image.load acionados borbulhem
                 * para window.load.
                 */
                noBubble: true
            },

            /**
             *
             */
            focus: {
                delegateType: "focusin"
            },

            /**
             *
             */
            blur: {
                delegateType: "focusout"
            },

            /**
             *
             */
            beforeunload: {
                /**
                 *
                 */
                setup: function(data, namespaces, eventHandle)
                {
                    /**
                     * Queremos apenas fazer este caso especial no Windows.
                     */
                    if (jQuery.isWindow(this))
                    {
                        this.onbeforeunload = eventHandle;
                    }
                },

                /**
                 *
                 */
                teardown: function(namespaces, eventHandle)
                {
                    if (this.onbeforeunload === eventHandle)
                    {
                        this.onbeforeunload = null;
                    }
                }
            }
        },

        /**
         *
         */
        simulate: function(type, elem, event, bubble)
        {
            /**
             * Pega carona em um evento de envio para simular outro diferente.
             * Falso originalEvent para evitar stopPropagation de envio, mas se o
             * evento simulado impede a inadimplência, então fazemos o mesmo
             * no envio.
             */
            var e = jQuery.extend(
                new jQuery.Event(),
                event,
                {
                    type: type,
                    isSimulated: true,
                    originalEvent: {}
                }
            );

            if (bubble)
            {
                jQuery.event.trigger(e, null, elem);
            } else
            {
                jQuery.event.dispatch.call(elem, e);
            }

            if (e.isDefaultPrevented())
            {
                event.preventDefault();
            }
        }
    };

    /**
     * Alguns plugins estão sendo usados, mas não estão documentados/em uso
     * e serão removidos. A interface de evento especial 1.7 deve fornecer
     * todos os plugs necessários agora.
     */
    jQuery.event.handle = jQuery.event.dispatch;

    /**
     *
     */
    jQuery.removeEvent = document.removeEventListener ?
        /**
         *
         */
        function(elem, type, handle)
        {
            if (elem.removeEventListener)
            {
                elem.removeEventListener(type, handle, false);
            }
        } :

        /**
         *
         */
        function(elem, type, handle)
        {
            if (elem.detachEvent)
            {
                elem.detachEvent("on" + type, handle);
            }
        };

    /**
     *
     */
    jQuery.Event = function(src, props)
    {
        /**
         * Permita a instanciação sem a palavra-chave 'new'.
         */
        if (!(this instanceof jQuery.Event))
        {
            return new jQuery.Event(src, props);
        }

        /**
         * Objeto de evento.
         */
        if (src && src.type)
        {
            this.originalEvent = src;
            this.type = src.type;

            /**
             * Os eventos que aparecem no documento podem ter sido marcados
             * como evitados por um modificador mais abaixo na árvore;
             * refletir o valor correto.
             */
            this.isDefaultPrevented = (
                src.defaultPrevented ||
                src.returnValue === false ||
                src.getPreventDefault &&
                src.getPreventDefault()
            ) ? returnTrue : returnFalse;

            /**
             * Tipo de evento.
             */
        } else {
            this.type = src;
        }

        /**
         * Coloque as propriedades fornecidas explicitamente
         * no objeto de evento.
         */
        if (props)
        {
            jQuery.extend(this, props);
        }

        /**
         * Crie um carimbo de data/hora se o evento recebido não tiver um.
         */
        this.timeStamp = src && src.timeStamp || jQuery.now();

        /**
         * Marque-o como melhorado.
         */
        this[ jQuery.expando ] = true;
    };

    /**
     *
     */
    function returnFalse()
    {
        return false;
    }

    /**
     *
     */
    function returnTrue()
    {
        return true;
    }

    /**
     * jQuery.Event é baseado em Eventos DOM3 conforme especificado
     * pelo ECMAScript Language Binding.
     */
    jQuery.Event.prototype = {
        /**
         *
         */
        preventDefault: function()
        {
            this.isDefaultPrevented = returnTrue;

            var e = this.originalEvent;

            if (!e)
            {
                return;
            }

            /**
             * Se preventDefault existir, faça o procedimento no evento original.
             */
            if (e.preventDefault)
            {
                e.preventDefault();

                /**
                 * Caso contrário, defina a propriedade returnValue do evento
                 * original como false (IE).
                 */
            } else
            {
                e.returnValue = false;
            }
        },

        /**
         *
         */
        stopPropagation: function()
        {
            this.isPropagationStopped = returnTrue;

            var e = this.originalEvent;

            if (!e)
            {
                return;
            }

            /**
             * Se stopPropagation existir, faça o procedimento no evento original.
             */
            if (e.stopPropagation)
            {
                e.stopPropagation();
            }

            /**
             * Caso contrário, defina a propriedade cancelBubble do
             * evento original como true (IE).
             */
            e.cancelBubble = true;
        },

        /**
         *
         */
        stopImmediatePropagation: function()
        {
            this.isImmediatePropagationStopped = returnTrue;
            this.stopPropagation();
        },

        /**
         *
         */
        isDefaultPrevented: returnFalse,

        /**
         *
         */
        isPropagationStopped: returnFalse,

        /**
         *
         */
        isImmediatePropagationStopped: returnFalse
    };

    /**
     * Crie eventos mouseenter/leave usando mouseover/out e
     * verificações de tempo de evento.
     */
    jQuery.each({
        mouseenter: "mouseover",
        mouseleave: "mouseout"
    }, function(orig, fix)
    {
        jQuery.event.special[ orig ] = {
            delegateType: fix,
            bindType: fix,

            /**
             *
             */
            handle: function(event)
            {
                var target = this;
                var related = event.relatedTarget;
                var handleObj = event.handleObj;
                var selector = handleObj.selector;
                var ret;

                /**
                 * Para mouseenter/leave, chame o modificador se relacionado
                 * estiver fora do objetivo. NB: Não relatedTarget se o mouse
                 * saiu/entrou na janela do navegador.
                 */
                if (!related || (related !== target && !jQuery.contains(target, related)))
                {
                    event.type = handleObj.origType;
                    ret = handleObj.handler.apply(this, arguments);
                    event.type = fix;
                }

                return ret;
            }
        };
    });

    /**
     * IE enviar delegação.
     */
    if (!jQuery.support.submitBubbles)
    {
        jQuery.event.special.submit = {
            /**
             *
             */
            setup: function()
            {
                /**
                 * Só precisa disso para eventos de envio de formulário
                 * de delegações.
                 */
                if (jQuery.nodeName(this, "form"))
                {
                    return false;
                }

                /**
                 * Adicione lentamente um modificador de envio quando um
                 * formulário descendente puder ser enviado.
                 */
                jQuery.event.add( this, "click._submit keypress._submit", function(e)
                {
                    /**
                     * A verificação do nome do nó evita uma falha relacionada
                     * ao VML no IE (#9807).
                     */
                    var elem = e.target;
                    var form = jQuery.nodeName(elem, "input") || jQuery.nodeName(elem, "button") ? elem.form : undefined;

                    if (form && !form._submit_attached)
                    {
                        jQuery.event.add(form, "submit._submit", function(event)
                        {
                            event._submit_bubble = true;
                        });

                        form._submit_attached = true;
                    }
                });

                /**
                 * return undefined, pois não precisamos de um ouvinte de evento.
                 */
            },

            /**
             *
             */
            postDispatch: function(event)
            {
                /**
                 * Se o formulário foi enviado pela pessoa, coloque o
                 * evento na árvore.
                 */
                if (event._submit_bubble)
                {
                    delete event._submit_bubble;

                    if (this.parentNode && !event.isTrigger)
                    {
                        jQuery.event.simulate("submit", this.parentNode, event, true);
                    }
                }
            },

            /**
             *
             */
            teardown: function()
            {
                /**
                 * Só precisa disso para eventos de envio de formulário
                 * de delegação.
                 */
                if (jQuery.nodeName(this, "form"))
                {
                    return false;
                }

                /**
                 * Remover modificadores de delegações; cleanData finalmente
                 * coleta modificadores de envio anexados acima.
                 */
                jQuery.event.remove(this, "._submit");
            }
        };
    }

    /**
     * IE altera delegação e caixa de seleção/correção de rádio.
     */
    if (!jQuery.support.changeBubbles)
    {
        jQuery.event.special.change = {
            /**
             *
             */
            setup: function()
            {
                if (rformElems.test(this.nodeName))
                {
                    /**
                     * O IE não envia a alteração em um cheque/rádio até o desfoque;
                     * acioná-lo no clique após uma mudança de propriedade. Coma a
                     * mudança de desfoque em special.change.handle. Isso ainda
                     * envia onchange uma segunda vez para verificar/rádio após
                     * o desfoque.
                     */
                    if (this.type === "checkbox" || this.type === "radio")
                    {
                        jQuery.event.add(this, "propertychange._change", function(event)
                        {
                            if (event.originalEvent.propertyName === "checked")
                            {
                                this._just_changed = true;
                            }
                        });

                        jQuery.event.add(this, "click._change", function(event)
                        {
                            if (this._just_changed && !event.isTrigger)
                            {
                                this._just_changed = false;
                                jQuery.event.simulate("change", this, event, true);
                            }
                        });
                    }

                    return false;
                }

                /**
                 * Evento de delegações; lazy-add um modificador de
                 * mudança em entradas descendentes.
                 */
                jQuery.event.add( this, "beforeactivate._change", function(e)
                {
                    var elem = e.target;

                    if (rformElems.test(elem.nodeName) && !elem._change_attached)
                    {
                        jQuery.event.add(elem, "change._change", function(event)
                        {
                            if (this.parentNode && !event.isSimulated && !event.isTrigger)
                            {
                                jQuery.event.simulate("change", this.parentNode, event, true);
                            }
                        });

                        elem._change_attached = true;
                    }
                });
            },

            /**
             *
             */
            handle: function(event)
            {
                var elem = event.target;

                /**
                 * Engula eventos de alteração nativa da caixa de seleção/rádio,
                 * já os acionamos acima.
                 */
                if (this !== elem || event.isSimulated || event.isTrigger || (elem.type !== "radio" && elem.type !== "checkbox"))
                {
                    return event.handleObj.handler.apply(this, arguments);
                }
            },

            /**
             *
             */
            teardown: function()
            {
                jQuery.event.remove(this, "._change");

                return rformElems.test(this.nodeName);
            }
        };
    }

    /**
     * Crie eventos de foco e desfoque "borbulhantes".
     */
    if (!jQuery.support.focusinBubbles)
    {
        jQuery.each({focus: "focusin", blur: "focusout"}, function(orig, fix)
        {
            /**
             * Anexe um único modificador de captura enquanto alguém
             * deseja focalizar/desfocar.
             */
            var attaches = 0;
            var handler = function(event)
            {
                jQuery.event.simulate(fix, event.target, jQuery.event.fix(event), true);
            };

            jQuery.event.special[fix] = {
                setup: function()
                {
                    if (attaches++ === 0)
                    {
                        document.addEventListener(orig, handler, true);
                    }
                },

                teardown: function()
                {
                    if (--attaches === 0)
                    {
                        document.removeEventListener(orig, handler, true);
                    }
                }
            };
        });
    }

    /**
     *
     */
    jQuery.fn.extend({
        /**
         * INTERNAL one.
         */
        on: function(types, selector, data, fn, one)
        {
            var origFn;
            var type;

            /**
             * Os tipos podem ser um mapa de tipos/modificadores.
             */
            if (typeof types === "object")
            {
                /**
                 * (types-Object, selector, data).
                 */
                if (typeof selector !== "string")
                {
                    /**
                     * && selector != null.
                     */

                    /**
                     * (types-Object, data).
                     */
                    data = data || selector;
                    selector = undefined;
                }

                for (type in types)
                {
                    this.on(type, selector, data, types[type], one);
                }

                return this;
            }

            if (data == null && fn == null)
            {
                /**
                 * (types, fn).
                 */
                fn = selector;
                data = selector = undefined;
            } else if (fn == null)
            {
                if (typeof selector === "string")
                {
                    /**
                     * (types, selector, fn).
                     */
                    fn = data;
                    data = undefined;
                } else
                {
                    /**
                     * (types, data, fn).
                     */
                    fn = data;
                    data = selector;
                    selector = undefined;
                }
            }

            if (fn === false)
            {
                fn = returnFalse;
            } else if (!fn)
            {
                return this;
            }

            if (one === 1)
            {
                origFn = fn;
                fn = function(event)
                {
                    /**
                     * Pode usar um conjunto vazio, pois o evento contém
                     * as informações.
                     */
                    jQuery().off(event);

                    return origFn.apply(this, arguments);
                };

                /**
                 * Use o mesmo guia para que o chamador possa remover usando origFn.
                 */
                fn.guid = origFn.guid || (origFn.guid = jQuery.guid++);
            }

            return this.each( function()
            {
                jQuery.event.add(this, types, fn, data, selector);
            });
        },

        /**
         *
         */
        one: function(types, selector, data, fn)
        {
            return this.on(types, selector, data, fn, 1);
        },

        /**
         *
         */
        off: function(types, selector, fn)
        {
            if (types && types.preventDefault && types.handleObj)
            {
                /**
                 * ( evento )  despachou jQuery.Event.
                 */
                var handleObj = types.handleObj;

                jQuery(types.delegateTarget).off(
                    handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType,
                    handleObj.selector,
                    handleObj.handler
                );

                return this;
            }

            if (typeof types === "object")
            {
                /**
                 * (types-object [, selector]).
                 */
                for (var type in types)
                {
                    this.off(type, selector, types[type]);
                }

                return this;
            }

            if (selector === false || typeof selector === "function")
            {
                /**
                 * (types [, fn]).
                 */
                fn = selector;
                selector = undefined;
            }

            if (fn === false)
            {
                fn = returnFalse;
            }

            return this.each(function()
            {
                jQuery.event.remove(this, types, fn, selector);
            });
        },

        /**
         *
         */
        bind: function(types, data, fn)
        {
            return this.on(types, null, data, fn);
        },

        /**
         *
         */
        unbind: function(types, fn)
        {
            return this.off(types, null, fn);
        },

        /**
         *
         */
        live: function(types, data, fn)
        {
            jQuery(this.context).on(types, this.selector, data, fn);

            return this;
        },

        /**
         *
         */
        die: function(types, fn)
        {
            jQuery(this.context).off(types, this.selector || "**", fn);

            return this;
        },

        /**
         *
         */
        delegate: function(selector, types, data, fn)
        {
            return this.on(types, selector, data, fn);
        },

        /**
         *
         */
        undelegate: function(selector, types, fn)
        {
            /**
             * (namespace) ou (selector, types [, fn]).
             */
            return arguments.length == 1? this.off(selector, "**") : this.off(types, selector, fn);
        },

        /**
         *
         */
        trigger: function(type, data)
        {
            return this.each(function()
            {
                jQuery.event.trigger(type, data, this);
            });
        },

        /**
         *
         */
        triggerHandler: function(type, data)
        {
            if (this[0])
            {
                return jQuery.event.trigger(type, data, this[0], true);
            }
        },

        /**
         *
         */
        toggle: function(fn)
        {
            /**
             * Salve a referência aos argumentos para acesso no encerramento.
             */
            var args = arguments;
            var guid = fn.guid || jQuery.guid++;
            var i = 0;

            var toggler = function(event)
            {
                /**
                 * Descubra qual função fazer o procedimento.
                 */
                var lastToggle = (jQuery._data(this, "lastToggle" + fn.guid) || 0) % i;
                jQuery._data(this, "lastToggle" + fn.guid, lastToggle + 1);

                /**
                 * Certifique-se de que os cliques param.
                 */
                event.preventDefault();

                /**
                 * E fazer o procedimento da função.
                 */
                return args[lastToggle].apply(this, arguments) || false;
            };

            /**
             * Vincule todas as funções, para que qualquer uma delas possa
             * desvincular esse modificador de cliques.
             */
            toggler.guid = guid;

            while (i < args.length)
            {
                args[i++].guid = guid;
            }

            return this.click(toggler);
        },

        /**
         *
         */
        hover: function(fnOver, fnOut)
        {
            return this.mouseenter(fnOver).mouseleave(fnOut || fnOver);
        }
    });

    /**
     *
     */
    jQuery.each(("blur " +
        "focus " +
        "focusin " +
        "focusout " +
        "load " +
        "resize " +
        "scroll " +
        "unload " +
        "click " +
        "dblclick " +
        "mousedown " +
        "mouseup " +
        "mousemove " +
        "mouseover " +
        "mouseout " +
        "mouseenter " +
        "mouseleave " +
        "change " +
        "select " +
        "submit " +
        "keydown " +
        "keypress " +
        "keyup " +
        "error " +
        "contextmenu").split(" "), function(i, name)
    {
        /**
         * Lidar com a vinculação de eventos.
         */
        jQuery.fn[name] = function(data, fn)
        {
            if (fn == null)
            {
                fn = data;
                data = null;
            }

            return arguments.length > 0 ?
                this.on(name, null, data, fn) :
                this.trigger(name);
        };

        if (jQuery.attrFn)
        {
            jQuery.attrFn[name] = true;
        }

        if (rkeyEvent.test(name))
        {
            jQuery.event.fixHooks[name] = jQuery.event.keyHooks;
        }

        if (rmouseEvent.test(name))
        {
            jQuery.event.fixHooks[name] = jQuery.event.mouseHooks;
        }
    });

    /**
     *
     */
    (function()
    {
        var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g;
        var expando = "sizcache" + (Math.random() + '').replace('.', '');
        var done = 0;
        var toString = Object.prototype.toString;
        var hasDuplicate = false;
        var baseHasDuplicate = true;
        var rBackslash = /\\/g;
        var rReturn = /\r\n/g;
        var rNonWord = /\W/;

        /**
         * Aqui verificamos se o mecanismo JavaScript está usando algum
         * tipo de otimização onde nem sempre chama nossa função de
         * comparação. Se for esse o caso, descarte o valor hasDuplicate.
         * Até agora, isso inclui o Google Chrome.
         */
        [0, 0].sort(function()
        {
            baseHasDuplicate = false;

            return 0;
        });

        /**
         *
         */
        var Sizzle = function(selector, context, results, seed)
        {
            results = results || [];
            context = context || document;

            var origContext = context;

            if (context.nodeType !== 1 && context.nodeType !== 9)
            {
                return [];
            }

            if (!selector || typeof selector !== "string")
            {
                return results;
            }

            var m;
            var set;
            var checkSet;
            var extra;
            var ret;
            var cur;
            var pop;
            var i;
            var prune = true;
            var contextXML = Sizzle.isXML(context);
            var parts = [];
            var soFar = selector;

            /**
             * Redefina a posição do regexp do chunker (comece da base).
             */
            do
            {
                chunker.exec("");
                m = chunker.exec(soFar);

                if (m)
                {
                    soFar = m[3];
                    parts.push(m[1]);

                    if (m[2])
                    {
                        extra = m[3];
                        break;
                    }
                }
            } while (m);

            if (parts.length > 1 && origPOS.exec(selector))
            {
                if (parts.length === 2 && Expr.relative[parts[0]])
                {
                    set = posProcess(parts[0] + parts[1], context, seed);
                } else
                {
                    set = Expr.relative[parts[0]] ? [context] : Sizzle(parts.shift(), context);

                    while (parts.length)
                    {
                        selector = parts.shift();

                        if (Expr.relative[selector])
                        {
                            selector += parts.shift();
                        }

                        set = posProcess(selector, set, seed);
                    }
                }
            } else
            {
                /**
                 * Pegue um atalho e defina o contexto se o seletor base for
                 * um ID (mas não se for mais rápido se o seletor interno
                 * for um ID).
                 */
                if (!seed && parts.length > 1 && context.nodeType === 9 && !contextXML && Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1]))
                {
                    ret = Sizzle.find(parts.shift(), context, contextXML);
                    context = ret.expr ? Sizzle.filter(ret.expr, ret.set)[0] : ret.set[0];
                }

                if (context)
                {
                    ret = seed ? { expr: parts.pop(), set: makeArray(seed) } : Sizzle.find(parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML);
                    set = ret.expr ? Sizzle.filter(ret.expr, ret.set) : ret.set;

                    if (parts.length > 0)
                    {
                        checkSet = makeArray(set);
                    } else
                    {
                        prune = false;
                    }

                    while (parts.length)
                    {
                        cur = parts.pop();
                        pop = cur;

                        if (!Expr.relative[cur])
                        {
                            cur = "";
                        } else
                        {
                            pop = parts.pop();
                        }

                        if (pop == null)
                        {
                            pop = context;
                        }

                        Expr.relative[cur](checkSet, pop, contextXML);
                    }
                } else
                {
                    checkSet = parts = [];
                }
            }

            if (!checkSet)
            {
                checkSet = set;
            }

            if (!checkSet)
            {
                Sizzle.error(cur || selector);
            }

            if (toString.call(checkSet) === "[object Array]")
            {
                if (!prune)
                {
                    results.push.apply(results, checkSet);
                } else if (context && context.nodeType === 1)
                {
                    for (i = 0; checkSet[i] != null; i++)
                    {
                        if (checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && Sizzle.contains(context, checkSet[i])))
                        {
                            results.push(set[i]);
                        }
                    }
                } else
                {
                    for (i = 0; checkSet[i] != null; i++)
                    {
                        if (checkSet[i] && checkSet[i].nodeType === 1)
                        {
                            results.push(set[i]);
                        }
                    }
                }
            } else
            {
                makeArray( checkSet, results );
            }

            if (extra)
            {
                Sizzle( extra, origContext, results, seed );
                Sizzle.uniqueSort(results);
            }

            return results;
        };

        /**
         *
         */
        Sizzle.uniqueSort = function(results)
        {
            if (sortOrder)
            {
                hasDuplicate = baseHasDuplicate;
                results.sort(sortOrder);

                if (hasDuplicate)
                {
                    for (var i = 1; i < results.length; i++)
                    {
                        if (results[i] === results[i - 1])
                        {
                            results.splice(i--, 1);
                        }
                    }
                }
            }

            return results;
        };

        /**
         *
         */
        Sizzle.matches = function(expr, set)
        {
            return Sizzle(expr, null, null, set);
        };

        /**
         *
         */
        Sizzle.matchesSelector = function(node, expr)
        {
            return Sizzle(expr, null, null, [node]).length > 0;
        };

        /**
         *
         */
        Sizzle.find = function(expr, context, isXML)
        {
            var set;
            var i;
            var len;
            var match;
            var type;
            var left;

            if (!expr)
            {
                return [];
            }

            for (i = 0, len = Expr.order.length; i < len; i++)
            {
                type = Expr.order[i];

                if ((match = Expr.leftMatch[type].exec(expr)))
                {
                    left = match[1];
                    match.splice(1, 1);

                    if (left.substr(left.length - 1) !== "\\")
                    {
                        match[1] = (match[1] || "").replace(rBackslash, "");
                        set = Expr.find[type](match, context, isXML);

                        if (set != null)
                        {
                            expr = expr.replace(Expr.match[type], "");

                            break;
                        }
                    }
                }
            }

            if (!set)
            {
                set = typeof context.getElementsByTagName !== "undefined" ? context.getElementsByTagName("*") : [];
            }

            return {
                set: set,
                expr: expr
            };
        };

        /**
         *
         */
        Sizzle.filter = function(expr, set, inplace, not)
        {
            var match;
            var anyFound;
            var type;
            var found;
            var item;
            var filter;
            var left;
            var i;
            var pass;
            var old = expr;
            var result = [];
            var curLoop = set;
            var isXMLFilter = set && set[0] && Sizzle.isXML(set[0]);

            while (expr && set.length)
            {
                for (type in Expr.filter)
                {
                    if ((match = Expr.leftMatch[type].exec(expr)) != null && match[2])
                    {
                        filter = Expr.filter[type];
                        left = match[1];

                        anyFound = false;
                        match.splice(1, 1);

                        if (left.substr(left.length - 1) === "\\")
                        {
                            continue;
                        }

                        if (curLoop === result)
                        {
                            result = [];
                        }

                        if (Expr.preFilter[type])
                        {
                            match = Expr.preFilter[type](match, curLoop, inplace, result, not, isXMLFilter);

                            if (!match)
                            {
                                anyFound = found = true;
                            } else if (match === true)
                            {
                                continue;
                            }
                        }

                        if (match)
                        {
                            for (i = 0; (item = curLoop[i]) != null; i++)
                            {
                                if (item)
                                {
                                    found = filter(item, match, i, curLoop);
                                    pass = not ^ found;

                                    if (inplace && found != null)
                                    {
                                        if (pass)
                                        {
                                            anyFound = true;
                                        } else
                                        {
                                            curLoop[i] = false;
                                        }
                                    } else if (pass)
                                    {
                                        result.push(item);
                                        anyFound = true;
                                    }
                                }
                            }
                        }

                        if (found !== undefined)
                        {
                            if (!inplace)
                            {
                                curLoop = result;
                            }

                            expr = expr.replace(Expr.match[type], "");

                            if (!anyFound)
                            {
                                return [];
                            }

                            break;
                        }
                    }
                }

                /**
                 * Expressão imprópria.
                 */
                if (expr === old)
                {
                    if (anyFound == null)
                    {
                        Sizzle.error(expr);
                    } else
                    {
                        break;
                    }
                }

                old = expr;
            }

            return curLoop;
        };

        /**
         *
         */
        Sizzle.error = function(msg)
        {
            throw new Error("Syntax error, unrecognized expression: " + msg);
        };

        /**
         * Função utilitária para recuperar o valor de texto de um
         * vetor de nós DOM.
         *
         * @param {Array|Element} elem.
         */
        var getText = Sizzle.getText = function(elem)
        {
            var i;
            var node;
            var nodeType = elem.nodeType;
            var ret = "";

            if (nodeType)
            {
                if (nodeType === 1 || nodeType === 9 || nodeType === 11)
                {
                    /**
                     * Use textContent || innerText para objetos.
                     */
                    if (typeof elem.textContent === 'string')
                    {
                        return elem.textContent;
                    } else if (typeof elem.innerText === 'string')
                    {
                        /**
                         * Substitua os retornos de carro do IE.
                         */
                        return elem.innerText.replace(rReturn, '');
                    } else
                    {
                        /**
                         * Atravesse suas camadas mais baixas.
                         */
                        for (elem = elem.firstChild; elem; elem = elem.nextSibling)
                        {
                            ret += getText(elem);
                        }
                    }
                } else if (nodeType === 3 || nodeType === 4)
                {
                    return elem.nodeValue;
                }
            } else
            {
                /**
                 * Se não houver nodeType, espera-se que seja um vetor.
                 */
                for (i = 0; (node = elem[i]); i++)
                {
                    /**
                     * Não atravesse os nós de comentário.
                     */
                    if (node.nodeType !== 8)
                    {
                        ret += getText(node);
                    }
                }
            }

            return ret;
        };

        /**
         *
         */
        var Expr = Sizzle.selectors = {
            /**
             *
             */
            order: [ "ID", "NAME", "TAG" ],

            /**
             *
             */
            match: {
                ID: /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
                CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
                NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,
                ATTR: /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/,
                TAG: /^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,
                CHILD: /:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,
                POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,
                PSEUDO: /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
            },

            /**
             *
             */
            leftMatch: {},

            /**
             *
             */
            attrMap: {
                "class": "className",
                "for": "htmlFor"
            },

            /**
             *
             */
            attrHandle: {
                /**
                 *
                 */
                href: function(elem)
                {
                    return elem.getAttribute("href");
                },

                /**
                 *
                 */
                type: function(elem)
                {
                    return elem.getAttribute("type");
                }
            },

            /**
             *
             */
            relative: {
                /**
                 *
                 */
                "+": function(checkSet, part)
                {
                    var isPartStr = typeof part === "string";
                    var isTag = isPartStr && !rNonWord.test(part);
                    var isPartStrNotTag = isPartStr && !isTag;

                    if (isTag)
                    {
                        part = part.toLowerCase();
                    }

                    for (var i = 0, l = checkSet.length, elem; i < l; i++)
                    {
                        if ((elem = checkSet[i]))
                        {
                            while ((elem = elem.previousSibling) && elem.nodeType !== 1)
                            {
                            }

                            checkSet[i] = isPartStrNotTag || elem && elem.nodeName.toLowerCase() === part ?
                                elem || false :
                                elem === part;
                        }
                    }

                    if (isPartStrNotTag)
                    {
                        Sizzle.filter(part, checkSet, true);
                    }
                },

                /**
                 *
                 */
                ">": function(checkSet, part)
                {
                    var elem;
                    var isPartStr = typeof part === "string";
                    var i = 0;
                    var l = checkSet.length;

                    if (isPartStr && !rNonWord.test(part))
                    {
                        part = part.toLowerCase();

                        for (; i < l; i++)
                        {
                            elem = checkSet[i];

                            if (elem)
                            {
                                var parent = elem.parentNode;
                                checkSet[i] = parent.nodeName.toLowerCase() === part ? parent : false;
                            }
                        }
                    } else
                    {
                        for (; i < l; i++)
                        {
                            elem = checkSet[i];

                            if (elem)
                            {
                                checkSet[i] = isPartStr ?
                                    elem.parentNode :
                                    elem.parentNode === part;
                            }
                        }

                        if (isPartStr)
                        {
                            Sizzle.filter(part, checkSet, true);
                        }
                    }
                },

                /**
                 *
                 */
                "": function(checkSet, part, isXML)
                {
                    var nodeCheck;
                    var doneName = done++;
                    var checkFn = dirCheck;

                    if (typeof part === "string" && !rNonWord.test(part))
                    {
                        part = part.toLowerCase();
                        nodeCheck = part;
                        checkFn = dirNodeCheck;
                    }

                    checkFn("parentNode", part, doneName, checkSet, nodeCheck, isXML);
                },

                /**
                 *
                 */
                "~": function(checkSet, part, isXML)
                {
                    var nodeCheck;
                    var doneName = done++;
                    var checkFn = dirCheck;

                    if (typeof part === "string" && !rNonWord.test(part))
                    {
                        part = part.toLowerCase();
                        nodeCheck = part;
                        checkFn = dirNodeCheck;
                    }

                    checkFn("previousSibling", part, doneName, checkSet, nodeCheck, isXML);
                }
            },

            /**
             *
             */
            find: {
                /**
                 *
                 */
                ID: function(match, context, isXML)
                {
                    if (typeof context.getElementById !== "undefined" && !isXML)
                    {
                        var m = context.getElementById(match[1]);

                        /**
                         * Verifique parentNode para capturar quando o Blackberry
                         * vai retornar nós que não estão mais no documento #6963.
                         */
                        return m && m.parentNode ? [m] : [];
                    }
                },

                /**
                 *
                 */
                NAME: function(match, context)
                {
                    if (typeof context.getElementsByName !== "undefined")
                    {
                        var ret = [];
                        var results = context.getElementsByName(match[1]);

                        for (var i = 0, l = results.length; i < l; i++)
                        {
                            if (results[i].getAttribute("name") === match[1])
                            {
                                ret.push(results[i]);
                            }
                        }

                        return ret.length === 0 ? null : ret;
                    }
                },

                /**
                 *
                 */
                TAG: function(match, context)
                {
                    if (typeof context.getElementsByTagName !== "undefined")
                    {
                        return context.getElementsByTagName( match[1] );
                    }
                }
            },

            /**
             *
             */
            preFilter: {
                /**
                 *
                 */
                CLASS: function(match, curLoop, inplace, result, not, isXML)
                {
                    match = " " + match[1].replace(rBackslash, "") + " ";

                    if (isXML)
                    {
                        return match;
                    }

                    for (var i = 0, elem; (elem = curLoop[i]) != null; i++)
                    {
                        if (elem)
                        {
                            if (not ^ (elem.className && (" " + elem.className + " ").replace(/[\t\n\r]/g, " ").indexOf(match) >= 0))
                            {
                                if (!inplace)
                                {
                                    result.push(elem);
                                }
                            } else if (inplace)
                            {
                                curLoop[i] = false;
                            }
                        }
                    }

                    return false;
                },

                /**
                 *
                 */
                ID: function(match)
                {
                    return match[1].replace(rBackslash, "");
                },

                /**
                 *
                 */
                TAG: function(match, curLoop)
                {
                    return match[1].replace(rBackslash, "").toLowerCase();
                },

                /**
                 *
                 */
                CHILD: function(match)
                {
                    if (match[1] === "nth")
                    {
                        if (!match[2])
                        {
                            Sizzle.error(match[0]);
                        }

                        match[2] = match[2].replace(/^\+|\s*/g, '');

                        /**
                         * Analisar equações como 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'.
                         */
                        var test = /(-?)(\d*)(?:n([+\-]?\d*))?/.exec(match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" || !/\D/.test( match[2] ) && "0n+" + match[2] || match[2]);

                        /**
                         * calcule os números (primeiro)n+(último) inclusive se
                         * forem negativos.
                         */
                        match[2] = (test[1] + (test[2] || 1)) - 0;
                        match[3] = test[3] - 0;
                    } else if (match[2])
                    {
                        Sizzle.error(match[0]);
                    }

                    /**
                     * Questão: Mover para o sistema de cubo normal.
                     */
                    match[0] = done++;

                    return match;
                },

                /**
                 *
                 */
                ATTR: function(match, curLoop, inplace, result, not, isXML)
                {
                    var name = match[1] = match[1].replace(rBackslash, "");

                    if (!isXML && Expr.attrMap[name])
                    {
                        match[1] = Expr.attrMap[name];
                    }

                    /**
                     * Modifica se um valor sem aspas foi usado.
                     */
                    match[4] = (match[4] || match[5] || "").replace(rBackslash, "");

                    if (match[2] === "~=")
                    {
                        match[4] = " " + match[4] + " ";
                    }

                    return match;
                },

                /**
                 *
                 */
                PSEUDO: function(match, curLoop, inplace, result, not)
                {
                    if (match[1] === "not")
                    {
                        /**
                         * Se estivermos lidando com uma expressão complexa,
                         * ou simples.
                         */
                        if ((chunker.exec(match[3]) || "").length > 1 || /^\w/.test(match[3]))
                        {
                            match[3] = Sizzle(match[3], null, null, curLoop);
                        } else
                        {
                            var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);

                            if (!inplace)
                            {
                                result.push.apply(result, ret);
                            }

                            return false;
                        }
                    } else if (Expr.match.POS.test(match[0]) || Expr.match.CHILD.test(match[0]))
                    {
                        return true;
                    }

                    return match;
                },

                /**
                 *
                 */
                POS: function(match)
                {
                    match.unshift(true);

                    return match;
                }
            },

            /**
             *
             */
            filters: {
                /**
                 *
                 */
                enabled: function(elem)
                {
                    return elem.disabled === false && elem.type !== "hidden";
                },

                /**
                 *
                 */
                disabled: function(elem)
                {
                    return elem.disabled === true;
                },

                /**
                 *
                 */
                checked: function(elem)
                {
                    return elem.checked === true;
                },

                /**
                 *
                 */
                selected: function(elem)
                {
                    /**
                     * Acessar essa propriedade faz com que as opções selecionadas
                     * no Safari funcionem corretamente.
                     */
                    if (elem.parentNode)
                    {
                        elem.parentNode.selectedIndex;
                    }

                    return elem.selected === true;
                },

                /**
                 *
                 */
                parent: function(elem)
                {
                    return !!elem.firstChild;
                },

                /**
                 *
                 */
                empty: function(elem)
                {
                    return !elem.firstChild;
                },

                /**
                 *
                 */
                has: function(elem, i, match)
                {
                    return !!Sizzle(match[3], elem).length;
                },

                /**
                 *
                 */
                header: function(elem)
                {
                    return (/h\d/i).test(elem.nodeName);
                },

                /**
                 *
                 */
                text: function(elem)
                {
                    var attr = elem.getAttribute( "type" ), type = elem.type;

                    /**
                     * IE6 e 7 irão mapear elem.type para 'text' para novos
                     * tipos de HTML5 (pesquisa, etc). Use getAttribute em
                     * vez de testar este caso.
                     */
                    return elem.nodeName.toLowerCase() === "input" && "text" === type && (attr === type || attr === null);
                },

                /**
                 *
                 */
                radio: function(elem)
                {
                    return elem.nodeName.toLowerCase() === "input" && "radio" === elem.type;
                },

                /**
                 *
                 */
                checkbox: function(elem)
                {
                    return elem.nodeName.toLowerCase() === "input" && "checkbox" === elem.type;
                },

                /**
                 *
                 */
                file: function(elem)
                {
                    return elem.nodeName.toLowerCase() === "input" && "file" === elem.type;
                },

                /**
                 *
                 */
                password: function(elem)
                {
                    return elem.nodeName.toLowerCase() === "input" && "password" === elem.type;
                },

                /**
                 *
                 */
                submit: function(elem)
                {
                    var name = elem.nodeName.toLowerCase();

                    return (name === "input" || name === "button") && "submit" === elem.type;
                },

                /**
                 *
                 */
                image: function(elem)
                {
                    return elem.nodeName.toLowerCase() === "input" && "image" === elem.type;
                },

                /**
                 *
                 */
                reset: function(elem)
                {
                    var name = elem.nodeName.toLowerCase();

                    return (name === "input" || name === "button") && "reset" === elem.type;
                },

                /**
                 *
                 */
                button: function(elem)
                {
                    var name = elem.nodeName.toLowerCase();

                    return name === "input" && "button" === elem.type || name === "button";
                },

                /**
                 *
                 */
                input: function(elem)
                {
                    return (/input|select|textarea|button/i).test( elem.nodeName );
                },

                /**
                 *
                 */
                focus: function(elem)
                {
                    return elem === elem.ownerDocument.activeElement;
                }
            },

            /**
             *
             */
            setFilters: {
                /**
                 *
                 */
                first: function(elem, i)
                {
                    return i === 0;
                },

                /**
                 *
                 */
                last: function(elem, i, match, array)
                {
                    return i === array.length - 1;
                },

                /**
                 *
                 */
                even: function(elem, i)
                {
                    return i % 2 === 0;
                },

                /**
                 *
                 */
                odd: function(elem, i)
                {
                    return i % 2 === 1;
                },

                /**
                 *
                 */
                lt: function(elem, i, match)
                {
                    return i < match[3] - 0;
                },

                /**
                 *
                 */
                gt: function(elem, i, match)
                {
                    return i > match[3] - 0;
                },

                /**
                 *
                 */
                nth: function(elem, i, match)
                {
                    return match[3] - 0 === i;
                },

                /**
                 *
                 */
                eq: function(elem, i, match)
                {
                    return match[3] - 0 === i;
                }
            },

            /**
             *
             */
            filter: {
                /**
                 *
                 */
                PSEUDO: function(elem, match, i, array)
                {
                    var name = match[1];
                    var filter = Expr.filters[name];

                    if (filter)
                    {
                        return filter(elem, i, match, array);
                    } else if (name === "contains")
                    {
                        return (elem.textContent || elem.innerText || getText([elem]) || "").indexOf(match[3]) >= 0;
                    } else if (name === "not")
                    {
                        var not = match[3];

                        for (var j = 0, l = not.length; j < l; j++)
                        {
                            if (not[j] === elem)
                            {
                                return false;
                            }
                        }

                        return true;
                    } else
                    {
                        Sizzle.error(name);
                    }
                },

                /**
                 *
                 */
                CHILD: function(elem, match)
                {
                    var first;
                    var last;
                    var doneName;
                    var parent;
                    var cache;
                    var count;
                    var diff;
                    var type = match[1];
                    var node = elem;

                    switch (type)
                    {
                        case "only":
                        case "first":
                            while ((node = node.previousSibling))
                            {
                                if (node.nodeType === 1)
                                {
                                    return false;
                                }
                            }

                            if (type === "first")
                            {
                                return true;
                            }

                            node = elem;

                            /**
                             * Conclusão completa.
                             */

                        case "last":
                            while ((node = node.nextSibling))
                            {
                                if (node.nodeType === 1)
                                {
                                    return false;
                                }
                            }

                            return true;

                        case "nth":
                            first = match[2];
                            last = match[3];

                            if (first === 1 && last === 0)
                            {
                                return true;
                            }

                            doneName = match[0];
                            parent = elem.parentNode;

                            if (parent && (parent[expando] !== doneName || !elem.nodeIndex))
                            {
                                count = 0;

                                for (node = parent.firstChild; node; node = node.nextSibling)
                                {
                                    if (node.nodeType === 1)
                                    {
                                        node.nodeIndex = ++count;
                                    }
                                }

                                parent[expando] = doneName;
                            }

                            diff = elem.nodeIndex - last;

                            if (first === 0)
                            {
                                return diff === 0;
                            } else
                            {
                                return (diff % first === 0 && diff / first >= 0);
                            }
                    }
                },

                /**
                 *
                 */
                ID: function(elem, match)
                {
                    return elem.nodeType === 1 && elem.getAttribute("id") === match;
                },

                /**
                 *
                 */
                TAG: function(elem, match)
                {
                    return (match === "*" && elem.nodeType === 1) || !!elem.nodeName && elem.nodeName.toLowerCase() === match;
                },

                /**
                 *
                 */
                CLASS: function(elem, match)
                {
                    return (" " + (elem.className || elem.getAttribute("class")) + " ").indexOf(match) > -1;
                },

                /**
                 *
                 */
                ATTR: function(elem, match)
                {
                    var name = match[1];
                    var result = Sizzle.attr
                        ?
                            Sizzle.attr(elem, name)
                        :
                            Expr.attrHandle[name]
                            ?
                                Expr.attrHandle[name](elem)
                            :
                                elem[name] != null
                                ?
                                    elem[name]
                                :
                                    elem.getAttribute(name);

                    var value = result + "";
                    var type = match[2];
                    var check = match[4];

                    return result == null
                        ?
                            type === "!="
                        :
                            !type && Sizzle.attr
                            ?
                                result != null
                            :
                                type === "="
                                ?
                                    value === check
                                :
                                    type === "*="
                                    ?
                                        value.indexOf(check) >= 0
                                    :
                                        type === "~="
                                        ?
                                            (" " + value + " ").indexOf(check) >= 0
                                        :
                                            !check
                                            ?
                                                value && result !== false
                                            :
                                                type === "!="
                                                ?
                                                    value !== check
                                                :
                                                    type === "^="
                                                    ?
                                                        value.indexOf(check) === 0
                                                    :
                                                        type === "$="
                                                        ?
                                                            value.substr(value.length - check.length) === check
                                                        :
                                                            type === "|="
                                                            ?
                                                                value === check || value.substr(0, check.length + 1) === check + "-"
                                                            :
                                                                false;
                },

                /**
                 *
                 */
                POS: function(elem, match, i, array)
                {
                    var name = match[2];
                    var filter = Expr.setFilters[name];

                    if (filter)
                    {
                        return filter(elem, i, match, array);
                    }
                }
            }
        };

        /**
         *
         */
        var origPOS = Expr.match.POS;

        /**
         *
         */
        var fescape = function(all, num)
        {
            return "\\" + (num - 0 + 1);
        };

        /**
         *
         */
        for (var type in Expr.match)
        {
            Expr.match[type] = new RegExp( Expr.match[ type ].source + (/(?![^\[]*\])(?![^\(]*\))/.source) );
            Expr.leftMatch[type] = new RegExp( /(^(?:.|\r|\n)*?)/.source + Expr.match[ type ].source.replace(/\\(\d+)/g, fescape) );
        }

        /**
         * Expor origPOS.
         * "global" como independentemente da relação com colchetes/parênteses.
         */
        Expr.match.globalPOS = origPOS;

        /**
         *
         */
        var makeArray = function(array, results)
        {
            array = Array.prototype.slice.call(array, 0);

            if (results)
            {
                results.push.apply(results, array);

                return results;
            }

            return array;
        };

        /**
         * Procedimento de uma verificação simples para determinar se
         * o navegador é capaz de converter uma NodeList em um vetor
         * usando métodos integrados. Também verifica se o vetor
         * retornado contém nós DOM (o que não é o caso no navegador
         * Blackberry).
         */
        try
        {
            Array.prototype.slice.call(document.documentElement.childNodes, 0)[0].nodeType;

            /**
             * Forneça um método alternativo se não funcionar.
             */
        } catch(e)
        {
            makeArray = function(array, results)
            {
                var i = 0;
                var ret = results || [];

                if (toString.call(array) === "[object Array]")
                {
                    Array.prototype.push.apply(ret, array);
                } else
                {
                    if (typeof array.length === "number")
                    {
                        for (var l = array.length; i < l; i++)
                        {
                            ret.push(array[i]);
                        }
                    } else
                    {
                        for (; array[i]; i++)
                        {
                            ret.push(array[i]);
                        }
                    }
                }

                return ret;
            };
        }

        var sortOrder;
        var siblingCheck;

        /**
         *
         */
        if (document.documentElement.compareDocumentPosition)
        {
            sortOrder = function(a, b)
            {
                if (a === b)
                {
                    hasDuplicate = true;

                    return 0;
                }

                if (!a.compareDocumentPosition || !b.compareDocumentPosition)
                {
                    return a.compareDocumentPosition ? -1 : 1;
                }

                return a.compareDocumentPosition(b) & 4 ? -1 : 1;
            };
        } else
        {
            sortOrder = function(a, b)
            {
                /**
                 * Os nós são idênticos, podemos terminar mais cedo.
                 */
                if (a === b)
                {
                    hasDuplicate = true;

                    return 0;

                    /**
                     * Fallback para usar sourceIndex (no IE) se estiver
                     * disponível em ambos os nós.
                     */
                } else if (a.sourceIndex && b.sourceIndex)
                {
                    return a.sourceIndex - b.sourceIndex;
                }

                var al;
                var bl;
                var ap = [];
                var bp = [];
                var aup = a.parentNode;
                var bup = b.parentNode;
                var cur = aup;

                /**
                 * Se os nós forem próximos (ou idênticos), podemos fazer
                 * uma verificação rápida.
                 */
                if (aup === bup)
                {
                    return siblingCheck(a, b);

                    /**
                     * Se nenhuma camada mais alta for encontrada, os nós
                     * serão desconectados.
                     */
                } else if (!aup)
                {
                    return -1;
                } else if (!bup)
                {
                    return 1;
                }

                /**
                 * Caso contrário, eles estão em outro lugar na árvore, então
                 * precisamos criar uma lista completa dos parentNodes para
                 * comparação.
                 */
                while (cur)
                {
                    ap.unshift(cur);
                    cur = cur.parentNode;
                }

                cur = bup;

                while (cur)
                {
                    bp.unshift(cur);
                    cur = cur.parentNode;
                }

                al = ap.length;
                bl = bp.length;

                /**
                 * Comece a descer a árvore procurando por uma obtenção.
                 */
                for (var i = 0; i < al && i < bl; i++)
                {
                    if (ap[i] !== bp[i])
                    {
                        return siblingCheck(ap[i], bp[i]);
                    }
                }

                /**
                 * Terminamos em algum lugar na árvore, então faça uma
                 * verificação de irmãos.
                 */
                return i === al ? siblingCheck(a, bp[i], -1) : siblingCheck(ap[i], b, 1);
            };

            /**
             *
             */
            siblingCheck = function(a, b, ret)
            {
                if (a === b)
                {
                    return ret;
                }

                var cur = a.nextSibling;

                while (cur)
                {
                    if (cur === b)
                    {
                        return -1;
                    }

                    cur = cur.nextSibling;
                }

                return 1;
            };
        }

        /**
         * Verifique se o navegador retorna elementos por nome ao consultar
         * por getElementById (e forneça uma solução alternativa).
         */
        (function()
        {
            /**
             * Vamos injetar um elemento de entrada falso com um nome
             * especificado.
             */
            var form = document.createElement("div");
            var id = "script" + (new Date()).getTime();
            var root = document.documentElement;

            form.innerHTML = "<a name='" + id + "'/>";

            /**
             * Injete-o no elemento raiz, verifique seu status e
             * remova-o rapidamente.
             */
            root.insertBefore(form, root.firstChild);

            /**
             * A solução alternativa tem que fazer verificações adicionais
             * após um getElementById. O que torna as coisas mais lentas
             * para outros navegadores.
             */
            if (document.getElementById(id))
            {
                Expr.find.ID = function(match, context, isXML)
                {
                    if (typeof context.getElementById !== "undefined" && !isXML)
                    {
                        var m = context.getElementById(match[1]);

                        return m ?
                            m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ?
                                [m] :
                                undefined :
                            [];
                    }
                };

                Expr.filter.ID = function(elem, match)
                {
                    var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");

                    return elem.nodeType === 1 && node && node.nodeValue === match;
                };
            }

            root.removeChild(form);

            /**
             * Liberar cubos em IE.
             */
            root = form = null;
        })();

        /**
         *
         */
        (function()
        {
            /**
             * Verifique se o navegador retorna apenas elementos ao fazer
             * getElementsByTagName("*").
             */

            /**
             * Crie um elemento falso.
             */
            var div = document.createElement("div");
                div.appendChild( document.createComment("") );

            /**
             * Certifique-se de que nenhum comentário seja encontrado.
             */
            if (div.getElementsByTagName("*").length > 0)
            {
                Expr.find.TAG = function(match, context)
                {
                    var results = context.getElementsByTagName(match[1]);

                    /**
                     * Filtre possíveis comentários.
                     */
                    if (match[1] === "*")
                    {
                        var tmp = [];

                        for (var i = 0; results[i]; i++)
                        {
                            if (results[i].nodeType === 1)
                            {
                                tmp.push(results[i]);
                            }
                        }

                        results = tmp;
                    }

                    return results;
                };
            }

            /**
             * Verifique se um atributo retorna atributos href normalizados.
             */
            div.innerHTML = "<a href='#'></a>";

            /**
             *
             */
            if (div.firstChild && typeof div.firstChild.getAttribute !== "undefined" && div.firstChild.getAttribute("href") !== "#")
            {
                Expr.attrHandle.href = function(elem)
                {
                    return elem.getAttribute("href", 2);
                };
            }

            /**
             * Liberar cubos em IE.
             */
            div = null;
        })();

        /**
         *
         */
        if (document.querySelectorAll)
        {
            (function()
            {
                var oldSizzle = Sizzle;
                var div = document.createElement("div");
                var id = "__sizzle__";

                div.innerHTML = "<p class='TEST'></p>";

                /**
                 * O Safari não pode lidar com grafemas maiúsculos ou unicode
                 * no modo peculiaridades.
                 */
                if (div.querySelectorAll && div.querySelectorAll(".TEST").length === 0)
                {
                    return;
                }

                /**
                 *
                 */
                Sizzle = function(query, context, extra, seed)
                {
                    context = context || document;

                    /**
                     * Use querySelectorAll somente em documentos não XML.
                     * (seletores de ID não funcionam em documentos não HTML).
                     */
                    if (!seed && !Sizzle.isXML(context))
                    {
                        /**
                         * Veja se encontramos um seletor para acelerar.
                         */
                        var match = /^(\w+$)|^\.([\w\-]+$)|^#([\w\-]+$)/.exec(query);

                        /**
                         *
                         */
                        if (match && (context.nodeType === 1 || context.nodeType === 9))
                        {
                            /**
                             * Acelerar: Sizzle("TAG").
                             */
                            if (match[1])
                            {
                                return makeArray(context.getElementsByTagName(query), extra);

                                /**
                                 * Acelerar: Sizzle(".CLASS").
                                 */
                            } else if (match[2] && Expr.find.CLASS && context.getElementsByClassName)
                            {
                                return makeArray(context.getElementsByClassName(match[2]), extra);
                            }
                        }

                        /**
                         *
                         */
                        if (context.nodeType === 9)
                        {
                            /**
                             * Acelerar: Sizzle("body").
                             * O elemento da base existe apenas uma vez, otimize sua localização.
                             */
                            if (query === "body" && context.body)
                            {
                                return makeArray([context.body], extra);

                                /**
                                 * Acelerar: Sizzle("#ID").
                                 */
                            } else if (match && match[3])
                            {
                                var elem = context.getElementById(match[3]);

                                /**
                                 * Verifique parentNode para capturar quando o Blackberry retornar
                                 * nós que não estão mais no documento #6963.
                                 */
                                if (elem && elem.parentNode)
                                {
                                    /**
                                     * Lide com o caso em que IE e Opera retornam itens
                                     * por nome em vez de ID.
                                     */
                                    if (elem.id === match[3])
                                    {
                                        return makeArray([elem], extra);
                                    }
                                } else
                                {
                                    return makeArray([], extra);
                                }
                            }

                            try
                            {
                                return makeArray(context.querySelectorAll(query), extra);
                            } catch(qsaError)
                            {
                            }

                            /**
                             * qSA funciona de forma estranha em consultas enraizadas em
                             * elemento. Podemos contornar isso especificando um ID extra
                             * na raiz e trabalhando a partir daí. O IE 8 não funciona em
                             * elementos de objeto.
                             */
                        } else if (context.nodeType === 1 && context.nodeName.toLowerCase() !== "object")
                        {
                            var oldContext = context;
                            var old = context.getAttribute("id");
                            var nid = old || id;
                            var hasParent = context.parentNode;
                            var relativeHierarchySelector = /^\s*[+~]/.test(query);

                            if (!old)
                            {
                                context.setAttribute("id", nid);
                            } else
                            {
                                nid = nid.replace(/'/g, "\\$&");
                            }

                            if (relativeHierarchySelector && hasParent)
                            {
                                context = context.parentNode;
                            }

                            try
                            {
                                if (!relativeHierarchySelector || hasParent)
                                {
                                    return makeArray(context.querySelectorAll("[id='" + nid + "'] " + query), extra);
                                }
                            } catch(pseudoError)
                            {
                            } finally
                            {
                                if (!old)
                                {
                                    oldContext.removeAttribute("id");
                                }
                            }
                        }
                    }

                    return oldSizzle(query, context, extra, seed);
                };

                for (var prop in oldSizzle)
                {
                    Sizzle[prop] = oldSizzle[prop];
                }

                /**
                 * Liberar cubos em IE.
                 */
                div = null;
            })();
        }

        /**
         *
         */
        (function()
        {
            var html = document.documentElement;
            var matches = html.matchesSelector || html.mozMatchesSelector || html.webkitMatchesSelector || html.msMatchesSelector;

            if (matches)
            {
                /**
                 * Verifique se é possível fazer matchesSelector em um nó
                 * desconectado (o IE 9 falha nisso).
                 */
                var disconnectedMatch = !matches.call(document.createElement("div"), "div");
                var pseudoWorks = false;

                try
                {
                    /**
                     * Isso deve falhar com uma exceção.
                     * O Gecko não apresenta falha, retorna false.
                     */
                    matches.call(document.documentElement, "[test!='']:sizzle");
                } catch(pseudoError)
                {
                    pseudoWorks = true;
                }

                /**
                 *
                 */
                Sizzle.matchesSelector = function(node, expr)
                {
                    /**
                     * Certifique-se de que os seletores de atributo estejam
                     * entre aspas.
                     */
                    expr = expr.replace(/\=\s*([^'"\]]*)\s*\]/g, "='$1']");

                    /**
                     *
                     */
                    if (!Sizzle.isXML(node))
                    {
                        try
                        {
                            if (pseudoWorks || !Expr.match.PSEUDO.test(expr) && !/!=/.test(expr))
                            {
                                var ret = matches.call(node, expr);

                                /**
                                 * IE 9's matchesSelector retorna falso em nós desconectados.
                                 *
                                 * //
                                 * // Além disso, diz-se que os nós desconectados estão em
                                 * // um fragmento de documento no IE 9, então verifique
                                 * // isso.
                                 * //
                                 * node.document && node.document.nodeType !== 11
                                 */
                                if (ret || !disconnectedMatch || node.document && node.document.nodeType !== 11)
                                {
                                    return ret;
                                }
                            }
                        } catch(e)
                        {
                        }
                    }

                    return Sizzle(expr, null, null, [node]).length > 0;
                };
            }
        })();

        /**
         *
         */
        (function()
        {
            var div = document.createElement("div");
                div.innerHTML = "<div class='test e'></div><div class='test'></div>";

            /**
             * O Opera não consegue encontrar um segundo nome de
             * classe (em 9.6). Além disso, certifique-se de que
             * getElementsByClassName realmente exista.
             */
            if (!div.getElementsByClassName || div.getElementsByClassName("e").length === 0)
            {
                return;
            }

            /**
             * O Safari armazena em cubos os atributos de classe, não
             * detecta alterações (em 3.2).
             */
            div.lastChild.className = "e";

            if (div.getElementsByClassName("e").length === 1)
            {
                return;
            }

            Expr.order.splice(1, 0, "CLASS");
            Expr.find.CLASS = function(match, context, isXML)
            {
                if (typeof context.getElementsByClassName !== "undefined" && !isXML)
                {
                    return context.getElementsByClassName(match[1]);
                }
            };

            /**
             * Liberar cubos no IE.
             */
            div = null;
        })();

        /**
         *
         */
        function dirNodeCheck(dir, cur, doneName, checkSet, nodeCheck, isXML)
        {
            for (var i = 0, l = checkSet.length; i < l; i++)
            {
                var elem = checkSet[i];

                if (elem)
                {
                    var match = false;

                    elem = elem[dir];

                    while (elem)
                    {
                        if (elem[expando] === doneName)
                        {
                            match = checkSet[elem.sizset];
                            break;
                        }

                        if (elem.nodeType === 1 && !isXML)
                        {
                            elem[expando] = doneName;
                            elem.sizset = i;
                        }

                        if (elem.nodeName.toLowerCase() === cur)
                        {
                            match = elem;
                            break;
                        }

                        elem = elem[dir];
                    }

                    checkSet[i] = match;
                }
            }
        }

        /**
         *
         */
        function dirCheck(dir, cur, doneName, checkSet, nodeCheck, isXML)
        {
            for (var i = 0, l = checkSet.length; i < l; i++)
            {
                var elem = checkSet[i];

                if (elem)
                {
                    var match = false;

                    elem = elem[dir];

                    while (elem)
                    {
                        if (elem[expando] === doneName)
                        {
                            match = checkSet[elem.sizset];
                            break;
                        }

                        if (elem.nodeType === 1)
                        {
                            if (!isXML)
                            {
                                elem[expando] = doneName;
                                elem.sizset = i;
                            }

                            if (typeof cur !== "string")
                            {
                                if (elem === cur)
                                {
                                    match = true;
                                    break;
                                }
                            } else if (Sizzle.filter(cur, [elem]).length > 0)
                            {
                                match = elem;
                                break;
                            }
                        }

                        elem = elem[dir];
                    }

                    checkSet[i] = match;
                }
            }
        }

        /**
         *
         */
        if (document.documentElement.contains)
        {
            Sizzle.contains = function(a, b)
            {
                return a !== b && (a.contains ? a.contains(b) : true);
            };
        } else if (document.documentElement.compareDocumentPosition)
        {
            Sizzle.contains = function(a, b)
            {
                return !!(a.compareDocumentPosition(b) & 16);
            };
        } else
        {
            Sizzle.contains = function()
            {
                return false;
            };
        }

        /**
         *
         */
        Sizzle.isXML = function(elem)
        {
            /**
             * documentElement é verificado para os casos em que ainda não existe
             * (como carregar iframes no IE - #4833).
             */
            var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;

            return documentElement ? documentElement.nodeName !== "HTML" : false;
        };

        /**
         *
         */
        var posProcess = function(selector, context, seed)
        {
            var match;
            var tmpSet = [];
            var later = "";
            var root = context.nodeType ? [context] : context;

            /**
             * Os seletores de posição devem ser feitos após o filtro. E
             * assim deve :not(posicional) então movemos todos os PSEUDOs
             * para o final.
             */
            while ((match = Expr.match.PSEUDO.exec(selector)))
            {
                later += match[0];
                selector = selector.replace(Expr.match.PSEUDO, "");
            }

            selector = Expr.relative[selector] ? selector + "*" : selector;

            for (var i = 0, l = root.length; i < l; i++)
            {
                Sizzle(selector, root[i], tmpSet, seed);
            }

            return Sizzle.filter(later, tmpSet);
        };

        /**
         * EXPOR.
         * Substitua a recuperação do atributo sizzle.
         */
        Sizzle.attr = jQuery.attr;
        Sizzle.selectors.attrMap = {};

        jQuery.find = Sizzle;
        jQuery.expr = Sizzle.selectors;
        jQuery.expr[":"] = jQuery.expr.filters;
        jQuery.unique = Sizzle.uniqueSort;
        jQuery.text = Sizzle.getText;
        jQuery.isXMLDoc = Sizzle.isXML;
        jQuery.contains = Sizzle.contains;
    })();

    /**
     *
     */
    var runtil = /Until$/;
    var rparentsprev = /^(?:parents|prevUntil|prevAll)/;

    /**
     * Observação: Este RegExp deve ser melhorado ou provavelmente
     * removido de Sizzle.
     */
    var rmultiselector = /,/;
    var isSimple = /^.[^:#\[\.,]*$/;
    var slice = Array.prototype.slice;
    var POS = jQuery.expr.match.globalPOS;

    /**
     * Métodos garantidos para produzir um conjunto exclusivo ao
     * iniciar de um conjunto exclusivo.
     */
    var guaranteedUnique = {
        children: true,
        contents: true,
        next: true,
        prev: true
    };

    /**
     *
     */
    jQuery.fn.extend({
        /**
         *
         */
        find: function(selector)
        {
            var self = this;
            var i;
            var l;

            if (typeof selector !== "string")
            {
                return jQuery(selector).filter(function()
                {
                    for (i = 0, l = self.length; i < l; i++)
                    {
                        if (jQuery.contains(self[i], this))
                        {
                            return true;
                        }
                    }
                });
            }

            var ret = this.pushStack("", "find", selector);
            var length;
            var n;
            var r;

            for (i = 0, l = this.length; i < l; i++)
            {
                length = ret.length;
                jQuery.find(selector, this[i], ret);

                if (i > 0)
                {
                    /**
                     * Certifique-se de que os resultados sejam únicos.
                     */
                    for (n = length; n < ret.length; n++)
                    {
                        for (r = 0; r < length; r++)
                        {
                            if (ret[r] === ret[n])
                            {
                                ret.splice(n--, 1);
                                break;
                            }
                        }
                    }
                }
            }

            return ret;
        },

        /**
         *
         */
        has: function(target)
        {
            var targets = jQuery(target);

            return this.filter(function()
            {
                for (var i = 0, l = targets.length; i < l; i++)
                {
                    if (jQuery.contains(this, targets[i]))
                    {
                        return true;
                    }
                }
            });
        },

        /**
         *
         */
        not: function(selector)
        {
            return this.pushStack(winnow(this, selector, false), "not", selector);
        },

        /**
         *
         */
        filter: function(selector)
        {
            return this.pushStack(winnow(this, selector, true), "filter", selector);
        },

        /**
         *
         */
        is: function(selector)
        {
            return !!selector && (typeof selector === "string" ?
                    /**
                     * Se este for um seletor posicional, verifique a associação
                     * no conjunto retornado para $("p:first").is("p:last"),
                     * não retornará verdadeiro para um documento com dois "p".
                     */
                    POS.test(selector) ?
                        jQuery(selector, this.context).index(this[0]) >= 0 :
                        jQuery.filter(selector, this).length > 0 :
                    this.filter(selector).length > 0);
        },

        /**
         *
         */
        closest: function(selectors, context)
        {
            var ret = [];
            var i;
            var l;
            var cur = this[0];

            /**
             * Vetor (Não é mais usado após jQuery 1.7).
             */
            if (jQuery.isArray(selectors))
            {
                var level = 1;

                while (cur && cur.ownerDocument && cur !== context)
                {
                    for (i = 0; i < selectors.length; i++)
                    {
                        if (jQuery(cur).is(selectors[i]))
                        {
                            ret.push({ selector: selectors[i], elem: cur, level: level });
                        }
                    }

                    cur = cur.parentNode;
                    level++;
                }

                return ret;
            }

            /**
             * Sequência de grafemas.
             */
            var pos = POS.test(selectors) || typeof selectors !== "string" ?
                jQuery(selectors, context || this.context) :
                0;

            for (i = 0, l = this.length; i < l; i++)
            {
                cur = this[i];

                while (cur)
                {
                    if (pos ? pos.index(cur) > -1 : jQuery.find.matchesSelector(cur, selectors))
                    {
                        ret.push(cur);
                        break;
                    } else
                    {
                        cur = cur.parentNode;

                        if (!cur || !cur.ownerDocument || cur === context || cur.nodeType === 11)
                        {
                            break;
                        }
                    }
                }
            }

            ret = ret.length > 1 ? jQuery.unique(ret) : ret;

            return this.pushStack(ret, "closest", selectors);
        },

        /**
         * Determine a posição de um elemento dentro do conjunto
         * correspondente de elementos.
         */
        index: function(elem)
        {
            /**
             * Sem argumento, retorna o índice na camada mais alta.
             */
            if (!elem)
            {
                return (this[0] && this[0].parentNode) ? this.prevAll().length : -1;
            }

            /**
             * índice no seletor.
             */
            if (typeof elem === "string")
            {
                return jQuery.inArray(this[0], jQuery(elem));
            }

            /**
             * Localize a posição do elemento desejado.
             * Se receber um objeto jQuery, o primeiro elemento é usado.
             */
            return jQuery.inArray(elem.jquery ? elem[0] : elem, this);
        },

        /**
         *
         */
        add: function(selector, context)
        {
            var set = typeof selector === "string" ? jQuery(selector, context) : jQuery.makeArray(selector && selector.nodeType ? [selector] : selector);
            var all = jQuery.merge(this.get(), set);

            return this.pushStack(isDisconnected(set[0]) || isDisconnected(all[0]) ? all : jQuery.unique(all));
        },

        /**
         *
         */
        andSelf: function()
        {
            return this.add(this.prevObject);
        }
    });

    /**
     * Uma verificação complexa para ver se um elemento está
     * desconectado de um documento (deve ser melhorado,
     * sempre que possível).
     */
    function isDisconnected(node)
    {
        return !node || !node.parentNode || node.parentNode.nodeType === 11;
    }

    /**
     *
     */
    jQuery.each({
        /**
         *
         */
        parent: function(elem)
        {
            var parent = elem.parentNode;

            return parent && parent.nodeType !== 11 ? parent : null;
        },

        /**
         *
         */
        parents: function(elem)
        {
            return jQuery.dir(elem, "parentNode");
        },

        /**
         *
         */
        parentsUntil: function(elem, i, until)
        {
            return jQuery.dir(elem, "parentNode", until);
        },

        /**
         *
         */
        next: function(elem)
        {
            return jQuery.nth(elem, 2, "nextSibling");
        },

        /**
         *
         */
        prev: function(elem)
        {
            return jQuery.nth(elem, 2, "previousSibling");
        },

        /**
         *
         */
        nextAll: function(elem)
        {
            return jQuery.dir(elem, "nextSibling");
        },

        /**
         *
         */
        prevAll: function(elem)
        {
            return jQuery.dir(elem, "previousSibling");
        },

        /**
         *
         */
        nextUntil: function(elem, i, until)
        {
            return jQuery.dir(elem, "nextSibling", until);
        },

        /**
         *
         */
        prevUntil: function(elem, i, until)
        {
            return jQuery.dir(elem, "previousSibling", until);
        },

        /**
         *
         */
        siblings: function(elem)
        {
            return jQuery.sibling((elem.parentNode || {}).firstChild, elem);
        },

        /**
         *
         */
        children: function(elem)
        {
            return jQuery.sibling(elem.firstChild);
        },

        /**
         *
         */
        contents: function(elem)
        {
            return jQuery.nodeName(elem, "iframe") ? elem.contentDocument || elem.contentWindow.document : jQuery.makeArray(elem.childNodes);
        }
    }, function(name, fn)
    {
        jQuery.fn[ name ] = function(until, selector)
        {
            var ret = jQuery.map(this, fn, until);

            if (!runtil.test(name))
            {
                selector = until;
            }

            if (selector && typeof selector === "string")
            {
                ret = jQuery.filter(selector, ret);
            }

            ret = this.length > 1 && !guaranteedUnique[name] ? jQuery.unique(ret) : ret;

            if ((this.length > 1 || rmultiselector.test(selector)) && rparentsprev.test(name))
            {
                ret = ret.reverse();
            }

            return this.pushStack(ret, name, slice.call(arguments).join(","));
        };
    });

    /**
     *
     */
    jQuery.extend({
        /**
         *
         */
        filter: function(expr, elems, not)
        {
            if (not)
            {
                expr = ":not(" + expr + ")";
            }

            return elems.length === 1 ?
                jQuery.find.matchesSelector(elems[0], expr) ? [elems[0]] : [] :
                jQuery.find.matches(expr, elems);
        },

        /**
         *
         */
        dir: function(elem, dir, until)
        {
            var matched = [];
            var cur = elem[dir];

            while (cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !jQuery(cur).is(until)))
            {
                if (cur.nodeType === 1)
                {
                    matched.push(cur);
                }

                cur = cur[dir];
            }

            return matched;
        },

        /**
         *
         */
        nth: function(cur, result, dir, elem)
        {
            result = result || 1;
            var num = 0;

            for (; cur; cur = cur[dir])
            {
                if (cur.nodeType === 1 && ++num === result)
                {
                    break;
                }
            }

            return cur;
        },

        /**
         *
         */
        sibling: function(n, elem)
        {
            var r = [];

            for (; n; n = n.nextSibling)
            {
                if (n.nodeType === 1 && n !== elem)
                {
                    r.push(n);
                }
            }

            return r;
        }
    });

    /**
     * Implemente a funcionalidade idêntica para filtro e não.
     */
    function winnow(elements, qualifier, keep)
    {
        /**
         * Não é possível passar nulo ou indefinido para indexOf no Firefox 4.
         * Defina como 0 para ignorar a verificação da string.
         */
        qualifier = qualifier || 0;

        if (jQuery.isFunction(qualifier))
        {
            return jQuery.grep(elements, function(elem, i)
            {
                var retVal = !!qualifier.call(elem, i, elem);

                return retVal === keep;
            });
        } else if (qualifier.nodeType)
        {
            return jQuery.grep(elements, function(elem, i)
            {
                return (elem === qualifier) === keep;
            });
        } else if (typeof qualifier === "string")
        {
            var filtered = jQuery.grep(elements, function(elem)
            {
                return elem.nodeType === 1;
            });

            if (isSimple.test(qualifier))
            {
                return jQuery.filter(qualifier, filtered, !keep);
            } else
            {
                qualifier = jQuery.filter(qualifier, filtered);
            }
        }

        return jQuery.grep(elements, function(elem, i)
        {
            return (jQuery.inArray(elem, qualifier) >= 0) === keep;
        });
    }

    /**
     *
     */
    function createSafeFragment(document)
    {
        var list = nodeNames.split( "|" );
        var safeFrag = document.createDocumentFragment();

        if (safeFrag.createElement)
        {
            while (list.length)
            {
                safeFrag.createElement(
                    list.pop()
                );
            }
        }

        return safeFrag;
    }

    /**
     *
     */
    var nodeNames = "abbr|" +
        "article|" +
        "aside|" +
        "audio|" +
        "bdi|" +
        "canvas|" +
        "data|" +
        "datalist|" +
        "details|" +
        "figcaption|" +
        "figure|" +
        "footer|" +
        "header|" +
        "hgroup|" +
        "mark|" +
        "meter|" +
        "nav|" +
        "output|" +
        "progress|" +
        "section|" +
        "summary|" +
        "time|" +
        "video";

    var rinlinejQuery = / jQuery\d+="(?:\d+|null)"/g;
    var rleadingWhitespace = /^\s+/;
    var rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig;
    var rtagName = /<([\w:]+)/;
    var rtbody = /<tbody/i;
    var rhtml = /<|&#?\w+;/;
    var rnoInnerhtml = /<(?:script|style)/i;
    var rnocache = /<(?:script|object|embed|option|style)/i;
    var rnoshimcache = new RegExp("<(?:" + nodeNames + ")[\\s/>]", "i");

    /**
     * checked="checked" ou checked.
     */
    var rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i;
    var rscriptType = /\/(java|ecma)script/i;
    var rcleanScript = /^\s*<!(?:\[CDATA\[|\-\-)/;
    var wrapMap = {
        option: [
            1,

            "<select multiple='multiple'>",
            "</select>"
        ],

        legend: [
            1,

            "<fieldset>",
            "</fieldset>"
        ],

        thead: [
            1,

            "<table>",
            "</table>"
        ],

        tr: [
            2,

            "<table><tbody>",
            "</tbody></table>"
        ],

        td: [
            3,

            "<table><tbody><tr>",
            "</tr></tbody></table>"
        ],

        col: [
            2,

            "<table><tbody></tbody><colgroup>",
            "</colgroup></table>"
        ],

        area: [
            1,

            "<map>",
            "</map>"
        ],

        _default: [
            0,

            "",
            ""
        ]
    };

    /**
     *
     */
    var safeFragment = createSafeFragment(document);

    /**
     *
     */
    wrapMap.optgroup = wrapMap.option;
    wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
    wrapMap.th = wrapMap.td;

    /**
     * O IE não pode serializar as tags <link> e <script> normalmente.
     */
    if (!jQuery.support.htmlSerialize)
    {
        wrapMap._default = [1, "div<div>", "</div>"];
    }

    /**
     *
     */
    jQuery.fn.extend({
        /**
         *
         */
        text: function(value)
        {
            return jQuery.access(this, function(value)
            {
                return value === undefined ?
                    jQuery.text(this) :
                    this.empty().append((this[0] && this[0].ownerDocument || document).createTextNode(value));
            }, null, value, arguments.length);
        },

        /**
         *
         */
        wrapAll: function(html)
        {
            if (jQuery.isFunction(html))
            {
                return this.each(function(i)
                {
                    jQuery(this).wrapAll(html.call(this, i));
                });
            }

            if (this[0])
            {
                /**
                 * Os elementos para envolver a base.
                 */
                var wrap = jQuery(html, this[0].ownerDocument).eq(0).clone(true);

                if (this[0].parentNode)
                {
                    wrap.insertBefore(this[0]);
                }

                wrap.map(function()
                {
                    var elem = this;

                    while (elem.firstChild && elem.firstChild.nodeType === 1)
                    {
                        elem = elem.firstChild;
                    }

                    return elem;
                }).append(this);
            }

            return this;
        },

        /**
         *
         */
        wrapInner: function(html)
        {
            if (jQuery.isFunction(html))
            {
                return this.each(function(i)
                {
                    jQuery(this).wrapInner(html.call(this, i));
                });
            }

            return this.each(function()
            {
                var self = jQuery(this);
                var contents = self.contents();

                if (contents.length)
                {
                    contents.wrapAll(html);
                } else
                {
                    self.append(html);
                }
            });
        },

        /**
         *
         */
        wrap: function(html)
        {
            var isFunction = jQuery.isFunction(html);

            return this.each(function(i)
            {
                jQuery(this).wrapAll(isFunction ? html.call(this, i) : html);
            });
        },

        /**
         *
         */
        unwrap: function()
        {
            return this.parent().each(function()
            {
                if (!jQuery.nodeName(this, "body"))
                {
                    jQuery(this).replaceWith(this.childNodes);
                }
            }).end();
        },

        /**
         *
         */
        append: function()
        {
            return this.domManip(arguments, true, function(elem)
            {
                if (this.nodeType === 1)
                {
                    this.appendChild(elem);
                }
            });
        },

        /**
         *
         */
        prepend: function()
        {
            return this.domManip(arguments, true, function(elem)
            {
                if (this.nodeType === 1)
                {
                    this.insertBefore(elem, this.firstChild);
                }
            });
        },

        /**
         *
         */
        before: function()
        {
            if (this[0] && this[0].parentNode)
            {
                return this.domManip(arguments, false, function(elem)
                {
                    this.parentNode.insertBefore(elem, this);
                });
            } else if (arguments.length)
            {
                var set = jQuery.clean(arguments);
                    set.push.apply(set, this.toArray());

                return this.pushStack(set, "before", arguments);
            }
        },

        /**
         *
         */
        after: function()
        {
            if (this[0] && this[0].parentNode)
            {
                return this.domManip(arguments, false, function(elem)
                {
                    this.parentNode.insertBefore(elem, this.nextSibling);
                });
            } else if (arguments.length)
            {
                var set = this.pushStack(this, "after", arguments);
                    set.push.apply(set, jQuery.clean(arguments));

                return set;
            }
        },

        /**
         * keepData é apenas para uso interno--não faça a criação
         * de um manual para esse.
         */
        remove: function(selector, keepData)
        {
            for (var i = 0, elem; (elem = this[i]) != null; i++)
            {
                if (!selector || jQuery.filter(selector, [elem]).length)
                {
                    if (!keepData && elem.nodeType === 1)
                    {
                        jQuery.cleanData(elem.getElementsByTagName("*"));
                        jQuery.cleanData([elem]);
                    }

                    if (elem.parentNode)
                    {
                        elem.parentNode.removeChild(elem);
                    }
                }
            }

            return this;
        },

        /**
         *
         */
        empty: function()
        {
            for (var i = 0, elem; (elem = this[i]) != null; i++)
            {
                /**
                 * Remova os nós do elemento e evite envios de cubos.
                 */
                if (elem.nodeType === 1)
                {
                    jQuery.cleanData(elem.getElementsByTagName("*"));
                }

                /**
                 * Remova todos os nós restantes.
                 */
                while (elem.firstChild)
                {
                    elem.removeChild(elem.firstChild);
                }
            }

            return this;
        },

        /**
         *
         */
        clone: function(dataAndEvents, deepDataAndEvents)
        {
            dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
            deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

            return this.map(function ()
            {
                return jQuery.clone(this, dataAndEvents, deepDataAndEvents);
            });
        },

        /**
         *
         */
        html: function(value)
        {
            return jQuery.access(this, function(value)
            {
                var elem = this[0] || {};
                var i = 0;
                var l = this.length;

                if (value === undefined)
                {
                    return elem.nodeType === 1 ? elem.innerHTML.replace(rinlinejQuery, "") : null;
                }

                if (typeof value === "string" && !rnoInnerhtml.test(value) && (jQuery.support.leadingWhitespace || !rleadingWhitespace.test(value)) && !wrapMap[(rtagName.exec(value) || ["", ""])[1].toLowerCase()])
                {
                    value = value.replace(rxhtmlTag, "<$1></$2>");

                    try
                    {
                        for (; i < l; i++)
                        {
                            /**
                             * Remova os nós do elemento e evite envios de cubos.
                             */
                            elem = this[i] || {};

                            if (elem.nodeType === 1)
                            {
                                jQuery.cleanData(elem.getElementsByTagName("*"));
                                elem.innerHTML = value;
                            }
                        }

                        elem = 0;

                        /**
                         * Se o uso de innerHTML lançar uma exceção, use
                         * o método de fallback.
                         */
                    } catch(e)
                    {
                    }
                }

                if (elem)
                {
                    this.empty().append(value);
                }
            }, null, value, arguments.length);
        },

        /**
         *
         */
        replaceWith: function(value)
        {
            if (this[0] && this[0].parentNode)
            {
                /**
                 * Certifique-se de que os elementos sejam removidos do DOM antes
                 * de serem inseridos, isso pode ajudar a melhorar a substituição
                 * de uma camada mais alta por elementos da camada mais baixa.
                 */
                if (jQuery.isFunction(value))
                {
                    return this.each(function(i)
                    {
                        var self = jQuery(this);
                        var old = self.html();

                        self.replaceWith(value.call(this, i, old));
                    });
                }

                if (typeof value !== "string")
                {
                    value = jQuery(value).detach();
                }

                return this.each(function()
                {
                    var next = this.nextSibling;
                    var parent = this.parentNode;

                    jQuery(this).remove();

                    if (next)
                    {
                        jQuery(next).before(value);
                    } else
                    {
                        jQuery(parent).append(value);
                    }
                });
            } else
            {
                return this.length ?
                    this.pushStack(jQuery(jQuery.isFunction(value) ? value() : value), "replaceWith", value) :
                    this;
            }
        },

        /**
         *
         */
        detach: function(selector)
        {
            return this.remove(selector, true);
        },

        /**
         *
         */
        domManip: function(args, table, callback)
        {
            var results;
            var first;
            var fragment;
            var parent;
            var value = args[0];
            var scripts = [];

            /**
             * Não podemos clonar fragmentos Node que contenham verificados,
             * em WebKit.
             */
            if (!jQuery.support.checkClone && arguments.length === 3 && typeof value === "string" && rchecked.test(value))
            {
                return this.each(function()
                {
                    jQuery(this).domManip(args, table, callback, true);
                });
            }

            if (jQuery.isFunction(value))
            {
                return this.each(function(i)
                {
                    var self = jQuery(this);

                    args[0] = value.call(this, i, table ? self.html() : undefined);
                    self.domManip(args, table, callback);
                });
            }

            if (this[0])
            {
                parent = value && value.parentNode;

                /**
                 * Se estivermos em um fragmento, basta usá-lo em vez
                 * de criar um novo.
                 */
                if (jQuery.support.parentNode && parent && parent.nodeType === 11 && parent.childNodes.length === this.length)
                {
                    results = {
                        fragment: parent
                    };
                } else
                {
                    results = jQuery.buildFragment(args, this, scripts);
                }

                fragment = results.fragment;

                if (fragment.childNodes.length === 1)
                {
                    first = fragment = fragment.firstChild;
                } else
                {
                    first = fragment.firstChild;
                }

                if (first)
                {
                    table = table && jQuery.nodeName(first, "tr");

                    for (var i = 0, l = this.length, lastIndex = l - 1; i < l; i++)
                    {
                        callback.call(table ? root(this[i], first) : this[i],
                            /**
                             * Certifique-se de não enviar cubos descartando
                             * inadvertidamente o fragmento original (que pode ter
                             * anexado dados) em vez de usando isso; além disso,
                             * use o objeto de fragmento original para o último
                             * item em vez de primeiro porque pode acabar sendo
                             * esvaziado incorretamente em certas situações
                             * (Falha #8070). Fragmentos do cubo de fragmentos
                             * sempre devem ser clonados e nunca usados no lugar.
                             */
                            results.cacheable || (l > 1 && i < lastIndex) ?
                                jQuery.clone(fragment, true, true) :
                                fragment
                        );
                    }
                }

                if (scripts.length)
                {
                    jQuery.each(scripts, function(i, elem)
                    {
                        if (elem.src)
                        {
                            jQuery.ajax({
                                type: "GET",
                                global: false,
                                url: elem.src,
                                async: false,
                                dataType: "script"
                            });
                        } else
                        {
                            jQuery.globalEval((elem.text || elem.textContent || elem.innerHTML || "").replace(rcleanScript, "/*$0*/"));
                        }

                        if (elem.parentNode)
                        {
                            elem.parentNode.removeChild(elem);
                        }
                    });
                }
            }

            return this;
        }
    });

    /**
     *
     */
    function root(elem, cur)
    {
        return jQuery.nodeName(elem, "table") ? (
            elem.getElementsByTagName("tbody")[0] ||
            elem.appendChild(elem.ownerDocument.createElement("tbody"))) :
            elem;
    }

    /**
     *
     */
    function cloneCopyEvent(src, dest)
    {
        if (dest.nodeType !== 1 || !jQuery.hasData(src))
        {
            return;
        }

        var type;
        var i;
        var l;
        var oldData = jQuery._data(src);
        var curData = jQuery._data(dest, oldData);
        var events = oldData.events;

        if (events)
        {
            delete curData.handle;
            curData.events = {};

            for (type in events)
            {
                for (i = 0, l = events[type].length; i < l; i++)
                {
                    jQuery.event.add(dest, type, events[type][i]);
                }
            }
        }

        /**
         * Tornar o objeto de dados públicos clonado uma cópia do original.
         */
        if (curData.data)
        {
            curData.data = jQuery.extend({}, curData.data);
        }
    }

    /**
     *
     */
    function cloneFixAttributes(src, dest)
    {
        var nodeName;

        /**
         * Não precisamos fazer nada para não-Elementos.
         */
        if (dest.nodeType !== 1)
        {
            return;
        }

        /**
         * clearAttributes remove os atributos, que não queremos,
         * mas também remove os eventos attachEvent,que nós *queremos*.
         */
        if (dest.clearAttributes)
        {
            dest.clearAttributes();
        }

        /**
         * mergeAttributes, em contraste, apenas funde novamente nos
         * atributos originais, não nos eventos.
         */
        if (dest.mergeAttributes)
        {
            dest.mergeAttributes(src);
        }

        nodeName = dest.nodeName.toLowerCase();

        /**
         * IE6-8 falha ao clonar as camadas mais baixas dentro de
         * elementos de objeto que usam o valor do atributo classid
         * proprietário (em vez do atributo type) para identificar
         * o tipo de conteúdo a ser exibido.
         */
        if (nodeName === "object")
        {
            dest.outerHTML = src.outerHTML;
        } else if (nodeName === "input" && (src.type === "checkbox" || src.type === "radio"))
        {
            /**
             * IE6-8 falha em manter o estado marcado de uma caixa de seleção
             * ou botão de opção clonado. Pior ainda, o IE6-7 falha em dar
             * ao elemento clonado uma aparência verificada se o valor
             * defaultChecked também não estiver definido.
             */
            if (src.checked)
            {
                dest.defaultChecked = dest.checked = src.checked;
            }

            /**
             * IE6-7 ficar confuso e acabar definindo o valor de uma caixa
             * de seleção/botão de rádio clonado para uma sequência de
             * grafemas vazia em vez de "on".
             */
            if (dest.value !== src.value)
            {
                dest.value = src.value;
            }

            /**
             * IE6-8 falha ao retornar a opção selecionada ao status
             * selecionado da especificação ao clonar opções.
             */
        } else if (nodeName === "option")
        {
            dest.selected = src.defaultSelected;

            /**
             * IE6-8 falha ao definir o defaultValue para o valor
             * correto ao clonar outros tipos de campos de entrada.
             */
        } else if (nodeName === "input" || nodeName === "textarea")
        {
            dest.defaultValue = src.defaultValue;

            /**
             * O IE apaga o conteúdo ao clonar scripts.
             */
        } else if (nodeName === "script" && dest.text !== src.text)
        {
            dest.text = src.text;
        }

        /**
         * Os dados do evento são referenciados em vez de copiados
         * se o expando também for copiado.
         */
        dest.removeAttribute(jQuery.expando);

        /**
         * Sinalizadores claros para borbulhar eventos especiais de
         * alteração/envio, eles devem ser reanexados quando os
         * eventos recém-clonados forem ativados pela primeira
         * vez.
         */
        dest.removeAttribute("_submit_attached");
        dest.removeAttribute("_change_attached");
    }

    /**
     *
     */
    jQuery.buildFragment = function(args, nodes, scripts)
    {
        var fragment;
        var cacheable;
        var cacheresults;
        var doc;
        var first = args[0];

        /**
         * Os nós podem conter um objeto de documento explícito, uma
         * coleção jQuery ou um objeto de contexto. Se nodes[0] contiver
         * um objeto válido para atribuir a doc.
         */
        if (nodes && nodes[0])
        {
            doc = nodes[0].ownerDocument || nodes[0];
        }

        /**
         * Assegure-se de que um objeto atr não se posicione incorretamente
         * como um objeto de documento. O Chrome e o Firefox parecem permitir
         * que isso ocorra e lançarão uma exceção. Melhorias em #8950.
         */
        if (!doc.createDocumentFragment)
        {
            doc = document;
        }

        /**
         * Armazene em cubos apenas sequências de grafemas HTML "pequenas" (1/2 KB)
         * associadas ao documento principal. As opções de clonagem perdem o
         * estado selecionado, portanto, não as armazene em cubos. O IE 6 não
         * gosta quando você coloca elementos <object> ou <embed> em um fragmento.
         * Além disso, o WebKit não clona atributos 'checked' no cloneNode, então
         * não os coloque em cubos. Por fim, o IE6,7,8 não reutilizará corretamente
         * os fragmentos em cubos que foram criados a partir de elementos
         * desconhecidos #10501.
         */
        if (args.length === 1 && typeof first === "string" && first.length < 512 && doc === document && first.charAt(0) === "<" && !rnocache.test(first) && (jQuery.support.checkClone || !rchecked.test(first)) && (jQuery.support.html5Clone || !rnoshimcache.test(first)))
        {
            cacheable = true;
            cacheresults = jQuery.fragments[first];

            if (cacheresults && cacheresults !== 1)
            {
                fragment = cacheresults;
            }
        }

        if (!fragment)
        {
            fragment = doc.createDocumentFragment();
            jQuery.clean(args, doc, fragment, scripts);
        }

        if (cacheable)
        {
            jQuery.fragments[first] = cacheresults ? fragment : 1;
        }

        return {
            fragment: fragment,
            cacheable: cacheable
        };
    };

    /**
     *
     */
    jQuery.fragments = {};

    /**
     *
     */
    jQuery.each({
        appendTo: "append",
        prependTo: "prepend",
        insertBefore: "before",
        insertAfter: "after",
        replaceAll: "replaceWith"
    }, function(name, original)
    {
        jQuery.fn[ name ] = function(selector)
        {
            var ret = [];
            var insert = jQuery(selector);
            var parent = this.length === 1 && this[0].parentNode;

            if (parent && parent.nodeType === 11 && parent.childNodes.length === 1 && insert.length === 1)
            {
                insert[original](this[0]);

                return this;
            } else
            {
                for (var i = 0, l = insert.length; i < l; i++)
                {
                    var elems = (i > 0 ? this.clone(true) : this).get();

                    jQuery(insert[i])[original](elems);
                    ret = ret.concat(elems);
                }

                return this.pushStack(ret, name, insert.selector);
            }
        };
    });

    /**
     *
     */
    function getAll(elem)
    {
        if (typeof elem.getElementsByTagName !== "undefined")
        {
            return elem.getElementsByTagName( "*" );
        } else if (typeof elem.querySelectorAll !== "undefined")
        {
            return elem.querySelectorAll( "*" );
        } else
        {
            return [];
        }
    }

    /**
     * Usado em clean, melhora a propriedade defaultChecked.
     */
    function fixDefaultChecked(elem)
    {
        if (elem.type === "checkbox" || elem.type === "radio")
        {
            elem.defaultChecked = elem.checked;
        }
    }

    /**
     * Localiza todas as entradas e as passa para fixDefaultChecked.
     */
    function findInputs(elem)
    {
        var nodeName = (elem.nodeName || "").toLowerCase();

        if (nodeName === "input")
        {
            fixDefaultChecked(elem);

            /**
             * Ignore scripts, consiga outras camadas mais baixas.
             */
        } else if (nodeName !== "script" && typeof elem.getElementsByTagName !== "undefined")
        {
            jQuery.grep(elem.getElementsByTagName("input"), fixDefaultChecked);
        }
    }

    /**
     *
     */
    function shimCloneNode(elem)
    {
        var div = document.createElement("div");

        safeFragment.appendChild(div);
        div.innerHTML = elem.outerHTML;

        return div.firstChild;
    }

    /**
     *
     */
    jQuery.extend({
        /**
         *
         */
        clone: function(elem, dataAndEvents, deepDataAndEvents)
        {
            var srcElements;
            var destElements;
            var i;

            /**
             * IE<=8 não clona adequadamente nós de elementos desconhecidos
             * e desanexados.
             */
            var clone = jQuery.support.html5Clone || jQuery.isXMLDoc(elem) || !rnoshimcache.test( "<" + elem.nodeName + ">" ) ?
                elem.cloneNode(true) :
                shimCloneNode(elem);

            if ((!jQuery.support.noCloneEvent || !jQuery.support.noCloneChecked) &&  (elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem))
            {
                /**
                 * IE copia eventos vinculados via attachEvent ao usar cloneNode.
                 * Chamar detachEvent no clone também removerá os eventos
                 * do original. Para contornar isso, usamos alguns métodos
                 * proprietários para limpar os eventos.
                 */
                cloneFixAttributes(elem, clone);

                /**
                 * Usar Sizzle aqui é muito lento, então usamos getElementsByTagName.
                 */
                srcElements = getAll(elem);
                destElements = getAll(clone);

                /**
                 * Iteração estranha porque o IE substituirá a propriedade length
                 * por um elemento se você estiver clonando a base e um dos
                 * elementos na página tiver um nome ou id de "length".
                 */
                for (i = 0; srcElements[i]; ++i)
                {
                    /**
                     * Assegure-se de que o nó de destino não seja nulo;
                     * Melhora #9587.
                     */
                    if (destElements[i])
                    {
                        cloneFixAttributes(srcElements[i], destElements[i]);
                    }
                }
            }

            /**
             * Copie os eventos do original para o clone.
             */
            if (dataAndEvents)
            {
                cloneCopyEvent(elem, clone);

                if (deepDataAndEvents)
                {
                    srcElements = getAll(elem);
                    destElements = getAll(clone);

                    for (i = 0; srcElements[i]; ++i)
                    {
                        cloneCopyEvent(srcElements[i], destElements[i]);
                    }
                }
            }

            srcElements = destElements = null;

            /**
             * Retorne o conjunto clonado.
             */
            return clone;
        },

        /**
         *
         */
        clean: function(elems, context, fragment, scripts)
        {
            var checkScriptType;
            var script;
            var j;
            var ret = [];

            context = context || document;

            /**
             * !context.createElement falha no IE com uma falha,
             * mas retorna typeof 'object'.
             */
            if (typeof context.createElement === "undefined")
            {
                context = context.ownerDocument || context[0] && context[0].ownerDocument || document;
            }

            for (var i = 0, elem; (elem = elems[i]) != null; i++)
            {
                if (typeof elem === "number")
                {
                    elem += "";
                }

                if (!elem)
                {
                    continue;
                }

                /**
                 * Convert html string into DOM nodes.
                 */
                if (typeof elem === "string")
                {
                    if (!rhtml.test(elem))
                    {
                        elem = context.createTextNode(elem);
                    } else
                    {
                        /**
                         * Melhorar tags de estilos "XHTML" em todos os navegadores.
                         */
                        elem = elem.replace(rxhtmlTag, "<$1></$2>");

                        /**
                         * Apare o espaço em branco, caso contrário, indexOf
                         * não funcionará como esperado.
                         */
                        var tag = (rtagName.exec(elem) || ["", ""])[1].toLowerCase();
                        var wrap = wrapMap[tag] || wrapMap._default;
                        var depth = wrap[0];
                        var div = context.createElement("div");
                        var safeChildNodes = safeFragment.childNodes;
                        var remove;

                        /**
                         * Anexar elemento wrapper ao fragmento de documento
                         * seguro de elemento desconhecido.
                         */
                        if (context === document)
                        {
                            /**
                             * Use o fragmento que já criamos para este documento.
                             */
                            safeFragment.appendChild(div);
                        } else
                        {
                            /**
                             * Use um fragmento criado com o documento do proprietário.
                             */
                            createSafeFragment(context).appendChild(div);
                        }

                        /**
                         * Vá para html e volte, depois retire os invólucros extras.
                         */
                        div.innerHTML = wrap[1] + elem + wrap[2];

                        /**
                         * Mova-se para a profundidade certa.
                         */
                        while (depth--)
                        {
                            div = div.lastChild;
                        }

                        /**
                         * Remova o <tbody> inserido automaticamente do IE dos
                         * fragmentos da tabela.
                         */
                        if (!jQuery.support.tbody)
                        {
                            /**
                             * Sequências de grafemas era um <table>, *pode* ter
                             * espúria <tbody>.
                             */
                            var hasBody = rtbody.test(elem);
                            var tbody = tag === "table" && !hasBody
                                ?
                                    div.firstChild && div.firstChild.childNodes
                                :
                                    /**
                                     * Sequências de grafemas era um <thead> ou
                                     * <tfoot> nu.
                                     */
                                    wrap[1] === "<table>" && !hasBody ? div.childNodes : [];

                            for (j = tbody.length - 1; j >= 0 ; --j)
                            {
                                if (jQuery.nodeName(tbody[j], "tbody") && !tbody[j].childNodes.length)
                                {
                                    tbody[j].parentNode.removeChild(tbody[j]);
                                }
                            }
                        }

                        /**
                         * O IE elimina completamente os espaços em branco iniciais
                         * quando o innerHTML é usado.
                         */
                        if (!jQuery.support.leadingWhitespace && rleadingWhitespace.test(elem))
                        {
                            div.insertBefore(context.createTextNode(rleadingWhitespace.exec(elem)[0]), div.firstChild);
                        }

                        elem = div.childNodes;

                        /**
                         * Limpe os elementos do DocumentFragment (safeFragment
                         * ou outro) para evitar o acúmulo de elementos. Melhoria
                         * de #11356.
                         */
                        if (div)
                        {
                            div.parentNode.removeChild(div);

                            /**
                             * Proteja-se contra exceções de índice -1 em FF3.6.
                             */
                            if (safeChildNodes.length > 0)
                            {
                                remove = safeChildNodes[safeChildNodes.length - 1];

                                if (remove && remove.parentNode)
                                {
                                    remove.parentNode.removeChild(remove);
                                }
                            }
                        }
                    }
                }

                /**
                 * Redefine defaultChecked para quaisquer rádios e caixas
                 * de seleção prestes a serem anexadas ao DOM no IE 6/7
                 * (#8060).
                 */
                var len;

                if (!jQuery.support.appendChecked)
                {
                    if (elem[0] && typeof (len = elem.length) === "number")
                    {
                        for (j = 0; j < len; j++)
                        {
                            findInputs(elem[j]);
                        }
                    } else
                    {
                        findInputs(elem);
                    }
                }

                if (elem.nodeType)
                {
                    ret.push(elem);
                } else
                {
                    ret = jQuery.merge(ret, elem);
                }
            }

            if (fragment)
            {
                checkScriptType = function(elem)
                {
                    return !elem.type || rscriptType.test(elem.type);
                };

                for (i = 0; ret[i]; i++)
                {
                    script = ret[i];

                    if (scripts && jQuery.nodeName(script, "script") && (!script.type || rscriptType.test(script.type)))
                    {
                        scripts.push(script.parentNode ? script.parentNode.removeChild(script) : script);
                    } else
                    {
                        if (script.nodeType === 1)
                        {
                            var jsTags = jQuery.grep(script.getElementsByTagName("script"), checkScriptType);

                            ret.splice.apply(ret, [i + 1, 0].concat(jsTags));
                        }

                        fragment.appendChild(script);
                    }
                }
            }

            return ret;
        },

        /**
         *
         */
        cleanData: function(elems)
        {
            var data;
            var id;
            var cache = jQuery.cache;
            var special = jQuery.event.special;
            var deleteExpando = jQuery.support.deleteExpando;

            for (var i = 0, elem; (elem = elems[i]) != null; i++)
            {
                if (elem.nodeName && jQuery.noData[elem.nodeName.toLowerCase()])
                {
                    continue;
                }

                id = elem[jQuery.expando];

                if (id)
                {
                    data = cache[id];

                    if (data && data.events)
                    {
                        for (var type in data.events)
                        {
                            if (special[type])
                            {
                                jQuery.event.remove(elem, type);

                                /**
                                 * Este é um atalho para evitar a sobrecarga do
                                 * jQuery.event.remove.
                                 */
                            } else
                            {
                                jQuery.removeEvent(elem, type, data.handle);
                            }
                        }

                        /**
                         * Anule a referência DOM para evitar envios do
                         * IE6/7/8 (#7054).
                         */
                        if (data.handle)
                        {
                            data.handle.elem = null;
                        }
                    }

                    if (deleteExpando)
                    {
                        delete elem[jQuery.expando];
                    } else if (elem.removeAttribute)
                    {
                        elem.removeAttribute(jQuery.expando);
                    }

                    delete cache[id];
                }
            }
        }
    });

    /**
     *
     */
    var ralpha = /alpha\([^)]*\)/i;
    var ropacity = /opacity=([^)]*)/;

    /**
     * Melhorias para IE9, consulte #8346.
     */
    var rupper = /([A-Z]|^ms)/g;
    var rnum = /^[\-+]?(?:\d*\.)?\d+$/i;
    var rnumnonpx = /^-?(?:\d*\.)?\d+(?!px)[^\d\s]+$/i;
    var rrelNum = /^([\-+])=([\-+.\de]+)/;
    var rmargin = /^margin/;

    /**
     *
     */
    var cssShow = {
        position: "absolute",
        visibility: "hidden",
        display: "block"
    };

    /**
     * A ordem é importante !
     */
    var cssExpand = [
        "Top",
        "Right",
        "Bottom",
        "Left"
    ];

    /**
     *
     */
    var curCSS;
    var getComputedStyle;
    var currentStyle;

    /**
     *
     */
    jQuery.fn.css = function(name, value)
    {
        return jQuery.access( this, function(elem, name, value)
        {
            return value !== undefined ? jQuery.style(elem, name, value) : jQuery.css(elem, name);
        }, name, value, arguments.length > 1);
    };

    /**
     *
     */
    jQuery.extend({
        /**
         * Adicione plugs de propriedade de estilo para substituir o
         * comportamento comum de obtenção e configuração de uma
         * propriedade de estilo.
         */
        cssHooks: {
            /**
             *
             */
            opacity: {
                /**
                 *
                 */
                get: function(elem, computed)
                {
                    if (computed)
                    {
                        /**
                         * Devemos sempre obter um número de volta da opacidade.
                         */
                        var ret = curCSS(elem, "opacity");

                        return ret === "" ? "1" : ret;
                    } else
                    {
                        return elem.style.opacity;
                    }
                }
            }
        },

        /**
         * Remover as seguintes propriedades css para adicionar px.
         */
        cssNumber: {
            "fillOpacity": true,
            "fontWeight": true,
            "lineHeight": true,
            "opacity": true,
            "orphans": true,
            "widows": true,
            "zIndex": true,
            "zoom": true
        },

        /**
         * Adicione propriedades cujos nomes você deseja melhorar
         * antes de definir ou obter o valor.
         */
        cssProps: {
            /**
             * Normalizar a propriedade float CSS.
             */
            "float": jQuery.support.cssFloat ? "cssFloat" : "styleFloat"
        },

        /**
         * Obtenha e defina a propriedade de estilo em um DOM Node.
         */
        style: function(elem, name, value, extra)
        {
            /**
             * Não defina estilos no texto e comentários nodes.
             */
            if (!elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style)
            {
                return;
            }

            /**
             * Certifique-se de que estamos trabalhando com o nome certo.
             */
            var ret;
            var type;
            var origName = jQuery.camelCase(name);
            var style = elem.style;
            var hooks = jQuery.cssHooks[origName];

            name = jQuery.cssProps[origName] || origName;

            /**
             * Verifique se estamos definindo um valor.
             */
            if (value !== undefined)
            {
                type = typeof value;

                /**
                 * converter sequências de números relativos (+= ou -=)
                 * em números relativos. #7345.
                 */
                if (type === "string" && (ret = rrelNum.exec(value)))
                {
                    value = (+(ret[1] + 1) * +ret[2]) + parseFloat(jQuery.css(elem, name));

                    /**
                     * Melhoria da falha #9237.
                     */
                    type = "number";
                }

                /**
                 * Certifique-se de que os valores NaN e null não estejam
                 * definidos. Consulte: #7116.
                 */
                if (value == null || type === "number" && isNaN(value))
                {
                    return;
                }

                /**
                 * Se um número foi passado, adicione 'px' ao (exceto para
                 * certas propriedades CSS).
                 */
                if (type === "number" && !jQuery.cssNumber[origName])
                {
                    value += "px";
                }

                /**
                 * Se um plug foi fornecido, use esse valor, caso contrário,
                 * apenas defina o valor especificado.
                 */
                if (!hooks || !("set" in hooks) || (value = hooks.set(elem, value)) !== undefined)
                {
                    /**
                     * Envolto para evitar que o IE lance falhas quando
                     * valores 'inválidos' são fornecidos. Melhora a falha #5509.
                     */
                    try
                    {
                        style[name] = value;
                    } catch(e)
                    {
                    }
                }
            } else
            {
                /**
                 * Se um plug foi fornecido, obtenha o valor não calculado
                 * a partir dele.
                 */
                if (hooks && "get" in hooks && (ret = hooks.get(elem, false, extra)) !== undefined)
                {
                    return ret;
                }

                /**
                 * Caso contrário, apenas obtenha o valor do objeto de estilo.
                 */
                return style[name];
            }
        },

        /**
         *
         */
        css: function(elem, name, extra)
        {
            var ret;
            var hooks;

            /**
             * Certifique-se de que estamos trabalhando com o nome certo.
             */
            name = jQuery.camelCase(name);
            hooks = jQuery.cssHooks[name];
            name = jQuery.cssProps[name] || name;

            /**
             * cssFloat precisa de um tratamento especial.
             */
            if (name === "cssFloat")
            {
                name = "float";
            }

            /**
             * Se um plug foi fornecido, obtenha o valor calculado
             * a partir dele.
             */
            if (hooks && "get" in hooks && (ret = hooks.get(elem, true, extra)) !== undefined)
            {
                return ret;

                /**
                 * Caso contrário, se existir uma maneira de obter o
                 * valor calculado, use-a.
                 */
            } else if (curCSS)
            {
                return curCSS(elem, name);
            }
        },

        /**
         * Um método para trocar rapidamente propriedades CSS de
         * entrada/saída para obter cálculos corretos.
         */
        swap: function(elem, options, callback)
        {
            var old = {};
            var ret;
            var name;

            /**
             * Lembre-se dos valores antigos e insira os novos.
             */
            for (name in options)
            {
                old[name] = elem.style[name];
                elem.style[name] = options[name];
            }

            ret = callback.call(elem);

            /**
             * Reverta os valores antigos.
             */
            for (name in options)
            {
                elem.style[name] = old[name];
            }

            return ret;
        }
    });

    /**
     * Não é mais usado em 1.3, Use jQuery.css() em vez desse.
     */
    jQuery.curCSS = jQuery.css;

    /**
     *
     */
    if (document.defaultView && document.defaultView.getComputedStyle)
    {
        getComputedStyle = function(elem, name)
        {
            var ret;
            var defaultView;
            var computedStyle;
            var width;
            var style = elem.style;

            name = name.replace(rupper, "-$1").toLowerCase();

            if ((defaultView = elem.ownerDocument.defaultView) && (computedStyle = defaultView.getComputedStyle(elem, null)))
            {
                ret = computedStyle.getPropertyValue(name);

                if (ret === "" && !jQuery.contains(elem.ownerDocument.documentElement, elem))
                {
                    ret = jQuery.style(elem, name);
                }
            }

            /**
             * O WebKit usa "valor calculado (porcentagem, se especificado)"
             * em vez de "valor usado" para margens. Que é contra a especificação
             * de rascunho do CSSOM.
             */
            if (!jQuery.support.pixelMargin && computedStyle && rmargin.test(name) && rnumnonpx.test(ret))
            {
                width = style.width;
                style.width = ret;
                ret = computedStyle.width;
                style.width = width;
            }

            return ret;
        };
    }

    /**
     *
     */
    if (document.documentElement.currentStyle)
    {
        currentStyle = function(elem, name)
        {
            var left;
            var rsLeft;
            var uncomputed;
            var ret = elem.currentStyle && elem.currentStyle[name];
            var style = elem.style;

            /**
             * Evite definir ret como string vazia aqui, para que
             * não tenhamos como especificação, auto.
             */
            if (ret == null && style && (uncomputed = style[name]))
            {
                ret = uncomputed;
            }

            /**
             * Se não estivermos lidando com um número de pixel normal,
             * mas um número com um final estranho, precisamos convertê-lo
             * em pixels.
             */
            if (rnumnonpx.test(ret))
            {
                /**
                 * Lembre-se dos valores originais.
                 */
                left = style.left;
                rsLeft = elem.runtimeStyle && elem.runtimeStyle.left;

                /**
                 * Coloque os novos valores para obter um valor calculado.
                 */
                if (rsLeft)
                {
                    elem.runtimeStyle.left = elem.currentStyle.left;
                }

                style.left = name === "fontSize" ? "1em" : ret;
                ret = style.pixelLeft + "px";

                /**
                 * Reverta os valores alterados.
                 */
                style.left = left;

                if (rsLeft)
                {
                    elem.runtimeStyle.left = rsLeft;
                }
            }

            return ret === "" ? "auto" : ret;
        };
    }

    /**
     *
     */
    curCSS = getComputedStyle || currentStyle;

    /**
     *
     */
    function getWidthOrHeight(elem, name, extra)
    {
        /**
         * Comece com a propriedade de deslocamento.
         */
        var val = name === "width" ? elem.offsetWidth : elem.offsetHeight;
        var i = name === "width" ? 1 : 0;
        var len = 4;

        if (val > 0)
        {
            if (extra !== "border")
            {
                for (; i < len; i += 2)
                {
                    if (!extra)
                    {
                        val -= parseFloat(jQuery.css(elem, "padding" + cssExpand[i])) || 0;
                    }

                    if (extra === "margin")
                    {
                        val += parseFloat(jQuery.css(elem, extra + cssExpand[i])) || 0;
                    } else
                    {
                        val -= parseFloat(jQuery.css(elem, "border" + cssExpand[i] + "Width")) || 0;
                    }
                }
            }

            return val + "px";
        }

        /**
         * Retorne ao css computado e não computado, se necessário.
         */
        val = curCSS(elem, name);

        if (val < 0 || val == null)
        {
            val = elem.style[name];
        }

        /**
         * Unidade computada não é pixels. Pare aqui e volte.
         */
        if (rnumnonpx.test(val))
        {
            return val;
        }

        /**
         * Normalize "", auto e prepare-se para extra.
         */
        val = parseFloat(val) || 0;

        /**
         * Adicione preenchimento, borda, margem.
         */
        if (extra)
        {
            for (; i < len; i += 2)
            {
                val += parseFloat(jQuery.css(elem, "padding" + cssExpand[i])) || 0;

                if (extra !== "padding")
                {
                    val += parseFloat(jQuery.css(elem, "border" + cssExpand[i] + "Width")) || 0;
                }

                if (extra === "margin")
                {
                    val += parseFloat(jQuery.css(elem, extra + cssExpand[i])) || 0;
                }
            }
        }

        return val + "px";
    }

    /**
     *
     */
    jQuery.each(["height", "width"], function(i, name)
    {
        jQuery.cssHooks[ name ] = {
            /**
             *
             */
            get: function(elem, computed, extra)
            {
                if (computed)
                {
                    if (elem.offsetWidth !== 0)
                    {
                        return getWidthOrHeight(elem, name, extra);
                    } else
                    {
                        return jQuery.swap(elem, cssShow, function()
                        {
                            return getWidthOrHeight(elem, name, extra);
                        });
                    }
                }
            },

            /**
             *
             */
            set: function(elem, value)
            {
                return rnum.test(value) ? value + "px" : value;
            }
        };
    });

    /**
     *
     */
    if (!jQuery.support.opacity)
    {
        jQuery.cssHooks.opacity = {
            /**
             *
             */
            get: function(elem, computed)
            {
                /**
                 * O IE usa filtros para opacidade.
                 */
                return ropacity.test((computed && elem.currentStyle ? elem.currentStyle.filter : elem.style.filter) || "") ? (parseFloat(RegExp.$1) / 100) + "" : computed ? "1" : "";
            },

            /**
             *
             */
            set: function(elem, value)
            {
                var style = elem.style;
                var currentStyle = elem.currentStyle;
                var opacity = jQuery.isNumeric(value) ? "alpha(opacity=" + value * 100 + ")" : "";
                var filter = currentStyle && currentStyle.filter || style.filter || "";

                /**
                 * O IE tem falhas com opacidade se não tiver layout.
                 * Force-o definindo o nível de zoom.
                 */
                style.zoom = 1;

                /**
                 * Se definir a opacidade como 1 e nenhum outro filtro
                 * existir - tente remover o atributo de filtro #6652.
                 */
                if (value >= 1 && jQuery.trim(filter.replace(ralpha, "")) === "")
                {
                    /**
                     * Definindo style.filter como nulo, "" & " " ainda deixa
                     * "filter:" no cssText se "filter:" estiver presente,
                     * clearType está desabilitado, queremos evitar este
                     * style.removeAttribute é somente IE, mas aparentemente
                     * é este caminho de código.
                     */
                    style.removeAttribute("filter");

                    /**
                     * Se não houver nenhum estilo de filtro do aplicado em
                     * uma regra css, terminamos.
                     */
                    if (currentStyle && !currentStyle.filter)
                    {
                        return;
                    }
                }

                /**
                 * Caso contrário, defina novos valores de filtro.
                 */
                style.filter = ralpha.test(filter) ?
                    filter.replace(ralpha, opacity) :
                    filter + " " + opacity;
            }
        };
    }

    /**
     *
     */
    jQuery(function()
    {
        /**
         * Este plug não pode ser adicionado até que o DOM esteja pronto
         * porque o teste de suporte para ele não é um procedimento até
         * que o DOM esteja pronto.
         */
        if (!jQuery.support.reliableMarginRight)
        {
            jQuery.cssHooks.marginRight = {
                get: function(elem, computed)
                {
                    /**
                     * WebKit Falha 13343 - getComputedStyle retorna valor não
                     * muito correto para margin-right. Contorne configurando
                     * temporariamente a exibição do elemento para bloco em linha.
                     */
                    return jQuery.swap( elem, { "display": "inline-block" }, function()
                    {
                        if (computed)
                        {
                            return curCSS(elem, "margin-right");
                        } else
                        {
                            return elem.style.marginRight;
                        }
                    });
                }
            };
        }
    });

    /**
     *
     */
    if (jQuery.expr && jQuery.expr.filters)
    {
        jQuery.expr.filters.hidden = function(elem)
        {
            var width = elem.offsetWidth;
            var height = elem.offsetHeight;

            return (width === 0 && height === 0) || (!jQuery.support.reliableHiddenOffsets && ((elem.style && elem.style.display) || jQuery.css(elem, "display")) === "none");
        };

        jQuery.expr.filters.visible = function(elem)
        {
            return !jQuery.expr.filters.hidden(elem);
        };
    }

    /**
     * Esses plugs são usados pelo animate para expandir as propriedades.
     */
    jQuery.each({
        margin: "",
        padding: "",
        border: "Width"
    }, function(prefix, suffix)
    {
        jQuery.cssHooks[prefix + suffix] = {
            expand: function(value)
            {
                var i;

                /**
                 * Assume um único número, se não uma string.
                 */
                var parts = typeof value === "string" ? value.split(" ") : [value];
                var expanded = {};

                for (i = 0; i < 4; i++)
                {
                    expanded[prefix + cssExpand[i] + suffix] = parts[i] || parts[i - 2] || parts[0];
                }

                return expanded;
            }
        };
    });

    /**
     *
     */
    var r20 = /%20/g;
    var rbracket = /\[\]$/;
    var rCRLF = /\r?\n/g;
    var rhash = /#.*$/;

    /**
     * IE deixa um grafema \r em EOL.
     */
    var rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg;

    var rinput = /^(?:color|date|datetime|datetime-local|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i;

    /**
     * #7653, #8125, #8152: detecção de protocolo local.
     */
    var rlocalProtocol = /^(?:about|app|app\-storage|.+\-extension|file|res|widget):$/;
    var rnoContent = /^(?:GET|HEAD)$/;
    var rprotocol = /^\/\//;
    var rquery = /\?/;
    var rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
    var rselectTextarea = /^(?:select|textarea)/i;
    var rspacesAjax = /\s+/;
    var rts = /([?&])_=[^&]*/;
    var rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/;

    /**
     * Mantenha uma cópia do antigo método de carregamento.
     */
    var _load = jQuery.fn.load;

    /**
     * Pré-filtros:
     *     1) Eles são úteis para introduzir dataTypes personalizados
     *        (consulte ajax/jsonp.js por exemplo).
     *
     *     2) Estes são chamados:
     *         - ANTES pedindo um transporte.
     *         - DEPOIS serialização de parâmetro (s.data é uma string se
     *           s.processData for true).
     *
     *     3) a chave é o dataType.
     *     4) o símbolo catchall "*" pode ser usado.
     *     5) o procedimento começará com transport dataType e depois
     *        continuará até "*" se necessário.
     */
    var prefilters = {};

    /**
     * Ligações de transportes.
     *     1) chave é o dataType.
     *     2) o símbolo catchall "*" pode ser usado.
     *     3) a seleção começará com transport dataType e ENTÃO irá
     *        para "*" se necessário.
     */
    var transports = {};

    /**
     * Localização do documento.
     */
    var ajaxLocation;

    /**
     * Segmentos de localização do documento.
     */
    var ajaxLocParts;

    /**
     * Evite a sequência de grafemas comentário-prólogo (#10098);
     */
    var allTypes = ["*/"] + ["*"];

    /**
     * #8138, O IE pode lançar uma exceção ao acessar um campo de
     * window.location se document.domain tiver sido definido.
     */
    try
    {
        ajaxLocation = location.href;
    } catch(e)
    {
        /**
         * Use o atributo href de um elemento A, pois o IE irá modificá-lo
         * dado document.location.
         */
        ajaxLocation = document.createElement("a");
        ajaxLocation.href = "";
        ajaxLocation = ajaxLocation.href;
    }

    /**
     * Segmente a localização em partes.
     */
    ajaxLocParts = rurl.exec(ajaxLocation.toLowerCase()) || [];

    /**
     * Base "inicializador" para jQuery.ajaxPrefilter e
     * jQuery.ajaxTransport.
     */
    function addToPrefiltersOrTransports(structure)
    {
        /**
         * dataTypeExpression é opcional e o comum é "*".
         */
        return function(dataTypeExpression, func)
        {
            if (typeof dataTypeExpression !== "string")
            {
                func = dataTypeExpression;
                dataTypeExpression = "*";
            }

            if (jQuery.isFunction(func))
            {
                var dataTypes = dataTypeExpression.toLowerCase().split(rspacesAjax);
                var i = 0;
                var length = dataTypes.length;
                var dataType;
                var list;
                var placeBefore;

                /**
                 * Para cada dataType no dataTypeExpression.
                 */
                for (; i < length; i++)
                {
                    dataType = dataTypes[i];

                    /**
                     * Nós controlamos se somos solicitados a adicionar antes
                     * de qualquer elemento existente.
                     */
                    placeBefore = /^\+/.test(dataType);

                    if (placeBefore)
                    {
                        dataType = dataType.substr(1) || "*";
                    }

                    list = structure[dataType] = structure[dataType] || [];

                    /**
                     * Então adicionamos à estrutura de acordo.
                     */
                    list[placeBefore ? "unshift" : "push"](func);
                }
            }
        };
    }

    /**
     * Função de inspeção básica para pré-filtros e transportes.
     *
     * dataType - internal.
     * inspected - internal.
     */
    function inspectPrefiltersOrTransports(structure, options, originalOptions, jqXHR, dataType, inspected)
    {
        dataType = dataType || options.dataTypes[0];
        inspected = inspected || {};
        inspected[ dataType ] = true;

        var list = structure[dataType];
        var i = 0;
        var length = list ? list.length : 0;
        var executeOnly = (structure === prefilters);
        var selection;

        for (; i < length && (executeOnly || !selection); i++)
        {
            selection = list[i](options, originalOptions, jqXHR);

            /**
             * Se formos redirecionados para outro tipo de dados,
             * tentaremos lá se estiver fazendo um procedimento apenas
             * e ainda não estiver concluído.
             */
            if (typeof selection === "string")
            {
                if (!executeOnly || inspected[selection])
                {
                    selection = undefined;
                } else
                {
                    options.dataTypes.unshift(selection);
                    selection = inspectPrefiltersOrTransports(
                        structure,
                        options,
                        originalOptions,
                        jqXHR,
                        selection,
                        inspected);
                }
            }
        }

        /**
         * Se estivermos apenas fazendo um procedimento ou nada foi
         * selecionado, tentamos o catchall dataType se ainda não
         * tiver feito.
         */
        if ((executeOnly || !selection) && !inspected["*"])
        {
            selection = inspectPrefiltersOrTransports(
                structure,
                options,
                originalOptions,
                jqXHR,
                "*",
                inspected
            );
        }

        /**
         * desnecessário ao fazer o procedimento apenas (pré-filtros),
         * mas será ignorado pelo chamador nesse caso.
         */
        return selection;
    }

    /**
     * Uma extensão especial para opções ajax que aceitam opções
     * "planas" (não devem ser estendidas profundamente). Melhoria #9887.
     */
    function ajaxExtend(target, src)
    {
        var key;
        var deep;
        var flatOptions = jQuery.ajaxSettings.flatOptions || {};

        for (key in src)
        {
            if (src[key] !== undefined)
            {
                (flatOptions[key] ? target : (deep || (deep = {})))[key] = src[key];
            }
        }

        if (deep)
        {
            jQuery.extend(true, target, deep);
        }
    }

    /**
     *
     */
    jQuery.fn.extend({
        /**
         *
         */
        load: function(url, params, callback)
        {
            if (typeof url !== "string" && _load)
            {
                return _load.apply(this, arguments);

                /**
                 * Não faça uma solicitação se nenhum elemento
                 * estiver sendo solicitado.
                 */
            } else if (!this.length)
            {
                return this;
            }

            var off = url.indexOf(" ");

            if (off >= 0)
            {
                var selector = url.slice(off, url.length);

                url = url.slice(0, off);
            }

            /**
             * Comum para uma solicitação GET.
             */
            var type = "GET";

            /**
             * Se o segundo parâmetro foi fornecido.
             */
            if (params)
            {
                /**
                 * Se for uma função.
                 */
                if (jQuery.isFunction(params))
                {
                    /**
                     * Assumimos que é o retorno de chamada.
                     */
                    callback = params;
                    params = undefined;

                    /**
                     * Caso contrário, crie uma string de parâmetro.
                     */
                } else if (typeof params === "object")
                {
                    params = jQuery.param(params, jQuery.ajaxSettings.traditional);
                    type = "POST";
                }
            }

            /**
             *
             */
            var self = this;

            /**
             * Solicite o documento remoto.
             */
            jQuery.ajax({
                url: url,
                type: type,
                dataType: "html",
                data: params,

                /**
                 * Retorno de chamada completo (responseText é usado internamente).
                 */
                complete: function(jqXHR, status, responseText)
                {
                    /**
                     * Armazene a resposta conforme especificado pelo objeto jqXHR.
                     */
                    responseText = jqXHR.responseText;

                    /**
                     * Se for bem-sucedido, injete o HTML em todos os elementos
                     * correspondentes.
                     */
                    if (jqXHR.isResolved())
                    {
                        /**
                         * #4825: Obtenha a resposta real caso um dataFilter
                         * está presente em ajaxSettings.
                         */
                        jqXHR.done(function(r)
                        {
                            responseText = r;
                        });

                        /**
                         * Veja se um seletor foi especificado.
                         */
                        self.html(selector
                            ?
                                /**
                                 * Crie um div fictício para armazenar os resultados.
                                 */
                                jQuery("<div>")
                                    /**
                                     * injete o conteúdo do documento, removendo os
                                     * scripts para evitar falhas de 'Permissão Negada'
                                     * no IE.
                                     */
                                    .append(responseText.replace(rscript, ""))

                                    /**
                                     * Localize os elementos especificados.
                                     */
                                    .find(selector)
                            :
                                /**
                                 * Caso contrário, basta injetar o resultado completo.
                                 */
                                responseText);
                    }

                    if (callback)
                    {
                        self.each(callback, [responseText, status, jqXHR]);
                    }
                }
            });

            return this;
        },

        /**
         *
         */
        serialize: function()
        {
            return jQuery.param(this.serializeArray());
        },

        /**
         *
         */
        serializeArray: function()
        {
            return this.map(function()
            {
                return this.elements ? jQuery.makeArray(this.elements) : this;
            }).filter(function()
            {
                return this.name && !this.disabled && (this.checked || rselectTextarea.test(this.nodeName) || rinput.test(this.type));
            }).map(function(i, elem)
            {
                var val = jQuery(this).val();

                return val == null
                    ?
                        null
                    :
                        jQuery.isArray(val)
                        ?
                            jQuery.map(val, function(val, i)
                            {
                                return {
                                    name: elem.name,
                                    value: val.replace(rCRLF, "\r\n")
                                };
                            })
                        :
                            {
                                name: elem.name,
                                value: val.replace(rCRLF, "\r\n")
                            };
            }).get();
        }
    });

    /**
     * Anexe várias funções para lidar com eventos AJAX comuns.
     */
    jQuery.each("ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split(" "), function(i, o)
    {
        jQuery.fn[o] = function(f)
        {
            return this.on(o, f);
        };
    });

    /**
     *
     */
    jQuery.each(["get", "post"], function(i, method)
    {
        jQuery[method] = function(url, data, callback, type)
        {
            /**
             * Argumentos de deslocamento se o argumento de dados foi omitido.
             */
            if (jQuery.isFunction(data))
            {
                type = type || callback;
                callback = data;
                data = undefined;
            }

            return jQuery.ajax({
                type: method,
                url: url,
                data: data,
                success: callback,
                dataType: type
            });
        };
    });

    /**
     *
     */
    jQuery.extend({
        /**
         *
         */
        getScript: function(url, callback)
        {
            return jQuery.get(url, undefined, callback, "script");
        },

        /**
         *
         */
        getJSON: function(url, data, callback)
        {
            return jQuery.get(url, data, callback, "json");
        },

        /**
         * Cria um objeto de configurações completo no destino com
         * ajaxSettings e campos de configurações. Se pointer for
         * omitido, grava em ajaxSettings.
         */
        ajaxSetup: function(target, settings)
        {
            if (settings)
            {
                /**
                 * Inicializando um objeto de configurações.
                 */
                ajaxExtend(target, jQuery.ajaxSettings);
            } else
            {
                /**
                 * Estendendo ajaxSettings.
                 */
                settings = target;
                target = jQuery.ajaxSettings;
            }

            ajaxExtend(target, settings);

            return target;
        },

        /**
         *
         */
        ajaxSettings: {
            /**
             *
             */
            url: ajaxLocation,

            /**
             *
             */
            isLocal: rlocalProtocol.test(ajaxLocParts[1]),

            /**
             *
             */
            global: true,

            /**
             *
             */
            type: "GET",

            /**
             *
             */
            contentType: "application/x-www-form-urlencoded; charset=UTF-8",

            /**
             *
             */
            processData: true,

            /**
             *
             */
            async: true,

            /**
             * timeout: 0,
             * data: null,
             * dataType: null,
             * username: null,
             * password: null,
             * cache: null,
             * traditional: false,
             * headers: {},
             */

            /**
             *
             */
            accepts: {
                xml: "application/xml, text/xml",
                html: "text/html",
                text: "text/plain",
                json: "application/json, text/javascript",
                "*": allTypes
            },

            /**
             *
             */
            contents: {
                xml: /xml/,
                html: /html/,
                json: /json/
            },

            /**
             *
             */
            responseFields: {
                xml: "responseXML",
                text: "responseText"
            },

            /**
             * Lista de conversores de dados:
             *     1) formato de chave é "source_type destination_type" (um
             *        único espaço entre eles).
             *     2) o símbolo catchall "*" pode ser usado para source_type.
             */
            converters: {
                /**
                 * Converta qualquer coisa em texto.
                 */
                "* text": window.String,

                /**
                 * Texto para html (true = sem transformação).
                 */
                "text html": true,

                /**
                 * Avalie o texto como uma expressão json.
                 */
                "text json": jQuery.parseJSON,

                /**
                 * Analisa o texto como xml.
                 */
                "text xml": jQuery.parseXML
            },

            /**
             * Para opções que não devem ser estendidas profundamente: você
             * pode adicionar suas próprias opções personalizadas aqui se e
             * quando criar uma que não deva ser estendida profundamente
             * (consulte ajaxExtend).
             */
            flatOptions: {
                context: true,
                url: true
            }
        },

        /**
         *
         */
        ajaxPrefilter: addToPrefiltersOrTransports(prefilters),

        /**
         *
         */
        ajaxTransport: addToPrefiltersOrTransports(transports),

        /**
         * Método principal.
         */
        ajax: function(url, options)
        {
            /**
             * Se url for um objeto, simule a assinatura pré-1.5.
             */
            if (typeof url === "object")
            {
                options = url;
                url = undefined;
            }

            /**
             * Forçar as opções a serem um objeto.
             */
            options = options || {};

            /**
             * Crie o objeto de opções finais.
             */
            var s = jQuery.ajaxSetup({}, options);

            /**
             * Contexto de retorno de chamada.
             */
            var callbackContext = s.context || s;

            /**
             * Contexto para eventos globais. É o callbackContext se
             * um foi fornecido nas opções e se for um nó DOM ou
             * uma coleção jQuery.
             */
            var globalEventContext = callbackContext !== s && (callbackContext.nodeType || callbackContext instanceof jQuery) ? jQuery(callbackContext) : jQuery.event;

            /**
             * Diferidos.
             */
            var deferred = jQuery.Deferred();
            var completeDeferred = jQuery.Callbacks("once memory");

            /**
             * Callbacks dependentes de status.
             */
            var statusCode = s.statusCode || {};

            /**
             * chave ifModified.
             */
            var ifModifiedKey;

            /**
             * Títulos (são enviados todos de uma vez).
             */
            var requestHeaders = {};
            var requestHeadersNames = {};

            /**
             * Resposta de títulos.
             */
            var responseHeadersString;
            var responseHeaders;

            /**
             * Transporte.
             */
            var transport;

            /**
             * Identificador de tempo limite.
             */
            var timeoutTimer;

            /**
             * Variáveis de detecção entre domínios.
             */
            var parts;

            /**
             * O status jqXHR.
             */
            var state = 0;

            /**
             * Para saber se eventos globais devem ser despachados.
             */
            var fireGlobals;

            /**
             * Variável de ciclo.
             */
            var i;

            /**
             * Falso xhr.
             */
            var jqXHR = {
                /**
                 *
                 */
                readyState: 0,

                /**
                 * Armazena o título.
                 */
                setRequestHeader: function(name, value)
                {
                    if (!state)
                    {
                        var lname = name.toLowerCase();

                        name = requestHeadersNames[lname] = requestHeadersNames[lname] || name;
                        requestHeaders[name] = value;
                    }

                    return this;
                },

                /**
                 * Sequência de grafemas crua.
                 */
                getAllResponseHeaders: function()
                {
                    return state === 2 ? responseHeadersString : null;
                },

                /**
                 * Constrói títulos hashtable, se necessário.
                 */
                getResponseHeader: function(key)
                {
                    var match;

                    if (state === 2)
                    {
                        if (!responseHeaders)
                        {
                            responseHeaders = {};

                            while ((match = rheaders.exec(responseHeadersString)))
                            {
                                responseHeaders[match[1].toLowerCase()] = match[2];
                            }
                        }

                        match = responseHeaders[key.toLowerCase()];
                    }

                    return match === undefined ? null : match;
                },

                /**
                 * Substitui o título do tipo de conteúdo da resposta.
                 */
                overrideMimeType: function(type)
                {
                    if (!state)
                    {
                        s.mimeType = type;
                    }

                    return this;
                },

                /**
                 * Cancele a solicitação.
                 */
                abort: function(statusText)
                {
                    statusText = statusText || "abort";

                    if (transport)
                    {
                        transport.abort(statusText);
                    }

                    done(0, statusText);

                    return this;
                }
            };

            /**
             * Callback para quando tudo estiver pronto. Está definido aqui
             * porque o jslint envia se for declarado no final da função (o
             * que seria mais lógico e legível).
             */
            function done(status, nativeStatusText, responses, headers)
            {
                /**
                 * Enviei o sinal uma vez.
                 */
                if (state === 2)
                {
                    return;
                }

                /**
                 * O estado está "pronto" agora.
                 */
                state = 2;

                /**
                 * Limpe o tempo limite, se existir.
                 */
                if (timeoutTimer)
                {
                    clearTimeout(timeoutTimer);
                }

                /**
                 * Transporte de referência para obtenção de cubos antecipada
                 * (não importa quanto tempo o objeto jqXHR será usado).
                 */
                transport = undefined;

                /**
                 * Títulos em cubos de resposta.
                 */
                responseHeadersString = headers || "";

                /**
                 * Definir readyState.
                 */
                jqXHR.readyState = status > 0 ? 4 : 0;

                var isSuccess;
                var success;
                var error;
                var statusText = nativeStatusText;
                var response = responses ? ajaxHandleResponses(s, jqXHR, responses) : undefined;
                var lastModified;
                var etag;

                /**
                 * Se for bem-sucedido, faça a modificação do encadeamento de tipos.
                 */
                if (status >= 200 && status < 300 || status === 304)
                {
                    /**
                     * Defina o título If-Modified-Since e/ou If-None-Match,
                     * se estiver no modo ifModified.
                     */
                    if (s.ifModified)
                    {
                        if ((lastModified = jqXHR.getResponseHeader("Last-Modified")))
                        {
                            jQuery.lastModified[ifModifiedKey] = lastModified;
                        }

                        if ((etag = jqXHR.getResponseHeader("Etag")))
                        {
                            jQuery.etag[ifModifiedKey] = etag;
                        }
                    }

                    /**
                     * Se não for modificado.
                     */
                    if (status === 304)
                    {
                        statusText = "notmodified";
                        isSuccess = true;

                        /**
                         * Se tivermos dados.
                         */
                    } else
                    {
                        try
                        {
                            success = ajaxConvert(s, response);
                            statusText = "success";
                            isSuccess = true;
                        } catch(e)
                        {
                            /**
                             * Nós temos um parsererror.
                             */
                            statusText = "parsererror";
                            error = e;
                        }
                    }
                } else
                {
                    /**
                     * Extraímos a falha do statusText e normalizamos o statusText
                     * e o status para não terminar.
                     */
                    error = statusText;

                    if (!statusText || status)
                    {
                        statusText = "error";

                        if (status < 0)
                        {
                            status = 0;
                        }
                    }
                }

                /**
                 * Definir dados para o objeto xhr falso.
                 */
                jqXHR.status = status;
                jqXHR.statusText = "" + (nativeStatusText || statusText);

                /**
                 * Sucesso/Falha.
                 */
                if (isSuccess)
                {
                    deferred.resolveWith(callbackContext, [success, statusText, jqXHR]);
                } else
                {
                    deferred.rejectWith(callbackContext, [jqXHR, statusText, error]);
                }

                /**
                 * Callbacks dependentes de status.
                 */
                jqXHR.statusCode(statusCode);
                statusCode = undefined;

                if (fireGlobals)
                {
                    globalEventContext.trigger("ajax" + (isSuccess ? "Success" : "Error"), [jqXHR, s, isSuccess ? success : error]);
                }

                /**
                 * Completo.
                 */
                completeDeferred.fireWith(callbackContext, [jqXHR, statusText]);

                if (fireGlobals)
                {
                    globalEventContext.trigger("ajaxComplete", [jqXHR, s]);

                    /**
                     * Modifique o contador AJAX global.
                     */
                    if (!(--jQuery.active))
                    {
                        jQuery.event.trigger("ajaxStop");
                    }
                }
            }

            /**
             * Anexar diferidos.
             */
            deferred.promise(jqXHR);
            jqXHR.success = jqXHR.done;
            jqXHR.error = jqXHR.fail;
            jqXHR.complete = completeDeferred.add;

            /**
             * Callbacks dependentes de status.
             */
            jqXHR.statusCode = function(map)
            {
                if (map)
                {
                    var tmp;

                    if (state < 2)
                    {
                        for (tmp in map)
                        {
                            statusCode[tmp] = [statusCode[tmp], map[tmp]];
                        }
                    } else
                    {
                        tmp = map[jqXHR.status];
                        jqXHR.then(tmp, tmp);
                    }
                }

                return this;
            };

            /**
             * Remova o grafema hash (#7531: e promoção de string). Adicionar
             * protocolo se não for fornecido (#5866: falha do IE7 com URLs
             * sem protocolo). Também usamos o parâmetro url, se disponível.
             */
            s.url = ((url || s.url) + "").replace(rhash, "").replace(rprotocol, ajaxLocParts[1] + "//");

            /**
             * Extraia a lista de tipos de dados.
             */
            s.dataTypes = jQuery.trim(s.dataType || "*").toLowerCase().split(rspacesAjax);

            /**
             * Determine se uma solicitação entre domínios está em ordem.
             */
            if (s.crossDomain == null)
            {
                parts = rurl.exec(s.url.toLowerCase());
                s.crossDomain = !!(parts &&
                    (parts[1] != ajaxLocParts[1] || parts[2] != ajaxLocParts[2] ||
                        (parts[3] || (parts[1] === "http:" ? 80 : 443)) !=
                            (ajaxLocParts[3] || (ajaxLocParts[1] === "http:" ? 80 : 443)))
                );
            }

            /**
             * Converta os dados se ainda não forem uma string.
             */
            if (s.data && s.processData && typeof s.data !== "string")
            {
                s.data = jQuery.param(s.data, s.traditional);
            }

            /**
             * Aplique pré-filtros.
             */
            inspectPrefiltersOrTransports(prefilters, s, options, jqXHR);

            /**
             * Se a solicitação foi terminada dentro de um pré-filtro, pare aí.
             */
            if (state === 2)
            {
                return false;
            }

            /**
             * Podemos enviar eventos globais a partir de agora,
             * se solicitado.
             */
            fireGlobals = s.global;

            /**
             * Maiúsculas o tipo.
             */
            s.type = s.type.toUpperCase();

            /**
             * Determine se a solicitação tem conteúdo.
             */
            s.hasContent = !rnoContent.test(s.type);

            /**
             * Fique atento a um novo conjunto de solicitações.
             */
            if (fireGlobals && jQuery.active++ === 0)
            {
                jQuery.event.trigger("ajaxStart");
            }

            /**
             * Mais opções de tratamento para solicitações sem conteúdo.
             */
            if (!s.hasContent)
            {
                /**
                 * Se houver dados disponíveis, anexe os dados ao url.
                 */
                if (s.data)
                {
                    s.url += (rquery.test(s.url) ? "&" : "?") + s.data;

                    /**
                     * #9682: remova os dados para que não sejam usados
                     * em uma eventual nova tentativa.
                     */
                    delete s.data;
                }

                /**
                 * Obter ifModifiedKey antes de adicionar o parâmetro anti-cubos.
                 */
                ifModifiedKey = s.url;

                /**
                 * Adicione anti-cubos no URL, se necessário.
                 */
                if (s.cache === false)
                {
                    var ts = jQuery.now();

                    /**
                     * Tente substituir _= se estiver lá.
                     */
                    var ret = s.url.replace( rts, "$1_=" + ts );

                    /**
                     * Se nada foi substituído, adicione timestamp ao final.
                     */
                    s.url = ret + ((ret === s.url) ? (rquery.test(s.url) ? "&" : "?") + "_=" + ts : "");
                }
            }

            /**
             * Defina o título correto, se os dados estiverem
             * sendo enviados.
             */
            if (s.data && s.hasContent && s.contentType !== false || options.contentType)
            {
                jqXHR.setRequestHeader("Content-Type", s.contentType);
            }

            /**
             * Definir o título If-Modified-Since e/ou If-None-Match,
             * se no modo ifModified.
             */
            if (s.ifModified)
            {
                ifModifiedKey = ifModifiedKey || s.url;

                if (jQuery.lastModified[ifModifiedKey])
                {
                    jqXHR.setRequestHeader("If-Modified-Since", jQuery.lastModified[ifModifiedKey]);
                }

                if (jQuery.etag[ifModifiedKey])
                {
                    jqXHR.setRequestHeader("If-None-Match", jQuery.etag[ifModifiedKey]);
                }
            }

            /**
             * Defina o título Accepts para o fornecedor, dependendo do dataType.
             */
            jqXHR.setRequestHeader(
                "Accept",
                s.dataTypes[0] && s.accepts[s.dataTypes[0]]
                    ?
                        s.accepts[s.dataTypes[0]] + (s.dataTypes[0] !== "*" ? ", " + allTypes + "; q=0.01" : "")
                    :
                        s.accepts["*"]
            );

            /**
             * Verifique a opção de títulos.
             */
            for (i in s.headers)
            {
                jqXHR.setRequestHeader(i, s.headers[i]);
            }

            /**
             * Permitir títulos/tipos MIME personalizados e
             * terminar antecipadamente.
             */
            if (s.beforeSend && (s.beforeSend.call(callbackContext, jqXHR, s) === false || state === 2))
            {
                /**
                 * Terminar se ainda não tiver feito.
                 */
                jqXHR.abort();

                return false;
            }

            /**
             * Instale callbacks em adiados.
             */
            for (i in {success: 1, error: 1, complete: 1})
            {
                jqXHR[i](s[i]);
            }

            /**
             * Obter transportação.
             */
            transport = inspectPrefiltersOrTransports(transports, s, options, jqXHR);

            /**
             * Se não houver transporte, terminamos automaticamente.
             */
            if (!transport)
            {
                done(-1, "No Transport");
            } else
            {
                jqXHR.readyState = 1;

                /**
                 * Enviar evento global.
                 */
                if (fireGlobals)
                {
                    globalEventContext.trigger("ajaxSend", [jqXHR, s]);
                }

                /**
                 * Tempo esgotado.
                 */
                if (s.async && s.timeout > 0)
                {
                    timeoutTimer = setTimeout(function()
                    {
                        jqXHR.abort("timeout");
                    }, s.timeout );
                }

                try
                {
                    state = 1;
                    transport.send(requestHeaders, done);
                } catch (e)
                {
                    /**
                     * Propagar exceção como falha se não for feito.
                     */
                    if (state < 2)
                    {
                        done(-1, e);

                        /**
                         * Basta enviar novamente caso contrário.
                         */
                    } else
                    {
                        throw e;
                    }
                }
            }

            return jqXHR;
        },

        /**
         * Serialize um vetor de elementos de formulário ou um
         * conjunto de chaves/valores em uma string de
         * consulta.
         */
        param: function(a, traditional)
        {
            var s = [];
            var add = function(key, value)
            {
                /**
                 * Se value for uma função, chame-a e retorne seu valor.
                 */
                value = jQuery.isFunction(value) ? value() : value;

                /**
                 *
                 */
                s[s.length] = encodeURIComponent(key) + "=" + encodeURIComponent(value);
            };

            /**
             * Defina tradicional como true para o comportamento jQuery <= 1.3.2.
             */
            if (traditional === undefined)
            {
                traditional = jQuery.ajaxSettings.traditional;
            }

            /**
             * Se um vetor foi passado, assuma que é um vetor
             * de elementos de formulário.
             */
            if (jQuery.isArray(a) || (a.jquery && !jQuery.isPlainObject(a)))
            {
                /**
                 * Serialize os elementos do formulário.
                 */
                jQuery.each(a, function()
                {
                    add(this.name, this.value);
                });
            } else
            {
                /**
                 * Se for tradicional, codifique da maneira "antiga" (da
                 * maneira que o 1.3.2 ou mais antigo fazia), caso contrário,
                 * codifique os parâmetros recursivamente.
                 */
                for (var prefix in a)
                {
                    buildParams(prefix, a[prefix], traditional, add);
                }
            }

            /**
             * Retorne a serialização resultante.
             */
            return s.join("&").replace(r20, "+");
        }
    });

    /**
     *
     */
    function buildParams(prefix, obj, traditional, add)
    {
        if (jQuery.isArray(obj))
        {
            /**
             * Serialize o item do vetor.
             */
            jQuery.each(obj, function(i, v)
            {
                if (traditional || rbracket.test(prefix))
                {
                    /**
                     * Trate cada item do vetor como um escalar.
                     */
                    add(prefix, v);
                } else
                {
                    /**
                     * Se o item do vetor for não escalar (vetor ou objeto),
                     * codifique seu índice numérico para resolver falhas de
                     * ambiguidade de desserialização. Observe que a base (a
                     * partir de 1.0.0) não pode desserializar vetores aninhados
                     * corretamente e tentar fazer isso pode causar uma falha
                     * no fornecedor. As possíveis correções são modificar o
                     * algoritmo de desserialização da base ou fornecer uma
                     * opção ou sinalizador para forçar a serialização do vetor
                     * a ser superficial.
                     */
                    buildParams(prefix + "[" + (typeof v === "object" ? i : "") + "]", v, traditional, add);
                }
            });
        } else if (!traditional && jQuery.type(obj) === "object")
        {
            /**
             * Serialize o item do objeto.
             */
            for (var name in obj)
            {
                buildParams(prefix + "[" + name + "]", obj[ name ], traditional, add);
            }
        } else
        {
            /**
             * Serialize o item escalar.
             */
            add(prefix, obj);
        }
    }

    /**
     * Isso ainda está no objeto jQuery... por enquanto.
     * Deseja mover isso para jQuery.ajax algum dia.
     */
    jQuery.extend({
        /**
         * Contador para armazenar o número de consultas ativas.
         */
        active: 0,

        /**
         * Cubos de títulos da última modificação para a próxima
         * solicitação.
         */
        lastModified: {},
        etag: {}

    });

    /**
     * Modifica as respostas a uma solicitação ajax:
     *     - define todos os campos responseXXX de acordo.
     *     - encontra o dataType correto (medeia entre o tipo de conteúdo
     *       e o dataType esperado).
     *     - retorna a resposta correspondente.
     */
    function ajaxHandleResponses(s, jqXHR, responses)
    {
        var contents = s.contents;
        var dataTypes = s.dataTypes;
        var responseFields = s.responseFields;
        var ct;
        var type;
        var finalDataType;
        var firstDataType;

        /**
         * Preencha os campos responseXXX.
         */
        for (type in responseFields)
        {
            if (type in responses)
            {
                jqXHR[responseFields[type]] = responses[type];
            }
        }

        /**
         * Remova o auto dataType e obtenha o tipo de conteúdo
         * no processo.
         */
        while(dataTypes[0] === "*")
        {
            dataTypes.shift();

            if (ct === undefined)
            {
                ct = s.mimeType || jqXHR.getResponseHeader("content-type");
            }
        }

        /**
         * Verifique se estamos lidando com um tipo de conteúdo conhecido.
         */
        if (ct)
        {
            for (type in contents)
            {
                if (contents[type] && contents[type].test(ct))
                {
                    dataTypes.unshift(type);
                    break;
                }
            }
        }

        /**
         * Verifique se temos uma resposta para o esperado dataType.
         */
        if (dataTypes[0] in responses)
        {
            finalDataType = dataTypes[0];
        } else
        {
            /**
             * Tente conversível dataTypes.
             */
            for (type in responses)
            {
                if (!dataTypes[0] || s.converters[type + " " + dataTypes[0]])
                {
                    finalDataType = type;
                    break;
                }

                if (!firstDataType)
                {
                    firstDataType = type;
                }
            }

            /**
             * Ou apenas use o primeiro.
             */
            finalDataType = finalDataType || firstDataType;
        }

        /**
         * Se encontrássemos um dataType. Adicionamos o dataType à lista,
         * se necessário, e retornamos a resposta correspondente.
         */
        if (finalDataType)
        {
            if (finalDataType !== dataTypes[0])
            {
                dataTypes.unshift(finalDataType);
            }

            return responses[finalDataType];
        }
    }

    /**
     * Conversões em sequências de acordo com a solicitação
     * e a resposta original.
     */
    function ajaxConvert(s, response)
    {
        /**
         * Aplique o dataFilter, se fornecido.
         */
        if (s.dataFilter)
        {
            response = s.dataFilter(response, s.dataType);
        }

        var dataTypes = s.dataTypes;
        var converters = {};
        var i;
        var key;
        var length = dataTypes.length;
        var tmp;

        /**
         * Atual e anterior dataTypes.
         */
        var current = dataTypes[0];
        var prev;

        /**
         * Expressão de conversão.
         */
        var conversion;

        /**
         * Função de conversão.
         */
        var conv;

        /**
         * Funções de conversão (conversão transitiva).
         */
        var conv1;
        var conv2;

        /**
         * Para cada dataType na sequência.
         */
        for (i = 1; i < length; i++)
        {
            /**
             * Crie um mapa de conversores com chaves minúsculas.
             */
            if (i === 1)
            {
                for (key in s.converters)
                {
                    if (typeof key === "string")
                    {
                        converters[key.toLowerCase()] = s.converters[key];
                    }
                }
            }

            /**
             * Obter o dataTypes.
             */
            prev = current;
            current = dataTypes[i];

            /**
             * Se atual for auto dataType, atualize-o para anterior.
             */
            if (current === "*")
            {
                current = prev;

                /**
                 * Se nenhum auto e dataTypes forem realmente diferentes.
                 */
            } else if (prev !== "*" && prev !== current)
            {
                /**
                 * Obtenha o conversor.
                 */
                conversion = prev + " " + current;
                conv = converters[conversion] || converters["* " + current];

                /**
                 * Se não houver conversor direto, pesquise transitivamente.
                 */
                if (!conv)
                {
                    conv2 = undefined;
                    for (conv1 in converters)
                    {
                        tmp = conv1.split(" ");
                        if (tmp[0] === prev || tmp[0] === "*")
                        {
                            conv2 = converters[tmp[1] + " " + current];
                            if (conv2)
                            {
                                conv1 = converters[conv1];

                                if (conv1 === true)
                                {
                                    conv = conv2;
                                } else if (conv2 === true)
                                {
                                    conv = conv1;
                                }

                                break;
                            }
                        }
                    }
                }

                /**
                 * Se não encontrarmos nenhum conversor, envie uma falha.
                 */
                if (!(conv || conv2))
                {
                    jQuery.error("No conversion from " + conversion.replace(" ", " to "));
                }

                /**
                 * Se encontrado conversor não é uma equivalência.
                 */
                if (conv !== true)
                {
                    /**
                     * Converta com 1 ou 2 conversores de acordo.
                     */
                    response = conv ? conv(response) : conv2(conv1(response));
                }
            }
        }

        return response;
    }

    /**
     *
     */
    var jsc = jQuery.now();
    var jsre = /(\=)\?(&|$)|\?\?/i;

    /**
     * Configurações jsonp comum.
     */
    jQuery.ajaxSetup({
        jsonp: "callback",
        jsonpCallback: function()
        {
            return jQuery.expando + "_" + (jsc++);
        }
    });

    /**
     * Detecte, normalize opções e instale callbacks para
     * solicitações jsonp.
     */
    jQuery.ajaxPrefilter("json jsonp", function(s, originalSettings, jqXHR)
    {
        var inspectData = (typeof s.data === "string") && /^application\/x\-www\-form\-urlencoded/.test(s.contentType);

        if (s.dataTypes[0] === "jsonp" || s.jsonp !== false && (jsre.test(s.url) || inspectData && jsre.test(s.data)))
        {
            var responseContainer;
            var jsonpCallback = s.jsonpCallback = jQuery.isFunction(s.jsonpCallback) ? s.jsonpCallback() : s.jsonpCallback;
            var previous = window[jsonpCallback];
            var url = s.url;
            var data = s.data;
            var replace = "$1" + jsonpCallback + "$2";

            if (s.jsonp !== false)
            {
                url = url.replace(jsre, replace);

                if (s.url === url)
                {
                    if (inspectData)
                    {
                        data = data.replace(jsre, replace);
                    }

                    if (s.data === data)
                    {
                        /**
                         * Adicionar retorno de chamada manualmente.
                         */
                        url += (/\?/.test(url) ? "&" : "?") + s.jsonp + "=" + jsonpCallback;
                    }
                }
            }

            s.url = url;
            s.data = data;

            /**
             * Instale o retorno de chamada.
             */
            window[jsonpCallback] = function(response)
            {
                responseContainer = [response];
            };

            /**
             * Função de limpeza.
             */
            jqXHR.always(function()
            {
                /**
                 * Defina o retorno de chamada para o valor anterior.
                 */
                window[jsonpCallback] = previous;

                /**
                 * Ligue se fosse uma função e temos uma resposta.
                 */
                if (responseContainer && jQuery.isFunction(previous))
                {
                    window[jsonpCallback](responseContainer[0]);
                }
            });

            /**
             * Use o conversor de dados para recuperar json após o
             * procedimento do script.
             */
            s.converters["script json"] = function()
            {
                if (!responseContainer)
                {
                    jQuery.error(jsonpCallback + " was not called");
                }

                return responseContainer[0];
            };

            /**
             * Forçar json dataType.
             */
            s.dataTypes[0] = "json";

            /**
             * Delegação ao script.
             */
            return "script";
        }
    });

    /**
     * Instalar script dataType.
     */
    jQuery.ajaxSetup({
        accepts: {
            script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
        },

        contents: {
            script: /javascript|ecmascript/
        },

        converters: {
            "text script": function(text)
            {
                jQuery.globalEval(text);

                return text;
            }
        }
    });

    /**
     * Lidar com o caso especial e global dos cubos.
     */
    jQuery.ajaxPrefilter("script", function(s)
    {
        if (s.cache === undefined)
        {
            s.cache = false;
        }

        if (s.crossDomain)
        {
            s.type = "GET";
            s.global = false;
        }
    });

    /**
     * Transporte de especificação de tag de script de vinculação.
     */
    jQuery.ajaxTransport("script", function(s)
    {
        /**
         * Este transporte lida apenas com solicitações entre domínios.
         */
        if (s.crossDomain)
        {
            var script;
            var head = document.head || document.getElementsByTagName("head")[0] || document.documentElement;

            return {
                /**
                 *
                 */
                send: function(_, callback)
                {
                    script = document.createElement("script");
                    script.async = "async";

                    if (s.scriptCharset)
                    {
                        script.charset = s.scriptCharset;
                    }

                    script.src = s.url;

                    /**
                     * Anexe modificadores para todos os navegadores.
                     */
                    script.onload = script.onreadystatechange = function(_, isAbort)
                    {
                        if (isAbort || !script.readyState || /loaded|complete/.test(script.readyState))
                        {
                            /**
                             * Lidar com envios de cubos no IE.
                             */
                            script.onload = script.onreadystatechange = null;

                            /**
                             * Remova o script.
                             */
                            if (head && script.parentNode)
                            {
                                head.removeChild(script);
                            }

                            /**
                             * Desreferenciar o script.
                             */
                            script = undefined;

                            /**
                             * Callback se não terminar.
                             */
                            if (!isAbort)
                            {
                                callback(200, "success");
                            }
                        }
                    };

                    /**
                     * Use insertBefore em vez de appendChild para contornar
                     * um bug do IE6. Isso surge quando um nó base é usado
                     * (#2709 e #4378).
                     */
                    head.insertBefore(script, head.firstChild);
                },

                /**
                 *
                 */
                abort: function()
                {
                    if (script)
                    {
                        script.onload(0, 1);
                    }
                }
            };
        }
    });


    /**
     * #5280: Internet Explorer manterá as conexões ativas se não
     * terminarmos no descarregamento.
     */
    var xhrOnUnloadAbort = window.ActiveXObject ? function()
    {
        /**
         * Cancele todas as solicitações pendentes.
         */
        for (var key in xhrCallbacks)
        {
            xhrCallbacks[key](0, 1);
        }
    } : false;

    /**
     *
     */
    var xhrId = 0;
    var xhrCallbacks;

    /**
     * Funções para criar xhrs.
     */
    function createStandardXHR()
    {
        try
        {
            return new window.XMLHttpRequest();
        } catch(e)
        {
        }
    }

    /**
     *
     */
    function createActiveXHR()
    {
        try
        {
            return new window.ActiveXObject("Microsoft.XMLHTTP");
        } catch(e)
        {
        }
    }

    /**
     * Crie o objeto de solicitação. (Isso ainda está anexado a
     * ajaxSettings para compatibilidade com versões anteriores).
     */
    jQuery.ajaxSettings.xhr = window.ActiveXObject
        ?
            /**
             * Microsoft falhou ao implementar corretamente o XMLHttpRequest
             * no IE7 (não é possível solicitar arquivos locais), então usamos
             * o ActiveXObject quando ele está disponível. Além disso,
             * XMLHttpRequest pode ser desabilitado no IE7/IE8, então
             * precisamos de um fallback.
             */
            function()
            {
                return !this.isLocal && createStandardXHR() || createActiveXHR();
            }
        :
            /**
             * Para todos os outros navegadores, use o objeto
             * XMLHttpRequest comum.
             */
            createStandardXHR;

    /**
     * Determinar as propriedades de suporte.
     */
    (function(xhr)
    {
        jQuery.extend( jQuery.support, {
            ajax: !!xhr,
            cors: !!xhr && ("withCredentials" in xhr)
        });
    })(jQuery.ajaxSettings.xhr());

    /**
     * Crie transporte se o navegador puder fornecer um xhr.
     */
    if (jQuery.support.ajax)
    {
        jQuery.ajaxTransport(function(s)
        {
            /**
             * Domínio cruzado permitido apenas se suportado por
             * meio de XMLHttpRequest.
             */
            if (!s.crossDomain || jQuery.support.cors)
            {
                var callback;

                return {
                    /**
                     *
                     */
                    send: function(headers, complete)
                    {
                        /**
                         * Obter um novo xhr.
                         */
                        var xhr = s.xhr();
                        var handle;
                        var i;

                        /**
                         * Abra o soquete.
                         * Passar nome da pessoa nulo gera um pop-up de login
                         * no Opera (#2865).
                         */
                        if (s.username)
                        {
                            xhr.open(s.type, s.url, s.async, s.username, s.password);
                        } else
                        {
                            xhr.open(s.type, s.url, s.async);
                        }

                        /**
                         * Aplique campos personalizados, se fornecidos.
                         */
                        if (s.xhrFields)
                        {
                            for (i in s.xhrFields)
                            {
                                xhr[i] = s.xhrFields[i];
                            }
                        }

                        /**
                         * Substitua o tipo MIME, se necessário.
                         */
                        if (s.mimeType && xhr.overrideMimeType)
                        {
                            xhr.overrideMimeType(s.mimeType);
                        }

                        /**
                         * X-Requested-With título.
                         * Para solicitações entre domínios, visto que as condições
                         * para um preflight são semelhantes a uma complexidade,
                         * simplesmente nunca o definimos para ter certeza.
                         *
                         * (Sempre pode ser definido por solicitação ou mesmo
                         * usando ajaxSetup). Para solicitações de mesmo domínio,
                         * o cabeçalho não será alterado se já for fornecido.
                         */
                        if (!s.crossDomain && !headers["X-Requested-With"])
                        {
                            headers["X-Requested-With"] = "XMLHttpRequest";
                        }

                        /**
                         * Precisa de um try/catch extra para solicitações
                         * entre domínios em Firefox 3.
                         */
                        try
                        {
                            for (i in headers)
                            {
                                xhr.setRequestHeader(i, headers[i]);
                            }
                        } catch(_)
                        {
                        }

                        /**
                         * Envie o pedido. Isso pode gerar uma exceção que é
                         * realmente tratada em jQuery.ajax (portanto, não
                         * tente/pegue aqui).
                         */
                        xhr.send((s.hasContent && s.data) || null);

                        /**
                         * Ouvinte.
                         */
                        callback = function(_, isAbort)
                        {
                            var status;
                            var statusText;
                            var responseHeaders;
                            var responses;
                            var xml;

                            /**
                             * O Firefox lança exceções ao acessar as propriedades
                             * de um xhr quando ocorreu uma falha de rede.
                             */
                            try
                            {
                                /**
                                 * Nunca foi chamado e está terminado ou completo.
                                 */
                                if (callback && (isAbort || xhr.readyState === 4))
                                {
                                    /**
                                     * Liguei apenas uma vez.
                                     */
                                    callback = undefined;

                                    /**
                                     * Não mantenha mais como ativo.
                                     */
                                    if (handle)
                                    {
                                        xhr.onreadystatechange = jQuery.noop;

                                        if (xhrOnUnloadAbort)
                                        {
                                            delete xhrCallbacks[handle];
                                        }
                                    }

                                    /**
                                     * Se for terminar.
                                     */
                                    if (isAbort)
                                    {
                                        /**
                                         * Terminar manualmente, se necessário.
                                         */
                                        if (xhr.readyState !== 4)
                                        {
                                            xhr.abort();
                                        }
                                    } else
                                    {
                                        status = xhr.status;
                                        responseHeaders = xhr.getAllResponseHeaders();
                                        responses = {};
                                        xml = xhr.responseXML;

                                        /**
                                         * Construct response list.
                                         *
                                         * xml.documentElement - #4958.
                                         */
                                        if ( xml && xml.documentElement)
                                        {
                                            responses.xml = xml;
                                        }

                                        /**
                                         * Ao solicitar dados binários, o IE6-9 lançará uma
                                         * exceção em qualquer tentativa de acesso
                                         * responseText (#11426).
                                         */
                                        try
                                        {
                                            responses.text = xhr.responseText;
                                        } catch(_)
                                        {
                                        }

                                        /**
                                         * Firefox lança uma exceção ao acessar statusText
                                         * para solicitações entre domínios com falha.
                                         */
                                        try
                                        {
                                            statusText = xhr.statusText;
                                        } catch(e)
                                        {
                                            /**
                                             * Normalizamos com Webkit dando um statusText vazio.
                                             */
                                            statusText = "";
                                        }

                                        /**
                                         * Status do filtro para comportamentos fora do normal.
                                         */

                                        /**
                                         * Se a solicitação for local e tivermos dados: assuma um
                                         * sucesso (sucesso sem dados não será notificado, é o melhor
                                         * que podemos fazer com as implementações atuais).
                                         */
                                        if (!status && s.isLocal && !s.crossDomain)
                                        {
                                            status = responses.text ? 200 : 404;

                                            /**
                                             * IE - #1450: às vezes retorna 1223 quando deveria ser 204.
                                             */
                                        } else if (status === 1223)
                                        {
                                            status = 204;
                                        }
                                    }
                                }
                            } catch(firefoxAccessException)
                            {
                                if (!isAbort)
                                {
                                    complete(-1, firefoxAccessException);
                                }
                            }

                            /**
                             * Chamada completa, se necessário.
                             */
                            if (responses)
                            {
                                complete(status, statusText, responses, responseHeaders);
                            }
                        };

                        /**
                         * Se estivermos no modo de sincronização ou no cubo e tiver
                         * sido recuperado diretamente (IE6 e IE7), precisamos
                         * enviar manualmente o retorno de chamada.
                         */
                        if (!s.async || xhr.readyState === 4)
                        {
                            callback();
                        } else
                        {
                            handle = ++xhrId;

                            if (xhrOnUnloadAbort)
                            {
                                /**
                                 * Crie a lista de retornos de chamada xhrs ativos, se
                                 * necessário, e anexe o modificador de descarregamento.
                                 */
                                if (!xhrCallbacks)
                                {
                                    xhrCallbacks = {};
                                    jQuery(window).unload(xhrOnUnloadAbort);
                                }

                                /**
                                 * Adicionar à lista de retornos de chamada xhrs ativos.
                                 */
                                xhrCallbacks[handle] = callback;
                            }

                            xhr.onreadystatechange = callback;
                        }
                    },

                    /**
                     *
                     */
                    abort: function()
                    {
                        if (callback)
                        {
                            callback(0, 1);
                        }
                    }
                };
            }
        });
    }

    /**
     *
     */
    var elemdisplay = {};
    var iframe;
    var iframeDoc;
    var rfxtypes = /^(?:toggle|show|hide)$/;
    var rfxnum = /^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i;
    var timerId;
    var fxAttrs = [
        /**
         * Animações de altura.
         */
        [
            "height",
            "marginTop",
            "marginBottom",
            "paddingTop",
            "paddingBottom"
        ],

        /**
         * Animações de largura.
         */
        [
            "width",
            "marginLeft",
            "marginRight",
            "paddingLeft",
            "paddingRight"
        ],

        /**
         * Animações de opacidade.
         */
        [
            "opacity"
        ]
    ];

    /**
     *
     */
    var fxNow;

    /**
     *
     */
    jQuery.fn.extend({
        /**
         *
         */
        show: function(speed, easing, callback)
        {
            var elem;
            var display;

            /**
             *
             */
            if (speed || speed === 0)
            {
                return this.animate(genFx("show", 3), speed, easing, callback);
            } else
            {
                for (var i = 0, j = this.length; i < j; i++)
                {
                    elem = this[i];

                    if (elem.style)
                    {
                        display = elem.style.display;

                        /**
                         * Redefina a exibição inline deste elemento para saber se ele
                         * está sendo oculto por regras em cascata ou não.
                         */
                        if (!jQuery._data(elem, "olddisplay") && display === "none")
                        {
                            display = elem.style.display = "";
                        }

                        /**
                         * Defina os elementos que foram substituídos por
                         * 'display: none' em uma folha de estilo para qualquer
                         * que seja o estilo comum do navegador para tal elemento.
                         */
                        if ((display === "" && jQuery.css(elem, "display") === "none") || !jQuery.contains(elem.ownerDocument.documentElement, elem))
                        {
                            jQuery._data(elem, "olddisplay", defaultDisplay(elem.nodeName));
                        }
                    }
                }

                /**
                 * Defina a exibição da maioria dos elementos em um segundo ciclo
                 * para evitar o refluxo constante.
                 */
                for (i = 0; i < j; i++)
                {
                    elem = this[i];

                    if (elem.style)
                    {
                        display = elem.style.display;

                        if (display === "" || display === "none")
                        {
                            elem.style.display = jQuery._data(elem, "olddisplay") || "";
                        }
                    }
                }

                return this;
            }
        },

        /**
         *
         */
        hide: function(speed, easing, callback)
        {
            if (speed || speed === 0)
            {
                return this.animate(genFx("hide", 3), speed, easing, callback);
            } else
            {
                var elem;
                var display;
                var i = 0;
                var j = this.length;

                for (; i < j; i++)
                {
                    elem = this[i];

                    if (elem.style)
                    {
                        display = jQuery.css(elem, "display");

                        if (display !== "none" && !jQuery._data(elem, "olddisplay"))
                        {
                            jQuery._data(elem, "olddisplay", display);
                        }
                    }
                }

                /**
                 * Defina a exibição dos elementos em um segundo ciclo
                 * para evitar o refluxo constante.
                 */
                for (i = 0; i < j; i++)
                {
                    if (this[i].style)
                    {
                        this[i].style.display = "none";
                    }
                }

                return this;
            }
        },

        /**
         * Salve a antiga função de alternância.
         */
        _toggle: jQuery.fn.toggle,

        /**
         *
         */
        toggle: function(fn, fn2, callback)
        {
            var bool = typeof fn === "boolean";

            if (jQuery.isFunction(fn) && jQuery.isFunction(fn2))
            {
                this._toggle.apply( this, arguments );
            } else if (fn == null || bool)
            {
                this.each(function()
                {
                    var state = bool ? fn : jQuery(this).is(":hidden");

                    jQuery(this)[state ? "show" : "hide"]();
                });
            } else
            {
                this.animate(genFx("toggle", 3), fn, fn2, callback);
            }

            return this;
        },

        /**
         *
         */
        fadeTo: function(speed, to, easing, callback)
        {
            return this.filter(":hidden")
                .css("opacity", 0)
                .show()
                .end()
                .animate({opacity: to}, speed, easing, callback);
        },

        /**
         *
         */
        animate: function(prop, speed, easing, callback)
        {
            var optall = jQuery.speed(speed, easing, callback);

            if (jQuery.isEmptyObject(prop))
            {
                return this.each(optall.complete, [false]);
            }

            /**
             * Não altere as propriedades referenciadas, pois a
             * atenuação por propriedade será perdida.
             */
            prop = jQuery.extend( {}, prop);

            /**
             *
             */
            function doAnimation()
            {
                /**
                 * xxx - 'esse' nem sempre tem um nodeName ao fazer o
                 * procedimento do conjunto de testes.
                 */

                if (optall.queue === false)
                {
                    jQuery._mark(this);
                }

                var opt = jQuery.extend({}, optall);
                var isElement = this.nodeType === 1;
                var hidden = isElement && jQuery(this).is(":hidden");
                var name;
                var val;
                var p;
                var e;
                var hooks;
                var replace;
                var parts;
                var start;
                var end;
                var unit;
                var method;

                /**
                 * Armazenará por propriedade easing e será usado para determinar
                 * quando uma animação for concluída.
                 */
                opt.animatedProperties = {};

                /**
                 * Passe primeiro pelas propriedades para expandir/normalizar.
                 */
                for (p in prop)
                {
                    name = jQuery.camelCase(p);

                    if (p !== name)
                    {
                        prop[name] = prop[p];
                        delete prop[p];
                    }

                    if ((hooks = jQuery.cssHooks[name]) && "expand" in hooks)
                    {
                        replace = hooks.expand(prop[name]);
                        delete prop[name];

                        /**
                         * Não exatamente $.extend, isso não substituirá as chaves
                         * já presentes. também - reutilizando 'p' de cima porque
                         * temos o "nome" correto.
                         */
                        for (p in replace)
                        {
                            if (!(p in prop))
                            {
                                prop[p] = replace[p];
                            }
                        }
                    }
                }

                for (name in prop)
                {
                    val = prop[name];

                    /**
                     * Resolução facilitada: por propriedade > opt.specialEasing
                     * > opt.easing > 'swing' (comum).
                     */
                    if (jQuery.isArray(val))
                    {
                        opt.animatedProperties[name] = val[1];
                        val = prop[name] = val[0];
                    } else
                    {
                        opt.animatedProperties[name] = opt.specialEasing && opt.specialEasing[name] || opt.easing || 'swing';
                    }

                    if (val === "hide" && hidden || val === "show" && !hidden)
                    {
                        return opt.complete.call( this );
                    }

                    if (isElement && (name === "height" || name === "width"))
                    {
                        /**
                         * Certifique-se de que nada escapa. Registre todos os 3
                         * atributos de envio porque o IE não altera o atributo
                         * de envio quando envioX e envioY são definidos com o
                         * mesmo valor.
                         */
                        opt.overflow = [
                            this.style.overflow,
                            this.style.overflowX,
                            this.style.overflowY
                        ];

                        /**
                         * Defina a propriedade de exibição como bloco embutido
                         * para animações de altura/largura em elementos embutidos
                         * que têm largura/altura animada.
                         */
                        if (jQuery.css(this, "display") === "inline" && jQuery.css(this, "float") === "none")
                        {
                            /**
                             * inline-level elementos aceitam inline-block;
                             * block-level os elementos precisam estar alinhados
                             * com o layout.
                             */
                            if (!jQuery.support.inlineBlockNeedsLayout || defaultDisplay(this.nodeName) === "inline")
                            {
                                this.style.display = "inline-block";
                            } else
                            {
                                this.style.zoom = 1;
                            }
                        }
                    }
                }

                if (opt.overflow != null)
                {
                    this.style.overflow = "hidden";
                }

                for (p in prop)
                {
                    e = new jQuery.fx(this, opt, p);
                    val = prop[p];

                    if (rfxtypes.test(val))
                    {
                        /**
                         * Rastreia se deve mostrar ou ocultar com base em dados
                         * privados anexados ao elemento.
                         */
                        method = jQuery._data(this, "toggle" + p) || (val === "toggle" ? hidden ? "show" : "hide" : 0);

                        if (method)
                        {
                            jQuery._data(this, "toggle" + p, method === "show" ? "hide" : "show");
                            e[method]();
                        } else
                        {
                            e[val]();
                        }
                    } else
                    {
                        parts = rfxnum.exec(val);
                        start = e.cur();

                        if (parts)
                        {
                            end = parseFloat(parts[2]);
                            unit = parts[3] || (jQuery.cssNumber[p] ? "" : "px");

                            /**
                             * Precisamos calcular o valor inicial.
                             */
                            if (unit !== "px")
                            {
                                jQuery.style(this, p, (end || 1) + unit);
                                start = ((end || 1) / e.cur()) * start;
                                jQuery.style(this, p, start + unit);
                            }

                            /**
                             * Se um token +=/-= foi fornecido, estamos fazendo
                             * uma animação relativa.
                             */
                            if (parts[1])
                            {
                                end = ((parts[1] === "-=" ? -1 : 1) * end) + start;
                            }

                            e.custom(start, end, unit);
                        } else
                        {
                            e.custom(start, val, "");
                        }
                    }
                }

                /**
                 * Para conformidade estrita de JS.
                 */
                return true;
            }

            return optall.queue === false ? this.each(doAnimation) : this.queue(optall.queue, doAnimation);
        },

        /**
         *
         */
        stop: function(type, clearQueue, gotoEnd)
        {
            if (typeof type !== "string")
            {
                gotoEnd = clearQueue;
                clearQueue = type;
                type = undefined;
            }

            if (clearQueue && type !== false)
            {
                this.queue(type || "fx", []);
            }

            return this.each(function()
            {
                var index;
                var hadTimers = false;
                var timers = jQuery.timers;
                var data = jQuery._data(this);

                /**
                 * limpe os contadores de marcadores se soubermos que não serão.
                 */
                if (!gotoEnd)
                {
                    jQuery._unmark(true, this);
                }

                function stopQueue(elem, data, index)
                {
                    var hooks = data[ index ];

                    jQuery.removeData(elem, index, true);
                    hooks.stop(gotoEnd);
                }

                if (type == null)
                {
                    for (index in data)
                    {
                        if (data[index] && data[index].stop && index.indexOf(".run") === index.length - 4)
                        {
                            stopQueue(this, data, index);
                        }
                    }
                } else if (data[index = type + ".run"] && data[index].stop)
                {
                    stopQueue(this, data, index);
                }

                for (index = timers.length; index--;)
                {
                    if (timers[index].elem === this && (type == null || timers[index].queue === type))
                    {
                        if (gotoEnd)
                        {
                            /**
                             * Forçar o próximo passo a ser o último.
                             */
                            timers[index](true);
                        } else
                        {
                            timers[index].saveState();
                        }

                        hadTimers = true;
                        timers.splice(index, 1);
                    }
                }

                /**
                 * Iniciar o próximo na fila se a última etapa não for forçada,
                 * os timers atualmente chamarão seus retornos de chamada
                 * completos, que serão retirados da fila, mas somente se
                 * forem gotoEnd.
                 */
                if (!(gotoEnd && hadTimers))
                {
                    jQuery.dequeue(this, type);
                }
            });
        }
    });

    /**
     * As animações criadas de forma síncrona serão
     * um procedimento de forma síncrona.
     */
    function createFxNow()
    {
        setTimeout(clearFxNow, 0);

        return (fxNow = jQuery.now());
    }

    /**
     *
     */
    function clearFxNow()
    {
        fxNow = undefined;
    }

    /**
     * Gere parâmetros para criar uma animação comum.
     */
    function genFx(type, num)
    {
        var obj = {};

        jQuery.each(fxAttrs.concat.apply([], fxAttrs.slice(0, num)), function()
        {
            obj[this] = type;
        });

        return obj;
    }

    /**
     * Gere atalhos para animações personalizadas.
     */
    jQuery.each({
        slideDown: genFx("show", 1),
        slideUp: genFx("hide", 1),
        slideToggle: genFx("toggle", 1),
        fadeIn: {opacity: "show"},
        fadeOut: {opacity: "hide"},
        fadeToggle: {opacity: "toggle"}
    }, function(name, props)
    {
        jQuery.fn[name] = function(speed, easing, callback)
        {
            return this.animate(props, speed, easing, callback);
        };
    });

    /**
     *
     */
    jQuery.extend({
        /**
         *
         */
        speed: function(speed, easing, fn)
        {
            var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
                complete: fn || !fn && easing || jQuery.isFunction(speed) && speed,
                duration: speed,
                easing: fn && easing || easing && !jQuery.isFunction(easing) && easing
            };

            opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
                opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[opt.duration] : jQuery.fx.speeds._default;

            /**
             * Normalizar opt.queue - true/undefined/null -> "fx".
             */
            if (opt.queue == null || opt.queue === true)
            {
                opt.queue = "fx";
            }

            /**
             * Fila.
             */
            opt.old = opt.complete;
            opt.complete = function(noUnmark)
            {
                if (jQuery.isFunction(opt.old))
                {
                    opt.old.call(this);
                }

                if (opt.queue)
                {
                    jQuery.dequeue(this, opt.queue);
                } else if (noUnmark !== false)
                {
                    jQuery._unmark(this);
                }
            };

            return opt;
        },

        /**
         *
         */
        easing: {
            /**
             *
             */
            linear: function(p)
            {
                return p;
            },

            /**
             *
             */
            swing: function(p)
            {
                return (-Math.cos(p*Math.PI) / 2 ) + 0.5;
            }
        },

        /**
         *
         */
        timers: [],

        /**
         *
         */
        fx: function(elem, options, prop)
        {
            this.options = options;
            this.elem = elem;
            this.prop = prop;

            options.orig = options.orig || {};
        }
    });

    /**
     *
     */
    jQuery.fx.prototype = {
        /**
         * Função simples para definir um valor de estilo.
         */
        update: function()
        {
            if (this.options.step)
            {
                this.options.step.call(this.elem, this.now, this);
            }

            (jQuery.fx.step[this.prop] || jQuery.fx.step._default)(this);
        },

        /**
         * Obtenha o tamanho atual.
         */
        cur: function()
        {
            if (this.elem[this.prop] != null && (!this.elem.style || this.elem.style[this.prop] == null))
            {
                return this.elem[this.prop];
            }

            var parsed;
            var r = jQuery.css(this.elem, this.prop);

            /**
             * Strings vazias, null, undefined e "auto" são convertidas
             * em 0, valores complexos como "rotate(1rad)" são retornados
             * como estão, valores simples como "10px" são analisados
             * para Float.
             */
            return isNaN(parsed = parseFloat(r)) ? !r || r === "auto" ? 0 : r : parsed;
        },

        /**
         * Inicie uma animação de um número para outro.
         */
        custom: function(from, to, unit)
        {
            var self = this;
            var fx = jQuery.fx;

            this.startTime = fxNow || createFxNow();
            this.end = to;
            this.now = this.start = from;
            this.pos = this.state = 0;
            this.unit = unit || this.unit || (jQuery.cssNumber[this.prop] ? "" : "px");

            function t(gotoEnd)
            {
                return self.step(gotoEnd);
            }

            t.queue = this.options.queue;
            t.elem = this.elem;
            t.saveState = function()
            {
                if (jQuery._data(self.elem, "fxshow" + self.prop) === undefined)
                {
                    if (self.options.hide)
                    {
                        jQuery._data(self.elem, "fxshow" + self.prop, self.start);
                    } else if (self.options.show)
                    {
                        jQuery._data(self.elem, "fxshow" + self.prop, self.end);
                    }
                }
            };

            if (t() && jQuery.timers.push(t) && !timerId)
            {
                timerId = setInterval(fx.tick, fx.interval);
            }
        },

        /**
         * Função 'mostrar' simples.
         */
        show: function()
        {
            var dataShow = jQuery._data(this.elem, "fxshow" + this.prop);

            /**
             * Lembre-se de onde começamos, para que possamos
             * voltar mais tarde.
             */
            this.options.orig[this.prop] = dataShow || jQuery.style(this.elem, this.prop);
            this.options.show = true;

            /**
             * Comece a animação. Certifique-se de começar com uma
             * largura/altura pequena para evitar qualquer flash de conteúdo.
             */
            if (dataShow !== undefined)
            {
                /**
                 * Este show está começando de onde um show anterior parou.
                 */
                this.custom(this.cur(), dataShow);
            } else
            {
                this.custom(this.prop === "width" || this.prop === "height" ? 1 : 0, this.cur());
            }

            /**
             * Comece mostrando o elemento.
             */
            jQuery(this.elem).show();
        },

        /**
         * Função 'ocultar' simples.
         */
        hide: function()
        {
            /**
             * Lembre-se de onde começamos, para que possamos voltar mais tarde.
             */
            this.options.orig[this.prop] = jQuery._data(this.elem, "fxshow" + this.prop) || jQuery.style(this.elem, this.prop);
            this.options.hide = true;

            /**
             * Comece a animação.
             */
            this.custom(this.cur(), 0);
        },

        /**
         * Cada passo de uma animação.
         */
        step: function(gotoEnd)
        {
            var p;
            var n;
            var complete;
            var t = fxNow || createFxNow();
            var done = true;
            var elem = this.elem;
            var options = this.options;

            if (gotoEnd || t >= options.duration + this.startTime)
            {
                this.now = this.end;
                this.pos = this.state = 1;
                this.update();

                options.animatedProperties[ this.prop ] = true;

                for (p in options.animatedProperties)
                {
                    if (options.animatedProperties[p] !== true)
                    {
                        done = false;
                    }
                }

                if (done)
                {
                    /**
                     * Redefina o envio.
                     */
                    if (options.overflow != null && !jQuery.support.shrinkWrapBlocks)
                    {
                        jQuery.each(["", "X", "Y"], function(index, value)
                        {
                            elem.style["overflow" + value] = options.overflow[index];
                        });
                    }

                    /**
                     * Oculte o elemento se a operação "ocultar" foi realizada.
                     */
                    if (options.hide)
                    {
                        jQuery(elem).hide();
                    }

                    /**
                     * Redefina as propriedades, se o item estiver oculto
                     * ou exibido.
                     */
                    if (options.hide || options.show)
                    {
                        for ( p in options.animatedProperties )
                        {
                            jQuery.style(elem, p, options.orig[p]);
                            jQuery.removeData(elem, "fxshow" + p, true);

                            /**
                             * Os dados de alternância não são mais necessários.
                             */
                            jQuery.removeData(elem, "toggle" + p, true);
                        }
                    }

                    /**
                     * Faça o procedimento da função 'complete' caso a função
                     * complete envie uma exceção, devemos garantir que ela
                     * não seja chamada duas vezes. #5684.
                     */
                    complete = options.complete;

                    if (complete)
                    {
                        options.complete = false;
                        complete.call(elem);
                    }
                }

                return false;
            } else
            {
                /**
                 * A atenuação clássica não pode ser usada com uma
                 * duração infinita.
                 */
                if (options.duration == Infinity)
                {
                    this.now = t;
                } else
                {
                    n = t - this.startTime;
                    this.state = n / options.duration;

                    /**
                     * Faça o procedimento da função easing, o comum é swing.
                     */
                    this.pos = jQuery.easing[options.animatedProperties[this.prop]](this.state, n, 0, 1, options.duration);
                    this.now = this.start + ((this.end - this.start) * this.pos);
                }

                /**
                 * Faça o procedimento da próxima etapa da animação.
                 */
                this.update();
            }

            return true;
        }
    };

    /**
     *
     */
    jQuery.extend( jQuery.fx, {
        /**
         *
         */
        tick: function()
        {
            var timer;
            var timers = jQuery.timers;
            var i = 0;

            for (; i < timers.length; i++)
            {
                timer = timers[i];

                /**
                 * Verifica se o cronômetro já não foi removido.
                 */
                if (!timer() && timers[i] === timer)
                {
                    timers.splice(i--, 1);
                }
            }

            if (!timers.length)
            {
                jQuery.fx.stop();
            }
        },

        /**
         *
         */
        interval: 13,

        /**
         *
         */
        stop: function()
        {
            clearInterval(timerId);
            timerId = null;
        },

        /**
         *
         */
        speeds: {
            slow: 600,
            fast: 200,

            /**
             * Velocidade comum.
             */
            _default: 400
        },

        /**
         *
         */
        step: {
            /**
             *
             */
            opacity: function(fx)
            {
                jQuery.style(fx.elem, "opacity", fx.now);
            },

            /**
             *
             */
            _default: function(fx)
            {
                if (fx.elem.style && fx.elem.style[fx.prop] != null)
                {
                    fx.elem.style[fx.prop] = fx.now + fx.unit;
                } else
                {
                    fx.elem[fx.prop] = fx.now;
                }
            }
        }
    });

    /**
     * Certifique-se de que props que não podem ser negativos
     * não cheguem lá no undershoot easing.
     */
    jQuery.each(fxAttrs.concat.apply([], fxAttrs), function(i, prop)
    {
        /**
         * Remover marginTop, marginLeft, marginBottom e marginRight
         * dessa lista.
         */
        if (prop.indexOf("margin"))
        {
            jQuery.fx.step[prop] = function(fx)
            {
                jQuery.style(fx.elem, prop, Math.max(0, fx.now) + fx.unit);
            };
        }
    });

    /**
     *
     */
    if (jQuery.expr && jQuery.expr.filters)
    {
        jQuery.expr.filters.animated = function(elem)
        {
            return jQuery.grep(jQuery.timers, function(fn)
            {
                return elem === fn.elem;
            }).length;
        };
    }

    /**
     * Tente restaurar o valor de exibição comum
     * de um elemento.
     */
    function defaultDisplay(nodeName)
    {
        if (!elemdisplay[nodeName])
        {
            var body = document.body;
            var elem = jQuery("<" + nodeName + ">").appendTo(body);
            var display = elem.css("display");

            elem.remove();

            /**
             * Se a maneira simples falhar, obtenha a exibição comum
             * real do elemento anexando-a a um iframe temporário.
             */
            if (display === "none" || display === "")
            {
                /**
                 * Nenhum iframe para usar ainda, então crie-o.
                 */
                if (!iframe)
                {
                    iframe = document.createElement("iframe");
                    iframe.frameBorder = iframe.width = iframe.height = 0;
                }

                body.appendChild(iframe);

                /**
                 * Crie uma cópia armazenável em cubos do documento iframe na
                 * primeira chamada. O IE e o Opera nos permitirão reutilizar
                 * o iframeDoc sem reescrever o documento HTML falso nele; O
                 * WebKit e o Firefox não permitirão a reutilização do
                 * documento iframe.
                 */
                if (!iframeDoc || !iframe.createElement)
                {
                    iframeDoc = (iframe.contentWindow || iframe.contentDocument).document;
                    iframeDoc.write((jQuery.support.boxModel ? "<!doctype html>" : "") + "<html><body>");
                    iframeDoc.close();
                }

                elem = iframeDoc.createElement(nodeName);
                iframeDoc.body.appendChild(elem);

                display = jQuery.css(elem, "display");
                body.removeChild(iframe);
            }

            /**
             * Armazene a exibição comum correta.
             */
            elemdisplay[nodeName] = display;
        }

        return elemdisplay[nodeName];
    }

    /**
     *
     */
    var getOffset;
    var rtable = /^t(?:able|d|h)$/i;
    var rroot = /^(?:body|html)$/i;

    /**
     *
     */
    if ("getBoundingClientRect" in document.documentElement)
    {
        getOffset = function(elem, doc, docElem, box)
        {
            try
            {
                box = elem.getBoundingClientRect();
            } catch(e)
            {
            }

            /**
             * Certifique-se de que não estamos lidando com um nó
             * DOM desconectado.
             */
            if (!box || !jQuery.contains(docElem, elem))
            {
                return box ? { top: box.top, left: box.left } : { top: 0, left: 0 };
            }

            var body = doc.body;
            var win = getWindow(doc);
            var clientTop = docElem.clientTop || body.clientTop || 0;
            var clientLeft = docElem.clientLeft || body.clientLeft || 0;
            var scrollTop = win.pageYOffset || jQuery.support.boxModel && docElem.scrollTop || body.scrollTop;
            var scrollLeft = win.pageXOffset || jQuery.support.boxModel && docElem.scrollLeft || body.scrollLeft;
            var top = box.top + scrollTop - clientTop;
            var left = box.left + scrollLeft - clientLeft;

            return {
                top: top,
                left: left
            };
        };
    } else
    {
        /**
         *
         */
        getOffset = function(elem, doc, docElem)
        {
            var computedStyle;
            var offsetParent = elem.offsetParent;
            var prevOffsetParent = elem;
            var body = doc.body;
            var defaultView = doc.defaultView;
            var prevComputedStyle = defaultView ? defaultView.getComputedStyle(elem, null) : elem.currentStyle;
            var top = elem.offsetTop;
            var left = elem.offsetLeft;

            while ((elem = elem.parentNode) && elem !== body && elem !== docElem)
            {
                if (jQuery.support.fixedPosition && prevComputedStyle.position === "fixed")
                {
                    break;
                }

                computedStyle = defaultView ? defaultView.getComputedStyle(elem, null) : elem.currentStyle;
                top -= elem.scrollTop;
                left -= elem.scrollLeft;

                if (elem === offsetParent)
                {
                    top  += elem.offsetTop;
                    left += elem.offsetLeft;

                    if (jQuery.support.doesNotAddBorder && !(jQuery.support.doesAddBorderForTableAndCells && rtable.test(elem.nodeName)))
                    {
                        top += parseFloat(computedStyle.borderTopWidth) || 0;
                        left += parseFloat(computedStyle.borderLeftWidth) || 0;
                    }

                    prevOffsetParent = offsetParent;
                    offsetParent = elem.offsetParent;
                }

                if (jQuery.support.subtractsBorderForOverflowNotVisible && computedStyle.overflow !== "visible")
                {
                    top += parseFloat(computedStyle.borderTopWidth) || 0;
                    left += parseFloat(computedStyle.borderLeftWidth) || 0;
                }

                prevComputedStyle = computedStyle;
            }

            if (prevComputedStyle.position === "relative" || prevComputedStyle.position === "static")
            {
                top  += body.offsetTop;
                left += body.offsetLeft;
            }

            if (jQuery.support.fixedPosition && prevComputedStyle.position === "fixed")
            {
                top += Math.max(docElem.scrollTop, body.scrollTop);
                left += Math.max(docElem.scrollLeft, body.scrollLeft);
            }

            return {
                top: top,
                left: left
            };
        };
    }

    /**
     *
     */
    jQuery.fn.offset = function(options)
    {
        if (arguments.length)
        {
            return options === undefined ?
                this :
                this.each(function(i)
                {
                    jQuery.offset.setOffset(this, options, i);
                });
        }

        var elem = this[0];
        var doc = elem && elem.ownerDocument;

        if (!doc)
        {
            return null;
        }

        if (elem === doc.body)
        {
            return jQuery.offset.bodyOffset(elem);
        }

        return getOffset(elem, doc, doc.documentElement);
    };

    /**
     *
     */
    jQuery.offset = {
        /**
         *
         */
        bodyOffset: function(body)
        {
            var top = body.offsetTop;
            var left = body.offsetLeft;

            if (jQuery.support.doesNotIncludeMarginInBodyOffset)
            {
                top += parseFloat(jQuery.css(body, "marginTop")) || 0;
                left += parseFloat(jQuery.css(body, "marginLeft")) || 0;
            }

            return {
                top: top,
                left: left
            };
        },

        /**
         *
         */
        setOffset: function(elem, options, i)
        {
            var position = jQuery.css(elem, "position");

            /**
             * Definir a posição primeiro, caso alto/esquerdo sejam
             * definidos mesmo em um elemento estático.
             */
            if (position === "static")
            {
                elem.style.position = "relative";
            }

            var curElem = jQuery(elem);
            var curOffset = curElem.offset();
            var curCSSTop = jQuery.css(elem, "top");
            var curCSSLeft = jQuery.css(elem, "left");
            var calculatePosition = (position === "absolute" || position === "fixed") && jQuery.inArray("auto", [curCSSTop, curCSSLeft]) > -1;
            var props = {};
            var curPosition = {};
            var curTop;
            var curLeft;

            /**
             * Precisa ser capaz de calcular a posição se alto ou esquerdo
             * for automático e a posição for absoluta ou fixa.
             */
            if (calculatePosition)
            {
                curPosition = curElem.position();
                curTop = curPosition.top;
                curLeft = curPosition.left;
            } else
            {
                curTop = parseFloat(curCSSTop) || 0;
                curLeft = parseFloat(curCSSLeft) || 0;
            }

            if (jQuery.isFunction(options))
            {
                options = options.call(elem, i, curOffset);
            }

            if (options.top != null)
            {
                props.top = (options.top - curOffset.top) + curTop;
            }

            if (options.left != null)
            {
                props.left = (options.left - curOffset.left) + curLeft;
            }

            if ("using" in options)
            {
                options.using.call(elem, props);
            } else
            {
                curElem.css(props);
            }
        }
    };

    /**
     *
     */
    jQuery.fn.extend({
        /**
         *
         */
        position: function()
        {
            if (!this[0])
            {
                return null;
            }

            var elem = this[0];

            /**
             * Obter *real* offsetParent.
             */
            var offsetParent = this.offsetParent();

            /**
             * Obtenha compensações corretas.
             */
            var offset = this.offset();
            var parentOffset = rroot.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset();

            /**
             * Subtrair as margens do elemento.
             * Observação: quando um elemento tem margin: auto, offsetLeft e
             * marginLeft são os mesmos no Safari, fazendo com que offset.left
             * seja incorretamente 0.
             */
            offset.top -= parseFloat(jQuery.css(elem, "marginTop")) || 0;
            offset.left -= parseFloat(jQuery.css(elem, "marginLeft")) || 0;

            /**
             * Adicione bordas offsetParent.
             */
            parentOffset.top += parseFloat(jQuery.css(offsetParent[0], "borderTopWidth")) || 0;
            parentOffset.left += parseFloat(jQuery.css(offsetParent[0], "borderLeftWidth")) || 0;

            /**
             * Subtraia os dois deslocamentos.
             */
            return {
                top: offset.top  - parentOffset.top,
                left: offset.left - parentOffset.left
            };
        },

        /**
         *
         */
        offsetParent: function()
        {
            return this.map(function()
            {
                var offsetParent = this.offsetParent || document.body;

                while (offsetParent && (!rroot.test(offsetParent.nodeName) && jQuery.css(offsetParent, "position") === "static"))
                {
                    offsetParent = offsetParent.offsetParent;
                }

                return offsetParent;
            });
        }
    });

    /**
     * Criar métodos scrollLeft e scrollTop.
     */
    jQuery.each({scrollLeft: "pageXOffset", scrollTop: "pageYOffset"}, function(method, prop)
    {
        var top = /Y/.test( prop );

        /**
         *
         */
        jQuery.fn[method] = function(val)
        {
            return jQuery.access(this, function(elem, method, val)
            {
                var win = getWindow(elem);

                if (val === undefined)
                {
                    return win ? (prop in win) ? win[prop] : jQuery.support.boxModel && win.document.documentElement[method] || win.document.body[method] : elem[method];
                }

                if (win)
                {
                    win.scrollTo(
                        !top ? val : jQuery(win).scrollLeft(),
                         top ? val : jQuery(win).scrollTop()
                    );
                } else
                {
                    elem[method] = val;
                }
            }, method, val, arguments.length, null );
        };
    });

    /**
     *
     */
    function getWindow(elem)
    {
        return jQuery.isWindow(elem) ?
            elem :
            elem.nodeType === 9 ?
                elem.defaultView || elem.parentWindow :
                false;
    }

    /**
     * Criar métodos [width, height, innerHeight, innerWidth, outerHeight
     * e outerWidth].
     */
    jQuery.each({ Height: "height", Width: "width" }, function(name, type)
    {
        var clientProp = "client" + name;
        var scrollProp = "scroll" + name;
        var offsetProp = "offset" + name;

        /**
         * innerHeight e innerWidth.
         */
        jQuery.fn[ "inner" + name ] = function()
        {
            var elem = this[0];

            return elem ? elem.style ? parseFloat(jQuery.css(elem, type, "padding")) : this[type]() : null;
        };

        /**
         * outerHeight e outerWidth.
         */
        jQuery.fn["outer" + name] = function(margin)
        {
            var elem = this[0];

            return elem ? elem.style ? parseFloat(jQuery.css(elem, type, margin ? "margin" : "border")) : this[type]() : null;
        };

        /**
         *
         */
        jQuery.fn[type] = function(value)
        {
            return jQuery.access(this, function(elem, type, value)
            {
                var doc;
                var docElemProp;
                var orig;
                var ret;

                if (jQuery.isWindow(elem))
                {
                    /**
                     * A 3ª condição permite o suporte da Nokia, pois suporta
                     * o suporte docElem, mas não o CSS1Compat.
                     */
                    doc = elem.document;
                    docElemProp = doc.documentElement[clientProp];

                    return jQuery.support.boxModel && docElemProp || doc.body && doc.body[clientProp] || docElemProp;
                }

                /**
                 * Obter documento 'width' ou 'height'.
                 */
                if (elem.nodeType === 9)
                {
                    /**
                     * Qualquer scroll[Width/Height] ou offset[Width/Height],
                     * o que for maior.
                     */
                    doc = elem.documentElement;

                    /**
                     * Quando uma janela > documento, o IE6 relata um
                     * deslocamento[Largura/Altura] > cliente[Largura/Altura],
                     * portanto não podemos usar o máximo, pois ele escolherá
                     * o deslocamento incorreto[Largura/Altura] em vez disso,
                     * usamos o cliente correto[Largura/Altura] suporte: IE6.
                     */
                    if (doc[clientProp] >= doc[scrollProp])
                    {
                        return doc[clientProp];
                    }

                    return Math.max(
                        elem.body[scrollProp], doc[scrollProp],
                        elem.body[offsetProp], doc[offsetProp]
                    );
                }

                /**
                 * Obter largura ou altura no elemento.
                 */
                if (value === undefined)
                {
                    orig = jQuery.css(elem, type);
                    ret = parseFloat(orig);

                    return jQuery.isNumeric(ret) ? ret : orig;
                }

                /**
                 * Defina a largura ou a altura do elemento.
                 */
                jQuery(elem).css(type, value);
            }, type, value, arguments.length, null);
        };
    });

    /**
     * Expor jQuery ao objeto global.
     */
    window.jQuery = window.$ = jQuery;

    /**
     * Exponha o jQuery como um módulo AMD, mas apenas para carregadores
     * AMD que entendam as falhas com o carregamento de várias versões
     * do jQuery em uma página que pode chamar define(). O carregador
     * indicará que eles têm permissões especiais para várias versões
     * do jQuery especificando define.amd.jQuery = true. Registre-se
     * como um módulo nomeado, pois jQuery pode ser concatenado com
     * outros arquivos que podem usar define, mas não usar um script de
     * concatenação adequado que entenda módulos AMD anônimos. Um AMD
     * nomeado é a maneira mais segura e robusta de se registrar. O
     * jquery em letras minúsculas é usado porque os nomes dos módulos
     * AMD são derivados de nomes de arquivos e o jQuery é normalmente
     * fornecido em um nome de arquivo em letras minúsculas. Faça isso
     * depois de criar o global para que, se um módulo AMD quiser chamar
     * noConflict para ocultar esta versão do jQuery, funcione.
     */
    if (typeof define === "function" && define.amd && define.amd.jQuery)
    {
        define("jquery", [], function()
        {
            return jQuery;
        });
    }
})(window);
