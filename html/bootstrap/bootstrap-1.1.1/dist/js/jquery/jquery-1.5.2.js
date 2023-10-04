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
     * Use o documento correto de acordo com o argumento
     * da janela (sandbox).
     */
    var document = window.document;

    /**
     *
     */
    var jQuery = (function()
    {
        /**
         * Defina uma cópia local do jQuery.
         */
        var jQuery = function(selector, context)
            {
                /**
                 * O objeto jQuery é, na verdade, apenas o construtor
                 * init 'aprimorado'.
                 */
                return new jQuery.fn.init(selector, context, rootjQuery);
            },

            /**
             * Mapear sobre jQuery em caso de substituição.
             */
            _jQuery = window.jQuery,

            /**
             * Mapeie o $ em caso de substituição.
             */
            _$ = window.$,

            /**
             * Uma referência central para o jQuery(document) raiz.
             */
            rootjQuery,

            /**
             * Uma maneira simples de verificar strings HTML ou
             * strings de ID (para as quais otimizamos).
             */
            quickExpr = /^(?:[^<]*(<[\w\W]+>)[^>]*$|#([\w\-]+)$)/,

            /**
             * Verifique se uma string contém um caractere que não
             * seja um espaço em branco.
             */
            rnotwhite = /\S/,

            /**
             * Usado para aparar espaços em branco.
             */
            trimLeft = /^\s+/,
            trimRight = /\s+$/,

            /**
             * Verifique os dígitos.
             */
            rdigit = /\d/,

            /**
             * Corresponde a uma tag independente.
             */
            rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>)?$/,

            /**
             * JSON RegExp.
             */
            rvalidchars = /^[\],:{}\s]*$/,
            rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
            rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
            rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,

            /**
             * Useragent RegExp.
             */
            rwebkit = /(webkit)[ \/]([\w.]+)/,
            ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/,
            rmsie = /(msie) ([\w.]+)/,
            rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/,

            /**
             * Mantenha uma string UserAgent para uso com jQuery.browser.
             */
            userAgent = navigator.userAgent,

            /**
             * Para combinar o mecanismo e a versão do navegador.
             */
            browserMatch,

            /**
             * O adiado usado no DOM pronto.
             */
            readyList,

            /**
             * O manipulador de eventos pronto.
             */
            DOMContentLoaded,

            /**
             * Salve uma referência para alguns métodos principais.
             */
            toString = Object.prototype.toString,
            hasOwn = Object.prototype.hasOwnProperty,
            push = Array.prototype.push,
            slice = Array.prototype.slice,
            trim = String.prototype.trim,
            indexOf = Array.prototype.indexOf,

            /**
             * [[Class]] -> type pars.
             */
            class2type = {};

        jQuery.fn = jQuery.prototype = {
            /**
             *
             */
            constructor: jQuery,

            /**
             *
             */
            init: function(selector, context, rootjQuery)
            {
                var match,
                    elem,
                    ret,
                    doc;

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
                 * O elemento do corpo existe apenas uma vez,
                 * otimize sua localização.
                 */
                if (selector === "body" && !context && document.body)
                {
                    this.context = document;
                    this[0] = document.body;
                    this.selector = "body";
                    this.length = 1;

                    return this;
                }

                /**
                 * Lidar com strings HTML.
                 */
                if (typeof selector === "string")
                {
                    /**
                     * Estamos lidando com uma string HTML ou um ID ?
                     */
                    match = quickExpr.exec(selector);

                    /**
                     * Verifique uma correspondência e se nenhum contexto
                     * foi especificado para #id.
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
                             * Se uma string única for passada e for uma tag
                             * única, faça um createElement e pule o resto.
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
                             * Verifique parentNode para capturar quando o
                             * Blackberry 4.6 retornar nós que não estão
                             * mais no documento #6963.
                             */
                            if (elem && elem.parentNode)
                            {
                                /**
                                 * Lide com o caso em que IE e Opera retornam
                                 * itens por nome em vez de ID.
                                 */
                                if (elem.id !== match[2])
                                {
                                    return rootjQuery.find(selector);
                                }

                                /**
                                 * Caso contrário, injetamos o elemento
                                 * diretamente no objeto jQuery.
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
                         *
                         * (que é apenas equivalente a: $(context).find(expr)
                         */
                    } else
                    {
                        return this.constructor(context).find(selector);
                    }

                    /**
                     * HANDLE: $(function).
                     *
                     * Atalho para documento pronto.
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
             * A versão atual do jQuery que está sendo usada.
             */
            jquery: "1.5.2",

            /**
             * O comprimento padrão de um objeto jQuery é 0.
             */
            length: 0,

            /**
             * O número de elementos contidos no conjunto de
             * elementos correspondentes.
             */
            size: function()
            {
                return this.length;
            },

            /**
             *
             */
            toArray: function()
            {
                return slice.call(this, 0);
            },

            /**
             * Obtenha o elemento Nth no conjunto de elementos
             * correspondentes OU Obtenha todo o elemento
             * correspondente definido como uma matriz limpa.
             */
            get: function(num)
            {
                return num == null ?
                    /**
                     * Retorna um vetor 'limpo'.
                     */
                    this.toArray() :
                    /**
                     * Retorne apenas o objeto.
                     */
                    (num < 0 ? this[this.length + num] : this[num]);
            },

            /**
             * Pegue uma matriz de elementos e coloque-a na pilha
             * (retornando o novo conjunto de elementos
             * correspondentes).
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
                 * Adicione o objeto antigo à pilha (como referência).
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
                 * Retorne o conjunto de elementos recém-formado.
                 */
                return ret;
            },

            /**
             * Execute um retorno de chamada para cada elemento no
             * conjunto correspondente. (Você pode semear os argumentos
             * com uma matriz de args, mas isso é usado apenas
             * internamente.).
             */
            each: function(callback, args)
            {
                return jQuery.each(this, callback, args);
            },

            /**
             *
             */
            ready: function(fn)
            {
                /**
                 * Anexe os ouvintes.
                 */
                jQuery.bindReady();

                /**
                 * Adicione o retorno de chamada.
                 */
                readyList.done(fn);

                /**
                 *
                 */
                return this;
            },

            /**
             *
             */
            eq: function(i)
            {
                return i === -1 ? this.slice(i) : this.slice(i, +i + 1);
            },

            /**
             *
             */
            first: function()
            {
                return this.eq(0);
            },

            /**
             *
             */
            last: function()
            {
                return this.eq(-1);
            },

            /**
             *
             */
            slice: function()
            {
                return this.pushStack(slice.apply(this, arguments), "slice", slice.call(arguments).join(","));
            },

            /**
             *
             */
            map: function(callback)
            {
                return this.pushStack(jQuery.map(this, function(elem, i)
                {
                    return callback.call(elem, i, elem);
                }));
            },

            /**
             *
             */
            end: function()
            {
                return this.prevObject || this.constructor(null);
            },

            /**
             * Apenas para uso interno.
             * Comporta-se como um método de Array, não como um método jQuery.
             */
            push: push,
            sort: [].sort,
            splice: [].splice
        };

        /**
         * Forneça à função init o protótipo jQuery para
         * instanciação posterior.
         */
        jQuery.fn.init.prototype = jQuery.fn;

        /**
         *
         */
        jQuery.extend = jQuery.fn.extend = function()
        {
            var options,
                name,
                src,
                copy,
                copyIsArray,
                clone,
                target = arguments[0] || {},
                i = 1,
                length = arguments.length,
                deep = false;

            /**
             * Lide com uma situação de cópia profunda.
             */
            if (typeof target === "boolean")
            {
                deep = target;
                target = arguments[1] || {};

                /**
                 * Pule o booleano e o alvo.
                 */
                i = 2;
            }

            /**
             * Lidar com o caso quando o destino é uma string ou algo
             * assim (possível em cópia profunda).
             */
            if (typeof target !== "object" && !jQuery.isFunction(target))
            {
                target = {};
            }

            /**
             * Extensão do próprio jQuery se apenas um argumento
             * para o passado.
             */
            if (length === i)
            {
                target = this;
                --i;
            }

            for (; i < length; i++)
            {
                /**
                 * Lide apenas com valores não nulos/indefinidos.
                 */
                if ((options = arguments[i]) != null)
                {
                    /**
                     * Estenda o objeto base.
                     */
                    for (name in options)
                    {
                        src = target[name];
                        copy = options[name];

                        /**
                         * Evite um loop sem fim.
                         */
                        if (target === copy)
                        {
                            continue;
                        }

                        /**
                         * Recurse se estivermos mesclando objetos simples
                         * ou arrays.
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
             * Retorna o objeto modificado.
             */
            return target;
        };

        jQuery.extend({
            noConflict: function(deep)
            {
                window.$ = _$;

                if (deep)
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
             * Um contador para rastrear quantos itens esperar antes
             * que o evento pronto seja acionado. Consulte #6781.
             */
            readyWait: 1,

            /**
             * Manuseie quando o DOM estiver pronto.
             */
            ready: function(wait)
            {
                /**
                 * Um terceiro está encaminhando o evento pronto.
                 */
                if (wait === true)
                {
                    jQuery.readyWait--;
                }

                /**
                 * Certifique-se de que o DOM ainda não esteja carregado.
                 */
                if (!jQuery.readyWait || (wait !== true && !jQuery.isReady))
                {
                    /**
                     * Certifique-se de que o corpo existe, pelo menos,
                     * caso o IE fique um pouco zeloso demais (bilhete nº 5443).
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
                     * Se um evento DOM Ready normal for acionado, diminua
                     * e aguarde, se necessário.
                     */
                    if (wait !== true && --jQuery.readyWait > 0)
                    {
                        return;
                    }

                    /**
                     * Se houver funções ligadas, para executar.
                     */
                    readyList.resolveWith(document, [jQuery]);

                    /**
                     * Acione quaisquer eventos prontos vinculados.
                     */
                    if (jQuery.fn.trigger)
                    {
                        jQuery(document).trigger("ready").unbind("ready");
                    }
                }
            },

            /**
             *
             */
            bindReady: function()
            {
                if (readyList)
                {
                    return;
                }

                readyList = jQuery._Deferred();

                /**
                 * Capturar casos em que $(document).ready() é chamado após
                 * o evento do navegador já ter ocorrido.
                 */
                if (document.readyState === "complete")
                {
                    /**
                     * Manipule-o de forma assíncrona para permitir que
                     * os scripts tenham a oportunidade de atrasar a
                     * preparação.
                     */
                    return setTimeout(jQuery.ready, 1);
                }

                /**
                 * Mozilla, Opera e webkit nightlies atualmente suportam
                 * este evento.
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
                     * Certifique-se de disparar antes do carregamento,
                     * talvez atrasado, mas seguro também para iframes.
                     */
                    document.attachEvent("onreadystatechange", DOMContentLoaded);

                    /**
                     * Um substituto para window.onload, que sempre funcionará.
                     */
                    window.attachEvent("onload", jQuery.ready);

                    /**
                     * Se for IE e não um quadro, verifique continuamente
                     * se o documento está pronto.
                     */
                    var toplevel = false;

                    try
                    {
                        toplevel = window.frameElement == null;
                    } catch (e)
                    {
                    }

                    if (document.documentElement.doScroll && toplevel)
                    {
                        doScrollCheck();
                    }
                }
            },

            /**
             * Consulte test/unit/core.js para obter detalhes sobre
             * isFunction. Desde a versão 1.3, métodos DOM e funções
             * como alerta não são suportados. Eles retornam false
             * no IE (#2968).
             */
            isFunction: function(obj)
            {
                return jQuery.type(obj) === "function";
            },

            /**
             *
             */
            isArray: Array.isArray || function(obj)
            {
                return jQuery.type(obj) === "array";
            },

            /**
             * Uma maneira grosseira de determinar se um objeto é
             * uma janela.
             */
            isWindow: function(obj)
            {
                return obj && typeof obj === "object" && "setInterval" in obj;
            },

            /**
             *
             */
            isNaN: function(obj)
            {
                return obj == null || !rdigit.test(obj) || isNaN(obj);
            },

            /**
             *
             */
            type: function(obj)
            {
                return obj == null ? String(obj) : class2type[toString.call(obj)] || "object";
            },

            /**
             *
             */
            isPlainObject: function(obj)
            {
                /**
                 * Deve ser um Objeto.
                 * Por causa do IE, também temos que verificar a presença
                 * da propriedade constructor. Certifique-se de que os nós
                 * DOM e os objetos da janela também não passem.
                 */
                if (!obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow(obj))
                {
                    return false;
                }

                /**
                 * A propriedade do construtor não deve ser Object.
                 */
                if (obj.constructor && !hasOwn.call(obj, "constructor") && !hasOwn.call(obj.constructor.prototype, "isPrototypeOf"))
                {
                    return false;
                }

                /**
                 * As propriedades próprias são enumeradas primeiro,
                 * portanto, para acelerar, se a última for própria,
                 * então todas as propriedades são próprias.
                 */
                var key;
                for (key in obj)
                {
                }

                return key === undefined || hasOwn.call(obj, key);
            },

            /**
             *
             */
            isEmptyObject: function(obj)
            {
                for (var name in obj)
                {
                    return false;
                }

                return true;
            },

            /**
             *
             */
            error: function(msg)
            {
                throw msg;
            },

            /**
             *
             */
            parseJSON: function(data)
            {
                if (typeof data !== "string" || !data)
                {
                    return null;
                }

                /**
                 * Certifique-se de que o espaço em branco inicial/final
                 * seja removido (o IE não pode lidar com isso).
                 */
                data = jQuery.trim(data);

                /**
                 * Certifique-se de que os dados recebidos sejam JSON reais.
                 * Lógica emprestada de http://json.org/json2.js.
                 */
                if (rvalidchars.test(data.replace(rvalidescape, "@").replace(rvalidtokens, "]").replace(rvalidbraces, "")))
                {
                    /**
                     * Tente usar o analisador JSON nativo primeiro.
                     */
                    return window.JSON && window.JSON.parse ? window.JSON.parse(data) : (new Function("return " + data))();
                } else
                {
                    jQuery.error("Invalid JSON: " + data);
                }
            },

            /**
             * Análise xml entre navegadores.
             * (xml & tmp usado internamente).
             */
            parseXML: function(data, xml, tmp)
            {
                if (window.DOMParser)
                {
                    /**
                     * Padrão.
                     */
                    tmp = new DOMParser();
                    xml = tmp.parseFromString(data, "text/xml");
                } else
                {
                    /**
                     * IE.
                     */
                    xml = new ActiveXObject("Microsoft.XMLDOM");
                    xml.async = "false";
                    xml.loadXML(data);
                }

                /**
                 *
                 */
                tmp = xml.documentElement;

                if (!tmp || !tmp.nodeName || tmp.nodeName === "parsererror")
                {
                    jQuery.error("Invalid XML: " + data);
                }

                return xml;
            },

            /**
             *
             */
            noop: function()
            {
            },

            /**
             * Avalia um script em um contexto global.
             */
            globalEval: function(data)
            {
                if (data && rnotwhite.test(data))
                {
                    var head = document.head || document.getElementsByTagName("head")[0] || document.documentElement,
                        script = document.createElement("script");

                    if (jQuery.support.scriptEval())
                    {
                        script.appendChild(document.createTextNode(data));
                    } else
                    {
                        script.text = data;
                    }

                    /**
                     * Use insertBefore em vez de appendChild para contornar
                     * um bug do IE6. Isso ocorre quando um nó base é usado
                     * (#2709).
                     */
                    head.insertBefore(script, head.firstChild);
                    head.removeChild(script);
                }
            },

            /**
             *
             */
            nodeName: function(elem, name)
            {
                return elem.nodeName && elem.nodeName.toUpperCase() === name.toUpperCase();
            },

            /**
             * args é apenas para uso interno.
             */
            each: function(object, callback, args)
            {
                var name,
                    i = 0,
                    length = object.length,
                    isObj = length === undefined || jQuery.isFunction(object);

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
                     * Um caso especial, rápido, para o uso mais comum de
                     * cada um.
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
                        for (var value = object[0]; i < length && callback.call(value, i, value) !== false; value = object[++i])
                        {
                        }
                    }
                }

                return object;
            },

            /**
             * Use a função nativa String.trim sempre que possível.
             */
            trim: trim ? function(text)
                {
                    return text == null ? "" : trim.call(text);
                } :
                /**
                 * Caso contrário, use nossa própria funcionalidade de corte.
                 */
                function(text)
                {
                    return text == null ? "" : text.toString().replace(trimLeft, "").replace(trimRight, "");
                },

            /**
             * resultados é apenas para uso interno.
             */
            makeArray: function(array, results)
            {
                var ret = results || [];

                if (array != null)
                {
                    /**
                     * A janela, strings (e funções) também têm 'length'.
                     * O tipo extra de verificação de função é para evitar
                     * travamentos no Safari 2 (consulte: #3039). Lógica
                     * ligeiramente ajustada para lidar com os problemas
                     * nº 6930 do Blackberry 4.7 RegExp.
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

            /**
             *
             */
            inArray: function(elem, array)
            {
                if (array.indexOf)
                {
                    return array.indexOf(elem);
                }

                for (var i = 0, length = array.length; i < length; i++)
                {
                    if (array[i] === elem)
                    {
                        return i;
                    }
                }

                return -1;
            },

            /**
             *
             */
            merge: function(first, second)
            {
                var i = first.length,
                    j = 0;

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

            /**
             *
             */
            grep: function(elems, callback, inv)
            {
                var ret = [],
                    retVal;

                inv = !!inv;

                /**
                 * Percorra o array, salvando apenas os itens que
                 * passarem pela função do validador.
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
                var ret = [],
                    value;

                /**
                 * Percorra a matriz, traduzindo cada um dos itens para
                 * seu novo valor (ou valores).
                 */
                for (var i = 0, length = elems.length; i < length; i++)
                {
                    value = callback(elems[i], i, arg);

                    if (value != null)
                    {
                        ret[ret.length] = value;
                    }
                }

                /**
                 * Nivele quaisquer arrays aninhados.
                 */
                return ret.concat.apply([], ret);
            },

            /**
             * Um contador GUID global para objetos.
             */
            guid: 1,

            /**
             *
             */
            proxy: function(fn, proxy, thisObject)
            {
                if (arguments.length === 2)
                {
                    if (typeof proxy === "string")
                    {
                        thisObject = fn;
                        fn = thisObject[proxy];
                        proxy = undefined;
                    } else if (proxy && !jQuery.isFunction(proxy))
                    {
                        thisObject = proxy;
                        proxy = undefined;
                    }
                }

                if (!proxy && fn)
                {
                    proxy = function()
                    {
                        return fn.apply(thisObject || this, arguments);
                    };
                }

                /**
                 * Defina o guid do manipulador exclusivo para o mesmo
                 * do manipulador original, para que possa ser removido.
                 */
                if (fn)
                {
                    proxy.guid = fn.guid = fn.guid || proxy.guid || jQuery.guid++;
                }

                /**
                 * Portanto, o proxy pode ser declarado como um argumento.
                 */
                return proxy;
            },

            /**
             * Método multifuncional para obter e definir valores
             * para uma coleção. O(s) valor(es) pode(m) ser
             * opcionalmente executado(s) se for uma função.
             */
            access: function(elems, key, value, exec, fn, pass)
            {
                var length = elems.length;

                /**
                 * Definindo muitos atributos.
                 */
                if (typeof key === "object")
                {
                    for (var k in key)
                    {
                        jQuery.access(elems, k, key[k], exec, fn, value);
                    }

                    return elems;
                }

                /**
                 * Definindo um atributo.
                 */
                if (value !== undefined)
                {
                    /**
                     * Opcionalmente, os valores de função são executados
                     * se exec for verdadeiro.
                     */
                    exec = !pass && exec && jQuery.isFunction(value);

                    for (var i = 0; i < length; i++)
                    {
                        fn(elems[i], key, exec ? value.call(elems[i], i, fn(elems[i], key)) : value, pass);
                    }

                    return elems;
                }

                /**
                 * Obtendo um atributo.
                 */
                return length ? fn(elems[0], key) : undefined;
            },

            /**
             *
             */
            now: function()
            {
                return (new Date()).getTime();
            },

            /**
             * O uso de jQuery.browser é desaprovado.
             * Mais detalhes: http://docs.jquery.com/Utilities/jQuery.browser.
             */
            uaMatch: function(ua)
            {
                ua = ua.toLowerCase();
                var match = rwebkit.exec(ua) || ropera.exec(ua) || rmsie.exec(ua) || ua.indexOf("compatible") < 0 && rmozilla.exec(ua) || [];

                return {
                    browser: match[1] || "",
                    version: match[2] || "0"
                };
            },

            /**
             *
             */
            sub: function()
            {
                function jQuerySubclass(selector, context)
                {
                    return new jQuerySubclass.fn.init(selector, context);
                }

                jQuery.extend(true, jQuerySubclass, this);
                jQuerySubclass.superclass = this;
                jQuerySubclass.fn = jQuerySubclass.prototype = this();
                jQuerySubclass.fn.constructor = jQuerySubclass;
                jQuerySubclass.subclass = this.subclass;
                jQuerySubclass.fn.init = function init(selector, context)
                {
                    if (context && context instanceof jQuery && !(context instanceof jQuerySubclass))
                    {
                        context = jQuerySubclass(context);
                    }

                    return jQuery.fn.init.call(this, selector, context, rootjQuerySubclass);
                };

                jQuerySubclass.fn.init.prototype = jQuerySubclass.fn;
                var rootjQuerySubclass = jQuerySubclass(document);

                return jQuerySubclass;
            },

            browser: {}
        });

        /**
         * Preencha o mapa class2type.
         */
        jQuery.each("Boolean Number String Function Array Date RegExp Object".split(" "), function(i, name)
        {
            class2type["[object " + name + "]"] = name.toLowerCase();
        });

        /**
         *
         */
        browserMatch = jQuery.uaMatch(userAgent);

        if (browserMatch.browser)
        {
            jQuery.browser[browserMatch.browser] = true;
            jQuery.browser.version = browserMatch.version;
        }

        /**
         * Obsoleto, use jQuery.browser.webkit em seu lugar.
         */
        if (jQuery.browser.webkit)
        {
            jQuery.browser.safari = true;
        }

        if (indexOf)
        {
            jQuery.inArray = function(elem, array)
            {
                return indexOf.call(array, elem);
            };
        }

        /**
         * O IE não corresponde a espaços sem quebra com \s.
         */
        if (rnotwhite.test("\xA0"))
        {
            trimLeft = /^[\s\xA0]+/;
            trimRight = /[\s\xA0]+$/;
        }

        /**
         * Todos os objetos jQuery devem apontar para eles.
         */
        rootjQuery = jQuery(document);

        /**
         * Funções de limpeza para o método de documento pronto.
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
                 * Certifique-se de que o corpo existe, pelo menos,
                 * caso o IE fique um pouco zeloso demais (bilhete nº 5443).
                 */
                if (document.readyState === "complete")
                {
                    document.detachEvent("onreadystatechange", DOMContentLoaded);
                    jQuery.ready();
                }
            };
        }

        /**
         * A verificação pronta do DOM para o Internet Explorer.
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
                 * http://javascript.nwbox.com/IEContentLoaded/.
                 */
                document.documentElement.doScroll("left");
            } catch (e)
            {
                setTimeout(doScrollCheck, 1);

                return;
            }

            /**
             * E executar quaisquer funções de espera.
             */
            jQuery.ready();
        }

        /**
         * Expor jQuery ao objeto global.
         */
        return jQuery;
    })();

    /**
     *
     */
    var
        /**
         * Métodos de promessa.
         */
        promiseMethods = "then done fail isResolved isRejected promise".split(" "),

        /**
         * Referência estática à fatia.
         */
        sliceDeferred = [].slice;

    /**
     *
     */
    jQuery.extend({
        /**
         * Crie um adiado simples (uma lista de retornos de chamada).
         */
        _Deferred: function()
        {
            /**
             *
             */
            var
                /**
                 * Lista de retornos de chamada.
                 */
                callbacks = [],

                /**
                 * stored [ context , args ].
                 */
                fired,

                /**
                 * Para evitar disparar quando já o faz.
                 */
                firing,

                /**
                 * Flag para saber se o diferido foi cancelado.
                 */
                cancelled,

                /**
                 * O próprio diferido.
                 */
                deferred = {
                    /**
                     * done( f1, f2, ...).
                     */
                    done: function()
                    {
                        if (!cancelled)
                        {
                            var args = arguments,
                                i,
                                length,
                                elem,
                                type,
                                _fired;

                            if (fired)
                            {
                                _fired = fired;
                                fired = 0;
                            }

                            for (i = 0, length = args.length; i < length; i++)
                            {
                                elem = args[i];
                                type = jQuery.type(elem);

                                if (type === "array")
                                {
                                    deferred.done.apply(deferred, elem);
                                } else if (type === "function")
                                {
                                    callbacks.push(elem);
                                }
                            }

                            if (_fired)
                            {
                                deferred.resolveWith(_fired[0], _fired[1]);
                            }
                        }

                        return this;
                    },

                    /**
                     * Resolver com determinado contexto e args.
                     */
                    resolveWith: function(context, args)
                    {
                        if (!cancelled && !fired && !firing)
                        {
                            /**
                             * Verifique se os argumentos estão disponíveis (#8421).
                             */
                            args = args || [];
                            firing = 1;

                            try
                            {
                                while (callbacks[0])
                                {
                                    callbacks.shift().apply(context, args);
                                }
                            } finally
                            {
                                fired = [context, args];
                                firing = 0;
                            }
                        }

                        return this;
                    },

                    /**
                     * Resolva com isso como contexto e argumentos dados.
                     */
                    resolve: function()
                    {
                        deferred.resolveWith(this, arguments);

                        return this;
                    },

                    /**
                     * Esse adiamento foi resolvido ?
                     */
                    isResolved: function()
                    {
                        return !!(firing || fired);
                    },

                    /**
                     * Cancelar.
                     */
                    cancel: function()
                    {
                        cancelled = 1;
                        callbacks = [];

                        return this;
                    }
                };

            return deferred;
        },

        /**
         * Adiado completo (lista de dois retornos de chamada).
         */
        Deferred: function(func)
        {
            var deferred = jQuery._Deferred(),
                failDeferred = jQuery._Deferred(),
                promise;

            /**
             * Adicione os métodos errorDeferred e, em seguida,
             * e a promessa.
             */
            jQuery.extend(deferred, {
                then: function(doneCallbacks, failCallbacks)
                {
                    deferred.done(doneCallbacks).fail(failCallbacks);

                    return this;
                },

                fail: failDeferred.done,
                rejectWith: failDeferred.resolveWith,
                reject: failDeferred.resolve,
                isRejected: failDeferred.isResolved,

                /**
                 * Obtenha uma promessa para este diferido.
                 * Se obj for fornecido, o aspecto de promessa será
                 * adicionado ao objeto.
                 */
                promise: function(obj)
                {
                    if (obj == null)
                    {
                        if (promise)
                        {
                            return promise;
                        }

                        promise = obj = {};
                    }

                    var i = promiseMethods.length;

                    while (i--)
                    {
                        obj[promiseMethods[i]] = deferred[promiseMethods[i]];
                    }

                    return obj;
                }
            });

            /**
             * Certifique-se de que apenas uma lista de retorno de
             * chamada será usada.
             */
            deferred.done(failDeferred.cancel).fail(deferred.cancel);

            /**
             * Desexpor cancelar.
             */
            delete deferred.cancel;

            /**
             * Chame a função fornecida, se houver.
             */
            if (func)
            {
                func.call(deferred, deferred);
            }

            return deferred;
        },

        /**
         * Auxiliar diferido.
         */
        when: function(firstParam)
        {
            var args = arguments,
                i = 0,
                length = args.length,
                count = length,
                deferred = length <= 1 && firstParam && jQuery.isFunction(firstParam.promise) ? firstParam : jQuery.Deferred();

            function resolveFunc(i)
            {
                return function(value)
                {
                    args[i] = arguments.length > 1 ? sliceDeferred.call(arguments, 0) : value;

                    if (!(--count))
                    {
                        /**
                         * Bug estranho em FF4:
                         * Os valores alterados no objeto de argumentos
                         * às vezes terminam como valores indefinidos fora
                         * do método $.when. A clonagem do objeto em uma
                         * nova matriz resolve o problema.
                         */
                        deferred.resolveWith(deferred, sliceDeferred.call(args, 0));
                    }
                };
            }

            if (length > 1)
            {
                for (; i < length; i++)
                {
                    if (args[i] && jQuery.isFunction(args[i].promise))
                    {
                        args[i].promise().then(resolveFunc(i), deferred.reject);
                    } else
                    {
                        --count;
                    }
                }

                if (!count)
                {
                    deferred.resolveWith(deferred, args);
                }
            } else if (deferred !== firstParam)
            {
                deferred.resolveWith(deferred, length ? [firstParam] : []);
            }

            return deferred.promise();
        }
    });

    /**
     *
     */
    (function()
    {
        /**
         *
         */
        jQuery.support = {};

        /**
         *
         */
        var div = document.createElement("div");
            div.style.display = "none";
            div.innerHTML = "   <link/><table></table><a href='/a' style='color:red;float:left;opacity:.55;'>a</a><input type='checkbox'/>";

        /**
         *
         */
        var all = div.getElementsByTagName("*"),
            a = div.getElementsByTagName("a")[0],
            select = document.createElement("select"),
            opt = select.appendChild(document.createElement("option")),
            input = div.getElementsByTagName("input")[0];

        /**
         * Não é possível obter suporte de teste básico.
         */
        if (!all || !all.length || !a)
        {
            return;
        }

        /**
         *
         */
        jQuery.support = {
            /**
             * O IE remove os espaços em branco iniciais quando
             * .innerHTML é usado.
             */
            leadingWhitespace: div.firstChild.nodeType === 3,

            /**
             * Certifique-se de que os elementos do corpo não sejam
             * inseridos automaticamente. O IE irá inseri-los em
             * tabelas vazias.
             */
            tbody: !div.getElementsByTagName("tbody").length,

            /**
             * Certifique-se de que os elementos do link sejam serializados
             * corretamente pelo innerHTML. Isso requer um elemento wrapper
             * no IE.
             */
            htmlSerialize: !!div.getElementsByTagName("link").length,

            /**
             * Obtenha as informações de estilo de getAttribute.
             * (IE usa .cssText em vez).
             */
            style: /red/.test(a.getAttribute("style")),

            /**
             * Certifique-se de que os URLs não sejam manipulados.
             * (IE normaliza por padrão).
             */
            hrefNormalized: a.getAttribute("href") === "/a",

            /**
             * Certifique-se de que a opacidade do elemento existe.
             * (O IE usa o filtro em vez disso). Use um regex para
             * solucionar um problema do WebKit. Consulte #5145.
             */
            opacity: /^0.55$/.test(a.style.opacity),

            /**
             * Verifique a existência do flutuador de estilo.
             * (IE usa styleFloat em vez de cssFloat).
             */
            cssFloat: !!a.style.cssFloat,

            /**
             * Certifique-se de que, se nenhum valor for especificado
             * para uma caixa de seleção, o padrão é "on".
             * (O padrão do WebKit é "" em vez disso).
             */
            checkOn: input.value === "on",

            /**
             * Certifique-se de que uma opção selecionada por padrão
             * tenha uma propriedade selecionada funcional. (O padrão
             * do WebKit é false em vez de true, IE também, se estiver
             * em um optgroup).
             */
            optSelected: opt.selected,

            /**
             * Será definido posteriormente.
             */
            deleteExpando: true,
            optDisabled: false,
            checkClone: false,
            noCloneEvent: true,
            noCloneChecked: true,
            boxModel: null,
            inlineBlockNeedsLayout: false,
            shrinkWrapBlocks: false,
            reliableHiddenOffsets: true,
            reliableMarginRight: true
        };

        /**
         *
         */
        input.checked = true;
        jQuery.support.noCloneChecked = input.cloneNode(true).checked;

        /**
         * Certifique-se de que as opções dentro das seleções
         * desabilitadas não estejam marcadas como desabilitadas.
         * (O WebKit os marca como desativados).
         */
        select.disabled = true;
        jQuery.support.optDisabled = !opt.disabled;

        /**
         *
         */
        var _scriptEval = null;

        /**
         *
         */
        jQuery.support.scriptEval = function()
        {
            if (_scriptEval === null)
            {
                var root = document.documentElement,
                    script = document.createElement("script"),
                    id = "script" + jQuery.now();

                /**
                 * Certifique-se de que a execução do código funcione
                 * injetando uma tag de script com appendChild/createTextNode.
                 * (O IE não oferece suporte a isso, falha e usa .text).
                 */
                try
                {
                    script.appendChild(document.createTextNode("window." + id + "=1;"));
                } catch (e)
                {
                }

                root.insertBefore(script, root.firstChild);

                if (window[id])
                {
                    _scriptEval = true;
                    delete window[id];
                } else
                {
                    _scriptEval = false;
                }

                root.removeChild(script);
            }

            return _scriptEval;
        };

        /**
         * Teste para ver se é possível excluir um expando de um
         * elemento. Falha no Internet Explorer.
         */
        try
        {
            delete div.test;
        } catch (e)
        {
            jQuery.support.deleteExpando = false;
        }

        if (!div.addEventListener && div.attachEvent && div.fireEvent)
        {
            div.attachEvent("onclick", function click()
            {
                /**
                 * A clonagem de um nó não deve copiar nenhum manipulador
                 * de eventos vinculado (o IE faz isso).
                 */
                jQuery.support.noCloneEvent = false;
                div.detachEvent("onclick", click);
            });

            div.cloneNode(true).fireEvent("onclick");
        }

        div = document.createElement("div");
        div.innerHTML = "<input type='radio' name='radiotest' checked='checked'/>";

        var fragment = document.createDocumentFragment();
            fragment.appendChild(div.firstChild);

        /**
         * O WebKit não clona o estado verificado corretamente
         * em fragmentos.
         */
        jQuery.support.checkClone = fragment.cloneNode(true).cloneNode(true).lastChild.checked;

        /**
         * Descubra se o modelo de caixa do W3C funciona conforme o
         * esperado. O corpo do documento deve existir antes que
         * possamos fazer isso.
         */
        jQuery(function()
        {
            var div = document.createElement("div"),
                body = document.getElementsByTagName("body")[0];

            /**
             * Documentos de conjunto de quadros sem corpo não devem
             * executar este código.
             */
            if (!body)
            {
                return;
            }

            div.style.width = div.style.paddingLeft = "1px";
            body.appendChild(div);
            jQuery.boxModel = jQuery.support.boxModel = div.offsetWidth === 2;

            if ("zoom" in div.style)
            {
                /**
                 * Verifique se os elementos de nível de bloco nativo
                 * agem como elementos de bloco inline ao definir sua
                 * exibição como 'inline' e fornecer layout a eles.
                 * (IE < 8 faz isso).
                 */
                div.style.display = "inline";
                div.style.zoom = 1;

                /**
                 *
                 */
                jQuery.support.inlineBlockNeedsLayout = div.offsetWidth === 2;

                /**
                 * Verifique se os elementos com layout encolhem seus
                 * filhos. (IE 6 faz isso).
                 */
                div.style.display = "";
                div.innerHTML = "<div style='width:4px;'></div>";

                /**
                 *
                 */
                jQuery.support.shrinkWrapBlocks = div.offsetWidth !== 2;
            }

            /**
             *
             */
            div.innerHTML = "<table><tr><td style='padding:0;border:0;display:none'></td><td>t</td></tr></table>";

            /**
             *
             */
            var tds = div.getElementsByTagName("td");

            /**
             * Verifique se as células da tabela ainda têm offsetWidth/Height
             * quando estão configuradas para `display: none` e se ainda
             * existem outras células da tabela visíveis em uma linha da
             * tabela; em caso afirmativo, offsetWidth/Height não são
             * confiáveis para uso ao determinar se um elemento foi
             * oculto diretamente usando `display: none` (ainda é
             * seguro usar deslocamentos se um elemento pai estiver
             * oculto; use óculos de segurança e consulte o bug #4512
             * para obter mais informações ). (apenas o IE 8 falha
             * neste teste).
             */
            jQuery.support.reliableHiddenOffsets = tds[0].offsetHeight === 0;
            tds[0].style.display = "";
            tds[1].style.display = "none";

            /**
             * Verifique se as células vazias da tabela ainda têm
             * offsetWidth/Height. (IE < 8 falha neste teste).
             */
            jQuery.support.reliableHiddenOffsets = jQuery.support.reliableHiddenOffsets && tds[0].offsetHeight === 0;

            /**
             *
             */
            div.innerHTML = "";

            /**
             * Verifique se div com largura explícita e sem margem
             * direita incorretamente é calculado com margem direita
             * com base na largura do contêiner. Para obter mais
             * informações, consulte o bug #3333. Falha no WebKit
             * antes das noites de fevereiro de 2011. WebKit Bug
             * 13343 - getComputedStyle retorna valor errado para
             * margem direita.
             */
            if (document.defaultView && document.defaultView.getComputedStyle)
            {
                div.style.width = "1px";
                div.style.marginRight = "0";
                jQuery.support.reliableMarginRight = (parseInt(document.defaultView.getComputedStyle(div, null).marginRight, 10) || 0) === 0;
            }

            body.removeChild(div).style.display = "none";
            div = tds = null;
        });

        /**
         *
         */
        var eventSupported = function(eventName)
        {
            var el = document.createElement("div");
                eventName = "on" + eventName;

            /**
             * Nós nos preocupamos apenas com o caso em que sistemas
             * de eventos não padrão são usados, ou seja, no IE. O
             * curto-circuito aqui nos ajuda a evitar uma chamada
             * de avaliação (em setAttribute) que pode fazer com que
             * o CSP enlouqueça.
             *
             * Consulte: https://developer.mozilla.org/en/Security/CSP.
             */
            if (!el.attachEvent)
            {
                return true;
            }

            var isSupported = (eventName in el);

            if (!isSupported)
            {
                el.setAttribute(eventName, "return;");
                isSupported = typeof el[eventName] === "function";
            }

            return isSupported;
        };

        jQuery.support.submitBubbles = eventSupported("submit");
        jQuery.support.changeBubbles = eventSupported("change");

        /**
         * Liberar memória no IE.
         */
        div = all = a = null;
    })();

    /**
     *
     */
    var rbrace = /^(?:\{.*\}|\[.*\])$/;

    /**
     *
     */
    jQuery.extend({
        /**
         *
         */
        cache: {},

        /**
         * Por favor, use com cuidado.
         */
        uuid: 0,

        /**
         * Unique for each copy of jQuery on the page.
         * Non-digits removed to match rinlinejQuery.
         */
        expando: "jQuery" + (jQuery.fn.jquery + Math.random()).replace(/\D/g, ""),

        /**
         * Os elementos a seguir lançam exceções que não podem
         * ser capturadas se você tentar adicionar propriedades
         * expando a eles.
         */
        noData: {
            /**
             *
             */
            "embed": true,

            /**
             * Banir todos os objetos, exceto Flash (que
             * lida com expandos).
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

            var internalKey = jQuery.expando,
                getByName = typeof name === "string",
                thisCache,

                /**
                 * Temos que lidar com nós DOM e objetos JS de maneira
                 * diferente porque o IE6-7 não pode GC referenciar
                 * objetos corretamente através do limite DOM-JS.
                 */
                isNode = elem.nodeType,

                /**
                 * Somente nós DOM precisam do cache jQuery global;
                 * Os dados do objeto JS são anexados diretamente ao
                 * objeto para que o GC possa ocorrer automaticamente.
                 */
                cache = isNode ? jQuery.cache : elem,

                /**
                 * Apenas definir um ID para objetos JS se seu cache
                 * já existir permite que o código atue no mesmo caminho
                 * de um nó DOM sem cache.
                 */
                id = isNode ? elem[jQuery.expando] : elem[jQuery.expando] && jQuery.expando;

            /**
             * Evite fazer mais trabalho do que o necessário ao
             * tentar obter dados em um objeto que não possui
             * nenhum dado.
             */
            if ((!id || (pvt && id && !cache[id][internalKey])) && getByName && data === undefined)
            {
                return;
            }

            if (!id)
            {
                /**
                 * Somente nós DOM precisam de um novo ID exclusivo
                 * para cada elemento, pois seus dados acabam no
                 * cache global.
                 */
                if (isNode)
                {
                    elem[jQuery.expando] = id = ++jQuery.uuid;
                } else
                {
                    id = jQuery.expando;
                }
            }

            if (!cache[id])
            {
                /**
                 *
                 */
                cache[id] = {};

                /**
                 * Questão: Este é um hack para 1.5 APENAS. Evita expor
                 * metadados jQuery em objetos JS simples quando o
                 * objeto é serializado usando JSON.stringify.
                 */
                if (!isNode)
                {
                    cache[id].toJSON = jQuery.noop;
                }
            }

            /**
             * Um objeto pode ser passado para jQuery.data em vez
             * de um par chave/valor; isso é copiado superficialmente
             * para o cache existente.
             */
            if (typeof name === "object" || typeof name === "function")
            {
                if (pvt)
                {
                    cache[id][internalKey] = jQuery.extend(cache[id][internalKey], name);
                } else
                {
                    cache[id] = jQuery.extend(cache[id], name);
                }
            }

            thisCache = cache[id];

            /**
             * Os dados internos do jQuery são armazenados em um
             * objeto separado dentro do cache de dados do objeto
             * para evitar colisões importantes entre os dados
             * internos e os dados definidos pelo usuário.
             */
            if (pvt)
            {
                if (!thisCache[internalKey])
                {
                    thisCache[internalKey] = {};
                }

                thisCache = thisCache[internalKey];
            }

            if (data !== undefined)
            {
                thisCache[name] = data;
            }

            /**
             * Questão: Este é um hack para 1.5 APENAS. Ele será
             * removido em 1.6. Os usuários não devem tentar
             * inspecionar o objeto de eventos internos usando
             * jQuery.data, pois esse objeto de dados interno não
             * é documentado e está sujeito a alterações.
             */
            if (name === "events" && !thisCache[name])
            {
                return thisCache[internalKey] && thisCache[internalKey].events;
            }

            return getByName ? thisCache[name] : thisCache;
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

            var internalKey = jQuery.expando,
                /**
                 *
                 */
                isNode = elem.nodeType,

                /**
                 * Consulte jQuery.data para obter mais informações.
                 */
                cache = isNode ? jQuery.cache : elem,

                /**
                 * Consulte jQuery.data para obter mais informações.
                 */
                id = isNode ? elem[jQuery.expando] : jQuery.expando;

            /**
             * Se já não houver nenhuma entrada de cache para este
             * objeto, não há propósito em continuar.
             */
            if (!cache[id])
            {
                return;
            }

            if (name)
            {
                var thisCache = pvt ? cache[id][internalKey] : cache[id];

                if (thisCache)
                {
                    /**
                     *
                     */
                    delete thisCache[name];

                    /**
                     * Se não houver dados no cache, queremos continuar
                     * e deixar que o próprio objeto de cache seja
                     * destruído.
                     */
                    if (!isEmptyDataObject(thisCache))
                    {
                        return;
                    }
                }
            }

            /**
             * Consulte jQuery.data para obter mais informações.
             */
            if (pvt)
            {
                /**
                 *
                 */
                delete cache[id][internalKey];

                /**
                 * Não destrua o cache pai, a menos que o objeto de
                 * dados interno tenha sido a única coisa que restou
                 * nele.
                 */
                if (!isEmptyDataObject(cache[id]))
                {
                    return;
                }
            }

            /**
             *
             */
            var internalCache = cache[id][internalKey];

            /**
             * Os navegadores que falham na exclusão do expando
             * também se recusam a excluir expandos na janela,
             * mas permitirão isso em todos os outros objetos
             * JS; outros navegadores não se importam.
             */
            if (jQuery.support.deleteExpando || cache != window)
            {
                delete cache[id];
            } else
            {
                cache[id] = null;
            }

            /**
             * Destruímos todo o cache do usuário de uma vez porque
             * é mais rápido do que iterar por cada chave, mas
             * precisamos continuar a manter os dados internos,
             * caso existam.
             */
            if (internalCache)
            {
                /**
                 *
                 */
                cache[id] = {};

                /**
                 * Questão: Este é um hack para 1.5 APENAS. Evita expor
                 * metadados jQuery em objetos JS simples quando o
                 * objeto é serializado usando JSON.stringify.
                 */
                if (!isNode)
                {
                    cache[id].toJSON = jQuery.noop;
                }

                /**
                 *
                 */
                cache[id][internalKey] = internalCache;

                /**
                 * Caso contrário, precisamos eliminar o expando no nó
                 * para evitar pesquisas falsas no cache de entradas
                 * que não existem mais.
                 */
            } else if (isNode)
            {
                /**
                 * O IE não permite deletar as propriedades expando
                 * dos nodes, nem tem uma função removeAttribute nos
                 * nodes do Documento; devemos lidar com todos esses
                 * casos.
                 */
                if (jQuery.support.deleteExpando)
                {
                    delete elem[jQuery.expando];
                } else if (elem.removeAttribute)
                {
                    elem.removeAttribute(jQuery.expando);
                } else
                {
                    elem[jQuery.expando] = null;
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
         * Um método para determinar se um nó DOM pode lidar com
         * a expansão de dados.
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
            var data = null;

            if (typeof key === "undefined")
            {
                if (this.length)
                {
                    data = jQuery.data(this[0]);

                    if (this[0].nodeType === 1)
                    {
                        var attr = this[0].attributes,
                            name;

                        for (var i = 0, l = attr.length; i < l; i++)
                        {
                            name = attr[i].name;

                            if (name.indexOf("data-") === 0)
                            {
                                name = name.substr(5);
                                dataAttr(this[0], name, data[name]);
                            }
                        }
                    }
                }

                return data;
            } else if (typeof key === "object")
            {
                return this.each(function()
                {
                    jQuery.data(this, key);
                });
            }

            var parts = key.split(".");
                parts[1] = parts[1] ? "." + parts[1] : "";

            if (value === undefined)
            {
                data = this.triggerHandler("getData" + parts[1] + "!", [parts[0]]);

                /**
                 * Tente buscar quaisquer dados armazenados
                 * internamente primeiro.
                 */
                if (data === undefined && this.length)
                {
                    data = jQuery.data(this[0], key);
                    data = dataAttr(this[0], key, data);
                }

                return data === undefined && parts[1] ? this.data(parts[0]) : data;
            } else
            {
                return this.each(function()
                {
                    var $this = jQuery(this),
                        args = [parts[0], value];

                    $this.triggerHandler("setData" + parts[1] + "!", args);
                    jQuery.data(this, key, value);
                    $this.triggerHandler("changeData" + parts[1] + "!", args);
                });
            }
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
         * Se nada for encontrado internamente, tente buscar
         * quaisquer dados do atributo data-* do HTML5.
         */
        if (data === undefined && elem.nodeType === 1)
        {
            data = elem.getAttribute("data-" + key);

            if (typeof data === "string")
            {
                try
                {
                    data = data === "true" ? true : data === "false" ? false : data === "null" ? null : !jQuery.isNaN(data) ? parseFloat(data) : rbrace.test(data) ? jQuery.parseJSON(data) : data;
                } catch (e)
                {
                }

                /**
                 * Certifique-se de definir os dados para que não
                 * sejam alterados posteriormente.
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
     * Questão: Este é um hack para 1.5 SOMENTE para permitir que
     * objetos com uma única propriedade toJSON sejam considerados
     * objetos vazios; essa propriedade sempre existe para garantir
     * que JSON.stringify não exponha metadados internos.
     */
    function isEmptyDataObject(obj)
    {
        for (var name in obj)
        {
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
    jQuery.extend({
        /**
         *
         */
        queue: function(elem, type, data)
        {
            if (!elem)
            {
                return;
            }

            /**
             *
             */
            type = (type || "fx") + "queue";

            /**
             *
             */
            var q = jQuery._data(elem, type);

            /**
             * Acelere o desenfileiramento saindo rapidamente se
             * for apenas uma pesquisa.
             */
            if (!data)
            {
                return q || [];
            }

            if (!q || jQuery.isArray(data))
            {
                q = jQuery._data(elem, type, jQuery.makeArray(data));
            } else
            {
                q.push(data);
            }

            return q;
        },

        /**
         *
         */
        dequeue: function(elem, type)
        {
            type = type || "fx";

            var queue = jQuery.queue(elem, type),
                fn = queue.shift();

            /**
             * Se a fila fx for retirada da fila, sempre remova a
             * sentinela de progresso.
             */
            if (fn === "inprogress")
            {
                fn = queue.shift();
            }

            if (fn)
            {
                /**
                 * Adicione uma sentinela de progresso para evitar
                 * que a fila fx seja retirada automaticamente da
                 * fila.
                 */
                if (type === "fx")
                {
                    queue.unshift("inprogress");
                }

                fn.call(elem, function()
                {
                    jQuery.dequeue(elem, type);
                });
            }

            if (!queue.length)
            {
                jQuery.removeData(elem, type + "queue", true);
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
            if (typeof type !== "string")
            {
                data = type;
                type = "fx";
            }

            if (data === undefined)
            {
                return jQuery.queue(this[0], type);
            }

            return this.each(function(i)
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
                jQuery.dequeue(this, type);
            });
        },

        /**
         * Baseado no plugin de Clint Helfers, com permissão.
         * http://blindsignals.com/index.php/2009/07/jquery-delay/.
         */
        delay: function(time, type)
        {
            time = jQuery.fx ? jQuery.fx.speeds[time] || time : time;
            type = type || "fx";

            return this.queue(type, function()
            {
                var elem = this;
                setTimeout(function()
                {
                    jQuery.dequeue(elem, type);
                }, time);
            });
        },

        /**
         *
         */
        clearQueue: function(type)
        {
            return this.queue(type || "fx", []);
        }
    });

    /**
     *
     */
    var rclass = /[\n\t\r]/g,
        rspaces = /\s+/,
        rreturn = /\r/g,
        rspecialurl = /^(?:href|src|style)$/,
        rtype = /^(?:button|input)$/i,
        rfocusable = /^(?:button|input|object|select|textarea)$/i,
        rclickable = /^a(?:rea)?$/i,
        rradiocheck = /^(?:radio|checkbox)$/i;

    /**
     *
     */
    jQuery.props = {
        "for": "htmlFor",
        "class": "className",
        readonly: "readOnly",
        maxlength: "maxLength",
        cellspacing: "cellSpacing",
        rowspan: "rowSpan",
        colspan: "colSpan",
        tabindex: "tabIndex",
        usemap: "useMap",
        frameborder: "frameBorder"
    };

    /**
     *
     */
    jQuery.fn.extend({
        /**
         *
         */
        attr: function(name, value)
        {
            return jQuery.access(this, name, value, true, jQuery.attr);
        },

        /**
         *
         */
        removeAttr: function(name, fn)
        {
            return this.each(function()
            {
                jQuery.attr(this, name, "");

                if (this.nodeType === 1)
                {
                    this.removeAttribute(name);
                }
            });
        },

        /**
         *
         */
        addClass: function(value)
        {
            if (jQuery.isFunction(value))
            {
                return this.each(function(i)
                {
                    var self = jQuery(this);
                    self.addClass(value.call(this, i, self.attr("class")));
                });
            }

            if (value && typeof value === "string")
            {
                var classNames = (value || "").split(rspaces);

                for (var i = 0, l = this.length; i < l; i++)
                {
                    var elem = this[i];
                    if (elem.nodeType === 1)
                    {
                        if (!elem.className)
                        {
                            elem.className = value;
                        } else
                        {
                            var className = " " + elem.className + " ",
                                setClass = elem.className;

                            for (var c = 0, cl = classNames.length; c < cl; c++)
                            {
                                if (className.indexOf(" " + classNames[c] + " ") < 0)
                                {
                                    setClass += " " + classNames[c];
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
            if (jQuery.isFunction(value))
            {
                return this.each(function(i)
                {
                    var self = jQuery(this);
                    self.removeClass(value.call(this, i, self.attr("class")));
                });
            }

            if ((value && typeof value === "string") || value === undefined)
            {
                var classNames = (value || "").split(rspaces);

                for (var i = 0, l = this.length; i < l; i++)
                {
                    var elem = this[i];
                    if (elem.nodeType === 1 && elem.className)
                    {
                        if (value)
                        {
                            var className = (" " + elem.className + " ").replace(rclass, " ");

                            for (var c = 0, cl = classNames.length; c < cl; c++)
                            {
                                className = className.replace(" " + classNames[c] + " ", " ");
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
            var type = typeof value,
                isBool = typeof stateVal === "boolean";

            if (jQuery.isFunction(value))
            {
                return this.each(function(i)
                {
                    var self = jQuery(this);
                        self.toggleClass(value.call(this, i, self.attr("class"), stateVal), stateVal);
                });
            }

            return this.each(function()
            {
                if (type === "string")
                {
                    /**
                     * Alternar nomes de classes individuais.
                     */
                    var className,
                        i = 0,
                        self = jQuery(this),
                        state = stateVal,
                        classNames = value.split(rspaces);

                    while ((className = classNames[i++]))
                    {
                        /**
                         * Verifique cada className fornecido, lista
                         * separada por espaço.
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
                     * Alternar className inteiro.
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

            for (var i = 0, l = this.length; i < l; i++)
            {
                if ((" " + this[i].className + " ").replace(rclass, " ").indexOf(className) > -1)
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
            if (!arguments.length)
            {
                var elem = this[0];

                if (elem)
                {
                    if (jQuery.nodeName(elem, "option"))
                    {
                        /**
                         * attributes.value é indefinido no Blackberry
                         * 4.7, mas usa .value. Consulte #6932.
                         */
                        var val = elem.attributes.value;

                        return !val || val.specified ? elem.value : elem.text;
                    }

                    /**
                     * Precisamos lidar com caixas de seleção especiais.
                     */
                    if (jQuery.nodeName(elem, "select"))
                    {
                        var index = elem.selectedIndex,
                            values = [],
                            options = elem.options,
                            one = elem.type === "select-one";

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
                        for (var i = one ? index : 0, max = one ? index + 1 : options.length; i < max; i++)
                        {
                            var option = options[i];

                            /**
                             * Não retorne opções desabilitadas ou em um
                             * optgroup desabilitado.
                             */
                            if (option.selected && (jQuery.support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null) && (!option.parentNode.disabled || !jQuery.nodeName(option.parentNode, "optgroup")))
                            {
                                /**
                                 * Obtenha o valor específico para a opção.
                                 */
                                value = jQuery(option).val();

                                /**
                                 * Não precisamos de um array para um select.
                                 */
                                if (one)
                                {
                                    return value;
                                }

                                /**
                                 * Multi-Selects retornam um array.
                                 */
                                values.push(value);
                            }
                        }

                        /**
                         * Corrige o Bug #2551 -- select.val() quebrado
                         * no IE após form.reset().
                         */
                        if (one && !values.length && options.length)
                        {
                            return jQuery(options[index]).val();
                        }

                        return values;
                    }

                    /**
                     * Lide com o caso em que no Webkit "" é retornado
                     * em vez de "on" se um valor não for especificado.
                     */
                    if (rradiocheck.test(elem.type) && !jQuery.support.checkOn)
                    {
                        return elem.getAttribute("value") === null ? "on" : elem.value;
                    }

                    /**
                     * Todo o resto, apenas pegamos o valor.
                     */
                    return (elem.value || "").replace(rreturn, "");
                }

                return undefined;
            }

            /**
             *
             */
            var isFunction = jQuery.isFunction(value);

            /**
             *
             */
            return this.each(function(i)
            {
                var self = jQuery(this),
                    val = value;

                if (this.nodeType !== 1)
                {
                    return;
                }

                if (isFunction)
                {
                    val = value.call(this, i, self.val());
                }

                /**
                 * Tratar nulo/indefinido como ""; converter números
                 * em string.
                 */
                if (val == null)
                {
                    val = "";
                } else if (typeof val === "number")
                {
                    val += "";
                } else if (jQuery.isArray(val))
                {
                    val = jQuery.map(val, function(value)
                    {
                        return value == null ? "" : value + "";
                    });
                }

                if (jQuery.isArray(val) && rradiocheck.test(this.type))
                {
                    this.checked = jQuery.inArray(self.val(), val) >= 0;
                } else if (jQuery.nodeName(this, "select"))
                {
                    var values = jQuery.makeArray(val);

                    jQuery("option", this).each(function()
                    {
                        this.selected = jQuery.inArray(jQuery(this).val(), values) >= 0;
                    });

                    if (!values.length)
                    {
                        this.selectedIndex = -1;
                    }
                } else
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
            /**
             * Não obtenha/defina atributos em nós de texto,
             * comentário e atributo.
             */
            if (!elem || elem.nodeType === 3 || elem.nodeType === 8 || elem.nodeType === 2)
            {
                return undefined;
            }

            if (pass && name in jQuery.attrFn)
            {
                return jQuery(elem)[name](value);
            }

            var notxml = elem.nodeType !== 1 || !jQuery.isXMLDoc(elem),
                /**
                 * Se estamos definindo (ou recebendo).
                 */
                set = value !== undefined;

            /**
             * Tente normalizar/corrigir o nome.
             */
            name = notxml && jQuery.props[name] || name;

            /**
             * Apenas faça o seguinte se for um nó (mais rápido
             * para o estilo).
             */
            if (elem.nodeType === 1)
            {
                /**
                 * Esses atributos requerem tratamento especial.
                 */
                var special = rspecialurl.test(name);

                /**
                 * O Safari reporta erroneamente a propriedade
                 * selecionada padrão de uma opção. Acessar a
                 * propriedade selectedIndex do pai corrige
                 * isso.
                 */
                if (name === "selected" && !jQuery.support.optSelected)
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
                }

                /**
                 * Se aplicável, acesse o atributo via DOM 0 way 'in'
                 * as verificações falham no Blackberry 4.7 #6931.
                 */
                if ((name in elem || elem[name] !== undefined) && notxml && !special)
                {
                    if (set)
                    {
                        /**
                         * Não podemos permitir que a propriedade type
                         * seja alterada (uma vez que causa problemas
                         * no IE).
                         */
                        if (name === "type" && rtype.test(elem.nodeName) && elem.parentNode)
                        {
                            jQuery.error("type property can't be changed");
                        }

                        if (value === null)
                        {
                            if (elem.nodeType === 1)
                            {
                                elem.removeAttribute(name);
                            }
                        } else
                        {
                            elem[name] = value;
                        }
                    }

                    /**
                     * Navegadores indexam elementos por id/nome em
                     * formulários, dão prioridade aos atributos.
                     */
                    if (jQuery.nodeName(elem, "form") && elem.getAttributeNode(name))
                    {
                        return elem.getAttributeNode(name).nodeValue;
                    }

                    /**
                     * elem.tabIndex nem sempre retorna o valor correto
                     * quando não foi definido explicitamente.
                     * 
                     * http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/.
                     */
                    if (name === "tabIndex")
                    {
                        var attributeNode = elem.getAttributeNode("tabIndex");

                        return attributeNode && attributeNode.specified ? attributeNode.value : rfocusable.test(elem.nodeName) || rclickable.test(elem.nodeName) && elem.href ? 0 : undefined;
                    }

                    return elem[name];
                }

                if (!jQuery.support.style && notxml && name === "style")
                {
                    if (set)
                    {
                        elem.style.cssText = "" + value;
                    }

                    return elem.style.cssText;
                }

                if (set)
                {
                    /**
                     * Converta o valor em uma string (todos os
                     * navegadores fazem isso, exceto o IE), consulte
                     * #1070.
                     */
                    elem.setAttribute(name, "" + value);
                }

                /**
                 * Certifique-se de que os atributos ausentes retornem
                 * indefinidos. Blackberry 4.7 retorna "" de
                 * getAttribute #6938.
                 */
                if (!elem.attributes[name] && (elem.hasAttribute && !elem.hasAttribute(name)))
                {
                    return undefined;
                }

                var attr = !jQuery.support.hrefNormalized && notxml && special ?
                    /**
                     * Alguns atributos requerem uma chamada especial
                     * no IE.
                     */
                    elem.getAttribute(name, 2) : elem.getAttribute(name);

                /**
                 * Atributos inexistentes retornam nulo, normalizamos
                 * para indefinido.
                 */
                return attr === null ? undefined : attr;
            }

            /**
             * Lidar com tudo o que não é um nó de elemento DOM.
             */
            if (set)
            {
                elem[name] = value;
            }

            return elem[name];
        }
    });

    /**
     *
     */
    var rnamespaces = /\.(.*)$/,
        rformElems = /^(?:textarea|input|select)$/i,
        rperiod = /\./g,
        rspace = / /g,
        rescape = /[^\w\s.|`]/g,
        fcleanup = function(nm)
        {
            return nm.replace(rescape, "\\$&");
        };

    /**
     * Várias funções auxiliares usadas para gerenciar eventos.
     * Muitas das ideias por trás desse código se originaram da
     * biblioteca addEvent.
     */
    jQuery.event = {
        /**
         * Vincule um evento a um elemento.
         */
        add: function(elem, types, handler, data)
        {
            if (elem.nodeType === 3 || elem.nodeType === 8)
            {
                return;
            }

            /**
             * Questão :: Use um try/catch até que seja seguro
             * retirá-lo (provavelmente 1.6). Correção de
             * lançamento menor para bug #8018.
             */
            try
            {
                /**
                 * Por alguma razão, o IE tem problemas para passar
                 * o objeto janela, fazendo com que ele seja clonado
                 * no processo.
                 */
                if (jQuery.isWindow(elem) && (elem !== window && !elem.frameElement))
                {
                    elem = window;
                }
            } catch (e)
            {
            }

            /**
             *
             */
            if (handler === false)
            {
                handler = returnFalse;
            } else if (!handler)
            {
                /**
                 * Corrige o bug #7229.
                 */
                return;
            }

            /**
             *
             */
            var handleObjIn, handleObj;

            /**
             *
             */
            if (handler.handler)
            {
                handleObjIn = handler;
                handler = handleObjIn.handler;
            }

            /**
             * Certifique-se de que a função que está sendo executada
             * tenha um ID exclusivo.
             */
            if (!handler.guid)
            {
                handler.guid = jQuery.guid++;
            }

            /**
             * Inicie a estrutura de eventos do elemento.
             */
            var elemData = jQuery._data(elem);

            /**
             * Se nenhum elemData for encontrado, devemos estar
             * tentando vincular a um dos elementos noData
             * banidos.
             */
            if (!elemData)
            {
                return;
            }

            var events = elemData.events,
                eventHandle = elemData.handle;

            if (!events)
            {
                elemData.events = events = {};
            }

            if (!eventHandle)
            {
                elemData.handle = eventHandle = function(e)
                {
                    /**
                     * Manipula o segundo evento de um gatilho e quando
                     * um evento é chamado após o descarregamento de
                     * uma página.
                     */
                    return typeof jQuery !== "undefined" && jQuery.event.triggered !== e.type ? jQuery.event.handle.apply(eventHandle.elem, arguments) : undefined;
                };
            }

            /**
             * Adicione elem como uma propriedade da função handle.
             * Isso é para evitar um vazamento de memória com eventos
             * não nativos no IE.
             */
            eventHandle.elem = elem;

            /**
             * Manipule vários eventos separados por um espaço.
             *
             * jQuery(...).bind("mouseover mouseout", fn);
             */
            types = types.split(" ");

            var type,
                i = 0,
                namespaces;

            while ((type = types[i++]))
            {
                handleObj = handleObjIn ? jQuery.extend({}, handleObjIn) : {
                    handler: handler,
                    data: data
                };

                /**
                 * Manipuladores de eventos com namespace.
                 */
                if (type.indexOf(".") > -1)
                {
                    namespaces = type.split(".");
                    type = namespaces.shift();
                    handleObj.namespace = namespaces.slice(0).sort().join(".");
                } else
                {
                    namespaces = [];
                    handleObj.namespace = "";
                }

                /**
                 *
                 */
                handleObj.type = type;

                /**
                 *
                 */
                if (!handleObj.guid)
                {
                    handleObj.guid = handler.guid;
                }

                /**
                 * Obtenha a lista atual de funções associadas a este
                 * evento.
                 */
                var handlers = events[type],
                    special = jQuery.event.special[type] || {};

                /**
                 * Inicie a fila do manipulador de eventos.
                 */
                if (!handlers)
                {
                    handlers = events[type] = [];

                    /**
                     * Verifique se há um manipulador de eventos
                     * especial. Use apenas addEventListener/attachEvent
                     * se o manipulador de eventos especiais retornar
                     * false.
                     */
                    if (!special.setup || special.setup.call(elem, data, namespaces, eventHandle) === false)
                    {
                        /**
                         * Vincule o manipulador de eventos global ao
                         * elemento.
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
                 * Adicione a função à lista de manipuladores do
                 * elemento.
                 */
                handlers.push(handleObj);

                /**
                 * Acompanhe quais eventos foram usados, para
                 * acionamento global.
                 */
                jQuery.event.global[type] = true;
            }

            /**
             * Anule o elemento para evitar vazamentos de memória no
             * IE.
             */
            elem = null;
        },

        /**
         *
         */
        global: {},

        /**
         * Desanexar um evento ou conjunto de eventos de um
         * elemento.
         */
        remove: function(elem, types, handler, pos)
        {
            /**
             * Não faça eventos em nós de texto e comentários.
             */
            if (elem.nodeType === 3 || elem.nodeType === 8)
            {
                return;
            }

            if (handler === false)
            {
                handler = returnFalse;
            }

            var ret,
                type,
                fn,
                j,
                i = 0,
                all,
                namespaces,
                namespace,
                special,
                eventType,
                handleObj,
                origType,
                elemData = jQuery.hasData(elem) && jQuery._data(elem),
                events = elemData && elemData.events;

            if (!elemData || !events)
            {
                return;
            }

            /**
             * Tipos é, na verdade, um objeto de evento aqui.
             */
            if (types && types.type)
            {
                handler = types.handler;
                types = types.type;
            }

            /**
             * Desvincule todos os eventos do elemento.
             */
            if (!types || typeof types === "string" && types.charAt(0) === ".")
            {
                types = types || "";

                for (type in events)
                {
                    jQuery.event.remove(elem, type + types);
                }

                return;
            }

            /**
             * Manipule vários eventos separados por um espaço.
             * 
             * jQuery(...).unbind("mouseover mouseout", fn);
             */
            types = types.split(" ");

            /**
             *
             */
            while ((type = types[i++]))
            {
                origType = type;
                handleObj = null;
                all = type.indexOf(".") < 0;
                namespaces = [];

                if (!all)
                {
                    /**
                     * Manipuladores de eventos com namespace.
                     */
                    namespaces = type.split(".");
                    type = namespaces.shift();
                    namespace = new RegExp("(^|\\.)" + jQuery.map(namespaces.slice(0).sort(), fcleanup).join("\\.(?:.*\\.)?") + "(\\.|$)");
                }

                /**
                 *
                 */
                eventType = events[type];

                /**
                 *
                 */
                if (!eventType)
                {
                    continue;
                }

                /**
                 *
                 */
                if (!handler)
                {
                    for (j = 0; j < eventType.length; j++)
                    {
                        handleObj = eventType[j];

                        if (all || namespace.test(handleObj.namespace))
                        {
                            jQuery.event.remove(elem, origType, handleObj.handler, j);
                            eventType.splice(j--, 1);
                        }
                    }

                    continue;
                }

                /**
                 *
                 */
                special = jQuery.event.special[type] || {};

                /**
                 *
                 */
                for (j = pos || 0; j < eventType.length; j++)
                {
                    handleObj = eventType[j];

                    if (handler.guid === handleObj.guid)
                    {
                        /**
                         * Remova o manipulador fornecido para o tipo
                         * especificado.
                         */
                        if (all || namespace.test(handleObj.namespace))
                        {
                            if (pos == null)
                            {
                                eventType.splice(j--, 1);
                            }

                            if (special.remove)
                            {
                                special.remove.call(elem, handleObj);
                            }
                        }

                        if (pos != null)
                        {
                            break;
                        }
                    }
                }

                /**
                 * Remova o manipulador de eventos genérico se não
                 * existirem mais manipuladores.
                 */
                if (eventType.length === 0 || pos != null && eventType.length === 1)
                {
                    if (!special.teardown || special.teardown.call(elem, namespaces) === false)
                    {
                        jQuery.removeEvent(elem, type, elemData.handle);
                    }

                    ret = null;
                    delete events[type];
                }
            }

            /**
             * Remova o expanso se não for mais usado.
             */
            if (jQuery.isEmptyObject(events))
            {
                var handle = elemData.handle;

                if (handle)
                {
                    handle.elem = null;
                }

                delete elemData.events;
                delete elemData.handle;

                if (jQuery.isEmptyObject(elemData))
                {
                    jQuery.removeData(elem, undefined, true);
                }
            }
        },

        /**
         * O borbulhar é interno.
         * 
         * event, data, elem, bubbling.
         */
        trigger: function(event, data, elem)
        {
            /**
             * Objeto de evento ou tipo de evento.
             */
            var type = event.type || event,
                bubbling = arguments[3];

            if (!bubbling)
            {
                event = typeof event === "object" ?
                    /**
                     * Objeto jQuery.Event.
                     */
                    event[jQuery.expando] ? event :

                    /**
                     * Objecto literal.
                     */
                    jQuery.extend(jQuery.Event(type), event) :

                    /**
                     * Apenas o tipo de evento (string).
                     */
                    jQuery.Event(type);

                if (type.indexOf("!") >= 0)
                {
                    event.type = type = type.slice(0, -1);
                    event.exclusive = true;
                }

                /**
                 * Lidar com um gatilho global.
                 */
                if (!elem)
                {
                    /**
                     * Não coloque eventos personalizados em bolhas
                     * quando forem globais (para evitar muita
                     * sobrecarga).
                     */
                    event.stopPropagation();

                    /**
                     * Acione apenas se já tivermos vinculado um evento
                     * a ele.
                     */
                    if (jQuery.event.global[type])
                    {
                        /**
                         * XXX - Este código cheira terrível.
                         * event.js não deve inspecionar diretamente o
                         * cache de dados.
                         */
                        jQuery.each(jQuery.cache, function()
                        {
                            /**
                             * A variável internalKey é usada apenas
                             * para facilitar a localização e
                             * potencialmente alterar essas coisas mais
                             * tarde; atualmente ele apenas aponta para
                             * jQuery.expando.
                             */
                            var internalKey = jQuery.expando,
                                internalCache = this[internalKey];

                            if (internalCache && internalCache.events && internalCache.events[type])
                            {
                                jQuery.event.trigger(event, data, internalCache.handle.elem);
                            }
                        });
                    }
                }

                /**
                 * Lidar com o acionamento de um único elemento.
                 */

                /**
                 * Não faça eventos em nós de texto e comentários.
                 */
                if (!elem || elem.nodeType === 3 || elem.nodeType === 8)
                {
                    return undefined;
                }

                /**
                 * Limpe caso seja reutilizado.
                 */
                event.result = undefined;
                event.target = elem;

                /**
                 * Clone os dados de entrada, se houver.
                 */
                data = jQuery.makeArray(data);
                data.unshift(event);
            }

            /**
             *
             */
            event.currentTarget = elem;

            /**
             * Acione o evento, assume-se que "manipular" é uma função.
             */
            var handle = jQuery._data(elem, "handle");

            /**
             *
             */
            if (handle)
            {
                handle.apply(elem, data);
            }

            /**
             *
             */
            var parent = elem.parentNode || elem.ownerDocument;

            /**
             * Acione um script vinculado embutido.
             */
            try
            {
                if (!(elem && elem.nodeName && jQuery.noData[elem.nodeName.toLowerCase()]))
                {
                    if (elem["on" + type] && elem["on" + type].apply(elem, data) === false)
                    {
                        event.result = false;
                        event.preventDefault();
                    }
                }

                /**
                 * Evitar que o IE lance um erro para alguns elementos
                 * com alguns tipos de evento, veja #3533.
                 */
            } catch (inlineError)
            {
            }

            if (!event.isPropagationStopped() && parent)
            {
                jQuery.event.trigger(event, data, parent, true);
            } else if (!event.isDefaultPrevented())
            {
                var old,
                    target = event.target,
                    targetType = type.replace(rnamespaces, ""),
                    isClick = jQuery.nodeName(target, "a") && targetType === "click",
                    special = jQuery.event.special[targetType] || {};

                if ((!special._default || special._default.call(elem, event) === false) && !isClick && !(target && target.nodeName && jQuery.noData[target.nodeName.toLowerCase()]))
                {
                    try
                    {
                        if (target[targetType])
                        {
                            /**
                             * Certifique-se de que não reativamos
                             * acidentalmente os eventos onFOO.
                             */
                            old = target["on" + targetType];

                            if (old)
                            {
                                target["on" + targetType] = null;
                            }

                            jQuery.event.triggered = event.type;
                            target[targetType]();
                        }

                        /**
                         * Evitar que o IE lance um erro para alguns
                         * elementos com alguns tipos de evento, veja
                         * #3533.
                         */
                    } catch (triggerError)
                    {
                    }

                    if (old)
                    {
                        target["on" + targetType] = old;
                    }

                    jQuery.event.triggered = undefined;
                }
            }
        },

        /**
         *
         */
        handle: function(event)
        {
            var all,
                handlers,
                namespaces,
                namespace_re,
                events,
                namespace_sort = [],
                args = jQuery.makeArray(arguments);

            event = args[0] = jQuery.event.fix(event || window.event);
            event.currentTarget = this;

            /**
             * Manipuladores de eventos com namespace.
             */
            all = event.type.indexOf(".") < 0 && !event.exclusive;

            if (!all)
            {
                namespaces = event.type.split(".");
                event.type = namespaces.shift();
                namespace_sort = namespaces.slice(0).sort();
                namespace_re = new RegExp("(^|\\.)" + namespace_sort.join("\\.(?:.*\\.)?") + "(\\.|$)");
            }

            event.namespace = event.namespace || namespace_sort.join(".");
            events = jQuery._data(this, "events");
            handlers = (events || {})[event.type];

            if (events && handlers)
            {
                /**
                 * Clone os manipuladores para evitar a manipulação.
                 */
                handlers = handlers.slice(0);

                for (var j = 0, l = handlers.length; j < l; j++)
                {
                    var handleObj = handlers[j];

                    /**
                     * Filtre as funções por classe.
                     */
                    if (all || namespace_re.test(handleObj.namespace))
                    {
                        /**
                         * Passe uma referência à própria função do
                         * manipulador. Para que possamos removê-lo
                         * posteriormente.
                         */
                        event.handler = handleObj.handler;
                        event.data = handleObj.data;
                        event.handleObj = handleObj;

                        var ret = handleObj.handler.apply(this, args);
                        if (ret !== undefined)
                        {
                            event.result = ret;

                            if (ret === false)
                            {
                                event.preventDefault();
                                event.stopPropagation();
                            }
                        }

                        if (event.isImmediatePropagationStopped())
                        {
                            break;
                        }
                    }
                }
            }

            return event.result;
        },

        /**
         *
         */
        props: "altKey attrChange attrName bubbles button cancelable charCode clientX clientY ctrlKey currentTarget data detail eventPhase fromElement handler keyCode layerX layerY metaKey newValue offsetX offsetY pageX pageY prevValue relatedNode relatedTarget screenX screenY shiftKey srcElement target toElement view wheelDelta which".split(" "),

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
             * Armazene uma cópia do objeto de evento original e
             * "clone" para definir propriedades somente leitura.
             */
            var originalEvent = event;
                event = jQuery.Event(originalEvent);

            for (var i = this.props.length, prop; i;)
            {
                prop = this.props[--i];
                event[prop] = originalEvent[prop];
            }

            /**
             * Corrija a propriedade de destino, se necessário.
             */
            if (!event.target)
            {
                /**
                 * Correções #1925 onde srcElement também não pode
                 * ser definido.
                 */
                event.target = event.srcElement || document;
            }

            /**
             * Verifique se o destino é um textnode (safari).
             */
            if (event.target.nodeType === 3)
            {
                event.target = event.target.parentNode;
            }

            /**
             * Adicione relatedTarget, se necessário.
             */
            if (!event.relatedTarget && event.fromElement)
            {
                event.relatedTarget = event.fromElement === event.target ? event.toElement : event.fromElement;
            }

            /**
             * Calcule a pageX/Y se estiver ausente e o clientX/Y
             * disponível.
             */
            if (event.pageX == null && event.clientX != null)
            {
                var doc = document.documentElement,
                    body = document.body;

                event.pageX = event.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
                event.pageY = event.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc && doc.clientTop || body && body.clientTop || 0);
            }

            /**
             * Adicione which para eventos-chave.
             */
            if (event.which == null && (event.charCode != null || event.keyCode != null))
            {
                event.which = event.charCode != null ? event.charCode : event.keyCode;
            }

            /**
             * Adicione metaKey a navegadores não Mac (use ctrl para
             * PCs e Meta para Macs).
             */
            if (!event.metaKey && event.ctrlKey)
            {
                event.metaKey = event.ctrlKey;
            }

            /**
             * Adicione qual para clicar: 1 === left; 2 === middle; 3 === right.
             * Observação: botão não é normalizado, então não o use.
             */
            if (!event.which && event.button !== undefined)
            {
                event.which = (event.button & 1 ? 1 : (event.button & 2 ? 3 : (event.button & 4 ? 2 : 0)));
            }

            return event;
        },

        /**
         * Obsoleto, use jQuery.guid em seu lugar.
         */
        guid: 1E8,

        /**
         * Obsoleto, use jQuery.proxy em vez disso.
         */
        proxy: jQuery.proxy,

        /**
         *
         */
        special: {
            /**
             *
             */
            ready: {
                /**
                 * Certifique-se de que o evento pronto esteja
                 * configurado.
                 */
                setup: jQuery.bindReady,
                teardown: jQuery.noop
            },

            /**
             *
             */
            live: {
                /**
                 *
                 */
                add: function(handleObj)
                {
                    jQuery.event.add(this, liveConvert(handleObj.origType, handleObj.selector), jQuery.extend({}, handleObj, {
                        handler: liveHandler,
                        guid: handleObj.handler.guid
                    }));
                },

                /**
                 *
                 */
                remove: function(handleObj)
                {
                    jQuery.event.remove(this, liveConvert(handleObj.origType, handleObj.selector), handleObj);
                }
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
                     * Queremos apenas fazer este caso especial no
                     * Windows.
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
        }
    };

    /**
     *
     */
    jQuery.removeEvent = document.removeEventListener ? function(elem, type, handle)
    {
        if (elem.removeEventListener)
        {
            elem.removeEventListener(type, handle, false);
        }
    } : function(elem, type, handle)
    {
        if (elem.detachEvent)
        {
            elem.detachEvent("on" + type, handle);
        }
    };

    /**
     *
     */
    jQuery.Event = function(src) {
        /**
         * Permita a instanciação sem a palavra-chave 'new'.
         */
        if (!this.preventDefault)
        {
            return new jQuery.Event(src);
        }

        /**
         * Objeto de evento.
         */
        if (src && src.type)
        {
            this.originalEvent = src;
            this.type = src.type;

            /**
             * Os eventos que aparecem no documento podem ter sido
             * marcados como evitados por um manipulador mais abaixo
             * na árvore; refletir o valor correto.
             */
            this.isDefaultPrevented = (src.defaultPrevented || src.returnValue === false || src.getPreventDefault && src.getPreventDefault()) ? returnTrue : returnFalse;

            /**
             * Tipo de evento.
             */
        } else
        {
            this.type = src;
        }

        /**
         * timeStamp é buggy para alguns eventos no Firefox(#3843).
         * Portanto, não dependeremos do valor nativo.
         */
        this.timeStamp = jQuery.now();

        /**
         * Marque-o como corrigido.
         */
        this[jQuery.expando] = true;
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
     * 
     * http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html.
     */
    jQuery.Event.prototype = {
        /**
         *
         */
        preventDefault: function() {
            this.isDefaultPrevented = returnTrue;
            var e = this.originalEvent;

            if (!e)
            {
                return;
            }

            /**
             * Se preventDefault existir, execute-o no evento original.
             */
            if (e.preventDefault)
            {
                e.preventDefault();

                /**
                 * Caso contrário, defina a propriedade returnValue
                 * do evento original como false (IE).
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
             * Se stopPropagation existir, execute-o no evento
             * original.
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
     * Verifica se um evento ocorreu em um elemento dentro de outro
     * elemento. Usado em manipuladores jQuery.event.special.mouseenter
     * e mouseleave.
     */
    var withinElement = function(event)
    {
            /**
             * Verifique se mouse(over|out) ainda está dentro do mesmo
             * elemento pai.
             */
            var parent = event.relatedTarget;

            /**
             * Às vezes, o Firefox atribui relatedTarget um elemento
             * XUL do qual não podemos acessar a propriedade
             * parentNode.
             */
            try
            {
                /**
                 * O Chrome faz algo semelhante, a propriedade parentNode
                 * pode ser acessada, mas é nula.
                 */
                if (parent && parent !== document && !parent.parentNode)
                {
                    return;
                }

                /**
                 * Atravesse a árvore.
                 */
                while (parent && parent !== this)
                {
                    parent = parent.parentNode;
                }

                if (parent !== this)
                {
                    /**
                     * Defina o tipo de evento correto.
                     */
                    event.type = event.data;

                    /**
                     * handle evento se, na verdade, apenas passarmos o
                     * mouse sobre um não subelemento.
                     */
                    jQuery.event.handle.apply(this, arguments);
                }

                /**
                 * Assumindo que deixamos o elemento, já que provavelmente
                 * passamos o mouse sobre um elemento xul.
                 */
            } catch (e)
            {
            }
        },

        /**
         * No caso de delegação de evento, só precisamos renomear o
         * event.type, liveHandler cuidará do resto.
         */
        delegate = function(event)
        {
            event.type = event.data;
            jQuery.event.handle.apply(this, arguments);
        };

    /**
     * Crie eventos mouseenter e mouseleave.
     */
    jQuery.each({
        mouseenter: "mouseover",
        mouseleave: "mouseout"
    }, function(orig, fix)
    {
        jQuery.event.special[orig] = {
            /**
             *
             */
            setup: function(data)
            {
                jQuery.event.add(this, fix, data && data.selector ? delegate : withinElement, orig);
            },

            /**
             *
             */
            teardown: function(data)
            {
                jQuery.event.remove(this, fix, data && data.selector ? delegate : withinElement);
            }
        };
    });

    /**
     * Enviar delegação.
     */
    if (!jQuery.support.submitBubbles) {
        jQuery.event.special.submit = {
            /**
             *
             */
            setup: function(data, namespaces)
            {
                if (this.nodeName && this.nodeName.toLowerCase() !== "form")
                {
                    jQuery.event.add(this, "click.specialSubmit", function(e)
                    {
                        var elem = e.target,
                            type = elem.type;

                        if ((type === "submit" || type === "image") && jQuery(elem).closest("form").length)
                        {
                            trigger("submit", this, arguments);
                        }
                    });

                    jQuery.event.add(this, "keypress.specialSubmit", function(e)
                    {
                        var elem = e.target,
                            type = elem.type;

                        if ((type === "text" || type === "password") && jQuery(elem).closest("form").length && e.keyCode === 13)
                        {
                            trigger("submit", this, arguments);
                        }
                    });
                } else
                {
                    return false;
                }
            },

            /**
             *
             */
            teardown: function(namespaces)
            {
                jQuery.event.remove(this, ".specialSubmit");
            }
        };
    }

    /**
     * Delegação de mudança, acontece aqui, então temos um
     * vínculo.
     */
    if (!jQuery.support.changeBubbles)
    {
        var changeFilters,
            getVal = function(elem)
            {
                var type = elem.type,
                    val = elem.value;

                if (type === "radio" || type === "checkbox")
                {
                    val = elem.checked;
                } else if (type === "select-multiple")
                {
                    val = elem.selectedIndex > -1 ? jQuery.map(elem.options, function(elem)
                    {
                        return elem.selected;
                    }).join("-") : "";
                } else if (elem.nodeName.toLowerCase() === "select")
                {
                    val = elem.selectedIndex;
                }

                return val;
            },

            testChange = function testChange(e)
            {
                var elem = e.target,
                    data,
                    val;

                if (!rformElems.test(elem.nodeName) || elem.readOnly)
                {
                    return;
                }

                data = jQuery._data(elem, "_change_data");
                val = getVal(elem);

                /**
                 * Os dados atuais também serão recuperados por
                 * beforeactivate.
                 */
                if (e.type !== "focusout" || elem.type !== "radio")
                {
                    jQuery._data(elem, "_change_data", val);
                }

                if (data === undefined || val === data)
                {
                    return;
                }

                if (data != null || val)
                {
                    e.type = "change";
                    e.liveFired = undefined;
                    jQuery.event.trigger(e, arguments[1], elem);
                }
            };

        jQuery.event.special.change = {
            filters: {
                focusout: testChange,
                beforedeactivate: testChange,

                /**
                 *
                 */
                click: function(e)
                {
                    var elem = e.target,
                        type = elem.type;

                    if (type === "radio" || type === "checkbox" || elem.nodeName.toLowerCase() === "select")
                    {
                        testChange.call(this, e);
                    }
                },

                /**
                 * A alteração deve ser chamada antes do envio.
                 * Keydown será chamado antes do pressionamento de
                 * tecla, que é usado na delegação de envio de evento.
                 */
                keydown: function(e)
                {
                    var elem = e.target,
                        type = elem.type;

                    if ((e.keyCode === 13 && elem.nodeName.toLowerCase() !== "textarea") || (e.keyCode === 32 && (type === "checkbox" || type === "radio")) || type === "select-multiple")
                    {
                        testChange.call(this, e);
                    }
                },

                /**
                 * Beforeactivate acontece também antes que o elemento
                 * anterior seja desfocado com este evento, você não
                 * pode acionar um evento de alteração, mas pode
                 * armazenar informações.
                 */
                beforeactivate: function(e)
                {
                    var elem = e.target;

                    jQuery._data(elem, "_change_data", getVal(elem));
                }
            },

            /**
             *
             */
            setup: function(data, namespaces)
            {
                if (this.type === "file")
                {
                    return false;
                }

                for (var type in changeFilters)
                {
                    jQuery.event.add(this, type + ".specialChange", changeFilters[type]);
                }

                return rformElems.test(this.nodeName);
            },

            /**
             *
             */
            teardown: function(namespaces)
            {
                jQuery.event.remove(this, ".specialChange");

                return rformElems.test(this.nodeName);
            }
        };

        /**
         *
         */
        changeFilters = jQuery.event.special.change.filters;

        /**
         * Manuseio quando a entrada é .focus()'d.
         */
        changeFilters.focus = changeFilters.beforeactivate;
    }

    /**
     *
     */
    function trigger(type, elem, args)
    {
        /**
         * Pega carona em um evento doador para simular outro
         * diferente. Falso originalEvent para evitar stopPropagation
         * do doador, mas se o evento simulado impedir o padrão,
         * faremos o mesmo no doador. Não passe argumentos ou
         * lembre-se de liveFired; eles se aplicam ao evento
         * doador.
         */
        var event = jQuery.extend({}, args[0]);
            event.type = type;
            event.originalEvent = {};
            event.liveFired = undefined;

        jQuery.event.handle.call(elem, event);

        if (event.isDefaultPrevented())
        {
            args[0].preventDefault();
        }
    }

    /**
     * Crie eventos de foco e desfoque "bubbling".
     */
    if (document.addEventListener)
    {
        jQuery.each({
            focus: "focusin",
            blur: "focusout"
        }, function(orig, fix)
        {
            /**
             * Anexe um único manipulador de captura enquanto alguém
             * deseja focalizar/desfocar.
             */
            var attaches = 0;

            /**
             *
             */
            jQuery.event.special[fix] = {
                /**
                 *
                 */
                setup: function()
                {
                    if (attaches++ === 0)
                    {
                        document.addEventListener(orig, handler, true);
                    }
                },

                /**
                 *
                 */
                teardown: function()
                {
                    if (--attaches === 0)
                    {
                        document.removeEventListener(orig, handler, true);
                    }
                }
            };

            /**
             *
             */
            function handler(donor)
            {
                /**
                 * O evento doador é sempre nativo; conserte-o e mude
                 * seu tipo. Deixe o manipulador de foco/saída cancelar
                 * o evento de foco/desfoque do doador.
                 */
                var e = jQuery.event.fix(donor);
                    e.type = fix;
                    e.originalEvent = {};

                jQuery.event.trigger(e, null, e.target);

                if (e.isDefaultPrevented())
                {
                    donor.preventDefault();
                }
            }
        });
    }

    /**
     *
     */
    jQuery.each(["bind", "one"], function(i, name)
    {
        jQuery.fn[name] = function(type, data, fn)
        {
            /**
             * Lidar com literais de objeto.
             */
            if (typeof type === "object")
            {
                for (var key in type)
                {
                    this[name](key, data, type[key], fn);
                }

                return this;
            }

            if (jQuery.isFunction(data) || data === false)
            {
                fn = data;
                data = undefined;
            }

            var handler = name === "one" ? jQuery.proxy(fn, function(event)
            {
                jQuery(this).unbind(event, handler);

                return fn.apply(this, arguments);
            }) : fn;

            if (type === "unload" && name !== "one")
            {
                this.one(type, data, fn);
            } else
            {
                for (var i = 0, l = this.length; i < l; i++)
                {
                    jQuery.event.add(this[i], type, handler, data);
                }
            }

            return this;
        };
    });

    /**
     *
     */
    jQuery.fn.extend({
        /**
         *
         */
        unbind: function(type, fn)
        {
            /**
             * Lidar com literais de objeto.
             */
            if (typeof type === "object" && !type.preventDefault)
            {
                for (var key in type)
                {
                    this.unbind(key, type[key]);
                }
            } else
            {
                for (var i = 0, l = this.length; i < l; i++)
                {
                    jQuery.event.remove(this[i], type, fn);
                }
            }

            return this;
        },

        /**
         *
         */
        delegate: function(selector, types, data, fn)
        {
            return this.live(types, data, fn, selector);
        },

        /**
         *
         */
        undelegate: function(selector, types, fn)
        {
            if (arguments.length === 0)
            {
                return this.unbind("live");
            } else
            {
                return this.die(types, null, fn, selector);
            }
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
                var event = jQuery.Event(type);
                    event.preventDefault();
                    event.stopPropagation();

                jQuery.event.trigger(event, data, this[0]);

                return event.result;
            }
        },

        /**
         *
         */
        toggle: function(fn)
        {
            /**
             * Salve a referência aos argumentos para acesso no
             * fechamento.
             */
            var args = arguments,
                i = 1;

            /**
             * Vincule todas as funções, para que qualquer uma
             * delas possa desvincular esse manipulador de
             * cliques.
             */
            while (i < args.length)
            {
                jQuery.proxy(fn, args[i++]);
            }

            return this.click(jQuery.proxy(fn, function(event)
            {
                /**
                 * Descubra qual função executar.
                 */
                var lastToggle = (jQuery._data(this, "lastToggle" + fn.guid) || 0) % i;

                /**
                 *
                 */
                jQuery._data(this, "lastToggle" + fn.guid, lastToggle + 1);

                /**
                 * Certifique-se de que os cliques param.
                 */
                event.preventDefault();

                /**
                 * E executar a função.
                 */
                return args[lastToggle].apply(this, arguments) || false;
            }));
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
    var liveMap = {
        focus: "focusin",
        blur: "focusout",
        mouseenter: "mouseover",
        mouseleave: "mouseout"
    };

    /**
     *
     */
    jQuery.each(["live", "die"], function(i, name)
    {
        /**
         * origSelector - Somente para uso interno.
         */
        jQuery.fn[name] = function(types, data, fn, origSelector)
        {
            var type,
                i = 0,
                match,
                namespaces,
                preType,
                selector = origSelector || this.selector,
                context = origSelector ? this : jQuery(this.context);

            if (typeof types === "object" && !types.preventDefault)
            {
                for (var key in types)
                {
                    context[name](key, data, types[key], selector);
                }

                return this;
            }

            if (jQuery.isFunction(data))
            {
                fn = data;
                data = undefined;
            }

            types = (types || "").split(" ");

            while ((type = types[i++]) != null)
            {
                match = rnamespaces.exec(type);
                namespaces = "";

                if (match)
                {
                    namespaces = match[0];
                    type = type.replace(rnamespaces, "");
                }

                if (type === "hover")
                {
                    types.push("mouseenter" + namespaces, "mouseleave" + namespaces);

                    continue;
                }

                preType = type;
                if (type === "focus" || type === "blur")
                {
                    types.push(liveMap[type] + namespaces);
                    type = type + namespaces;
                } else
                {
                    type = (liveMap[type] || type) + namespaces;
                }

                if (name === "live")
                {
                    /**
                     * Vincular manipulador ao vivo.
                     */
                    for (var j = 0, l = context.length; j < l; j++)
                    {
                        jQuery.event.add(context[j], "live." + liveConvert(type, selector), {
                            data: data,
                            selector: selector,
                            handler: fn,
                            origType: type,
                            origHandler: fn,
                            preType: preType
                        });
                    }
                } else
                {
                    /**
                     * Desvincule o manipulador ao vivo.
                     */
                    context.unbind("live." + liveConvert(type, selector), fn);
                }
            }

            return this;
        };
    });

    /**
     *
     */
    function liveHandler(event)
    {
        var stop,
            maxLevel,
            related,
            match,
            handleObj,
            elem,
            j,
            i,
            l,
            data,
            close,
            namespace,
            ret,
            elems = [],
            selectors = [],
            events = jQuery._data(this, "events");

        /**
         * Certifique-se de evitar bolhas de cliques não esquerdos
         * no Firefox (#3861) e elementos desabilitados no IE
         * (#6911).
         */
        if (event.liveFired === this || !events || !events.live || event.target.disabled || event.button && event.type === "click")
        {
            return;
        }

        if (event.namespace)
        {
            namespace = new RegExp("(^|\\.)" + event.namespace.split(".").join("\\.(?:.*\\.)?") + "(\\.|$)");
        }

        event.liveFired = this;
        var live = events.live.slice(0);

        for (j = 0; j < live.length; j++)
        {
            handleObj = live[j];
            if (handleObj.origType.replace(rnamespaces, "") === event.type)
            {
                selectors.push(handleObj.selector);
            } else
            {
                live.splice(j--, 1);
            }
        }

        match = jQuery(event.target).closest(selectors, event.currentTarget);

        for (i = 0, l = match.length; i < l; i++)
        {
            close = match[i];
            for (j = 0; j < live.length; j++)
            {
                handleObj = live[j];
                if (close.selector === handleObj.selector && (!namespace || namespace.test(handleObj.namespace)) && !close.elem.disabled)
                {
                    elem = close.elem;
                    related = null;

                    /**
                     * Esses dois eventos requerem verificação
                     * adicional.
                     */
                    if (handleObj.preType === "mouseenter" || handleObj.preType === "mouseleave")
                    {
                        event.type = handleObj.preType;
                        related = jQuery(event.relatedTarget).closest(handleObj.selector)[0];
                    }

                    if (!related || related !== elem)
                    {
                        elems.push({
                            elem: elem,
                            handleObj: handleObj,
                            level: close.level
                        });
                    }
                }
            }
        }

        for (i = 0, l = elems.length; i < l; i++)
        {
            match = elems[i];
            if (maxLevel && match.level > maxLevel)
            {
                break;
            }

            event.currentTarget = match.elem;
            event.data = match.handleObj.data;
            event.handleObj = match.handleObj;
            ret = match.handleObj.origHandler.apply(match.elem, arguments);

            if (ret === false || event.isPropagationStopped())
            {
                maxLevel = match.level;
                if (ret === false)
                {
                    stop = false;
                }

                if (event.isImmediatePropagationStopped())
                {
                    break;
                }
            }
        }

        return stop;
    }

    /**
     *
     */
    function liveConvert(type, selector)
    {
        return (type && type !== "*" ? type + "." : "") + selector.replace(rperiod, "`").replace(rspace, "&");
    }

    /**
     *
     */
    jQuery.each(("blur " + "focus " + "focusin " + "focusout " + "load " + "resize " + "scroll " + "unload " + "click " + "dblclick " + "mousedown " + "mouseup " + "mousemove " + "mouseover " + "mouseout " + "mouseenter " + "mouseleave " + "change " + "select " + "submit " + "keydown " + "keypress " + "keyup " + "error").split(" "), function(i, name)
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

            return arguments.length > 0 ? this.bind(name, data, fn) : this.trigger(name);
        };

        if (jQuery.attrFn)
        {
            jQuery.attrFn[name] = true;
        }
    });

    /**
     * Sizzle CSS Selector Engine.
     *
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
    (function()
    {
        /**
         *
         */
        var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
            done = 0,
            toString = Object.prototype.toString,
            hasDuplicate = false,
            baseHasDuplicate = true,
            rBackslash = /\\/g,
            rNonWord = /\W/;

        /**
         * Aqui verificamos se o mecanismo JavaScript está usando
         * algum tipo de otimização onde nem sempre chama nossa
         * função de comparação. Se for esse o caso, descarte o
         * valor hasDuplicate. Até agora, isso inclui o Google
         * Chrome.
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

            var m,
                set,
                checkSet,
                extra,
                ret,
                cur,
                pop,
                i,
                prune = true,
                contextXML = Sizzle.isXML(context),
                parts = [],
                soFar = selector;

            /**
             * Redefina a posição do regexp do chunker (comece
             * da cabeça).
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
                    set = posProcess(parts[0] + parts[1], context);
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

                        set = posProcess(selector, set);
                    }
                }
            } else
            {
                /**
                 * Pegue um atalho e defina o contexto se o seletor
                 * raiz for um ID (mas não se for mais rápido se o
                 * seletor interno for um ID).
                 */
                if (!seed && parts.length > 1 && context.nodeType === 9 && !contextXML && Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1]))
                {
                    ret = Sizzle.find(parts.shift(), context, contextXML);
                    context = ret.expr ? Sizzle.filter(ret.expr, ret.set)[0] : ret.set[0];
                }

                if (context)
                {
                    /**
                     *
                     */
                    ret = seed ? {
                        expr: parts.pop(),
                        set: makeArray(seed)
                    } : Sizzle.find(parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML);

                    /**
                     *
                     */
                    set = ret.expr ? Sizzle.filter(ret.expr, ret.set) : ret.set;

                    /**
                     *
                     */
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
                makeArray(checkSet, results);
            }

            if (extra)
            {
                Sizzle(extra, origContext, results, seed);
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
            if (!expr)
            {
                return [];
            }

            for (var i = 0, l = Expr.order.length; i < l; i++)
            {
                var match,
                    type = Expr.order[i];

                if ((match = Expr.leftMatch[type].exec(expr)))
                {
                    var left = match[1];
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
            var match,
                anyFound,
                old = expr,
                result = [],
                curLoop = set,
                isXMLFilter = set && set[0] && Sizzle.isXML(set[0]);

            while (expr && set.length)
            {
                for (var type in Expr.filter)
                {
                    if ((match = Expr.leftMatch[type].exec(expr)) != null && match[2])
                    {
                        var found,
                            item,
                            filter = Expr.filter[type],
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
                            for (var i = 0; (item = curLoop[i]) != null; i++)
                            {
                                if (item)
                                {
                                    /**
                                     *
                                     */
                                    found = filter(item, match, i, curLoop);

                                    /**
                                     *
                                     */
                                    var pass = not ^ !!found;

                                    /**
                                     *
                                     */
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
            throw "Syntax error, unrecognized expression: " + msg;
        };

        /**
         *
         */
        var Expr = Sizzle.selectors = {
            /**
             *
             */
            order: ["ID", "NAME", "TAG"],

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
                    var isPartStr = typeof part === "string",
                        isTag = isPartStr && !rNonWord.test(part),
                        isPartStrNotTag = isPartStr && !isTag;

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

                            checkSet[i] = isPartStrNotTag || elem && elem.nodeName.toLowerCase() === part ? elem || false : elem === part;
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
                    var elem,
                        isPartStr = typeof part === "string",
                        i = 0,
                        l = checkSet.length;

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
                                checkSet[i] = isPartStr ? elem.parentNode : elem.parentNode === part;
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
                    var nodeCheck,
                        doneName = done++,
                        checkFn = dirCheck;

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
                    var nodeCheck,
                        doneName = done++,
                        checkFn = dirCheck;

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
                         * Verifique parentNode para capturar quando o
                         * Blackberry 4.6 retornar nós que não estão
                         * mais no documento #6963.
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
                        var ret = [],
                            results = context.getElementsByName(match[1]);

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
                        return context.getElementsByTagName(match[1]);
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
                         * Analisar equações como:
                         *     'even',
                         *     'odd',
                         *     '5',
                         *     '2n',
                         *     '3n+2',
                         *     '4n-1',
                         *     '-n+6'.
                         */
                        var test = /(-?)(\d*)(?:n([+\-]?\d*))?/.exec(match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" || !/\D/.test(match[2]) && "0n+" + match[2] || match[2]);

                        /**
                         * Calcule os números (first)n+(last) inclusive
                         * se forem negativos.
                         */
                        match[2] = (test[1] + (test[2] || 1)) - 0;
                        match[3] = test[3] - 0;
                    } else if (match[2])
                    {
                        Sizzle.error(match[0]);
                    }

                    /**
                     * Questão: Mover para o sistema de cache normal.
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
                     * Manipula se um valor sem aspas foi usado.
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
                         * Se estivermos lidando com uma expressão
                         * complexa, ou simples.
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
                     * Acessar essa propriedade faz com que as opções
                     * selecionadas por padrão no Safari funcionem
                     * corretamente.
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
                    var attr = elem.getAttribute("type"),
                        type = elem.type;

                    /**
                     * IE6 e 7 irão mapear elem.type para 'text' para
                     * novos tipos de HTML5 (pesquisa, etc) use
                     * getAttribute para testar este caso.
                     */
                    return "text" === type && (attr === type || attr === null);
                },

                /**
                 *
                 */
                radio: function(elem)
                {
                    return "radio" === elem.type;
                },

                /**
                 *
                 */
                checkbox: function(elem)
                {
                    return "checkbox" === elem.type;
                },

                /**
                 *
                 */
                file: function(elem)
                {
                    return "file" === elem.type;
                },

                /**
                 *
                 */
                password: function(elem)
                {
                    return "password" === elem.type;
                },

                /**
                 *
                 */
                submit: function(elem)
                {
                    return "submit" === elem.type;
                },

                /**
                 *
                 */
                image: function(elem)
                {
                    return "image" === elem.type;
                },

                /**
                 *
                 */
                reset: function(elem)
                {
                    return "reset" === elem.type;
                },

                /**
                 *
                 */
                button: function(elem)
                {
                    return "button" === elem.type || elem.nodeName.toLowerCase() === "button";
                },

                /**
                 *
                 */
                input: function(elem)
                {
                    return (/input|select|textarea|button/i).test(elem.nodeName);
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
                    var name = match[1],
                        filter = Expr.filters[name];

                    if (filter)
                    {
                        return filter(elem, i, match, array);
                    } else if (name === "contains")
                    {
                        return (elem.textContent || elem.innerText || Sizzle.getText([elem]) || "").indexOf(match[3]) >= 0;
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
                    var type = match[1],
                        node = elem;

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
                            var first = match[2],
                                last = match[3];

                            if (first === 1 && last === 0)
                            {
                                return true;
                            }

                            var doneName = match[0],
                                parent = elem.parentNode;

                            if (parent && (parent.sizcache !== doneName || !elem.nodeIndex))
                            {
                                var count = 0;
                                for (node = parent.firstChild; node; node = node.nextSibling)
                                {
                                    if (node.nodeType === 1)
                                    {
                                        node.nodeIndex = ++count;
                                    }
                                }

                                parent.sizcache = doneName;
                            }

                            var diff = elem.nodeIndex - last;

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
                    return (match === "*" && elem.nodeType === 1) || elem.nodeName.toLowerCase() === match;
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
                    var name = match[1],
                        result = Expr.attrHandle[name] ? Expr.attrHandle[name](elem) : elem[name] != null ? elem[name] : elem.getAttribute(name),
                        value = result + "",
                        type = match[2],
                        check = match[4];

                    return result == null ? type === "!=" : type === "=" ? value === check : type === "*=" ? value.indexOf(check) >= 0 : type === "~=" ? (" " + value + " ").indexOf(check) >= 0 : !check ? value && result !== false : type === "!=" ? value !== check : type === "^=" ? value.indexOf(check) === 0 : type === "$=" ? value.substr(value.length - check.length) === check : type === "|=" ? value === check || value.substr(0, check.length + 1) === check + "-" : false;
                },

                /**
                 *
                 */
                POS: function(elem, match, i, array)
                {
                    var name = match[2],
                        filter = Expr.setFilters[name];

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
        var origPOS = Expr.match.POS,
            fescape = function(all, num)
            {
                return "\\" + (num - 0 + 1);
            };

        /**
         *
         */
        for (var type in Expr.match)
        {
            Expr.match[type] = new RegExp(Expr.match[type].source + (/(?![^\[]*\])(?![^\(]*\))/.source));
            Expr.leftMatch[type] = new RegExp(/(^(?:.|\r|\n)*?)/.source + Expr.match[type].source.replace(/\\(\d+)/g, fescape));
        }

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
         * Execute uma verificação simples para determinar se o
         * navegador é capaz de converter uma NodeList em uma matriz
         * usando métodos integrados. Também verifica se a matriz
         * retornada contém nós DOM (o que não é o caso no navegador
         * Blackberry).
         */
        try
        {
            Array.prototype.slice.call(document.documentElement.childNodes, 0)[0].nodeType;
            /**
             * Forneça um método alternativo se não funcionar.
             */
        } catch (e)
        {
            makeArray = function(array, results) {
                var i = 0,
                    ret = results || [];

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

        /**
         *
         */
        var sortOrder,
            siblingCheck;

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
                var al,
                    bl,
                    ap = [],
                    bp = [],
                    aup = a.parentNode,
                    bup = b.parentNode,
                    cur = aup;

                /**
                 * Os nós são idênticos, podemos sair mais cedo.
                 */
                if (a === b)
                {
                    hasDuplicate = true;

                    return 0;

                    /**
                     * Se os nós forem irmãos (ou idênticos), podemos
                     * fazer uma verificação rápida.
                     */
                } else if (aup === bup)
                {
                    return siblingCheck(a, b);

                    /**
                     * Se nenhum pai for encontrado, os nós serão
                     * desconectados.
                     */
                } else if (!aup)
                {
                    return -1;
                } else if (!bup)
                {
                    return 1;
                }

                /**
                 * Caso contrário, eles estão em outro lugar na árvore,
                 * então precisamos criar uma lista completa dos
                 * parentNodes para comparação.
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
                 * Comece a descer a árvore procurando por uma
                 * discrepância.
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
         * Função utilitária para recuperar o valor de texto de
         * uma matriz de nós DOM.
         */
        Sizzle.getText = function(elems)
        {
            var ret = "",
                elem;

            for (var i = 0; elems[i]; i++)
            {
                elem = elems[i];

                /**
                 * Obtenha o texto de nós de texto e nós CDATA.
                 */
                if (elem.nodeType === 3 || elem.nodeType === 4)
                {
                    ret += elem.nodeValue;

                    /**
                     * Atravesse todo o resto, exceto os nós de
                     * comentário.
                     */
                } else if (elem.nodeType !== 8)
                {
                    ret += Sizzle.getText(elem.childNodes);
                }
            }

            return ret;
        };

        /**
         * Verifique se o navegador retorna elementos por nome ao
         * consultar por getElementById (e forneça uma solução
         * alternativa).
         */
        (function()
        {
            /**
             * Vamos injetar um elemento de entrada falso com um nome
             * especificado.
             */
            var form = document.createElement("div"),
                id = "script" + (new Date()).getTime(),
                root = document.documentElement;

            /**
             *
             */
            form.innerHTML = "<a name='" + id + "'/>";

            /**
             * Injete-o no elemento raiz, verifique seu status e
             * remova-o rapidamente.
             */
            root.insertBefore(form, root.firstChild);

            /**
             * A solução alternativa deve fazer verificações adicionais
             * após um getElementById. O que torna as coisas mais
             * lentas para outros navegadores (daí a ramificação).
             */
            if (document.getElementById(id))
            {
                /**
                 *
                 */
                Expr.find.ID = function(match, context, isXML)
                {
                    if (typeof context.getElementById !== "undefined" && !isXML)
                    {
                        var m = context.getElementById(match[1]);

                        return m ? m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ? [m] : undefined : [];
                    }
                };

                /**
                 *
                 */
                Expr.filter.ID = function(elem, match)
                {
                    var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");

                    return elem.nodeType === 1 && node && node.nodeValue === match;
                };
            }

            /**
             *
             */
            root.removeChild(form);

            /**
             * Liberar memória no IE.
             */
            root = form = null;
        })();

        /**
         *
         */
        (function()
        {
            /**
             * Verifique se o navegador retorna apenas elementos ao
             * fazer getElementsByTagName("*").
             */

            /**
             * Crie um elemento falso.
             */
            var div = document.createElement("div");
                div.appendChild(document.createComment(""));

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
             * Verifique se um atributo retorna atributos href
             * normalizados.
             */
            div.innerHTML = "<a href='#'></a>";

            if (div.firstChild && typeof div.firstChild.getAttribute !== "undefined" && div.firstChild.getAttribute("href") !== "#")
            {
                Expr.attrHandle.href = function(elem)
                {
                    return elem.getAttribute("href", 2);
                };
            }

            /**
             * Liberar memória no IE.
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
                var oldSizzle = Sizzle,
                    div = document.createElement("div"),
                    id = "__sizzle__";

                /**
                 *
                 */
                div.innerHTML = "<p class='TEST'></p>";

                /**
                 * O Safari não pode lidar com caracteres maiúsculos
                 * ou unicode no modo peculiaridades.
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
                     * Use querySelectorAll somente em documentos não
                     * XML (seletores de ID não funcionam em documentos
                     * não HTML).
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

                        if (context.nodeType === 9)
                        {
                            /**
                             * Acelerar: Sizzle("body").
                             * O elemento do corpo existe apenas uma vez,
                             * otimize sua localização.
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
                                 * Verifique parentNode para capturar quando
                                 * o Blackberry 4.6 retornar nós que não estão
                                 * mais no documento #6963.
                                 */
                                if (elem && elem.parentNode)
                                {
                                    /**
                                     * Lide com o caso em que IE e Opera retornam
                                     * itens por nome em vez de ID.
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
                            } catch (qsaError)
                            {
                            }

                            /**
                             * qSA funciona de maneira estranha em consultas
                             * com raiz de elemento. Podemos contornar isso
                             * especificando um ID extra na raiz e trabalhando
                             * a partir daí (Obrigado pela técnica). O IE 8
                             * não funciona em elementos de objeto.
                             */
                        } else if (context.nodeType === 1 && context.nodeName.toLowerCase() !== "object")
                        {
                            var oldContext = context,
                                old = context.getAttribute("id"),
                                nid = old || id,
                                hasParent = context.parentNode,
                                relativeHierarchySelector = /^\s*[+~]/.test(query);

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
                            } catch (pseudoError)
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
                 * Liberar memória no IE.
                 */
                div = null;
            })();
        }

        /**
         *
         */
        (function()
        {
            var html = document.documentElement,
                matches = html.matchesSelector || html.mozMatchesSelector || html.webkitMatchesSelector || html.msMatchesSelector;

            if (matches)
            {
                /**
                 * Verifique se é possível fazer matchesSelector em
                 * um nó desconectado (o IE 9 falha nisso).
                 */
                var disconnectedMatch = !matches.call(document.createElement("div"), "div"),
                    pseudoWorks = false;

                try
                {
                    /**
                     * Isso deve falhar com uma exceção.
                     * O Gecko não apresenta erro, retorna false.
                     */
                    matches.call(document.documentElement, "[test!='']:sizzle");
                } catch (pseudoError)
                {
                    pseudoWorks = true;
                }

                Sizzle.matchesSelector = function(node, expr)
                {
                    /**
                     * Certifique-se de que os seletores de atributo
                     * estejam entre aspas.
                     */
                    expr = expr.replace(/\=\s*([^'"\]]*)\s*\]/g, "='$1']");

                    if (!Sizzle.isXML(node))
                    {
                        try
                        {
                            if (pseudoWorks || !Expr.match.PSEUDO.test(expr) && !/!=/.test(expr))
                            {
                                var ret = matches.call(node, expr);

                                /**
                                 * matchesSelector do IE 9 retorna false em
                                 * nós desconectados.
                                 */
                                if (ret || !disconnectedMatch ||
                                    /**
                                     * Além disso, diz-se que os nós desconectados
                                     * estão em um fragmento de documento no IE 9,
                                     * então verifique isso.
                                     */
                                    node.document && node.document.nodeType !== 11)
                                {
                                    return ret;
                                }
                            }
                        } catch (e)
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
             * O Safari armazena em cache os atributos de classe, não
             * detecta alterações (em 3.2).
             */
            div.lastChild.className = "e";

            /**
             *
             */
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
             * Liberar memória no IE.
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
                        if (elem.sizcache === doneName)
                        {
                            match = checkSet[elem.sizset];

                            break;
                        }

                        if (elem.nodeType === 1 && !isXML)
                        {
                            elem.sizcache = doneName;
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
                        if (elem.sizcache === doneName)
                        {
                            match = checkSet[elem.sizset];
                            break;
                        }

                        if (elem.nodeType === 1)
                        {
                            if (!isXML)
                            {
                                elem.sizcache = doneName;
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
             * documentElement é verificado para casos em que ainda
             * não existe (como carregar iframes no IE - #4833).
             */
            var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;

            return documentElement ? documentElement.nodeName !== "HTML" : false;
        };

        /**
         *
         */
        var posProcess = function(selector, context)
        {
            var match,
                tmpSet = [],
                later = "",
                root = context.nodeType ? [context] : context;

            /**
             * Os seletores de posição devem ser feitos após o filtro.
             * E assim deve :not(positional) então movemos todos os
             * PSEUDOs para o final.
             */
            while ((match = Expr.match.PSEUDO.exec(selector)))
            {
                later += match[0];
                selector = selector.replace(Expr.match.PSEUDO, "");
            }

            selector = Expr.relative[selector] ? selector + "*" : selector;

            for (var i = 0, l = root.length; i < l; i++)
            {
                Sizzle(selector, root[i], tmpSet);
            }

            return Sizzle.filter(later, tmpSet);
        };

        /**
         * EXPOR.
         */
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
    var runtil = /Until$/,
        /**
         *
         */
        rparentsprev = /^(?:parents|prevUntil|prevAll)/,

        /**
         * Observação: Este RegExp deve ser melhorado ou provavelmente
         * retirado do Sizzle.
         */
        rmultiselector = /,/,

        /**
         *
         */
        isSimple = /^.[^:#\[\.,]*$/,

        /**
         *
         */
        slice = Array.prototype.slice,

        /**
         *
         */
        POS = jQuery.expr.match.POS,

        /**
         * Métodos garantidos para produzir um conjunto exclusivo
         * ao iniciar de um conjunto exclusivo.
         */
        guaranteedUnique = {
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
            var ret = this.pushStack("", "find", selector),
                length = 0;

            for (var i = 0, l = this.length; i < l; i++)
            {
                length = ret.length;
                jQuery.find(selector, this[i], ret);

                if (i > 0)
                {
                    /**
                     * Certifique-se de que os resultados sejam únicos.
                     */
                    for (var n = length; n < ret.length; n++)
                    {
                        for (var r = 0; r < length; r++)
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
        has: function(target) {
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
            return !!selector && jQuery.filter(selector, this).length > 0;
        },

        /**
         *
         */
        closest: function(selectors, context)
        {
            var ret = [],
                i,
                l,
                cur = this[0];

            if (jQuery.isArray(selectors))
            {
                var match,
                    selector,
                    matches = {},
                    level = 1;

                if (cur && selectors.length)
                {
                    for (i = 0, l = selectors.length; i < l; i++)
                    {
                        selector = selectors[i];
                        if (!matches[selector])
                        {
                            matches[selector] = jQuery.expr.match.POS.test(selector) ? jQuery(selector, context || this.context) : selector;
                        }
                    }

                    while (cur && cur.ownerDocument && cur !== context)
                    {
                        for (selector in matches)
                        {
                            match = matches[selector];
                            if (match.jquery ? match.index(cur) > -1 : jQuery(cur).is(match))
                            {
                                ret.push({
                                    selector: selector,
                                    elem: cur,
                                    level: level
                                });
                            }
                        }

                        cur = cur.parentNode;
                        level++;
                    }
                }

                return ret;
            }

            /**
             *
             */
            var pos = POS.test(selectors) ? jQuery(selectors, context || this.context) : null;

            /**
             *
             */
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
                        if (!cur || !cur.ownerDocument || cur === context)
                        {
                            break;
                        }
                    }
                }
            }

            /**
             *
             */
            ret = ret.length > 1 ? jQuery.unique(ret) : ret;

            /**
             *
             */
            return this.pushStack(ret, "closest", selectors);
        },

        /**
         * Determine a posição de um elemento dentro do conjunto
         * correspondente de elementos.
         */
        index: function(elem)
        {
            if (!elem || typeof elem === "string")
            {
                return jQuery.inArray(this[0],
                    /**
                     * Se receber uma string, o seletor é usado.
                     * Se não receber nada, os irmãos são usados.
                     */
                    elem ? jQuery(elem) : this.parent().children());
            }

            /**
             * Localize a posição do elemento desejado.
             */
            return jQuery.inArray(
                /**
                 * Se receber um objeto jQuery, o primeiro elemento
                 * é usado.
                 */
                elem.jquery ? elem[0] : elem, this);
        },

        /**
         *
         */
        add: function(selector, context)
        {
            var set = typeof selector === "string" ? jQuery(selector, context) : jQuery.makeArray(selector),
                all = jQuery.merge(this.get(), set);

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
     * Uma verificação dolorosamente simples para ver se um elemento
     * está desconectado de um documento (deve ser melhorado, sempre
     * que possível).
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
            return jQuery.sibling(elem.parentNode.firstChild, elem);
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
        jQuery.fn[name] = function(until, selector)
        {
            var ret = jQuery.map(this, fn, until),
                /**
                 * A variável 'args' foi introduzida em
                 * https://github.com/jquery/jquery/commit/52a0238.
                 *
                 * Para solucionar um bug no Chrome 10 (Dev) e deve
                 * ser removido quando o bug for corrigido.
                 * http://code.google.com/p/v8/issues/detail?id=1050.
                 */
                args = slice.call(arguments);

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

            return this.pushStack(ret, name, args.join(","));
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

            return elems.length === 1 ? jQuery.find.matchesSelector(elems[0], expr) ? [elems[0]] : [] : jQuery.find.matches(expr, elems);
        },

        /**
         *
         */
        dir: function(elem, dir, until)
        {
            var matched = [],
                cur = elem[dir];

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
    var rinlinejQuery = / jQuery\d+="(?:\d+|null)"/g,
        /**
         *
         */
        rleadingWhitespace = /^\s+/,

        /**
         *
         */
        rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,

        /**
         *
         */
        rtagName = /<([\w:]+)/,

        /**
         *
         */
        rtbody = /<tbody/i,

        /**
         *
         */
        rhtml = /<|&#?\w+;/,

        /**
         *
         */
        rnocache = /<(?:script|object|embed|option|style)/i,

        /**
         * checked="checked" ou checked.
         */
        rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,

        /**
         *
         */
        wrapMap = {
            /**
             *
             */
            option: [
                1, "<select multiple='multiple'>", "</select>"
            ],

            /**
             *
             */
            legend: [
                1, "<fieldset>", "</fieldset>"
            ],

            /**
             *
             */
            thead: [
                1, "<table>", "</table>"
            ],

            /**
             *
             */
            tr: [
                2, "<table><tbody>", "</tbody></table>"
            ],

            /**
             *
             */
            td: [
                3, "<table><tbody><tr>", "</tr></tbody></table>"
            ],

            /**
             *
             */
            col: [
                2, "<table><tbody></tbody><colgroup>", "</colgroup></table>"
            ],

            /**
             *
             */
            area: [
                1, "<map>", "</map>"
            ],

            /**
             *
             */
            _default: [
                0, "", ""
            ]
        };

    /**
     *
     */
    wrapMap.optgroup = wrapMap.option;
    wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
    wrapMap.th = wrapMap.td;

    /**
     * O IE não pode serializar as tags <link> e <script>
     * normalmente.
     */
    if (!jQuery.support.htmlSerialize)
    {
        wrapMap._default = [
            1, "div<div>", "</div>"
        ];
    }

    /**
     *
     */
    jQuery.fn.extend({
        /**
         *
         */
        text: function(text)
        {
            if (jQuery.isFunction(text))
            {
                return this.each(function(i)
                {
                    var self = jQuery(this);
                        self.text(text.call(this, i, self.text()));
                });
            }

            if (typeof text !== "object" && text !== undefined)
            {
                return this.empty().append(
                    (this[0] && this[0].ownerDocument || document).createTextNode(text)
                );
            }

            return jQuery.text(this);
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
                 * Os elementos para envolver o alvo.
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
                var self = jQuery(this),
                    contents = self.contents();

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
            return this.each(function()
            {
                jQuery(this).wrapAll(html);
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
                var set = jQuery(arguments[0]);
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
                    set.push.apply(set, jQuery(arguments[0]).toArray());

                return set;
            }
        },

        /**
         * keepData é apenas para uso interno - não documente.
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
                 * Remova os nós do elemento e evite vazamentos de
                 * memória.
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

            return this.map(function()
            {
                return jQuery.clone(this, dataAndEvents, deepDataAndEvents);
            });
        },

        /**
         *
         */
        html: function(value)
        {
            if (value === undefined)
            {
                return this[0] && this[0].nodeType === 1 ? this[0].innerHTML.replace(rinlinejQuery, "") : null;

                /**
                 * Veja se podemos pegar um atalho e usar apenas o
                 * innerHTML.
                 */
            } else if (typeof value === "string" && !rnocache.test(value) && (jQuery.support.leadingWhitespace || !rleadingWhitespace.test(value)) && !wrapMap[(rtagName.exec(value) || ["", ""])[1].toLowerCase()])
            {
                value = value.replace(rxhtmlTag, "<$1></$2>");

                try
                {
                    for (var i = 0, l = this.length; i < l; i++)
                    {
                        /**
                         * Remova os nós do elemento e evite vazamentos
                         * de memória.
                         */
                        if (this[i].nodeType === 1)
                        {
                            jQuery.cleanData(this[i].getElementsByTagName("*"));
                            this[i].innerHTML = value;
                        }
                    }

                    /**
                     * Se o uso de innerHTML lançar uma exceção, use o
                     * método de fallback.
                     */
                } catch (e)
                {
                    this.empty().append(value);
                }
            } else if (jQuery.isFunction(value))
            {
                this.each(function(i)
                {
                    var self = jQuery(this);
                        self.html(value.call(this, i, self.html()));
                });
            } else
            {
                this.empty().append(value);
            }

            return this;
        },

        /**
         *
         */
        replaceWith: function(value)
        {
            if (this[0] && this[0].parentNode)
            {
                /**
                 * Certifique-se de que os elementos sejam removidos
                 * do DOM antes de serem inseridos, isso pode ajudar
                 * a corrigir a substituição de um pai por elementos
                 * filho.
                 */
                if (jQuery.isFunction(value))
                {
                    return this.each(function(i)
                    {
                        var self = jQuery(this), old = self.html();
                            self.replaceWith(value.call(this, i, old));
                    });
                }

                if (typeof value !== "string")
                {
                    value = jQuery(value).detach();
                }

                return this.each(function()
                {
                    var next = this.nextSibling,
                        parent = this.parentNode;

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
                return this.length ? this.pushStack(jQuery(jQuery.isFunction(value) ? value() : value), "replaceWith", value) : this;
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
            var results,
                first,
                fragment,
                parent,
                value = args[0],
                scripts = [];

            /**
             * Não podemos clonar fragmentos Node que contenham
             * verificados no WebKit.
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
                 * de construir um novo.
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
                             * Certifique-se de não vazar memória descartando
                             * inadvertidamente o fragmento original (que pode
                             * ter dados anexados) em vez de usá-lo; além disso,
                             * use o objeto fragmento original para o último item
                             * em vez do primeiro porque pode acabar sendo esvaziado
                             * incorretamente em certas situações (Bug #8070). Os
                             * fragmentos do cache de fragmentos sempre devem ser
                             * clonados e nunca usados no local.
                             */
                            results.cacheable || (l > 1 && i < lastIndex) ? jQuery.clone(fragment, true, true) : fragment);
                    }
                }

                if (scripts.length)
                {
                    jQuery.each(scripts, evalScript);
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
        return jQuery.nodeName(elem, "table") ? (elem.getElementsByTagName("tbody")[0] || elem.appendChild(elem.ownerDocument.createElement("tbody"))) : elem;
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

        var internalKey = jQuery.expando,
            oldData = jQuery.data(src),
            curData = jQuery.data(dest, oldData);

        /**
         * Mude para usar o objeto de dados interno, se existir,
         * para o próximo estágio de cópia de dados.
         */
        if ((oldData = oldData[internalKey]))
        {
            var events = oldData.events;
                curData = curData[internalKey] = jQuery.extend({}, oldData);

            if (events)
            {
                delete curData.handle;
                curData.events = {};

                for (var type in events)
                {
                    for (var i = 0, l = events[type].length; i < l; i++)
                    {
                        jQuery.event.add(dest, type + (events[type][i].namespace ? "." : "") + events[type][i].namespace, events[type][i], events[type][i].data);
                    }
                }
            }
        }
    }

    /**
     *
     */
    function cloneFixAttributes(src, dest)
    {
        /**
         * Não precisamos fazer nada para não-Elementos.
         */
        if (dest.nodeType !== 1)
        {
            return;
        }

        /**
         *
         */
        var nodeName = dest.nodeName.toLowerCase();

        /**
         * clearAttributes remove os atributos, que não queremos,
         * mas também remove os eventos attachEvent, que
         * *desejamos*.
         */
        dest.clearAttributes();

        /**
         * mergeAttributes, por outro lado, apenas mescla novamente
         * os atributos originais, não os eventos.
         */
        dest.mergeAttributes(src);

        /**
         * O IE6-8 falha ao clonar filhos dentro de elementos de
         * objeto que usam o valor do atributo classid proprietário
         * (em vez do atributo type) para identificar o tipo de
         * conteúdo a ser exibido.
         */
        if (nodeName === "object")
        {
            dest.outerHTML = src.outerHTML;
        } else if (nodeName === "input" && (src.type === "checkbox" || src.type === "radio"))
        {
            /**
             * O IE6-8 falha ao manter o estado marcado de uma caixa
             * de seleção ou botão de opção clonado. Pior ainda, o
             * IE6-7 falha em dar ao elemento clonado uma aparência
             * verificada se o valor defaultChecked também não
             * estiver definido.
             */
            if (src.checked)
            {
                dest.defaultChecked = dest.checked = src.checked;
            }

            /**
             * O IE6-7 fica confuso e acaba definindo o valor de
             * uma caixa de seleção/botão de rádio clonado para
             * uma string vazia em vez de "on".
             */
            if (dest.value !== src.value)
            {
                dest.value = src.value;
            }

            /**
             * O IE6-8 falha ao retornar a opção selecionada ao
             * estado selecionado padrão ao clonar opções.
             */
        } else if (nodeName === "option")
        {
            dest.selected = src.defaultSelected;

            /**
             * O IE6-8 falha ao definir o valor padrão como o valor
             * correto ao clonar outros tipos de campos de entrada.
             */
        } else if (nodeName === "input" || nodeName === "textarea")
        {
            dest.defaultValue = src.defaultValue;
        }

        /**
         * Os dados do evento são referenciados em vez de copiados
         * se o expando também for copiado.
         */
        dest.removeAttribute(jQuery.expando);
    }

    /**
     *
     */
    jQuery.buildFragment = function(args, nodes, scripts)
    {
        var fragment,
            cacheable,
            cacheresults,
            doc = (nodes && nodes[0] ? nodes[0].ownerDocument || nodes[0] : document);

        /**
         * Armazene em cache apenas strings HTML "pequenas" (1/2 KB)
         * associadas ao documento principal. As opções de clonagem
         * perdem o estado selecionado, portanto, não as armazene em
         * cache. O IE 6 não gosta quando você coloca elementos
         * <object> ou <embed> em um fragmento. Além disso, o WebKit
         * não clona atributos 'checked' no cloneNode, então não
         * faça cache.
         */
        if (args.length === 1 && typeof args[0] === "string" && args[0].length < 512 && doc === document && args[0].charAt(0) === "<" && !rnocache.test(args[0]) && (jQuery.support.checkClone || !rchecked.test(args[0])))
        {
            cacheable = true;
            cacheresults = jQuery.fragments[args[0]];

            if (cacheresults)
            {
                if (cacheresults !== 1)
                {
                    fragment = cacheresults;
                }
            }
        }

        if (!fragment)
        {
            fragment = doc.createDocumentFragment();
            jQuery.clean(args, doc, fragment, scripts);
        }

        if (cacheable)
        {
            jQuery.fragments[args[0]] = cacheresults ? fragment : 1;
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
        jQuery.fn[name] = function(selector)
        {
            var ret = [],
                insert = jQuery(selector),
                parent = this.length === 1 && this[0].parentNode;

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
        if ("getElementsByTagName" in elem)
        {
            return elem.getElementsByTagName("*");
        } else if ("querySelectorAll" in elem)
        {
            return elem.querySelectorAll("*");
        } else
        {
            return [];
        }
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
            var clone = elem.cloneNode(true),
                srcElements,
                destElements,
                i;

            if ((!jQuery.support.noCloneEvent || !jQuery.support.noCloneChecked) && (elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem))
            {
                /**
                 * IE copia eventos vinculados via attachEvent ao
                 * usar cloneNode. Chamar detachEvent no clone
                 * também removerá os eventos do original. Para
                 * contornar isso, usamos alguns métodos proprietários
                 * para limpar os eventos. Obrigado ao pessoal do
                 * MooTools por essa gostosura.
                 */
                cloneFixAttributes(elem, clone);

                /**
                 * Usar Sizzle aqui é muito lento, então usamos
                 * getElementsByTagName.
                 */
                srcElements = getAll(elem);
                destElements = getAll(clone);

                /**
                 * Iteração estranha porque o IE substituirá a
                 * propriedade length por um elemento se você estiver
                 * clonando o corpo e um dos elementos na página tiver
                 * um nome ou id de "length".
                 */
                for (i = 0; srcElements[i]; ++i)
                {
                    cloneFixAttributes(srcElements[i], destElements[i]);
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
            context = context || document;

            /**
             * !context.createElement falha no IE com um erro,
             * mas retorna typeof 'object'.
             */
            if (typeof context.createElement === "undefined")
            {
                context = context.ownerDocument || context[0] && context[0].ownerDocument || document;
            }

            var ret = [];
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
                 * Converta string html em nós DOM.
                 */
                if (typeof elem === "string" && !rhtml.test(elem))
                {
                    elem = context.createTextNode(elem);
                } else if (typeof elem === "string")
                {
                    /**
                     * Corrija tags de estilo "XHTML" em todos os
                     * navegadores.
                     */
                    elem = elem.replace(rxhtmlTag, "<$1></$2>");

                    /**
                     * Apare o espaço em branco, caso contrário,
                     * indexOf não funcionará como esperado.
                     */
                    var tag = (rtagName.exec(elem) || ["", ""])[1].toLowerCase(),
                        wrap = wrapMap[tag] || wrapMap._default,
                        depth = wrap[0],
                        div = context.createElement("div");

                    /**
                     * Vá para html e volte, depois retire os invólucros
                     * extras.
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
                     * Remova o <tbody> inserido automaticamente
                     * do IE dos fragmentos da tabela.
                     */
                    if (!jQuery.support.tbody)
                    {
                        /**
                         * String era uma <table>, *pode* ter <tbody>
                         * espúria.
                         */
                        var hasBody = rtbody.test(elem),
                            tbody = tag === "table" && !hasBody ? div.firstChild && div.firstChild.childNodes :

                            /**
                             * String era um <thead> ou <tfoot> nu.
                             */
                            wrap[1] === "<table>" && !hasBody ? div.childNodes : [];

                        for (var j = tbody.length - 1; j >= 0; --j)
                        {
                            if (jQuery.nodeName(tbody[j], "tbody") && !tbody[j].childNodes.length)
                            {
                                tbody[j].parentNode.removeChild(tbody[j]);
                            }
                        }
                    }

                    /**
                     * O IE elimina completamente os espaços em branco
                     * iniciais quando o innerHTML é usado.
                     */
                    if (!jQuery.support.leadingWhitespace && rleadingWhitespace.test(elem))
                    {
                        div.insertBefore(context.createTextNode(rleadingWhitespace.exec(elem)[0]), div.firstChild);
                    }

                    elem = div.childNodes;
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
                for (i = 0; ret[i]; i++)
                {
                    if (scripts && jQuery.nodeName(ret[i], "script") && (!ret[i].type || ret[i].type.toLowerCase() === "text/javascript"))
                    {
                        scripts.push(ret[i].parentNode ? ret[i].parentNode.removeChild(ret[i]) : ret[i]);
                    } else
                    {
                        if (ret[i].nodeType === 1)
                        {
                            ret.splice.apply(ret, [i + 1, 0].concat(jQuery.makeArray(ret[i].getElementsByTagName("script"))));
                        }

                        fragment.appendChild(ret[i]);
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
            var data,
                id,
                cache = jQuery.cache,
                internalKey = jQuery.expando,
                special = jQuery.event.special,
                deleteExpando = jQuery.support.deleteExpando;

            for (var i = 0, elem; (elem = elems[i]) != null; i++)
            {
                if (elem.nodeName && jQuery.noData[elem.nodeName.toLowerCase()])
                {
                    continue;
                }

                id = elem[jQuery.expando];
                if (id)
                {
                    data = cache[id] && cache[id][internalKey];
                    if (data && data.events)
                    {
                        for (var type in data.events)
                        {
                            if (special[type])
                            {
                                jQuery.event.remove(elem, type);

                                /**
                                 * Este é um atalho para evitar a sobrecarga
                                 * do jQuery.event.remove.
                                 */
                            } else
                            {
                                jQuery.removeEvent(elem, type, data.handle);
                            }
                        }

                        /**
                         * Anule a referência DOM para evitar vazamento
                         * do IE6/7/8 (#7054).
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
    function evalScript(i, elem)
    {
        if (elem.src)
        {
            jQuery.ajax({
                url: elem.src,
                async: false,
                dataType: "script"
            });
        } else
        {
            jQuery.globalEval(elem.text || elem.textContent || elem.innerHTML || "");
        }

        if (elem.parentNode)
        {
            elem.parentNode.removeChild(elem);
        }
    }

    /**
     *
     */
    var ralpha = /alpha\([^)]*\)/i,
        /**
         *
         */
        ropacity = /opacity=([^)]*)/,

        /**
         *
         */
        rdashAlpha = /-([a-z])/ig,

        /**
         * Corrigido para IE9, veja #8346.
         */
        rupper = /([A-Z]|^ms)/g,

        /**
         *
         */
        rnumpx = /^-?\d+(?:px)?$/i,

        /**
         *
         */
        rnum = /^-?\d/,

        /**
         *
         */
        cssShow = {
            position: "absolute",
            visibility: "hidden",
            display: "block"
        },

        /**
         *
         */
        cssWidth = ["Left", "Right"],

        /**
         *
         */
        cssHeight = ["Top", "Bottom"],

        /**
         *
         */
        curCSS,

        /**
         *
         */
        getComputedStyle,

        /**
         *
         */
        currentStyle,

        /**
         *
         */
        fcamelCase = function(all, letter)
        {
            return letter.toUpperCase();
        };

    /**
     *
     */
    jQuery.fn.css = function(name, value)
    {
        /**
         * Definir 'undefined' é um no-op.
         */
        if (arguments.length === 2 && value === undefined)
        {
            return this;
        }

        return jQuery.access(this, name, value, true, function(elem, name, value)
        {
            return value !== undefined ? jQuery.style(elem, name, value) : jQuery.css(elem, name);
        });
    };

    /**
     *
     */
    jQuery.extend({
        /**
         * Adicione ganchos de propriedade de estilo para substituir
         * o comportamento padrão de obtenção e configuração de uma
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
                         * Devemos sempre obter um número de volta da
                         * opacidade.
                         */
                        var ret = curCSS(elem, "opacity", "opacity");

                        /**
                         *
                         */
                        return ret === "" ? "1" : ret;
                    } else
                    {
                        return elem.style.opacity;
                    }
                }
            }
        },

        /**
         * Exclua as seguintes propriedades css para adicionar px.
         */
        cssNumber: {
            "zIndex": true,
            "fontWeight": true,
            "opacity": true,
            "zoom": true,
            "lineHeight": true
        },

        /**
         * Adicione propriedades cujos nomes você deseja corrigir
         * antes de definir ou obter o valor.
         */
        cssProps: {
            /**
             * Normalizar a propriedade float CSS.
             */
            "float": jQuery.support.cssFloat ? "cssFloat" : "styleFloat"
        },

        /**
         * Obtenha e defina a propriedade style em um nó DOM.
         */
        style: function(elem, name, value, extra)
        {
            /**
             * Não defina estilos em nós de texto e comentários.
             */
            if (!elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style)
            {
                return;
            }

            /**
             * Certifique-se de que estamos trabalhando com o
             * nome certo.
             */
            var ret,
                origName = jQuery.camelCase(name),
                style = elem.style,
                hooks = jQuery.cssHooks[origName];

            /**
             *
             */
            name = jQuery.cssProps[origName] || origName;

            /**
             * Verifique se estamos definindo um valor.
             */
            if (value !== undefined)
            {
                /**
                 * Certifique-se de que os valores NaN e null não
                 * estejam definidos. Veja: #7116.
                 */
                if (typeof value === "number" && isNaN(value) || value == null)
                {
                    return;
                }

                /**
                 * Se um número foi passado, adicione 'px' ao (exceto
                 * para certas propriedades CSS).
                 */
                if (typeof value === "number" && !jQuery.cssNumber[origName])
                {
                    value += "px";
                }

                /**
                 * Se um gancho foi fornecido, use esse valor, caso
                 * contrário, apenas defina o valor especificado.
                 */
                if (!hooks || !("set" in hooks) || (value = hooks.set(elem, value)) !== undefined)
                {
                    /**
                     * Envolto para evitar que o IE lance erros quando
                     * valores 'inválidos' são fornecidos. Corrige o
                     * bug #5509.
                     */
                    try
                    {
                        style[name] = value;
                    } catch (e)
                    {
                    }
                }
            } else
            {
                /**
                 * Se um gancho foi fornecido, obtenha o valor não
                 * calculado a partir dele.
                 */
                if (hooks && "get" in hooks && (ret = hooks.get(elem, false, extra)) !== undefined)
                {
                    return ret;
                }

                /**
                 * Caso contrário, apenas obtenha o valor do objeto
                 * de estilo.
                 */
                return style[name];
            }
        },

        /**
         *
         */
        css: function(elem, name, extra)
        {
            /**
             * Certifique-se de que estamos trabalhando com o
             * nome certo. sobrinho.
             */
            var ret,
                origName = jQuery.camelCase(name),
                hooks = jQuery.cssHooks[origName];

            /**
             *
             */
            name = jQuery.cssProps[origName] || origName;

            /**
             * Se um gancho foi fornecido, obtenha o valor calculado
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
                return curCSS(elem, name, origName);
            }
        },

        /**
         * Um método para trocar rapidamente propriedades CSS
         * de entrada/saída para obter cálculos corretos.
         */
        swap: function(elem, options, callback)
        {
            var old = {};

            /**
             * Lembre-se dos valores antigos e insira os novos.
             */
            for (var name in options)
            {
                old[name] = elem.style[name];
                elem.style[name] = options[name];
            }

            /**
             *
             */
            callback.call(elem);

            /**
             * Reverta os valores antigos.
             */
            for (name in options)
            {
                elem.style[name] = old[name];
            }
        },

        /**
         *
         */
        camelCase: function(string)
        {
            return string.replace(rdashAlpha, fcamelCase);
        }
    });

    /**
     * OBSOLETO, Use jQuery.css() em vez disso.
     */
    jQuery.curCSS = jQuery.css;

    /**
     *
     */
    jQuery.each(["height", "width"], function(i, name)
    {
        jQuery.cssHooks[name] = {
            /**
             *
             */
            get: function(elem, computed, extra)
            {
                var val;
                if (computed)
                {
                    if (elem.offsetWidth !== 0)
                    {
                        val = getWH(elem, name, extra);
                    } else
                    {
                        jQuery.swap(elem, cssShow, function()
                        {
                            val = getWH(elem, name, extra);
                        });
                    }

                    if (val <= 0)
                    {
                        val = curCSS(elem, name, name);
                        if (val === "0px" && currentStyle)
                        {
                            val = currentStyle(elem, name, name);
                        }

                        if (val != null)
                        {
                            /**
                             * Deve retornar "auto" em vez de 0, use 0
                             * para compatibilidade com versões
                             * anteriores temporária.
                             */
                            return val === "" || val === "auto" ? "0px" : val;
                        }
                    }

                    if (val < 0 || val == null)
                    {
                        val = elem.style[name];

                        /**
                         * Deve retornar "auto" em vez de 0, use 0 para
                         * compatibilidade com versões anteriores
                         * temporária.
                         */
                        return val === "" || val === "auto" ? "0px" : val;
                    }

                    return typeof val === "string" ? val : val + "px";
                }
            },

            /**
             *
             */
            set: function(elem, value)
            {
                if (rnumpx.test(value))
                {
                    /**
                     * Ignore os valores negativos de largura e altura
                     * #1599.
                     */
                    value = parseFloat(value);

                    if (value >= 0)
                    {
                        return value + "px";
                    }
                } else
                {
                    return value;
                }
            }
        };
    });

    /**
     *
     */
    if (!jQuery.support.opacity)
    {
        /**
         *
         */
        jQuery.cssHooks.opacity = {
            /**
             *
             */
            get: function(elem, computed)
            {
                /**
                 * O IE usa filtros para opacidade.
                 */
                return ropacity.test(
                    (
                        computed && elem.currentStyle ? elem.currentStyle.filter : elem.style.filter
                    ) || ""
                ) ? (parseFloat(RegExp.$1) / 100) + "" : computed ? "1" : "";
            },

            /**
             *
             */
            set: function(elem, value)
            {
                var style = elem.style;

                /**
                 * O IE tem problemas com opacidade se não tiver
                 * layout. Force-o definindo o nível de zoom.
                 */
                style.zoom = 1;

                /**
                 * Defina o filtro alfa para definir a opacidade.
                 */
                var opacity = jQuery.isNaN(value) ? "" : "alpha(opacity=" + value * 100 + ")",
                    filter = style.filter || "";

                style.filter = ralpha.test(filter) ? filter.replace(ralpha, opacity) : style.filter + ' ' + opacity;
            }
        };
    }

    /**
     *
     */
    jQuery(function()
    {
        /**
         * Este gancho não pode ser adicionado até que o DOM esteja
         * pronto porque o teste de suporte para ele não é executado
         * até que o DOM esteja pronto.
         */
        if (!jQuery.support.reliableMarginRight)
        {
            jQuery.cssHooks.marginRight = {
                /**
                 *
                 */
                get: function(elem, computed)
                {
                    /**
                     * WebKit Bug 13343 - getComputedStyle retorna
                     * valor errado para margem direita. Contorne
                     * configurando temporariamente a exibição do
                     * elemento para bloco em linha.
                     */
                    var ret;

                    jQuery.swap(elem, {
                        "display": "inline-block"
                    }, function()
                    {
                        if (computed)
                        {
                            ret = curCSS(elem, "margin-right", "marginRight");
                        } else
                        {
                            ret = elem.style.marginRight;
                        }
                    });

                    return ret;
                }
            };
        }
    });

    /**
     *
     */
    if (document.defaultView && document.defaultView.getComputedStyle)
    {
        getComputedStyle = function(elem, newName, name)
        {
            var ret,
                defaultView,
                computedStyle;

            /**
             *
             */
            name = name.replace(rupper, "-$1").toLowerCase();

            if (!(defaultView = elem.ownerDocument.defaultView))
            {
                return undefined;
            }

            if ((computedStyle = defaultView.getComputedStyle(elem, null)))
            {
                ret = computedStyle.getPropertyValue(name);

                if (ret === "" && !jQuery.contains(elem.ownerDocument.documentElement, elem))
                {
                    ret = jQuery.style(elem, name);
                }
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
            var left,
                ret = elem.currentStyle && elem.currentStyle[name],
                rsLeft = elem.runtimeStyle && elem.runtimeStyle[name],
                style = elem.style;

            /**
             * Se não estivermos lidando com um número de pixel
             * normal, mas um número com um final estranho,
             * precisamos convertê-lo em pixels.
             */
            if (!rnumpx.test(ret) && rnum.test(ret))
            {
                /**
                 * Lembre-se dos valores originais.
                 */
                left = style.left;

                /**
                 * Coloque os novos valores para obter um valor
                 * calculado.
                 */
                if (rsLeft)
                {
                    elem.runtimeStyle.left = elem.currentStyle.left;
                }

                style.left = name === "fontSize" ? "1em" : (ret || 0);
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
    function getWH(elem, name, extra)
    {
        var which = name === "width" ? cssWidth : cssHeight,
            val = name === "width" ? elem.offsetWidth : elem.offsetHeight;

        if (extra === "border")
        {
            return val;
        }

        jQuery.each(which, function()
        {
            if (!extra)
            {
                val -= parseFloat(jQuery.css(elem, "padding" + this)) || 0;
            }

            if (extra === "margin")
            {
                val += parseFloat(jQuery.css(elem, "margin" + this)) || 0;
            } else
            {
                val -= parseFloat(jQuery.css(elem, "border" + this + "Width")) || 0;
            }
        });

        return val;
    }

    /**
     *
     */
    if (jQuery.expr && jQuery.expr.filters)
    {
        jQuery.expr.filters.hidden = function(elem)
        {
            var width = elem.offsetWidth,
                height = elem.offsetHeight;

            return (width === 0 && height === 0) || (!jQuery.support.reliableHiddenOffsets && (elem.style.display || jQuery.css(elem, "display")) === "none");
        };

        jQuery.expr.filters.visible = function(elem)
        {
            return !jQuery.expr.filters.hidden(elem);
        };
    }

    /**
     *
     */
    var r20 = /%20/g,
        /**
         *
         */
        rbracket = /\[\]$/,

        /**
         *
         */
        rCRLF = /\r?\n/g,

        /**
         *
         */
        rhash = /#.*$/,

        /**
         * IE deixa um caractere \r em EOL.
         */
        rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg,

        /**
         *
         */
        rinput = /^(?:color|date|datetime|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i,

        /**
         * #7653, #8125, #8152: detecção de protocolo local.
         */
        rlocalProtocol = /^(?:about|app|app\-storage|.+\-extension|file|widget):$/,

        /**
         *
         */
        rnoContent = /^(?:GET|HEAD)$/,

        /**
         *
         */
        rprotocol = /^\/\//,

        /**
         *
         */
        rquery = /\?/,

        /**
         *
         */
        rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,

        /**
         *
         */
        rselectTextarea = /^(?:select|textarea)/i,

        /**
         *
         */
        rspacesAjax = /\s+/,

        /**
         *
         */
        rts = /([?&])_=[^&]*/,

        /**
         *
         */
        rucHeaders = /(^|\-)([a-z])/g,

        /**
         *
         */
        rucHeadersFunc = function(_, $1, $2)
        {
            return $1 + $2.toUpperCase();
        },

        /**
         *
         */
        rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/,

        /**
         * Mantenha uma cópia do antigo método de carregamento.
         */
        _load = jQuery.fn.load,

        /**
         * Pré-filtros:
         *     1) Eles são úteis para introduzir tipos de dados
         *        personalizados (consulte ajax/jsonp.js para
         *        obter um exemplo).
         * 
         *     2) Estes são chamados:
         *         - ANTES de pedir um transporte.
         *         - DEPOIS da serialização do parâmetro (s.data
         *           é uma string se s.processData for verdadeiro).
         * 
         *     3) A chave é o dataType.
         *     4) O símbolo catchall "*" pode ser usado.
         *     5) A execução começará com transport dataType e
         *        depois continuará até "*" se necessário.
         */
        prefilters = {},

        /**
         * Vinculações de transporte:
         *     1) A chave é o dataType.
         *     2) O símbolo catchall "*" pode ser usado.
         *     3) A seleção começará com transport dataType
         *        e ENTÃO irá para "*" se necessário.
         */
        transports = {},

        /**
         * Localização do documento.
         */
        ajaxLocation,

        /**
         * Segmentos de localização do documento.
         */
        ajaxLocParts;

    /**
     * #8138, o IE pode gerar uma exceção ao acessar um campo
     * de document.location se document.domain tiver sido
     * definido.
     */
    try
    {
        ajaxLocation = document.location.href;
    } catch (e)
    {
        /**
         * Use o atributo href de um elemento A, pois o IE
         * irá modificá-lo em um determinado document.location.
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
     * Base "constructor" para jQuery.ajaxPrefilter e
     * jQuery.ajaxTransport.
     */
    function addToPrefiltersOrTransports(structure)
    {
        /**
         * dataTypeExpression é opcional e o padrão é "*".
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
                var dataTypes = dataTypeExpression.toLowerCase().split(rspacesAjax),
                    i = 0,
                    length = dataTypes.length,
                    dataType,
                    list,
                    placeBefore;

                /**
                 * Para cada dataType no dataTypeExpression.
                 */
                for (; i < length; i++)
                {
                    dataType = dataTypes[i];

                    /**
                     * Nós controlamos se somos solicitados a adicionar
                     * antes de qualquer elemento existente.
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
     * @param dataType internal.
     * @param inspected internal.
     * 
     * 
     */
    function inspectPrefiltersOrTransports(structure, options, originalOptions, jqXHR, dataType, inspected)
    {
        dataType = dataType || options.dataTypes[0];
        inspected = inspected || {};
        inspected[dataType] = true;

        var list = structure[dataType],
            i = 0,
            length = list ? list.length : 0,
            executeOnly = (structure === prefilters),
            selection;

        for (; i < length && (executeOnly || !selection); i++)
        {
            selection = list[i](options, originalOptions, jqXHR);

            /**
             * Se formos redirecionados para outro tipo de dados,
             * tentaremos lá se estiver executando apenas e ainda
             * não estiver concluído.
             */
            if (typeof selection === "string")
            {
                if (!executeOnly || inspected[selection])
                {
                    selection = undefined;
                } else
                {
                    options.dataTypes.unshift(selection);
                    selection = inspectPrefiltersOrTransports(structure, options, originalOptions, jqXHR, selection, inspected);
                }
            }
        }

        /**
         * Se estivermos apenas executando ou nada foi selecionado,
         * tentamos o catchall dataType se ainda não tiver feito.
         */
        if ((executeOnly || !selection) && !inspected["*"])
        {
            selection = inspectPrefiltersOrTransports(structure, options, originalOptions, jqXHR, "*", inspected);
        }

        /**
         * Desnecessário ao executar apenas (pré-filtros), mas
         * será ignorado pelo chamador nesse caso.
         */
        return selection;
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
                 * Não faça uma solicitação se nenhum elemento estiver
                 * sendo solicitado.
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
             * Padrão para uma solicitação GET.
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
                 * Retorno de chamada completo (responseText é usado
                 * internamente).
                 */
                complete: function(jqXHR, status, responseText)
                {
                    /**
                     * Armazene a resposta conforme especificado
                     * pelo objeto jqXHR.
                     */
                    responseText = jqXHR.responseText;

                    /**
                     * Se for bem-sucedido, injete o HTML em todos
                     * os elementos correspondentes.
                     */
                    if (jqXHR.isResolved())
                    {
                        /**
                         * #4825: Obtenha a resposta real caso um
                         * dataFilter esteja presente em ajaxSettings.
                         */
                        jqXHR.done(function(r)
                        {
                            responseText = r;
                        });

                        /**
                         * Veja se um seletor foi especificado.
                         */
                        self.html(selector ?
                            /**
                             * Crie um div fictício para armazenar os
                             * resultados.
                             */
                            jQuery("<div>")

                            /**
                             * injete o conteúdo do documento, removendo
                             * os scripts para evitar erros de 'Permissão Negada'
                             * no IE.
                             */
                            .append(responseText.replace(rscript, ""))

                            /**
                             * Localize os elementos especificados.
                             */
                            .find(selector) :

                            /**
                             * Caso contrário, basta injetar o resultado
                             * completo.
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
                return val == null ? null : jQuery.isArray(val) ? jQuery.map(val, function(val, i)
                {
                    return {
                        name: elem.name,
                        value: val.replace(rCRLF, "\r\n")
                    };
                }) : {
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
            return this.bind(o, f);
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
             * Argumentos de deslocamento se o argumento de dados
             * foi omitido.
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
         * Cria um objeto de configurações completo no destino
         * com ajaxSettings e campos de configurações. Se target
         * for omitido, grava em ajaxSettings.
         */
        ajaxSetup: function(target, settings)
        {
            if (!settings)
            {
                /**
                 * Apenas um parâmetro, estendemos ajaxSettings.
                 */
                settings = target;
                target = jQuery.extend(true, jQuery.ajaxSettings, settings);
            } else
            {
                /**
                 * Alvo foi fornecido, nós estendemos para ele.
                 */
                jQuery.extend(true, target, jQuery.ajaxSettings, settings);
            }

            /**
             * Campos achatados que não queremos que sejam estendidos
             * profundamente.
             */
            for (var field in {context: 1, url: 1})
            {
                if (field in settings)
                {
                    target[field] = settings[field];
                } else if (field in jQuery.ajaxSettings)
                {
                    target[field] = jQuery.ajaxSettings[field];
                }
            }

            return target;
        },

        /**
         *
         */
        ajaxSettings: {
            url: ajaxLocation,
            isLocal: rlocalProtocol.test(ajaxLocParts[1]),
            global: true,
            type: "GET",
            contentType: "application/x-www-form-urlencoded",
            processData: true,
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
            accepts: {
                xml: "application/xml, text/xml",
                html: "text/html",
                text: "text/plain",
                json: "application/json, text/javascript",
                "*": "*/*"
            },

            contents: {
                xml: /xml/,
                html: /html/,
                json: /json/
            },

            responseFields: {
                xml: "responseXML",
                text: "responseText"
            },

            /**
             * Lista de conversores de dados:
             *     1) formato de chave é "source_type destination_type"
             *       (um único espaço entre eles).
             *
             *     2) o símbolo catchall "*" pode ser usado para
             *        source_type.
             */
            converters: {
                /**
                 * Converta qualquer coisa em texto.
                 */
                "* text": window.String,

                /**
                 * Texto para html (verdadeiro = sem transformação).
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
            }
        },

        /**
         *
         */
        ajaxPrefilter: addToPrefiltersOrTransports(prefilters),
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
             *
             */
            var
                /**
                 * Crie o objeto de opções finais.
                 */
                s = jQuery.ajaxSetup({}, options),

                /**
                 * Contexto de retorno de chamada.
                 */
                callbackContext = s.context || s,

                /**
                 * Contexto para eventos globais.
                 * É o callbackContext se um foi fornecido nas opções
                 * e se for um nó DOM ou uma coleção jQuery.
                 */
                globalEventContext = callbackContext !== s && (callbackContext.nodeType || callbackContext instanceof jQuery) ? jQuery(callbackContext) : jQuery.event,

                /**
                 * Diferidos.
                 */
                deferred = jQuery.Deferred(),
                completeDeferred = jQuery._Deferred(),

                /**
                 * Callbacks dependentes de status.
                 */
                statusCode = s.statusCode || {},

                /**
                 * Chave ifModified.
                 */
                ifModifiedKey,

                /**
                 * Cabeçalhos (são enviados todos de uma vez).
                 */
                requestHeaders = {},

                /**
                 * Cabeçalhos de resposta.
                 */
                responseHeadersString,
                responseHeaders,

                /**
                 * Transporte.
                 */
                transport,

                /**
                 * Identificador de tempo limite.
                 */
                timeoutTimer,

                /**
                 * Variáveis de detecção entre domínios.
                 */
                parts,

                /**
                 * O estado jqXHR.
                 */
                state = 0,

                /**
                 * Para saber se eventos globais devem ser despachados.
                 */
                fireGlobals,

                /**
                 * Variável de loop.
                 */
                i,

                /**
                 * xhr falso.
                 */
                jqXHR = {
                    /**
                     *
                     */
                    readyState: 0,

                    /**
                     * Armazena o cabeçalho.
                     */
                    setRequestHeader: function(name, value)
                    {
                        if (!state)
                        {
                            requestHeaders[name.toLowerCase().replace(rucHeaders, rucHeadersFunc)] = value;
                        }

                        return this;
                    },

                    /**
                     * Corda crua.
                     */
                    getAllResponseHeaders: function()
                    {
                        return state === 2 ? responseHeadersString : null;
                    },

                    /**
                     * Constrói cabeçalhos hashtable, se necessário.
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
                     * Substitui o cabeçalho do tipo de conteúdo da
                     * resposta.
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
             * Callback para quando tudo estiver pronto.
             * Está definido aqui porque o jslint reclama se
             * for declarado no final da função (o que seria
             * mais lógico e legível).
             */
            function done(status, statusText, responses, headers)
            {
                /**
                 * Liguei uma vez.
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
                 * Transporte de referência para coleta de lixo
                 * antecipada (não importa quanto tempo o objeto
                 * jqXHR será usado).
                 */
                transport = undefined;

                /**
                 * Cachear cabeçalhos de resposta.
                 */
                responseHeadersString = headers || "";

                /**
                 * Definir readyState.
                 */
                jqXHR.readyState = status ? 4 : 0;

                /**
                 *
                 */
                var isSuccess,
                    success,
                    error,
                    response = responses ? ajaxHandleResponses(s, jqXHR, responses) : undefined,
                    lastModified,
                    etag;

                /**
                 * Se for bem-sucedido, manipule o encadeamento de
                 * tipos.
                 */
                if (status >= 200 && status < 300 || status === 304)
                {
                    /**
                     * Defina o cabeçalho If-Modified-Since e/ou
                     * If-None-Match, se estiver no modo ifModified.
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
                        } catch (e)
                        {
                            /**
                             * Temos um parsererror.
                             */
                            statusText = "parsererror";
                            error = e;
                        }
                    }
                } else
                {
                    /**
                     * Extraímos o erro do statusText e normalizamos
                     * o statusText e o status para não abortar.
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
                jqXHR.statusText = statusText;

                /**
                 * Sucesso/Erro.
                 */
                if (isSuccess)
                {
                    deferred.resolveWith(callbackContext, [
                        success,
                        statusText,
                        jqXHR
                    ]);
                } else
                {
                    deferred.rejectWith(callbackContext, [
                        jqXHR,
                        statusText,
                        error
                    ]);
                }

                /**
                 * Callbacks dependentes de status.
                 */
                jqXHR.statusCode(statusCode);
                statusCode = undefined;

                if (fireGlobals)
                {
                    globalEventContext.trigger("ajax" + (isSuccess ? "Success" : "Error"), [
                        jqXHR,
                        s,
                        isSuccess ? success : error
                    ]);
                }

                /**
                 * Completo.
                 */
                completeDeferred.resolveWith(callbackContext, [jqXHR, statusText]);

                if (fireGlobals)
                {
                    globalEventContext.trigger("ajaxComplete", [jqXHR, s]);

                    /**
                     * Manipule o contador AJAX global.
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

            /**
             *
             */
            jqXHR.success = jqXHR.done;
            jqXHR.error = jqXHR.fail;
            jqXHR.complete = completeDeferred.done;

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
             * Remova o caractere hash (#7531: e promoção de string).
             * Adicionar protocolo se não for fornecido (#5866:
             * problema do IE7 com URLs sem protocolo). Também
             * usamos o parâmetro url, se disponível.
             */
            s.url = (
                (url || s.url) + ""
            ).replace(rhash, "").replace(rprotocol, ajaxLocParts[1] + "//");

            /**
             * Extraia a lista de tipos de dados.
             */
            s.dataTypes = jQuery.trim(s.dataType || "*").toLowerCase().split(rspacesAjax);

            /**
             * Determine se uma solicitação entre domínios está
             * em ordem.
             */
            if (s.crossDomain == null)
            {
                parts = rurl.exec(s.url.toLowerCase());
                s.crossDomain = !!(parts && (parts[1] != ajaxLocParts[1] || parts[2] != ajaxLocParts[2] || (parts[3] || (parts[1] === "http:" ? 80 : 443)) != (ajaxLocParts[3] || (ajaxLocParts[1] === "http:" ? 80 : 443))));
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
             * Se a solicitação foi abortada dentro de um
             * pré-arquivador, pare aí.
             */
            if (state === 2)
            {
                return false;
            }

            /**
             * Podemos disparar eventos globais a partir de agora,
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
             * Mais opções de tratamento para solicitações sem
             * conteúdo.
             */
            if (!s.hasContent)
            {
                /**
                 * Se houver dados disponíveis, anexe os dados
                 * ao url.
                 */
                if (s.data)
                {
                    s.url += (rquery.test(s.url) ? "&" : "?") + s.data;
                }

                /**
                 * Obtenha ifModifiedKey antes de adicionar o
                 * parâmetro anti-cache.
                 */
                ifModifiedKey = s.url;

                /**
                 * Adicione anti-cache no URL, se necessário.
                 */
                if (s.cache === false)
                {
                    var ts = jQuery.now(),
                        /**
                         * Tente substituir _= se estiver lá.
                         */
                        ret = s.url.replace(rts, "$1_=" + ts);

                    /**
                     * Se nada foi substituído, adicione timestamp
                     * ao final.
                     */
                    s.url = ret + (
                        (ret === s.url) ? (rquery.test(s.url) ? "&" : "?") + "_=" + ts : ""
                    );
                }
            }

            /**
             * Defina o cabeçalho correto, se os dados estiverem
             * sendo enviados.
             */
            if (s.data && s.hasContent && s.contentType !== false || options.contentType)
            {
                requestHeaders["Content-Type"] = s.contentType;
            }

            /**
             * Defina o cabeçalho If-Modified-Since e/ou If-None-Match,
             * se estiver no modo ifModified.
             */
            if (s.ifModified)
            {
                ifModifiedKey = ifModifiedKey || s.url;
                if (jQuery.lastModified[ifModifiedKey])
                {
                    requestHeaders["If-Modified-Since"] = jQuery.lastModified[ifModifiedKey];
                }

                if (jQuery.etag[ifModifiedKey])
                {
                    requestHeaders["If-None-Match"] = jQuery.etag[ifModifiedKey];
                }
            }

            /**
             * Defina o cabeçalho Accepts para o servidor,
             * dependendo do dataType.
             */
            requestHeaders.Accept = s.dataTypes[0] && s.accepts[s.dataTypes[0]] ? s.accepts[s.dataTypes[0]] + (s.dataTypes[0] !== "*" ? ", */*; q=0.01" : "") : s.accepts["*"];

            /**
             * Verifique a opção de cabeçalhos.
             */
            for (i in s.headers)
            {
                jqXHR.setRequestHeader(i, s.headers[i]);
            }

            /**
             * Permitir cabeçalhos/tipos MIME personalizados e abortar
             * antecipadamente.
             */
            if (s.beforeSend && (s.beforeSend.call(callbackContext, jqXHR, s) === false || state === 2))
            {
                /**
                 * Abortar se ainda não tiver feito.
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
             * Obter transporte.
             */
            transport = inspectPrefiltersOrTransports(transports, s, options, jqXHR);

            /**
             * Se não houver transporte, abortamos automaticamente.
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
                    }, s.timeout);
                }

                try
                {
                    state = 1;
                    transport.send(requestHeaders, done);
                } catch (e)
                {
                    /**
                     * Propagar exceção como erro se não for feito.
                     */
                    if (status < 2)
                    {
                        done(-1, e);

                        /**
                         * Basta jogar novamente caso contrário.
                         */
                    } else
                    {
                        jQuery.error(e);
                    }
                }
            }

            return jqXHR;
        },

        /**
         * Serialize uma matriz de elementos de formulário ou
         * um conjunto de chaves/valores em uma string de
         * consulta.
         */
        param: function(a, traditional)
        {
            /**
             *
             */
            var s = [],
                /**
                 *
                 */
                add = function(key, value)
                {
                    /**
                     * Se value for uma função, invoque-a e retorne
                     * seu valor.
                     */
                    value = jQuery.isFunction(value) ? value() : value;

                    /**
                     *
                     */
                    s[s.length] = encodeURIComponent(key) + "=" + encodeURIComponent(value);
                };

            /**
             * Defina tradicional como true para o comportamento
             * jQuery <= 1.3.2.
             */
            if (traditional === undefined)
            {
                traditional = jQuery.ajaxSettings.traditional;
            }

            /**
             * Se uma matriz foi passada, assuma que é uma matriz de
             * elementos de formulário.
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
                 * Se for tradicional, codifique da maneira "antiga"
                 * (da maneira que o 1.3.2 ou mais antigo fazia), caso
                 * contrário, codifique os parâmetros recursivamente.
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
        if (jQuery.isArray(obj) && obj.length)
        {
            /**
             * Serialize o item da matriz.
             */
            jQuery.each(obj, function(i, v)
            {
                if (traditional || rbracket.test(prefix))
                {
                    /**
                     * Trate cada item do array como um escalar.
                     */
                    add(prefix, v);
                } else
                {
                    /**
                     * Se o item da matriz for não escalar (matriz ou
                     * objeto), codifique seu índice numérico para
                     * resolver problemas de ambiguidade de desserialização.
                     * Observe que o rack (a partir de 1.0.0) não pode
                     * desserializar arrays aninhados corretamente e
                     * tentar fazer isso pode causar um erro no
                     * servidor. As possíveis correções são modificar
                     * o algoritmo de desserialização do rack ou
                     * fornecer uma opção ou sinalizador para forçar a
                     * serialização da matriz a ser superficial.
                     */
                    buildParams(prefix + "[" + (typeof v === "object" || jQuery.isArray(v) ? i : "") + "]", v, traditional, add);
                }
            });
        } else if (!traditional && obj != null && typeof obj === "object")
        {
            /**
             * Se vemos um array aqui, ele está vazio e deve ser
             * tratado como um objeto vazio.
             */
            if (jQuery.isArray(obj) || jQuery.isEmptyObject(obj))
            {
                add(prefix, "");

                /**
                 * Serialize o item do objeto.
                 */
            } else
            {
                for (var name in obj)
                {
                    buildParams(prefix + "[" + name + "]", obj[name], traditional, add);
                }
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
         * Cache de cabeçalho da última modificação para a próxima
         * solicitação.
         */
        lastModified: {},

        /**
         *
         */
        etag: {}
    });

    /**
     * Manipula as respostas a uma solicitação ajax:
     *     - Define todos os campos responseXXX de acordo.
     *     - Encontra o dataType correto (medeia entre o tipo
     *       de conteúdo e o dataType esperado).
     *     - Retorna a resposta correspondente.
     */
    function ajaxHandleResponses(s, jqXHR, responses)
    {
        var contents = s.contents,
            dataTypes = s.dataTypes,
            responseFields = s.responseFields,
            ct,
            type,
            finalDataType,
            firstDataType;

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
        while (dataTypes[0] === "*")
        {
            dataTypes.shift();
            if (ct === undefined)
            {
                ct = s.mimeType || jqXHR.getResponseHeader("content-type");
            }
        }

        /**
         * Verifique se estamos lidando com um tipo de conteúdo
         * conhecido.
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
         * Verifique se temos uma resposta para o dataType
         * esperado.
         */
        if (dataTypes[0] in responses)
        {
            finalDataType = dataTypes[0];
        } else
        {
            /**
             * Tente dataTypes conversíveis.
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
         * Se encontramos um dataType.
         * Adicionamos o dataType à lista, se necessário, e
         * retornamos a resposta correspondente.
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
     * Conversões em cadeia de acordo com a solicitação e a
     * resposta original.
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

        var dataTypes = s.dataTypes,
            converters = {},
            i,
            key,
            length = dataTypes.length,
            tmp,

            /**
             * dataTypes atuais e anteriores.
             */
            current = dataTypes[0],

            /**
             *
             */
            prev,

            /**
             * Expressão de conversão.
             */
            conversion,

            /**
             * Função de conversão.
             */
            conv,

            /**
             * Funções de conversão (conversão transitiva).
             */
            conv1,
            conv2;

        /**
         * Para cada dataType na cadeia.
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
             * Se atual for auto dataType, atualize-o para
             * anterior.
             */
            if (current === "*")
            {
                current = prev;

                /**
                 * Se nenhum auto e dataTypes forem realmente
                 * diferentes.
                 */
            } else if (prev !== "*" && prev !== current)
            {
                /**
                 * Obtenha o conversor.
                 */
                conversion = prev + " " + current;
                conv = converters[conversion] || converters["* " + current];

                /**
                 * Se não houver conversor direto, pesquise
                 * transitivamente.
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
                 * Se não encontrarmos nenhum conversor, envie
                 * um erro.
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
    var jsc = jQuery.now(),
        jsre = /(\=)\?(&|$)|\?\?/i;

    /**
     * Configurações jsonp padrão.
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
        var dataIsString = (typeof s.data === "string");
        if (s.dataTypes[0] === "jsonp" || originalSettings.jsonpCallback || originalSettings.jsonp != null || s.jsonp !== false && (jsre.test(s.url) || dataIsString && jsre.test(s.data)))
        {
            /**
             *
             */
            var responseContainer,
                /**
                 *
                 */
                jsonpCallback = s.jsonpCallback = jQuery.isFunction(s.jsonpCallback) ? s.jsonpCallback() : s.jsonpCallback,

                /**
                 *
                 */
                previous = window[jsonpCallback],

                /**
                 *
                 */
                url = s.url,

                /**
                 *
                 */
                data = s.data,

                /**
                 *
                 */
                replace = "$1" + jsonpCallback + "$2",

                /**
                 *
                 */
                cleanUp = function()
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
                };

            if (s.jsonp !== false)
            {
                url = url.replace(jsre, replace);
                if (s.url === url)
                {
                    if (dataIsString)
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
             * Instale a função de limpeza.
             */
            jqXHR.then(cleanUp, cleanUp);

            /**
             * Use o conversor de dados para recuperar json após a
             * execução do script.
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
             * Force json dataType.
             */
            s.dataTypes[0] = "json";

            /**
             * Delegue ao script.
             */
            return "script";
        }
    });

    /**
     * Instale o script dataType.
     */
    jQuery.ajaxSetup({
        /**
         *
         */
        accepts: {
            script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
        },

        /**
         *
         */
        contents: {
            script: /javascript|ecmascript/
        },

        /**
         *
         */
        converters: {
            "text script": function(text) {
                jQuery.globalEval(text);
                return text;
            }
        }
    });

    /**
     * Lidar com o caso especial e global do cache.
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
     * Lidar com o caso especial e global do cache.
     */
    jQuery.ajaxTransport("script", function(s)
    {
        /**
         * Este transporte lida apenas com solicitações entre
         * domínios.
         */
        if (s.crossDomain)
        {
            /**
             *
             */
            var script,
                /**
                 *
                 */
                head = document.head || document.getElementsByTagName("head")[0] || document.documentElement;

            /**
             *
             */
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

                    /**
                     *
                     */
                    script.src = s.url;

                    /**
                     * Anexe manipuladores para todos os navegadores.
                     */
                    script.onload = script.onreadystatechange = function(_, isAbort)
                    {
                        if (!script.readyState || /loaded|complete/.test(script.readyState))
                        {
                            /**
                             * Lidar com vazamento de memória no IE.
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
                             * Callback se não abortar.
                             */
                            if (!isAbort)
                            {
                                callback(200, "success");
                            }
                        }
                    };

                    /**
                     * Use insertBefore em vez de appendChild para
                     * contornar um bug do IE6. Isso ocorre quando
                     * um nó base é usado (#2709 e #4378).
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
     *
     */
    var
        /**
         * #5280: próximo id de xhr ativo e lista de callbacks
         * de xhrs ativos.
         */
        xhrId = jQuery.now(),
        xhrCallbacks,

        /**
         * XHR usado para determinar as propriedades dos suportes.
         */
        testXHR;

    /**
     * #5280: O Internet Explorer manterá as conexões ativas
     * se não interrompermos o descarregamento.
     */
    function xhrOnUnloadAbort()
    {
        jQuery(window).unload(function()
        {
            /**
             * Cancele todas as solicitações pendentes.
             */
            for (var key in xhrCallbacks)
            {
                xhrCallbacks[key](0, 1);
            }
        });
    }

    /**
     * Funções a criar xhrs.
     */
    function createStandardXHR()
    {
        try
        {
            return new window.XMLHttpRequest();
        } catch (e)
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
        } catch (e)
        {
        }
    }

    /**
     * Crie o objeto de solicitação. (Isso ainda está anexado a
     * ajaxSettings para compatibilidade com versões
     * anteriores).
     */
    jQuery.ajaxSettings.xhr = window.ActiveXObject ?
        /**
         * A Microsoft não implementou corretamente o XMLHttpRequest
         * no IE7 (não pode solicitar arquivos locais), então usamos
         * o ActiveXObject quando ele está disponível. Além disso,
         * XMLHttpRequest pode ser desabilitado no IE7/IE8, então
         * precisamos de um fallback.
         */
        function()
        {
            return !this.isLocal && createStandardXHR() || createActiveXHR();
        } :

        /**
         * Para todos os outros navegadores, use o objeto
         * XMLHttpRequest padrão.
         */
        createStandardXHR;

    /**
     * Teste se podemos criar um objeto xhr.
     */
    testXHR = jQuery.ajaxSettings.xhr();

    /**
     *
     */
    jQuery.support.ajax = !!testXHR;

    /**
     * Este navegador oferece suporte a solicitações
     * crossDomain XHR.
     */
    jQuery.support.cors = testXHR && ("withCredentials" in testXHR);

    /**
     * Não há mais necessidade do xhr temporário.
     */
    testXHR = undefined;

    /**
     * Crie transporte se o navegador puder fornecer um xhr.
     */
    if (jQuery.support.ajax)
    {
        jQuery.ajaxTransport(function(s)
        {
            /**
             * Domínio cruzado permitido apenas se suportado por
             * XMLHttpRequest.
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
                        var xhr = s.xhr(),
                            handle,
                            i;

                        /**
                         * Abra a tomada.
                         * A passagem de nome de usuário nulo gera um
                         * pop-up de login no Opera (#2865).
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
                         * Cabeçalho X-Requested-With. Para solicitações
                         * entre domínios, visto que as condições para
                         * um preflight são semelhantes a um
                         * quebra-cabeça, simplesmente nunca o definimos
                         * para ter certeza. (sempre pode ser definido
                         * por solicitação ou mesmo usando ajaxSetup).
                         * Para solicitações de mesmo domínio, não
                         * mudará o cabeçalho se já fornecido.
                         */
                        if (!s.crossDomain && !headers["X-Requested-With"])
                        {
                            headers["X-Requested-With"] = "XMLHttpRequest";
                        }

                        /**
                         * Precisa de um try/catch extra para
                         * solicitações entre domínios no Firefox 3.
                         */
                        try
                        {
                            for (i in headers)
                            {
                                xhr.setRequestHeader(i, headers[i]);
                            }
                        } catch (_)
                        {
                        }

                        /**
                         * Envie o pedido.
                         * Isso pode gerar uma exceção que é realmente
                         * tratada em jQuery.ajax (portanto, não
                         * tente/pegue aqui).
                         */
                        xhr.send((s.hasContent && s.data) || null);

                        /**
                         * Ouvinte.
                         */
                        callback = function(_, isAbort)
                        {
                            var status,
                                statusText,
                                responseHeaders,
                                responses,
                                xml;

                            /**
                             * O Firefox lança exceções ao acessar as
                             * propriedades de um xhr quando ocorreu um
                             * erro de rede.
                             *
                             * http://helpful.knobs-dials.com/index.php/Component_returned_failure_code:_0x80040111_(NS_ERROR_NOT_AVAILABLE).
                             */
                            try
                            {
                                /**
                                 * Nunca foi chamado e está abortado ou
                                 * completo.
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

                                        delete xhrCallbacks[handle];
                                    }

                                    /**
                                     * Se for abortar.
                                     */
                                    if (isAbort)
                                    {
                                        /**
                                         * Interrompa-o manualmente, se necessário.
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
                                         * Construir lista de respostas.
                                         * 
                                         * xml && xml.documentElement - #4958.
                                         */
                                        if (xml && xml.documentElement)
                                        {
                                            responses.xml = xml;
                                        }

                                        responses.text = xhr.responseText;

                                        /**
                                         * O Firefox lança uma exceção ao acessar
                                         * o statusText para solicitações entre
                                         * domínios com falha.
                                         */
                                        try
                                        {
                                            statusText = xhr.statusText;
                                        } catch (e)
                                        {
                                            /**
                                             * Normalizamos com Webkit dando um statusText
                                             * vazio.
                                             */
                                            statusText = "";
                                        }

                                        /**
                                         * Status do filtro para comportamentos fora do padrão.
                                         */

                                        /**
                                         * Se a solicitação for local e tivermos dados:
                                         * assuma um sucesso (sucesso sem dados não será
                                         * notificado, é o melhor que podemos fazer com
                                         * as implementações atuais).
                                         */
                                        if (!status && s.isLocal && !s.crossDomain)
                                        {
                                            status = responses.text ? 200 : 404;

                                            /**
                                             * IE - #1450: às vezes retorna 1223 quando deveria
                                             * ser 204.
                                             */
                                        } else if (status === 1223)
                                        {
                                            status = 204;
                                        }
                                    }
                                }
                            } catch (firefoxAccessException)
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
                         * Se estivermos no modo de sincronização ou no
                         * cache e tiver sido recuperado diretamente
                         * (IE6 e IE7), precisamos disparar manualmente
                         * o retorno de chamada.
                         */
                        if (!s.async || xhr.readyState === 4)
                        {
                            callback();
                        } else
                        {
                            /**
                             * Crie a lista de retornos de chamada xhrs
                             * ativos, se necessário, e anexe o
                             * manipulador de descarga.
                             */
                            if (!xhrCallbacks)
                            {
                                xhrCallbacks = {};
                                xhrOnUnloadAbort();
                            }

                            /**
                             * Adicionar à lista de retornos de chamada
                             * xhrs ativos.
                             */
                            handle = xhrId++;

                            /**
                             *
                             */
                            xhr.onreadystatechange = xhrCallbacks[handle] = callback;
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
    var elemdisplay = {},
        /**
         *
         */
        rfxtypes = /^(?:toggle|show|hide)$/,

        /**
         *
         */
        rfxnum = /^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i,

        /**
         *
         */
        timerId,

        /**
         *
         */
        fxAttrs = [
            /**
             * Animações de altura.
             */
            ["height", "marginTop", "marginBottom", "paddingTop", "paddingBottom"],

            /**
             * Animações de largura.
             */
            ["width", "marginLeft", "marginRight", "paddingLeft", "paddingRight"],

            /**
             * Animações de opacidade.
             */
            ["opacity"]
        ];

    /**
     *
     */
    jQuery.fn.extend({
        /**
         *
         */
        show: function(speed, easing, callback)
        {
            var elem,
                display;

            if (speed || speed === 0)
            {
                return this.animate(genFx("show", 3), speed, easing, callback);
            } else
            {
                for (var i = 0, j = this.length; i < j; i++)
                {
                    elem = this[i];
                    display = elem.style.display;

                    /**
                     * Redefina a exibição inline deste elemento para
                     * saber se ele está sendo oculto por regras em
                     * cascata ou não.
                     */
                    if (!jQuery._data(elem, "olddisplay") && display === "none")
                    {
                        display = elem.style.display = "";
                    }

                    /**
                     * Defina os elementos que foram substituídos por
                     * display: none, em uma folha de estilo para
                     * qualquer que seja o estilo padrão do navegador
                     * para tal elemento.
                     */
                    if (display === "" && jQuery.css(elem, "display") === "none")
                    {
                        jQuery._data(elem, "olddisplay", defaultDisplay(elem.nodeName));
                    }
                }

                /**
                 * Defina a exibição da maioria dos elementos em um
                 * segundo loop para evitar o refluxo constante.
                 */
                for (i = 0; i < j; i++)
                {
                    elem = this[i];
                    display = elem.style.display;

                    if (display === "" || display === "none")
                    {
                        elem.style.display = jQuery._data(elem, "olddisplay") || "";
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
                for (var i = 0, j = this.length; i < j; i++)
                {
                    var display = jQuery.css(this[i], "display");
                    if (display !== "none" && !jQuery._data(this[i], "olddisplay"))
                    {
                        jQuery._data(this[i], "olddisplay", display);
                    }
                }

                /**
                 * Defina a exibição dos elementos em um segundo loop
                 * para evitar o refluxo constante.
                 */
                for (i = 0; i < j; i++)
                {
                    this[i].style.display = "none";
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
                this._toggle.apply(this, arguments);
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
            return this.filter(":hidden").css("opacity", 0).show().end().animate({
                opacity: to
            }, speed, easing, callback);
        },

        /**
         *
         */
        animate: function(prop, speed, easing, callback)
        {
            var optall = jQuery.speed(speed, easing, callback);

            if (jQuery.isEmptyObject(prop))
            {
                return this.each(optall.complete);
            }

            return this[optall.queue === false ? "each" : "queue"](function()
            {
                /**
                 * XXX - 'this' nem sempre tem um nodeName ao
                 * executar o conjunto de testes.
                 */
                var opt = jQuery.extend({}, optall),
                    p,
                    isElement = this.nodeType === 1,
                    hidden = isElement && jQuery(this).is(":hidden"),
                    self = this;

                for (p in prop)
                {
                    var name = jQuery.camelCase(p);

                    if (p !== name)
                    {
                        prop[name] = prop[p];
                        delete prop[p];

                        p = name;
                    }

                    if (prop[p] === "hide" && hidden || prop[p] === "show" && !hidden)
                    {
                        return opt.complete.call(this);
                    }

                    if (isElement && (p === "height" || p === "width"))
                    {
                        /**
                         * Certifique-se de que nada escapa. Registre
                         * todos os 3 atributos de estouro porque o IE
                         * não altera o atributo de estouro quando
                         * overflowX e overflowY são definidos com o
                         * mesmo valor.
                         */
                        opt.overflow = [
                            this.style.overflow,
                            this.style.overflowX,
                            this.style.overflowY
                        ];

                        /**
                         * Defina a propriedade de exibição como bloco
                         * embutido para animações de altura/largura em
                         * elementos embutidos que têm largura/altura
                         * animada.
                         */
                        if (jQuery.css(this, "display") === "inline" && jQuery.css(this, "float") === "none")
                        {
                            if (!jQuery.support.inlineBlockNeedsLayout)
                            {
                                this.style.display = "inline-block";
                            } else
                            {
                                var display = defaultDisplay(this.nodeName);

                                /**
                                 * Elementos inline-level aceita inline-block;
                                 * Os elementos de nível de bloco precisam
                                 * estar alinhados com o layout.
                                 */
                                if (display === "inline")
                                {
                                    this.style.display = "inline-block";
                                } else
                                {
                                    this.style.display = "inline";
                                    this.style.zoom = 1;
                                }
                            }
                        }
                    }

                    if (jQuery.isArray(prop[p]))
                    {
                        /**
                         * Crie (se necessário) e adicione a specialEasing.
                         */
                        (opt.specialEasing = opt.specialEasing || {})[p] = prop[p][1];

                        /**
                         *
                         */
                        prop[p] = prop[p][0];
                    }
                }

                if (opt.overflow != null)
                {
                    this.style.overflow = "hidden";
                }

                /**
                 *
                 */
                opt.curAnim = jQuery.extend({}, prop);

                /**
                 *
                 */
                jQuery.each(prop, function(name, val)
                {
                    var e = new jQuery.fx(self, opt, name);

                    if (rfxtypes.test(val))
                    {
                        e[val === "toggle" ? hidden ? "show" : "hide" : val](prop);
                    } else
                    {
                        var parts = rfxnum.exec(val),
                            start = e.cur();

                        if (parts)
                        {
                            var end = parseFloat(parts[2]),
                                unit = parts[3] || (jQuery.cssNumber[name] ? "" : "px");

                            /**
                             * Precisamos calcular o valor inicial.
                             */
                            if (unit !== "px")
                            {
                                jQuery.style(self, name, (end || 1) + unit);
                                start = ((end || 1) / e.cur()) * start;
                                jQuery.style(self, name, start + unit);
                            }

                            /**
                             * Se um token +=/-= foi fornecido, estamos
                             * fazendo uma animação relativa.
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
                });

                /**
                 * Para conformidade estrita de JS.
                 */
                return true;
            });
        },

        /**
         *
         */
        stop: function(clearQueue, gotoEnd)
        {
            var timers = jQuery.timers;

            if (clearQueue)
            {
                this.queue([]);
            }

            this.each(function()
            {
                /**
                 * Vá na ordem inversa para que qualquer coisa
                 * adicionada à fila durante o loop seja ignorada.
                 */
                for (var i = timers.length - 1; i >= 0; i--)
                {
                    if (timers[i].elem === this)
                    {
                        if (gotoEnd)
                        {
                            /**
                             * Forçar o próximo passo a ser o último.
                             */
                            timers[i](true);
                        }

                        timers.splice(i, 1);
                    }
                }
            });

            /**
             * Iniciar o próximo na fila se a última etapa não
             * foi forçada.
             */
            if (!gotoEnd)
            {
                this.dequeue();
            }

            return this;
        }
    });

    /**
     *
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

        fadeIn: {
            opacity: "show"
        },

        fadeOut: {
            opacity: "hide"
        },

        fadeToggle: {
            opacity: "toggle"
        }
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
            var opt = speed && typeof speed === "object" ? jQuery.extend({}, speed) : {
                complete: fn || !fn && easing || jQuery.isFunction(speed) && speed,
                duration: speed,
                easing: fn && easing || easing && !jQuery.isFunction(easing) && easing
            };

            opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration : opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[opt.duration] : jQuery.fx.speeds._default;

            /**
             * Fila.
             */
            opt.old = opt.complete;
            opt.complete = function()
            {
                if (opt.queue !== false)
                {
                    jQuery(this).dequeue();
                }

                if (jQuery.isFunction(opt.old))
                {
                    opt.old.call(this);
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
            linear: function(p, n, firstNum, diff)
            {
                return firstNum + diff * p;
            },

            /**
             *
             */
            swing: function(p, n, firstNum, diff)
            {
                return ((-Math.cos(p * Math.PI) / 2) + 0.5) * diff + firstNum;
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

            if (!options.orig)
            {
                options.orig = {};
            }
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

            /**
             *
             */
            var parsed,
                /**
                 *
                 */
                r = jQuery.css(this.elem, this.prop);

            /**
             * Strings vazias, null, undefined e "auto" são convertidas
             * em 0, valores complexos como "rotate(1rad)" são
             * retornados como estão, valores simples como "10px" são
             * analisados para Float.
             */
            return isNaN(parsed = parseFloat(r)) ? !r || r === "auto" ? 0 : r : parsed;
        },

        /**
         * Inicie uma animação de um número para outro.
         */
        custom: function(from, to, unit)
        {
            var self = this,
                fx = jQuery.fx;

            this.startTime = jQuery.now();
            this.start = from;
            this.end = to;
            this.unit = unit || this.unit || (jQuery.cssNumber[this.prop] ? "" : "px");
            this.now = this.start;
            this.pos = this.state = 0;

            function t(gotoEnd)
            {
                return self.step(gotoEnd);
            }

            t.elem = this.elem;

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
            /**
             * Lembre-se de onde começamos, para que possamos
             * voltar mais tarde.
             */
            this.options.orig[this.prop] = jQuery.style(this.elem, this.prop);
            this.options.show = true;

            /**
             * Comece a animação. Certifique-se de começar com uma
             * largura/altura pequena para evitar qualquer flash
             * de conteúdo.
             */
            this.custom(this.prop === "width" || this.prop === "height" ? 1 : 0, this.cur());

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
             * Lembre-se de onde começamos, para que possamos
             * voltar mais tarde.
             */
            this.options.orig[this.prop] = jQuery.style(this.elem, this.prop);
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
            var t = jQuery.now(),
                done = true;

            if (gotoEnd || t >= this.options.duration + this.startTime)
            {
                this.now = this.end;
                this.pos = this.state = 1;
                this.update();
                this.options.curAnim[this.prop] = true;

                for (var i in this.options.curAnim)
                {
                    if (this.options.curAnim[i] !== true)
                    {
                        done = false;
                    }
                }

                if (done)
                {
                    /**
                     * Redefina o estouro.
                     */
                    if (this.options.overflow != null && !jQuery.support.shrinkWrapBlocks)
                    {
                        var elem = this.elem,
                            options = this.options;

                        /**
                         *
                         */
                        jQuery.each(["", "X", "Y"], function(index, value)
                        {
                            elem.style["overflow" + value] = options.overflow[index];
                        });
                    }

                    /**
                     * Oculte o elemento se a operação "ocultar" foi
                     * realizada.
                     */
                    if (this.options.hide)
                    {
                        jQuery(this.elem).hide();
                    }

                    /**
                     * Redefina as propriedades, se o item estiver
                     * oculto ou exibido.
                     */
                    if (this.options.hide || this.options.show)
                    {
                        for (var p in this.options.curAnim)
                        {
                            jQuery.style(this.elem, p, this.options.orig[p]);
                        }
                    }

                    /**
                     * Execute a função completa.
                     */
                    this.options.complete.call(this.elem);
                }

                return false;
            } else
            {
                var n = t - this.startTime;
                    this.state = n / this.options.duration;

                /**
                 * Execute a função easing, o padrão é swing.
                 */
                var specialEasing = this.options.specialEasing && this.options.specialEasing[this.prop];
                var defaultEasing = this.options.easing || (jQuery.easing.swing ? "swing" : "linear");

                this.pos = jQuery.easing[specialEasing || defaultEasing](this.state, n, 0, 1, this.options.duration);
                this.now = this.start + ((this.end - this.start) * this.pos);

                /**
                 * Execute a próxima etapa da animação.
                 */
                this.update();
            }

            return true;
        }
    };

    /**
     *
     */
    jQuery.extend(jQuery.fx, {
        /**
         *
         */
        tick: function()
        {
            var timers = jQuery.timers;
            for (var i = 0; i < timers.length; i++)
            {
                if (!timers[i]())
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
                    fx.elem.style[fx.prop] = (fx.prop === "width" || fx.prop === "height" ? Math.max(0, fx.now) : fx.now) + fx.unit;
                } else
                {
                    fx.elem[fx.prop] = fx.now;
                }
            }
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
     *
     */
    function defaultDisplay(nodeName)
    {
        if (!elemdisplay[nodeName])
        {
            var elem = jQuery("<" + nodeName + ">").appendTo("body"),
                display = elem.css("display");

            elem.remove();

            if (display === "none" || display === "")
            {
                display = "block";
            }

            elemdisplay[nodeName] = display;
        }

        return elemdisplay[nodeName];
    }

    /**
     *
     */
    var rtable = /^t(?:able|d|h)$/i,
        rroot = /^(?:body|html)$/i;

    /**
     *
     */
    if ("getBoundingClientRect" in document.documentElement)
    {
        jQuery.fn.offset = function(options)
        {
            var elem = this[0],
                box;

            if (options)
            {
                return this.each(function(i)
                {
                    jQuery.offset.setOffset(this, options, i);
                });
            }

            if (!elem || !elem.ownerDocument)
            {
                return null;
            }

            if (elem === elem.ownerDocument.body)
            {
                return jQuery.offset.bodyOffset(elem);
            }

            try
            {
                box = elem.getBoundingClientRect();
            } catch (e)
            {
            }

            var doc = elem.ownerDocument,
                docElem = doc.documentElement;

            /**
             * Certifique-se de que não estamos lidando com um nó
             * DOM desconectado.
             */
            if (!box || !jQuery.contains(docElem, elem))
            {
                return box ? {
                    top: box.top,
                    left: box.left
                } : {
                    top: 0,
                    left: 0
                };
            }

            var body = doc.body,
                win = getWindow(doc),
                clientTop = docElem.clientTop || body.clientTop || 0,
                clientLeft = docElem.clientLeft || body.clientLeft || 0,
                scrollTop = win.pageYOffset || jQuery.support.boxModel && docElem.scrollTop || body.scrollTop,
                scrollLeft = win.pageXOffset || jQuery.support.boxModel && docElem.scrollLeft || body.scrollLeft,
                top = box.top + scrollTop - clientTop,
                left = box.left + scrollLeft - clientLeft;

            return {
                top: top,
                left: left
            };
        };
    } else
    {
        jQuery.fn.offset = function(options)
        {
            var elem = this[0];
            if (options)
            {
                return this.each(function(i)
                {
                    jQuery.offset.setOffset(this, options, i);
                });
            }

            if (!elem || !elem.ownerDocument)
            {
                return null;
            }

            if (elem === elem.ownerDocument.body)
            {
                return jQuery.offset.bodyOffset(elem);
            }

            jQuery.offset.initialize();

            var computedStyle,
                offsetParent = elem.offsetParent,
                prevOffsetParent = elem,
                doc = elem.ownerDocument,
                docElem = doc.documentElement,
                body = doc.body,
                defaultView = doc.defaultView,
                prevComputedStyle = defaultView ? defaultView.getComputedStyle(elem, null) : elem.currentStyle,
                top = elem.offsetTop,
                left = elem.offsetLeft;

            while ((elem = elem.parentNode) && elem !== body && elem !== docElem)
            {
                if (jQuery.offset.supportsFixedPosition && prevComputedStyle.position === "fixed")
                {
                    break;
                }

                computedStyle = defaultView ? defaultView.getComputedStyle(elem, null) : elem.currentStyle;
                top -= elem.scrollTop;
                left -= elem.scrollLeft;

                if (elem === offsetParent)
                {
                    top += elem.offsetTop;
                    left += elem.offsetLeft;

                    if (jQuery.offset.doesNotAddBorder && !(jQuery.offset.doesAddBorderForTableAndCells && rtable.test(elem.nodeName)))
                    {
                        top += parseFloat(computedStyle.borderTopWidth) || 0;
                        left += parseFloat(computedStyle.borderLeftWidth) || 0;
                    }

                    prevOffsetParent = offsetParent;
                    offsetParent = elem.offsetParent;
                }

                if (jQuery.offset.subtractsBorderForOverflowNotVisible && computedStyle.overflow !== "visible")
                {
                    top += parseFloat(computedStyle.borderTopWidth) || 0;
                    left += parseFloat(computedStyle.borderLeftWidth) || 0;
                }

                prevComputedStyle = computedStyle;
            }

            if (prevComputedStyle.position === "relative" || prevComputedStyle.position === "static")
            {
                top += body.offsetTop;
                left += body.offsetLeft;
            }

            if (jQuery.offset.supportsFixedPosition && prevComputedStyle.position === "fixed")
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
    jQuery.offset = {
        /**
         *
         */
        initialize: function()
        {
            var body = document.body,
                container = document.createElement("div"),
                innerDiv,
                checkDiv,
                table,
                td,
                bodyMarginTop = parseFloat(jQuery.css(body, "marginTop")) || 0,
                html = "<div style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;'><div></div></div><table style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;' cellpadding='0' cellspacing='0'><tr><td></td></tr></table>";

            jQuery.extend(container.style, {
                position: "absolute",
                top: 0,
                left: 0,
                margin: 0,
                border: 0,
                width: "1px",
                height: "1px",
                visibility: "hidden"
            });

            container.innerHTML = html;
            body.insertBefore(container, body.firstChild);
            innerDiv = container.firstChild;
            checkDiv = innerDiv.firstChild;
            td = innerDiv.nextSibling.firstChild.firstChild;
            this.doesNotAddBorder = (checkDiv.offsetTop !== 5);
            this.doesAddBorderForTableAndCells = (td.offsetTop === 5);
            checkDiv.style.position = "fixed";
            checkDiv.style.top = "20px";

            /**
             * O safari subtrai a largura da borda pai aqui,
             * que é 5px.
             */
            this.supportsFixedPosition = (checkDiv.offsetTop === 20 || checkDiv.offsetTop === 15);
            checkDiv.style.position = checkDiv.style.top = "";
            innerDiv.style.overflow = "hidden";
            innerDiv.style.position = "relative";
            this.subtractsBorderForOverflowNotVisible = (checkDiv.offsetTop === -5);
            this.doesNotIncludeMarginInBodyOffset = (body.offsetTop !== bodyMarginTop);
            body.removeChild(container);
            jQuery.offset.initialize = jQuery.noop;
        },

        /**
         *
         */
        bodyOffset: function(body)
        {
            var top = body.offsetTop,
                left = body.offsetLeft;

            jQuery.offset.initialize();

            if (jQuery.offset.doesNotIncludeMarginInBodyOffset)
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
             * Definir a posição primeiro, caso superior/esquerdo
             * sejam definidos mesmo em um elemento estático.
             */
            if (position === "static")
            {
                elem.style.position = "relative";
            }

            var curElem = jQuery(elem),
                curOffset = curElem.offset(),
                curCSSTop = jQuery.css(elem, "top"),
                curCSSLeft = jQuery.css(elem, "left"),
                calculatePosition = (position === "absolute" || position === "fixed") && jQuery.inArray('auto', [curCSSTop, curCSSLeft]) > -1,
                props = {},
                curPosition = {},
                curTop,
                curLeft;

            /**
             * Precisa ser capaz de calcular a posição se superior
             * ou esquerdo for automático e a posição for absoluta
             * ou fixa.
             */
            if (calculatePosition)
            {
                curPosition = curElem.position();
            }

            curTop = calculatePosition ? curPosition.top : parseInt(curCSSTop, 10) || 0;
            curLeft = calculatePosition ? curPosition.left : parseInt(curCSSLeft, 10) || 0;

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

            var elem = this[0],
                /**
                 * Obter offsetParent *real*.
                 */
                offsetParent = this.offsetParent(),

                /**
                 * Obtenha compensações corretas.
                 */
                offset = this.offset(),

                /**
                 *
                 */
                parentOffset = rroot.test(offsetParent[0].nodeName) ? {
                    top: 0,
                    left: 0
                } : offsetParent.offset();

            /**
             * Subtraia as margens do elemento.
             * Observação: quando um elemento tem margin: auto,
             * offsetLeft e marginLeft são os mesmos no Safari,
             * fazendo com que offset.left seja incorretamente
             * 0.
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
                top: offset.top - parentOffset.top,
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
     * Crie os métodos scrollLeft e scrollTop.
     */
    jQuery.each(["Left", "Top"], function(i, name)
    {
        var method = "scroll" + name;
        jQuery.fn[method] = function(val)
        {
            var elem = this[0],
                win;

            if (!elem)
            {
                return null;
            }

            if (val !== undefined)
            {
                /**
                 * Defina o deslocamento de rolagem.
                 */
                return this.each(function()
                {
                    win = getWindow(this);
                    if (win)
                    {
                        win.scrollTo(!i ? val : jQuery(win).scrollLeft(), i ? val : jQuery(win).scrollTop());
                    } else
                    {
                        this[method] = val;
                    }
                });
            } else
            {
                win = getWindow(elem);

                /**
                 * Retorne o deslocamento de rolagem.
                 */
                return win ? ("pageXOffset" in win) ? win[i ? "pageYOffset" : "pageXOffset"] : jQuery.support.boxModel && win.document.documentElement[method] || win.document.body[method] : elem[method];
            }
        };
    });

    /**
     *
     */
    function getWindow(elem)
    {
        return jQuery.isWindow(elem) ? elem : elem.nodeType === 9 ? elem.defaultView || elem.parentWindow : false;
    }

    /**
     * Crie os métodos innerHeight, innerWidth, outerHeight
     * e outerWidth.
     */
    jQuery.each(["Height", "Width"], function(i, name)
    {
        var type = name.toLowerCase();

        /**
         * innerHeight e innerWidth.
         */
        jQuery.fn["inner" + name] = function()
        {
            return this[0] ? parseFloat(jQuery.css(this[0], type, "padding")) : null;
        };

        /**
         * outerHeight e outerWidth.
         */
        jQuery.fn["outer" + name] = function(margin)
        {
            return this[0] ? parseFloat(jQuery.css(this[0], type, margin ? "margin" : "border")) : null;
        };

        /**
         *
         */
        jQuery.fn[type] = function(size)
        {
            /**
             * Obter window width ou height.
             */
            var elem = this[0];

            if (!elem)
            {
                return size == null ? null : this;
            }

            if (jQuery.isFunction(size))
            {
                return this.each(function(i)
                {
                    var self = jQuery(this);
                        self[type](size.call(this, i, self[type]()));
                });
            }

            if (jQuery.isWindow(elem))
            {
                /**
                 * Todos os outros usam document.documentElement ou
                 * document.body dependendo do modo Quirks vs
                 * Standards 3ª condição permite suporte Nokia,
                 * pois suporta o docElem prop, mas não
                 * CSS1Compat.
                 */
                var docElemProp = elem.document.documentElement["client" + name];

                return elem.document.compatMode === "CSS1Compat" && docElemProp || elem.document.body["client" + name] || docElemProp;

                /**
                 * Obter largura ou altura do documento.
                 */
            } else if (elem.nodeType === 9)
            {
                /**
                 * Role [Largura/Altura] ou desloque [Largura/Altura],
                 * o que for maior.
                 */
                return Math.max(elem.documentElement["client" + name], elem.body["scroll" + name], elem.documentElement["scroll" + name], elem.body["offset" + name], elem.documentElement["offset" + name]);

                /**
                 * Obtenha ou defina a largura ou a altura do
                 * elemento.
                 */
            } else if (size === undefined)
            {
                var orig = jQuery.css(elem, type),
                    ret = parseFloat(orig);

                return jQuery.isNaN(ret) ? orig : ret;

                /**
                 * Defina a largura ou a altura do elemento (padrão
                 * para pixels se o valor for sem unidade).
                 */
            } else
            {
                return this.css(type, typeof size === "string" ? size : size + "px");
            }
        };
    });

    /**
     *
     */
    window.jQuery = window.$ = jQuery;
})(window);
