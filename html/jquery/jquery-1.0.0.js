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
 * Variável global indefinida.
 */
window.undefined = window.undefined;

/**
 *
 */
function jQuery(a, c)
{
    /**
     * Atalho para documento pronto (porque $(document).each() é bobo).
     */
    if (a && a.constructor == Function && jQuery.fn.ready)
    {
        return jQuery(document).ready(a);
    }

    /**
     * Certifique-se de que uma seleção foi fornecida.
     */
    a = a || jQuery.context || document;

    /**
     * Observe quando um objeto jQuery é passado como seletor.
     */
    if (a.jquery)
    {
        return $(jQuery.merge(a, []));
    }

    /**
     * Observe quando um objeto jQuery é passado no contexto.
     */
    if (c && c.jquery)
    {
        return $(c).find(a);
    }

    /**
     * Se o contexto for global, retorne um novo objeto.
     */
    if (window == this)
    {
        return new jQuery(a, c);
    }

    /**
     * Lidar com strings HTML.
     */
    var m = /^[^<]*(<.+>)[^>]*$/.exec(a);

    if (m)
    {
        a = jQuery.clean([m[1]]);
    }

    /**
     * Observe quando um array é passado.
     */
    this.get(a.constructor == Array || a.length && !a.nodeType && a[0] != undefined && a[0].nodeType ?
        /**
         * Suponha que seja um vetor de elementos DOM.
         */
        jQuery.merge(a, []) :

        /**
         * Encontre os elementos correspondentes e salve-os
         * para mais tarde.
         */
        jQuery.find(a, c)
    );

    /**
     * Veja se uma função extra foi fornecida.
     */
    var fn = arguments[arguments.length - 1];

    /**
     * Nesse caso, execute-o no contexto.
     */
    if (fn && fn.constructor == Function)
    {
        this.each(fn);
    }
}

/**
 * Mapeie sobre $ em caso de substituição.
 */
if ($)
{
    jQuery._$ = $;
}

/**
 * Mapeie o namespace jQuery para o '$'.
 */
var $ = jQuery;

/**
 *
 */
jQuery.fn = jQuery.prototype = {
    /**
     *
     */
    jquery: "$Rev: 509 $",

    /**
     *
     */
    size: function()
    {
        return this.length;
    },

    /**
     *
     */
    get: function(num)
    {
        /**
         * Observe quando um vetor (de elementos) é passada.
         */
        if (num && num.constructor == Array)
        {
            /**
             * Use um hack complicado para fazer o objeto
             * jQuery parecer um array.
             */
            this.length = 0;

            /**
             *
             */
            [].push.apply(this, num);

            /**
             *
             */
            return this;
        } else
        {
            return num == undefined ?
                /**
                 * Devolve um vetor 'clean' (limpo ?).
                 */
                jQuery.map(this, function(a)
                {
                    return a;
                }) :

                /**
                 * Retorne apenas o objeto.
                 */
                this[num];
        }
    },

    /**
     *
     */
    each: function(fn, args)
    {
        return jQuery.each(this, fn, args);
    },

    /**
     *
     */
    index: function(obj)
    {
        var pos = -1;
            this.each(function(i)
            {
                if (this == obj)
                {
                    pos = i;
                }
            });

        return pos;
    },

    /**
     *
     */
    attr: function(key, value, type)
    {
        /**
         * Verifique se estamos definindo valores de estilo.
         */
        return key.constructor != String || value != undefined ?
            /**
             * 
             */
            this.each(function()
            {
                /**
                 * Veja se estamos definindo um hash de estilos.
                 */
                if (value == undefined)
                {
                    /**
                     * Defina todos os estilos.
                     */
                    for (var prop in key)
                    {
                        jQuery.attr(type ? this.style : this, prop, key[prop]);
                    }
                } else
                {
                    /**
                     * Veja se estamos definindo um único estilo de
                     * chave/valor.
                     */
                    jQuery.attr(type ? this.style : this, key, value);
                }
            }) :

            /**
             * Procure o caso em que estamos acessando um valor
             * de estilo.
             */
            jQuery[type || "attr"](this[0], key);
    },

    /**
     *
     */
    css: function(key, value)
    {
        return this.attr(key, value, "curCSS");
    },

    /**
     *
     */
    text: function(e)
    {
        e = e || this;

        var t = "";
        for (var j = 0; j < e.length; j++)
        {
            var r = e[j].childNodes;
            for (var i = 0; i < r.length; i++)
            {
                t += r[i].nodeType != 1 ? r[i].nodeValue : jQuery.fn.text([r[i]]);
            }
        }

        return t;
    },

    /**
     *
     */
    wrap: function()
    {
        /**
         * Os elementos para envolver o alvo.
         */
        var a = jQuery.clean(arguments);

        /**
         * Envolva cada um dos elementos correspondentes individualmente.
         */
        return this.each(function()
        {
            /**
             * Clone a estrutura que estamos usando para encapsular.
             */
            var b = a[0].cloneNode(true);

            /**
             * Insira-o antes do elemento a ser encapsulado.
             */
            this.parentNode.insertBefore(b, this);

            /**
             * Encontre o ponto mais profundo na estrutura
             * envolvente.
             */
            while (b.firstChild)
            {
                b = b.firstChild;
            }

            /**
             * Mova o elemento correspondente para dentro da
             * estrutura wrap.
             */
            b.appendChild(this);
        });
    },

    /**
     *
     */
    append: function()
    {
        return this.domManip(arguments, true, 1, function(a)
        {
            this.appendChild(a);
        });
    },

    /**
     *
     */
    prepend: function()
    {
        return this.domManip(arguments, true, -1, function(a)
        {
            this.insertBefore(a, this.firstChild);
        });
    },

    /**
     *
     */
    before: function()
    {
        return this.domManip(arguments, false, 1, function(a)
        {
            this.parentNode.insertBefore(a, this);
        });
    },

    /**
     *
     */
    after: function()
    {
        return this.domManip(arguments, false, -1, function(a)
        {
            this.parentNode.insertBefore(a, this.nextSibling);
        });
    },

    /**
     *
     */
    end: function()
    {
        return this.get(this.stack.pop());
    },

    /**
     *
     */
    find: function(t)
    {
        return this.pushStack(jQuery.map(this, function(a)
        {
            return jQuery.find(t, a);
        }), arguments);
    },

    /**
     *
     */
    clone: function(deep)
    {
        return this.pushStack(jQuery.map(this, function(a)
        {
            return a.cloneNode(deep != undefined ? deep : true);
        }), arguments);
    },

    /**
     *
     */
    filter: function(t)
    {
        return this.pushStack(
            t.constructor == Array &&
            jQuery.map(this, function(a)
            {
                for (var i = 0; i < t.length; i++)
                {
                    if (jQuery.filter(t[i],[a]).r.length)
                    {
                        return a;
                    }
                }
            }) ||

            /**
             *
             */
            t.constructor == Boolean && (t ? this.get() : []) ||
            t.constructor == Function &&

            /**
             *
             */
            jQuery.grep(this, t) ||
            jQuery.filter(t, this).r, arguments);
    },

    /**
     *
     */
    not: function(t)
    {
        return this.pushStack( t.constructor == String ?
            jQuery.filter(t,this,false).r :
            jQuery.grep(this,function(a)
            {
                return a != t;
            }), arguments);
    },

    /**
     *
     */
    add: function(t)
    {
        return this.pushStack(jQuery.merge(this, t.constructor == String ? jQuery.find(t) : t.constructor == Array ? t : [t]), arguments);
    },

    /**
     *
     */
    is: function(expr)
    {
        return expr ? jQuery.filter(expr,this).r.length > 0 : this.length > 0;
    },

    /**
     *
     */
    domManip: function(args, table, dir, fn)
    {
        var clone = this.size() > 1;
        var a = jQuery.clean(args);

        return this.each(function()
        {
            var obj = this;

            if (table && this.nodeName == "TABLE" && a[0].nodeName != "THEAD")
            {
                var tbody = this.getElementsByTagName("tbody");

                if (!tbody.length)
                {
                    obj = document.createElement("tbody");
                    this.appendChild( obj );
                } else
                {
                    obj = tbody[0];
                }
            }

            for (var i = (dir < 0 ? a.length - 1 : 0); i != (dir < 0 ? dir : a.length); i += dir)
            {
                fn.apply(obj, [clone ? a[i].cloneNode(true) : a[i]]);
            }
        });
    },

    /**
     *
     */
    pushStack: function(a, args)
    {
        var fn = args && args[args.length - 1];

        if (!fn || fn.constructor != Function)
        {
            if (!this.stack)
            {
                this.stack = [];
            }

            this.stack.push(this.get());
            this.get(a);
        } else
        {
            var old = this.get();
                this.get(a);

            if (fn.constructor == Function)
            {
                return this.each(fn);
            }

            this.get(old);
        }

        return this;
    }
};

/**
 *
 */
jQuery.extend = jQuery.fn.extend = function(obj, prop)
{
    if (!prop)
    {
        prop = obj;
        obj = this;
    }

    for (var i in prop)
    {
        obj[i] = prop[i];
    }

    return obj;
};

/**
 *
 */
jQuery.extend({
    /**
     *
     */
    init: function()
    {
        jQuery.initDone = true;
        jQuery.each(
            jQuery.macros.axis, function(i, n)
            {
                jQuery.fn[i] = function(a)
                {
                    var ret = jQuery.map(this, n);

                    /**
                     *
                     */
                    if (a && a.constructor == String)
                    {
                        ret = jQuery.filter(a, ret).r;
                    }

                    return this.pushStack(ret, arguments);
                };
            }
        );

        /**
         *
         */
        jQuery.each(
            jQuery.macros.to, function(i, n)
            {
                jQuery.fn[i] = function()
                {
                    var a = arguments;

                    return this.each(function()
                    {
                        for (var j = 0; j < a.length; j++)
                        {
                            $(a[j])[n](this);
                        }
                    });
                };
            }
        );

        /**
         *
         */
        jQuery.each(
            jQuery.macros.each, function(i, n)
            {
                jQuery.fn[i] = function()
                {
                    return this.each(n, arguments);
                };
            }
        );

        /**
         *
         */
        jQuery.each(
            jQuery.macros.filter, function(i, n)
            {
                jQuery.fn[n] = function(num, fn)
                {
                    return this.filter(":" + n + "(" + num + ")", fn);
                };
            }
        );

        /**
         *
         */
        jQuery.each(
            jQuery.macros.attr, function(i, n)
            {
                n = n || i;
                jQuery.fn[i] = function(h)
                {
                    return h == undefined ?
                        this.length ? this[0][n] : null :
                        this.attr(n, h);
                };
            }
        );

        /**
         *
         */
        jQuery.each(
            jQuery.macros.css, function(i, n)
            {
                jQuery.fn[n] = function(h)
                {
                    return h == undefined ? (this.length ? jQuery.css(this[0], n) : null) : this.css(n, h);
                };
            }
        );
    },

    /**
     *
     */
    each: function(obj, fn, args)
    {
        if (obj.length == undefined)
        {
            for (var i in obj)
            {
                fn.apply(obj[i], args || [i, obj[i]]);
            }
        } else
        {
            for (var i = 0; i < obj.length; i++)
            {
                fn.apply(obj[i], args || [i, obj[i]]);
            }
        }

        return obj;
    },

    /**
     *
     */
    className: {
        /**
         *
         */
        add: function(o, c)
        {
            if (jQuery.className.has(o, c))
            {
                return;
            }

            o.className += (o.className ? " " : "") + c;
        },

        /**
         *
         */
        remove: function(o, c)
        {
            o.className = !c ? "" : o.className.replace(new RegExp("(^|\\s*\\b[^-])"+c+"($|\\b(?=[^-]))", "g"), "");
        },

        /**
         *
         */
        has: function(e, a)
        {
            if (e.className != undefined)
            {
                e = e.className;
            }

            return new RegExp("(^|\\s)" + a + "(\\s|$)").test(e);
        }
    },

    /**
     *
     */
    swap: function(e, o, f)
    {
        for (var i in o)
        {
            e.style["old" + i] = e.style[i];
            e.style[i] = o[i];
        }

        f.apply(e, []);
        for (var i in o)
        {
            e.style[i] = e.style["old" + i];
        }
    },

    /**
     *
     */
    css: function(e, p)
    {
        if (p == "height" || p == "width")
        {
            var old = {},
                oHeight,
                oWidth,
                d = [
                    "Top",
                    "Bottom",
                    "Right",
                    "Left"
                ];

            for (var i in d)
            {
                old["padding" + d[i]] = 0;
                old["border" + d[i] + "Width"] = 0;
            }

            jQuery.swap(e, old, function()
            {
                if (jQuery.css(e,"display") != "none")
                {
                    oHeight = e.offsetHeight;
                    oWidth = e.offsetWidth;
                } else
                {
                    e = $(e.cloneNode(true)).css({
                        visibility: "hidden",
                        position: "absolute",
                        display: "block"
                    }).prependTo("body")[0];

                    oHeight = e.clientHeight;
                    oWidth = e.clientWidth;
                    e.parentNode.removeChild(e);
                }
            });

            return p == "height" ? oHeight : oWidth;
        } else if (p == "opacity" && jQuery.browser.msie)
        {
            return parseFloat(jQuery.curCSS(e, "filter").replace(/[^0-9.]/, "")) || 1;
        }

        return jQuery.curCSS(e, p);
    },

    /**
     *
     */
    curCSS: function(elem, prop, force)
    {
        var ret;

        if (!force && elem.style[prop])
        {
            ret = elem.style[prop];
        } else if (elem.currentStyle)
        {
            var newProp = prop.replace(/\-(\w)/g, function(m, c)
            {
                return c.toUpperCase();
            }); 

            ret = elem.currentStyle[prop] || elem.currentStyle[newProp];
        } else if (document.defaultView && document.defaultView.getComputedStyle)
        {
            prop = prop.replace(/([A-Z])/g,"-$1").toLowerCase();

            var cur = document.defaultView.getComputedStyle(elem, null);

            if (cur)
            {
                ret = cur.getPropertyValue(prop);
            } else if (prop == 'display')
            {
                ret = 'none';
            } else
            {
                jQuery.swap(elem, { display: 'block' }, function()
                {
                    ret = document.defaultView.getComputedStyle(this, null).getPropertyValue(prop);
                });
            }
        }

        return ret;
    },

    /**
     *
     */
    clean: function(a)
    {
        var r = [];
        for (var i = 0; i < a.length; i++)
        {
            if (a[i].constructor == String)
            {
                var table = "";

                if (!a[i].indexOf("<thead") || !a[i].indexOf("<tbody"))
                {
                    table = "thead";
                    a[i] = "<table>" + a[i] + "</table>";
                } else if (!a[i].indexOf("<tr"))
                {
                    table = "tr";
                    a[i] = "<table>" + a[i] + "</table>";
                } else if (!a[i].indexOf("<td") || !a[i].indexOf("<th"))
                {
                    table = "td";
                    a[i] = "<table><tbody><tr>" + a[i] + "</tr></tbody></table>";
                }

                var div = document.createElement("div");
                    div.innerHTML = a[i];

                if (table)
                {
                    div = div.firstChild;

                    if (table != "thead")
                    {
                        div = div.firstChild;
                    }

                    if (table == "td")
                    {
                        div = div.firstChild;
                    }
                }

                for (var j = 0; j < div.childNodes.length; j++)
                {
                    r.push(div.childNodes[j]);
                }
            } else if (a[i].jquery || a[i].length && !a[i].nodeType)
            {
                for (var k = 0; k < a[i].length; k++)
                {
                    r.push(a[i][k]);
                }
            } else if (a[i] !== null)
            {
                r.push(a[i].nodeType ? a[i] : document.createTextNode(a[i].toString()));
            }
        }

        return r;
    },

    /**
     *
     */
    expr: {
        "": "m[2]== '*'||a.nodeName.toUpperCase()==m[2].toUpperCase()",
        "#": "a.getAttribute('id')&&a.getAttribute('id')==m[2]",
        ":": {
            /**
             * Verificações de posição.
             */
            lt: "i<m[3]-0",
            gt: "i>m[3]-0",
            nth: "m[3]-0==i",
            eq: "m[3]-0==i",
            first: "i==0",
            last: "i==r.length-1",
            even: "i%2==0",
            odd: "i%2",

            /**
             * Verificações de filhos.
             */
            "first-child": "jQuery.sibling(a,0).cur",
            "last-child": "jQuery.sibling(a,0).last",
            "only-child": "jQuery.sibling(a).length==1",

            /**
             * Verificações dos pais.
             */
            parent: "a.childNodes.length",
            empty: "!a.childNodes.length",

            /**
             * Verificação de texto.
             */
            contains: "(a.innerText||a.innerHTML).indexOf(m[3])>=0",

            /**
             * Visibilidade.
             */
            visible: "a.type!='hidden'&&jQuery.css(a,'display')!='none'&&jQuery.css(a,'visibility')!='hidden'",
            hidden: "a.type=='hidden'||jQuery.css(a,'display')=='none'||jQuery.css(a,'visibility')=='hidden'",

            /**
             * Elementos de formulário.
             */
            enabled: "!a.disabled",
            disabled: "a.disabled",
            checked: "a.checked",
            selected: "a.selected"
        },

        ".": "jQuery.className.has(a,m[2])",
        "@": {
            "=": "z==m[4]",
            "!=": "z!=m[4]",
            "^=": "!z.indexOf(m[4])",
            "$=": "z.substr(z.length - m[4].length,m[4].length)==m[4]",
            "*=": "z.indexOf(m[4])>=0",
            "": "z"
        },

        "[": "jQuery.find(m[2],a).length"
    },

    /**
     *
     */
    token: [
        "\\.\\.|/\\.\\.", "a.parentNode",
        ">|/", "jQuery.sibling(a.firstChild)",
        "\\+", "jQuery.sibling(a).next",
        "~", function(a)
        {
            var r = [];
            var s = jQuery.sibling(a);

            if (s.n > 0)
            {
                for (var i = s.n; i < s.length; i++)
                {
                    r.push(s[i]);
                }
            }

            return r;
        }
    ],

    /**
     *
     */
    find: function(t, context)
    {
        /**
         * Certifique-se de que o contexto seja um elemento DOM.
         */
        if (context && context.nodeType == undefined)
        {
            context = null;
        }

        /**
         * Defina o contexto correto (se nenhum for fornecido).
         */
        context = context || jQuery.context || document;

        if (t.constructor != String)
        {
            return [t];
        }

        if (!t.indexOf("//"))
        {
            context = context.documentElement;
            t = t.substr(2,t.length);
        } else if (!t.indexOf("/"))
        {
            context = context.documentElement;
            t = t.substr(1, t.length);

            /**
             * FIX Suponha que o elemento raiz esteja correto :(.
             */
            if (t.indexOf("/") >= 1)
            {
                t = t.substr(t.indexOf("/"), t.length);
            }
        }

        var ret = [context];
        var done = [];
        var last = null;

        while (t.length > 0 && last != t)
        {
            var r = [];
                last = t;
                t = jQuery.trim(t).replace(/^\/\//i, "");

            var foundToken = false;
            for (var i = 0; i < jQuery.token.length; i += 2)
            {
                var re = new RegExp("^(" + jQuery.token[i] + ")");
                var m = re.exec(t);

                if (m)
                {
                    r = ret = jQuery.map(ret, jQuery.token[i + 1]);
                    t = jQuery.trim(t.replace( re, ""));
                    foundToken = true;
                }
            }

            if (!foundToken)
            {
                if (!t.indexOf(",") || !t.indexOf("|"))
                {
                    if (ret[0] == context)
                    {
                        ret.shift();
                    }

                    done = jQuery.merge(done, ret);
                    r = ret = [context];
                    t = " " + t.substr(1, t.length);
                } else
                {
                    var re2 = /^([#.]?)([a-z0-9\\*_-]*)/i;
                    var m = re2.exec(t);

                    if (m[1] == "#")
                    {
                        // Ummm, should make this work in all XML docs
                        var oid = document.getElementById(m[2]);
                            r = ret = oid ? [oid] : [];
                            t = t.replace(re2, "");
                    } else
                    {
                        if (!m[2] || m[1] == ".")
                        {
                            m[2] = "*";
                        }

                        for (var i = 0; i < ret.length; i++)
                        {
                            r = jQuery.merge(r, m[2] == "*" ? jQuery.getAll(ret[i]) : ret[i].getElementsByTagName(m[2]));
                        }
                    }
                }
            }

            if (t)
            {
                var val = jQuery.filter(t, r);
                    ret = r = val.r;
                    t = jQuery.trim(val.t);
            }
        }

        if (ret && ret[0] == context)
        {
            ret.shift();
        }

        done = jQuery.merge(
            done,
            ret
        );

        return done;
    },

    /**
     *
     */
    getAll: function(o, r)
    {
        r = r || [];
        var s = o.childNodes;
        for (var i = 0; i < s.length; i++)
        {
            if (s[i].nodeType == 1)
            {
                r.push(s[i]);
                jQuery.getAll(s[i], r);
            }
        }

        return r;
    },

    /**
     *
     */
    attr: function(elem, name, value)
    {
        var fix = {
            "for": "htmlFor",
            "class": "className",
            "float": "cssFloat",
            innerHTML: "innerHTML",
            className: "className"
        };

        if (fix[name])
        {
            if (value != undefined)
            {
                elem[fix[name]] = value;
            }

            return elem[fix[name]];
        } else if (elem.getAttribute)
        {
            if (value != undefined)
            {
                elem.setAttribute(name, value);
            }

            return elem.getAttribute(name, 2);
        } else
        {
            name = name.replace(/-([a-z])/ig, function(z, b)
            {
                return b.toUpperCase();
            });

            if (value != undefined)
            {
                elem[name] = value;
            }

            return elem[name];
        }
    },

    /**
     * As expressões regulares que alimentam o mecanismo de análise.
     */
    parse: [
        /**
         * Corresponder: [@value='test'], [@foo].
         */
        [ "\\[ *(@)S *([!*$^=]*) *Q\\]", 1 ],

        /**
         * Corresponder: [div], [div p].
         */
        [ "(\\[)Q\\]", 0 ],

        /**
         * Corresponder: :contains('foo').
         */
        [ "(:)S\\(Q\\)", 0 ],

        /**
         * Corresponder: :even, :last-chlid.
         */
        [ "([:.#]*)S", 0 ]
    ],

    /**
     *
     */
    filter: function(t, r, not)
    {
        /**
         * Descubra se estamos fazendo filtragem regular ou inversa.
         */
        var g = not !== false ? jQuery.grep : function(a, f)
        {
            return jQuery.grep(a, f, true);
        };

        while (t && /^[a-z[({<*:.#]/i.test(t))
        {
            var p = jQuery.parse;
            for (var i = 0; i < p.length; i++)
            {
                var re = new RegExp( "^" + p[i][0]

                    /**
                     * Procure uma sequência semelhante a uma string.
                     */
                    .replace( 'S', "([a-z*_-][a-z0-9_-]*)" )

                    /**
                     * Procure algo (opcionalmente) entre aspas.
                     */
                    .replace('Q', " *'?\"?([^'\"]*?)'?\"? *"), "i");

                /**
                 *
                 */
                var m = re.exec(t);

                /**
                 *
                 */
                if (m)
                {
                    /**
                     * Reorganize a correspondência.
                     */
                    if (p[i][1])
                    {
                        m = ["", m[1], m[3], m[2], m[4]];
                    }

                    /**
                     * Remova o que acabamos de combinar.
                     */
                    t = t.replace(re, "");

                    break;
                }
            }

            /**
             * :not() é um caso especial que pode ser otimizado
             * mantendo-o fora da lista de expressões.
             */
            if (m[1] == ":" && m[2] == "not")
            {
                r = jQuery.filter(m[3], r, false).r;
            } else
            {
                /**
                 * Caso contrário, encontre a expressão a ser executada.
                 */
                var f = jQuery.expr[m[1]];
                if (f.constructor != String)
                {
                    f = jQuery.expr[m[1]][m[2]];
                }

                /**
                 * Crie uma macro personalizada para incluí-la.
                 */
                eval("f = function(a,i){" +  (m[1] == "@" ? "z=jQuery.attr(a,m[3]);" : "") + "return " + f + "}");

                /**
                 * Execute-o no filtro atual.
                 */
                r = g(r, f);
            }
        }

        /**
         * Retorna um vetor de elementos filtrados (r) e a
         * string de expressão modificada (t).
         */
        return {
            r: r,
            t: t
        };
    },

    /**
     *
     */
    trim: function(t)
    {
        return t.replace(/^\s+|\s+$/g, "");
    },

    /**
     *
     */
    parents: function(elem)
    {
        var matched = [];
        var cur = elem.parentNode;
        while (cur && cur != document)
        {
            matched.push(cur);
            cur = cur.parentNode;
        }

        return matched;
    },

    /**
     *
     */
    sibling: function(elem, pos, not)
    {
        var elems = [];
        var siblings = elem.parentNode.childNodes;

        for (var i = 0; i < siblings.length; i++)
        {
            if (not === true && siblings[i] == elem)
            {
                continue;
            }

            if (siblings[i].nodeType == 1)
            {
                elems.push(siblings[i]);
            }

            if (siblings[i] == elem)
            {
                elems.n = elems.length - 1;
            }
        }

        return jQuery.extend(elems, {
            last: elems.n == elems.length - 1,
            cur: pos == "even" && elems.n % 2 == 0 || pos == "odd" && elems.n % 2 || elems[pos] == elem,
            prev: elems[elems.n - 1],
            next: elems[elems.n + 1]
        });
    },

    /**
     *
     */
    merge: function(first, second)
    {
        var result = [];

        /**
         * Mova b para o novo array (isso ajuda a evitar
         * instâncias de StaticNodeList).
         */
        for (var k = 0; k < first.length; k++)
        {
            result[k] = first[k];
        }

        /**
         * Agora verifique se há duplicatas entre (a e b) e adicione
         * apenas os itens exclusivos.
         */
        for (var i = 0; i < second.length; i++)
        {
            var noCollision = true;

            /**
             * O processo de verificação de colisão.
             */
            for (var j = 0; j < first.length; j++)
            {
                if (second[i] == first[j])
                {
                    noCollision = false;
                }
            }

            /**
             * Se o item for exclusivo, adicione-o.
             */
            if (noCollision)
            {
                result.push(second[i]);
            }
        }

        return result;
    },

    /**
     *
     */
    grep: function(elems, fn, inv)
    {
        /**
         * Se uma string for passada para a função, crie
         * uma função para ela (um atalho útil).
         */
        if (fn.constructor == String)
        {
            fn = new Function("a", "i", "return " + fn);
        }

        /**
         *
         */
        var result = [];

        /**
         * Percorra o array, salvando apenas os itens que passam
         * na função validadora.
         */
        for (var i = 0; i < elems.length; i++)
        {
            if (!inv && fn(elems[i], i) || inv && !fn(elems[i], i))
            {
                result.push( elems[i] );
            }
        }

        return result;
    },

    /**
     *
     */
    map: function(elems, fn)
    {
        /**
         * Se uma string for passada para a função, crie
         * uma função para ela (um atalho útil).
         */
        if (fn.constructor == String)
        {
            fn = new Function("a", "return " + fn);
        }

        var result = [];

        /**
         * Percorra o vetor, traduzindo cada um dos itens
         * para seu novo valor (ou valores).
         */
        for (var i = 0; i < elems.length; i++)
        {
            var val = fn(elems[i], i);

            if (val !== null && val != undefined)
            {
                if (val.constructor != Array)
                {
                    val = [val];
                }

                result = jQuery.merge(result, val);
            }
        }

        return result;
    },

    /**
     * Diversas funções auxiliares usadas para gerenciar
     * eventos. Muitas das ideias por trás deste código
     * originaram-se da biblioteca addEvent.
     */
    event: {
        /**
         * Vincule um evento a um elemento.
         */
        add: function(element, type, handler)
        {
            /**
             * Por alguma razão, o IE tem problemas para passar
             * o objeto da janela, fazendo com que ele seja
             * clonado no processo.
             */
            if (jQuery.browser.msie && element.setInterval != undefined)
            {
                element = window;
            }

            /**
             * Certifique-se de que a função que está sendo
             * executada tenha um ID exclusivo.
             */
            if (!handler.guid)
            {
                handler.guid = this.guid++;
            }

            /**
             * Inicie a estrutura de eventos do elemento.
             */
            if (!element.events)
            {
                element.events = {};
            }

            /**
             * Obtenha a lista atual de funções vinculadas
             * a este evento.
             */
            var handlers = element.events[type];

            /**
             * Se ainda não foi inicializado.
             */
            if (!handlers)
            {
                /**
                 * Inicie a fila do manipulador de eventos.
                 */
                handlers = element.events[type] = {};

                /**
                 * Lembre-se de um manipulador existente, se já
                 * estiver lá.
                 */
                if (element["on" + type])
                {
                    handlers[0] = element["on" + type];
                }
            }

            /**
             * Adicione a função à lista de manipuladores
             * do elemento.
             */
            handlers[handler.guid] = handler;

            /**
             * E vincule o manipulador de eventos global ao elemento.
             */
            element["on" + type] = this.handle;

            /**
             * Lembre-se da função em uma lista global (para acionamento).
             */
            if (!this.global[type])
            {
                this.global[type] = [];
            }

            this.global[type].push( element );
        },

        /**
         *
         */
        guid: 1,

        /**
         *
         */
        global: {},

        /**
         * Desanexe um evento ou conjunto de eventos de um elemento.
         */
        remove: function(element, type, handler)
        {
            if (element.events)
            {
                if (type && element.events[type])
                {
                    if (handler)
                    {
                        delete element.events[type][handler.guid];
                    } else
                    {
                        for (var i in element.events[type])
                        {
                            delete element.events[type][i];
                        }
                    }
                } else
                {
                    for (var j in element.events)
                    {
                        this.remove(element, j);
                    }
                }
            }
        },

        /**
         *
         */
        trigger: function(type, data, element)
        {
            /**
             * Retoque os dados recebidos.
             */
            data = data || [];

            /**
             * Lidar com um gatilho global.
             */
            if (!element)
            {
                var g = this.global[type];

                if (g)
                {
                    for (var i = 0; i < g.length; i++)
                    {
                        this.trigger(type, data, g[i]);
                    }
                }

                /**
                 * Lidar com o acionamento de um único elemento.
                 */
            } else if (element["on" + type])
            {
                /**
                 * Passe adiante um evento falso.
                 */
                data.unshift(
                    this.fix({
                        type: type,
                        target: element
                    })
                );

                /**
                 * Acione o evento.
                 */
                element["on" + type].apply(element, data);
            }
        },

        /**
         *
         */
        handle: function(event)
        {
            if (typeof jQuery == "undefined")
            {
                return;
            }

            /**
             *
             */
            event = event || jQuery.event.fix(window.event);

            /**
             * Se nenhum evento correto for encontrado, falhe.
             */
            if (!event)
            {
                return;
            }

            var returnValue = true;
            var c = this.events[event.type];
            for (var j in c)
            {
                if (c[j].apply(this, [event]) === false)
                {
                    event.preventDefault();
                    event.stopPropagation();
                    returnValue = false;
                }
            }

            return returnValue;
        },

        /**
         *
         */
        fix: function(event)
        {
            if (event)
            {
                event.preventDefault = function()
                {
                    this.returnValue = false;
                };

                event.stopPropagation = function()
                {
                    this.cancelBubble = true;
                };
            }

            return event;
        }
    }
});

/**
 *
 */
new function()
{
    var b = navigator.userAgent.toLowerCase();

    /**
     * Descubra qual navegador está sendo usado.
     */
    jQuery.browser = {
        safari: /webkit/.test(b),
        opera: /opera/.test(b),
        msie: /msie/.test(b) && !/opera/.test(b),
        mozilla: /mozilla/.test(b) && !/compatible/.test(b)
    };

    /**
     * Verifique se o modelo de caixa W3C está sendo usado.
     */
    jQuery.boxModel = !jQuery.browser.msie || document.compatMode == "CSS1Compat";
};

/**
 *
 */
jQuery.macros = {
    to: {
        appendTo: "append",
        prependTo: "prepend",
        insertBefore: "before",
        insertAfter: "after"
    },

    css: "width,height,top,left,position,float,overflow,color,background".split(","),
    filter: [
        "eq",
        "lt",
        "gt",
        "contains"
    ],

    attr: {
        val: "value",
        html: "innerHTML",
        id: null,
        title: null,
        name: null,
        href: null,
        src: null,
        rel: null
    },

    axis: {
        parent: "a.parentNode",
        ancestors: jQuery.parents,
        parents: jQuery.parents,
        next: "jQuery.sibling(a).next",
        prev: "jQuery.sibling(a).prev",
        siblings: jQuery.sibling,
        children: "a.childNodes"
    },

    each: {
        /**
         *
         */
        removeAttr: function(key)
        {
            this.removeAttribute(key);
        },

        /**
         *
         */
        show: function()
        {
            this.style.display = this.oldblock ? this.oldblock : "";

            if (jQuery.css(this,"display") == "none")
            {
                this.style.display = "block";
            }
        },

        /**
         *
         */
        hide: function()
        {
            this.oldblock = this.oldblock || jQuery.css(this, "display");

            if (this.oldblock == "none")
            {
                this.oldblock = "block";
            }

            this.style.display = "none";
        },

        /**
         *
         */
        toggle: function()
        {
            $(this)[
                $(this).is(":hidden") ? "show" : "hide"
            ].apply($(this), arguments);
        },

        /**
         *
         */
        addClass: function(c)
        {
            jQuery.className.add(this, c);
        },

        /**
         *
         */
        removeClass: function(c)
        {
            jQuery.className.remove(this, c);
        },

        /**
         *
         */
        toggleClass: function(c)
        {
            jQuery.className[
                jQuery.className.has(this, c) ? "remove" : "add"
            ](this, c);
        },

        /**
         *
         */
        remove: function(a)
        {
            if (!a || jQuery.filter([this], a).r)
            {
                this.parentNode.removeChild(this);
            }
        },

        /**
         *
         */
        empty: function()
        {
            while (this.firstChild)
            {
                this.removeChild(this.firstChild);
            }
        },

        /**
         *
         */
        bind: function(type, fn)
        {
            if (fn.constructor == String)
            {
                fn = new Function("e", (!fn.indexOf(".") ? "$(this)" : "return ") + fn);
            }

            jQuery.event.add(
                this,
                type,
                fn
            );
        },

        /**
         *
         */
        unbind: function(type, fn)
        {
            jQuery.event.remove(
                this,
                type,
                fn
            );
        },

        /**
         *
         */
        trigger: function(type, data)
        {
            jQuery.event.trigger(
                type,
                data,
                this
            );
        }
    }
};

/**
 *
 */
jQuery.init();
jQuery.fn.extend({
    /**
     * Estamos substituindo a antiga função de alternância,
     * então lembre-se dela para mais tarde.
     */
    _toggle: jQuery.fn.toggle,

    /**
     *
     */
    toggle: function(a, b)
    {
        /**
         * Se duas funções forem passadas, alternaremos
         * com um clique.
         */
        return a && b && a.constructor == Function && b.constructor == Function ? this.click(function(e)
        {
            /**
             * Descubra qual função executar.
             */
            this.last = this.last == a ? b : a;

            /**
             * Certifique-se de que os cliques parem.
             */
            e.preventDefault();

            /**
             * E execute a função.
             */
            return this.last.apply(this, [e]) || false;
        }) :

        /**
         * Caso contrário, execute a antiga função de alternância.
         */
        this._toggle.apply(this, arguments);
    },

    /**
     *
     */
    hover: function(f, g)
    {
        /**
         * Uma função privada para manipular o mouse 'hovering'.
         */
        function handleHover(e)
        {
            /**
             * Verifique se mouse(over|out) ainda está
             * dentro do mesmo elemento pai.
             */
            var p = (e.type == "mouseover" ? e.fromElement : e.toElement) || e.relatedTarget;

            /**
             * Atravesse a árvore.
             */
            while (p && p != this)
            {
                p = p.parentNode;
            }

            /**
             * Se realmente passarmos o mouse sobre um subelemento,
             * ignore-o.
             */
            if (p == this)
            {
                return false;
            }

            /**
             * Execute a função correta.
             */
            return (e.type == "mouseover" ? f : g).apply(this, [e]);
        }

        /**
         * Vincule a função aos dois ouvintes de eventos.
         */
        return this.mouseover(handleHover).mouseout(handleHover);
    },

    /**
     *
     */
    ready: function(f)
    {
        /**
         * Se o DOM já estiver pronto.
         */
        if (jQuery.isReady)
        {
            /**
             * Execute a função imediatamente.
             */
            f.apply(document);
        } else
        {
            /**
             * Caso contrário, lembre-se da função para mais tarde.
             * Adicione a função à lista de espera.
             */
            jQuery.readyList.push(f);
        }

        return this;
    }
});

/**
 *
 */
jQuery.extend({
    /**
     * Todo o código que faz o DOM Ready funcionar bem.
     */
    isReady: false,
    readyList: [],

    /**
     * Tratar quando o DOM estiver pronto.
     */
    ready: function()
    {
        /**
         * Certifique-se de que o DOM ainda não esteja carregado.
         */
        if (!jQuery.isReady)
        {
            /**
             * Lembre-se que o DOM está pronto.
             */
            jQuery.isReady = true;

            /**
             * Se houver funções vinculadas, para executar.
             */
            if (jQuery.readyList)
            {
                /**
                 * Execute todos eles.
                 */
                for (var i = 0; i < jQuery.readyList.length; i++)
                {
                    jQuery.readyList[i].apply(document);
                }

                /**
                 * Redefina a lista de funções.
                 */
                jQuery.readyList = null;
            }
        }
    }
});

/**
 *
 */
new function()
{
    var e = ("blur," +
        "focus," +
        "load," +
        "resize," +
        "scroll," +
        "unload," +
        "click," +
        "dblclick," +
        "mousedown," +
        "mouseup," +
        "mousemove," +
        "mouseover," +
        "mouseout," +
        "change," +
        "reset," +
        "select," +
        "submit," +
        "keydown," +
        "keypress," +
        "keyup," +
        "error"
    ).split(",");

    /**
     * Verifique todos os nomes de eventos, mas certifique-se
     *  de que estejam devidamente incluídos.
     */
    for (var i = 0; i < e.length; i++)
    {
        new function()
        {
            var o = e[i];

            /**
             * Lidar com vinculação de eventos.
             */
            jQuery.fn[o] = function(f)
            {
                return f ? this.bind(o, f) : this.trigger(o);
            };

            /**
             * Lidar com a desvinculação de eventos.
             */
            jQuery.fn["un" + o] = function(f)
            {
                return this.unbind(o, f);
            };

            /**
             * Finalmente, lide com eventos que são disparados
             * apenas uma vez.
             */
            jQuery.fn["one"+o] = function(f)
            {
                /**
                 * Anexe o ouvinte de evento.
                 */
                return this.each(function()
                {
                    var count = 0;

                    /**
                     * Adicione o evento.
                     */
                    jQuery.event.add(this, o, function(e)
                    {
                        /**
                         * Se esta função já foi executada, pare.
                         */
                        if (count++)
                        {
                            return;
                        }

                        /**
                         * E execute a função vinculada.
                         */
                        return f.apply(this, [e]);
                    });
                });
            };
        };
    }

    /**
     * Se Mozilla for usado.
     */
    if (jQuery.browser.mozilla || jQuery.browser.opera)
    {
        /**
         * Use o callback prático de evento.
         */
        document.addEventListener("DOMContentLoaded", jQuery.ready, false);

        /**
         * Se o IE for usado, use o hack excelente.
         * http://www.outofhanwell.com/blog/index.php?title=the_window_onload_problem_revisited.
         */
    } else if (jQuery.browser.msie)
    {
        /**
         * Só funciona se você document.write() isso.
         */
        document.write("<scr" + "ipt id=__ie_init defer=true " + "src=//:><\/script>");

        /**
         * Use o hack do script adiar.
         */
        var script = document.getElementById("__ie_init");
            script.onreadystatechange = function()
            {
                if (this.readyState == "complete")
                {
                    jQuery.ready();
                }
            };

        /**
         * Limpe da memória.
         */
        script = null;

        /**
         * Se Safari for usado.
         */
    } else if (jQuery.browser.safari)
    {
        /**
         * Verifique continuamente se document.readyState é válido.
         */
        jQuery.safariTimer = setInterval(function()
        {
            /**
             * Carregado e concluído são estados válidos.
             */
            if (document.readyState == "loaded" || document.readyState == "complete")
            {
                /**
                 * Se algum deles for encontrado, remova o cronômetro.
                 */
                clearInterval(jQuery.safariTimer);
                jQuery.safariTimer = null;

                /**
                 * E execute quaisquer funções de espera.
                 */
                jQuery.ready();
            }
        }, 10);
    }

    /**
     * Um substituto para window.onload, que sempre funcionará.
     */
    jQuery.event.add(window, "load", jQuery.ready);
};

/**
 *
 */
jQuery.fn.extend({
    /**
     * Sobrescreva o antigo método show.
     */
    _show: jQuery.fn.show,

    /**
     *
     */
    show: function(speed, callback)
    {
        return speed ? this.animate({
            height: "show",
            width: "show",
            opacity: "show"
        }, speed, callback) : this._show();
    },

    /**
     * Substitua o antigo método hide.
     */
    _hide: jQuery.fn.hide,

    /**
     *
     */
    hide: function(speed, callback)
    {
        return speed ? this.animate({
            height: "hide",
            width: "hide",
            opacity: "hide"
        }, speed, callback) : this._hide();
    },

    /**
     *
     */
    slideDown: function(speed, callback)
    {
        return this.animate({height: "show"}, speed, callback);
    },

    /**
     *
     */
    slideUp: function(speed, callback)
    {
        return this.animate({height: "hide"}, speed, callback);
    },

    /**
     *
     */
    slideToggle: function(speed, callback)
    {
        return this.each(function(){
            var state = $(this).is(":hidden") ? "show" : "hide";
            $(this).animate({height: state}, speed, callback);
        });
    },

    /**
     *
     */
    fadeIn: function(speed, callback)
    {
        return this.animate({opacity: "show"}, speed, callback);
    },

    /**
     *
     */
    fadeOut: function(speed, callback)
    {
        return this.animate({opacity: "hide"}, speed, callback);
    },

    /**
     *
     */
    fadeTo: function(speed, to, callback)
    {
        return this.animate({opacity: to}, speed, callback);
    },

    /**
     *
     */
    animate: function(prop, speed, callback)
    {
        return this.queue(function()
        {
            this.curAnim = prop;

            for (var p in prop)
            {
                var e = new jQuery.fx(
                    this,
                    jQuery.speed(
                        speed,
                        callback
                    ),

                    p
                );

                if (prop[p].constructor == Number)
                {
                    e.custom(e.cur(), prop[p]);
                } else
                {
                    e[prop[p]](prop);
                }
            }
            
        });
    },

    /**
     *
     */
    queue: function(type, fn)
    {
        if (!fn)
        {
            fn = type;
            type = "fx";
        }

        return this.each(function()
        {
            if (!this.queue)
            {
                this.queue = {};
            }

            if (!this.queue[type])
            {
                this.queue[type] = [];
            }

            this.queue[type].push(fn);

            if (this.queue[type].length == 1)
            {
                fn.apply(this);
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
    setAuto: function(e, p)
    {
        if (e.notAuto)
        {
            return;
        }

        if (p == "height" && e.scrollHeight != parseInt(jQuery.curCSS(e, p)))
        {
            return;
        }

        if (p == "width" && e.scrollWidth != parseInt(jQuery.curCSS(e, p)))
        {
            return;
        }

        /**
         * Lembre-se da altura original.
         */
        var a = e.style[p];

        /**
         * Descubra o tamanho da altura agora.
         */
        var o = jQuery.curCSS(e, p, 1);

        if (p == "height" && e.scrollHeight != o || p == "width" && e.scrollWidth != o)
        {
            return;
        }

        /**
         * Defina a altura como automática.
         */
        e.style[p] = e.currentStyle ? "" : "auto";

        /**
         * Veja qual é o tamanho de "auto".
         */
        var n = jQuery.curCSS(e,p,1);

        /**
         * Reverta para o tamanho original.
         */
        if (o != n && n != "auto")
        {
            e.style[p] = a;
            e.notAuto = true;
        }
    },

    /**
     *
     */
    speed: function(s, o)
    {
        o = o || {};

        if (o.constructor == Function)
        {
            o = {
                complete: o
            };
        }

        var ss = {
            slow: 600,
            fast: 200
        };

        /**
         *
         */
        o.duration = (s && s.constructor == Number ? s : ss[s]) || 400;

        /**
         * Na fila.
         */
        o.oldComplete = o.complete;
        o.complete = function()
        {
            jQuery.dequeue(this, "fx");
            if (o.oldComplete && o.oldComplete.constructor == Function)
            {
                o.oldComplete.apply(this);
            }
        };

        return o;
    },

    /**
     *
     */
    queue: {},

    /**
     *
     */
    dequeue: function(elem, type)
    {
        type = type || "fx";

        if (elem.queue && elem.queue[type])
        {
            /**
             * Remova esse.
             */
            elem.queue[type].shift();

            /**
             * Obtenha a próxima função.
             */
            var f = elem.queue[type][0];

            if (f)
            {
                f.apply(elem);
            }
        }
    },

    /**
     * Originalmente, escrevi fx() como um clone de moo.fx e,
     * no processo de torná-lo pequeno, o código tornou-se
     * ilegível para pessoas sãs. Voce foi avisado.
     */
    fx: function(elem, options, prop)
    {
        var z = this;

        /**
         * As opções dos usuários.
         */
        z.o = {
            duration: options.duration || 400,
            complete: options.complete,
            step: options.step
        };

        /**
         * O elemento.
         */
        z.el = elem;

        /**
         * O estilo.
         */
        var y = z.el.style;

        /**
         * Função simples para definir um valor de estilo.
         */
        z.a = function()
        {
            if (options.step)
            {
                options.step.apply(elem, [z.now]);
            }

            if (prop == "opacity")
            {
                if (z.now == 1)
                {
                    z.now = 0.9999;
                }

                if (window.ActiveXObject)
                {
                    y.filter = "alpha(opacity=" + z.now*100 + ")";
                } else
                {
                    y.opacity = z.now;
                }

                /**
                 * Não parece muito legal no IE.
                 */
            } else if (parseInt(z.now))
            {
                y[prop] = parseInt(z.now) + "px";
            }

            y.display = "block";
        };

        /**
         * Descubra o número máximo para correr.
         */
        z.max = function()
        {
            return parseFloat(
                jQuery.css(z.el, prop)
            );
        };

        /**
         * Obtenha o tamanho atual.
         */
        z.cur = function()
        {
            var r = parseFloat(
                jQuery.curCSS(
                    z.el,
                    prop
                )
            );

            return r && r > -10000 ? r : z.max();
        };

        /**
         * Inicie uma animação de um número para outro.
         */
        z.custom = function(from, to)
        {
            z.startTime = (new Date()).getTime();
            z.now = from;
            z.a();
            z.timer = setInterval(function()
            {
                z.step(from, to);
            }, 13);
        };

        /**
         * Função simples de 'show' (mostrar ?).
         */
        z.show = function(p)
        {
            if (!z.el.orig)
            {
                z.el.orig = {};
            }

            /**
             * Lembre-se de onde começamos, para que possamos
             * voltar mais tarde.
             */
            z.el.orig[prop] = this.cur();
            z.custom(0, z.el.orig[prop]);

            /**
             * Questão: Falha de opacidade no IE ?
             */
            if (prop != "opacity")
            {
                y[prop] = "1px";
            }
        };

        /**
         * Função simples de 'hide' (ocultar ?).
         */
        z.hide = function()
        {
            if (!z.el.orig)
            {
                z.el.orig = {};
            }

            /**
             * Lembre-se de onde começamos, para que possamos
             * voltar mais tarde.
             */
            z.el.orig[prop] = this.cur();
            z.o.hide = true;

            /**
             * Comece a animação.
             */
            z.custom(z.el.orig[prop], 0);
        };

        /**
         * O IE tem problemas com opacidade se não tiver layout.
         */
        if (jQuery.browser.msie && !z.el.currentStyle.hasLayout)
        {
            y.zoom = "1";
        }

        /**
         * Lembre-se do estouro do elemento.
         */
        if (!z.el.oldOverlay)
        {
            z.el.oldOverflow = jQuery.css(z.el, "overflow");
        }

        /**
         * Certifique-se de que nada escape.
         */
        y.overflow = "hidden";

        /**
         * Cada etapa de uma animação.
         */
        z.step = function(firstNum, lastNum)
        {
            var t = (new Date()).getTime();

            if (t > z.o.duration + z.startTime)
            {
                /**
                 * Pare o cronômetro.
                 */
                clearInterval(z.timer);

                z.timer = null;
                z.now = lastNum;
                z.a();
                z.el.curAnim[prop] = true;

                var done = true;
                for (var i in z.el.curAnim)
                {
                    if (z.el.curAnim[i] !== true)
                    {
                        done = false;
                    }
                }

                if (done)
                {
                    /**
                     * Redefina o overflow.
                     */
                    y.overflow = z.el.oldOverflow;

                    /**
                     * Oculte o elemento se a operação "hide" tiver
                     * sido realizada.
                     */
                    if (z.o.hide)
                    {
                        y.display = 'none';
                    }

                    /**
                     * Redefina a propriedade, se o item estiver oculto.
                     */
                    if (z.o.hide)
                    {
                        for (var p in z.el.curAnim)
                        {
                            y[p] = z.el.orig[p] + (p == "opacity" ? "" : "px");

                            /**
                             * Defina sua altura e/ou largura como automática.
                             */
                            if (p == 'height' || p == 'width')
                            {
                                jQuery.setAuto(z.el, p);
                            }
                        }
                    }
                }

                /**
                 * Se um retorno de chamada foi fornecido, execute-o.
                 */
                if (done && z.o.complete && z.o.complete.constructor == Function)
                {
                    /**
                     * Execute a função completa.
                     */
                    z.o.complete.apply(z.el);
                }
            } else
            {
                /**
                 * Descubra onde estamos na animação e defina o número.
                 */
                var p = (t - this.startTime) / z.o.duration;
                    z.now = ((-Math.cos(p * Math.PI) / 2) + 0.5) * (lastNum - firstNum) + firstNum;

                /**
                 * Execute a próxima etapa da animação.
                 */
                z.a();
            }
        };
    }
});

/**
 * AJAX Plugin
 * Docs Here:
 *     http://jquery.com/docs/ajax/
 */
jQuery.fn.loadIfModified = function(url, params, callback)
{
    this.load(url, params, callback, 1);
};

/**
 *
 */
jQuery.fn.load = function(url, params, callback, ifModified)
{
    if (url.constructor == Function)
    {
        return this.bind("load", url);
    }

    callback = callback || function(){};

    /**
     * O padrão é uma solicitação GET.
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
        if (params.constructor == Function)
        {
            /**
             * Assumimos que é o callback.
             */
            callback = params;
            params = null;

            /**
             * Caso contrário, crie uma sequência de parâmetros.
             */
        } else
        {
            params = jQuery.param(params);
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
    jQuery.ajax( type, url, params,function(res, status)
    {
        if (status == "success" || !ifModified && status == "notmodified")
        {
            /**
             * Injete o HTML em todos os elementos correspondentes.
             */
            self.html(res.responseText).each(callback, [res.responseText, status]);

            /**
             * Execute todos os scripts dentro do HTML recém-injetado.
             */
            $("script", self).each(function()
            {
                if (this.src)
                {
                    $.getScript(this.src);
                } else
                {
                    eval.call(window, this.text || this.textContent || this.innerHTML || "");
                }
            });
        } else
        {
            callback.apply(self, [res.responseText, status]);
        }
    }, ifModified);

    return this;
};

/**
 * Se o IE for usado, crie um wrapper para o objeto
 * XMLHttpRequest.
 */
if (jQuery.browser.msie)
{
    XMLHttpRequest = function()
    {
        return new ActiveXObject(navigator.userAgent.indexOf("MSIE 5") >= 0 ? "Microsoft.XMLHTTP" : "Msxml2.XMLHTTP");
    };
}

/**
 * Anexe um monte de funções para lidar com eventos
 * AJAX comuns.
 */
new function()
{
    var e = "ajaxStart,ajaxStop,ajaxComplete,ajaxError,ajaxSuccess".split(',');
    for ( var i = 0; i < e.length; i++ )
    {
        new function()
        {
            var o = e[i];
            jQuery.fn[o] = function(f)
            {
                return this.bind(o, f);
            };
        };
    }
};

/**
 *
 */
jQuery.extend({
    /**
     *
     */
    get: function(url, data, callback, type, ifModified)
    {
        if (data.constructor == Function)
        {
            type = callback;
            callback = data;
            data = null;
        }

        if (data)
        {
            url += "?" + jQuery.param(data);
        }

        /**
         * Crie e inicie a solicitação HTTP.
         */
        jQuery.ajax("GET", url, null, function(r, status)
        {
            if (callback)
            {
                callback(jQuery.httpData(r, type), status);
            }
        }, ifModified);
    },

    /**
     *
     */
    getIfModified: function(url, data, callback, type)
    {
        jQuery.get(url, data, callback, type, 1);
    },

    /**
     *
     */
    getScript: function(url, data, callback)
    {
        jQuery.get(url, data, callback, "script");
    },

    /**
     *
     */
    post: function(url, data, callback, type)
    {
        // Build and start the HTTP Request
        jQuery.ajax( "POST", url, jQuery.param(data), function(r, status)
        {
            if (callback)
            {
                callback(jQuery.httpData(r, type), status);
            }
        });
    },

    /**
     * timeout (ms).
     */
    timeout: 0,

    /**
     *
     */
    ajaxTimeout: function(timeout)
    {
        jQuery.timeout = timeout;
    },

    /**
     * Cache de títulos modificado pela última vez para
     * a próxima solicitação.
     */
    lastModified: {},

    /**
     *
     */
    ajax: function(type, url, data, ret, ifModified)
    {
        /**
         * Se apenas um único argumento foi passado, suponha que
         * seja um objeto de pares chave/valor.
         */
        if (!url)
        {
            ret = type.complete;

            var success = type.success;
            var error = type.error;

            data = type.data;
            url = type.url;
            type = type.type;
        }

        /**
         * Fique atento a um novo conjunto de solicitações.
         */
        if (!jQuery.active++)
        {
            jQuery.event.trigger("ajaxStart");
        }

        var requestDone = false;

        /**
         * Crie o objeto de solicitação.
         */
        var xml = new XMLHttpRequest();

        /**
         * Abra o soquete.
         */
        xml.open(type || "GET", url, true);

        /**
         * Defina o título correto, se os dados estiverem
         * sendo enviados.
         */
        if (data)
        {
            xml.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        }

        /**
         * Defina o título If-Modified-Since, se for modo ifModified.
         */
        if (ifModified)
        {
            xml.setRequestHeader("If-Modified-Since", jQuery.lastModified[url] || "Thu, 01 Jan 1970 00:00:00 GMT");
        }

        /**
         * Defina o cabeçalho para que o script de chamada
         * saiba que é um XMLHttpRequest.
         */
        xml.setRequestHeader("X-Requested-With", "XMLHttpRequest");

        /**
         * Certifique-se de que o navegador envie o tamanho
         * correto do conteúdo.
         */
        if (xml.overrideMimeType)
        {
            xml.setRequestHeader("Connection", "close");
        }

        /**
         * Aguarde uma resposta para voltar.
         */
        var onreadystatechange = function(istimeout)
        {
            /**
             * A transferência foi concluída e os dados estão
             * disponíveis ou a solicitação expirou.
             */
            if (xml && (xml.readyState == 4 || istimeout == "timeout"))
            {
                requestDone = true;

                /**
                 *
                 */
                var status = jQuery.httpSuccess( xml ) && istimeout != "timeout" ? ifModified && jQuery.httpNotModified(xml, url) ? "notmodified" : "success" : "error";

                /**
                 * Certifique-se de que a solicitação foi bem-sucedida
                 * ou não foi modificada.
                 */
                if (status != "error")
                {
                    /**
                     * Cabeçalho Last-Modified em cache, se estiver
                     * no modo ifModified.
                     */
                    var modRes = xml.getResponseHeader("Last-Modified");

                    /**
                     *
                     */
                    if (ifModified && modRes)
                    {
                        jQuery.lastModified[url] = modRes;
                    }

                    /**
                     * Se um callback local foi especificado, envie-o.
                     */
                    if (success)
                    {
                        success(xml, status);
                    }

                    /**
                     * Envia o callback global.
                     */
                    jQuery.event.trigger("ajaxSuccess");

                    /**
                     * Caso contrário, a solicitação não foi bem-sucedida.
                     */
                } else
                {
                    /**
                     * Se um callback local foi especificado, envie-o.
                     */
                    if (error)
                    {
                        error(xml, status);
                    }

                    /**
                     * Envia o callback global.
                     */
                    jQuery.event.trigger("ajaxError");
                }

                /**
                 * A solicitação foi concluída.
                 */
                jQuery.event.trigger("ajaxComplete");

                /**
                 * Lidar com o contador AJAX global.
                 */
                if (!--jQuery.active)
                {
                    jQuery.event.trigger("ajaxStop");
                }

                /**
                 * Resultado do processo.
                 */
                if (ret)
                {
                    ret(xml, status);
                }

                /**
                 * Pare de vazamentos de memória.
                 */
                xml.onreadystatechange = function() {};
                xml = null;
            }
        };

        /**
         *
         */
        xml.onreadystatechange = onreadystatechange;

        /**
         * Verificador de tempo limite.
         */
        if (jQuery.timeout > 0)
        {
            setTimeout(function()
            {
                /**
                 * Verifique se a solicitação ainda está acontecendo.
                 */
                if (xml)
                {
                    /**
                     * Cancele a solicitação.
                     */
                    xml.abort();

                    /**
                     *
                     */
                    if (!requestDone)
                    {
                        onreadystatechange("timeout");
                    }

                    /**
                     * Limpe da memória.
                     */
                    xml = null;
                }
            }, jQuery.timeout);
        }

        /**
         * Envie os dados.
         */
        xml.send(data);
    },

    /**
     * Contador para armazenar o número de consultas ativas.
     */
    active: 0,

    /**
     * Determina se um XMLHttpRequest foi bem-sucedido ou não.
     */
    httpSuccess: function(r)
    {
        try
        {
            return !r.status && location.protocol == "file:" || (r.status >= 200 && r.status < 300) || r.status == 304 || jQuery.browser.safari && r.status == undefined;
        } catch(e)
        {
        }

        return false;
    },

    /**
     * Determina se um XMLHttpRequest retorna NotModified.
     */
    httpNotModified: function(xml, url)
    {
        try
        {
            var xmlRes = xml.getResponseHeader("Last-Modified");

            /**
             * O Firefox sempre retorna 200. verifique a data
             * da última modificação.
             */
            return xml.status == 304 || xmlRes == jQuery.lastModified[url] || jQuery.browser.safari && xml.status == undefined;
        } catch(e)
        {
        }

        return false;
    },

    /**
     * Obtenha os dados de um XMLHttpRequest. Retorna XML
     * analisado se o título do tipo de conteúdo for "xml"
     * e o tipo for "xml" ou omitido, caso contrário,
     * retorne texto simples.
     */
    httpData: function(r, type)
    {
        var ct = r.getResponseHeader("content-type");
        var data = !type && ct && ct.indexOf("xml") >= 0;
            data = type == "xml" || data ? r.responseXML : r.responseText;

        /**
         * Se o tipo for "script", avalie-o.
         */
        if (type == "script")
        {
            eval.call(window, data);
        }

        return data;
    },

    /**
     * Serialize um vetor de elementos de formulário ou
     * um conjunto de chaves/valores em uma string de
     * consulta.
     */
    param: function(a)
    {
        var s = [];

        /**
         * Se um array foi passado, suponha que seja um
         * array de elementos de formulário.
         */
        if (a.constructor == Array)
        {
            /**
             * Serialize os elementos do formulário.
             */
            for (var i = 0; i < a.length; i++)
            {
                s.push(a[i].name + "=" + encodeURIComponent(a[i].value));
            }

            /**
             * Caso contrário, suponha que seja um objeto de
             * pares chave/valor.
             */
        } else
        {
            /**
             * Serialize as chaves/valores.
             */
            for (var j in a)
            {
                s.push(j + "=" + encodeURIComponent(a[j]));
            }
        }

        /**
         * Retorne a serialização resultante.
         */
        return s.join("&");
    }
});
