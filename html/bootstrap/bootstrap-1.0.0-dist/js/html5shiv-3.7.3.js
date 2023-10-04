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
 * @preserve HTML5 Shiv 3.7.3.
 */
;(function(window, document)
{
    /**
     * jshint evil:true.
     */

    /**
     * Versão.
     */
    var version = '3.7.3-pre';

    /**
     * Opções predefinidas.
     */
    var options = window.html5 || {};

    /**
     * Usado para pular elementos do problema.
     */
    var reSkip = /^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i;

    /**
     * Nem todos os elementos podem ser clonados no IE.
     */
    var saveClones = /^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i;

    /**
     * Detecte se o navegador oferece suporte a estilos
     * html5 padrão.
     */
    var supportsHtml5Styles;

    /**
     * Nome do expando, para trabalhar com vários documentos
     * ou reescrever um documento.
     */
    var expando = '_html5shiv';

    /**
     * O id para os documentos expando.
     */
    var expanID = 0;

    /**
     * Dados armazenados em cache para cada documento.
     */
    var expandoData = {};

    /**
     * Detecte se o navegador oferece suporte a elementos
     * desconhecidos.
     */
    var supportsUnknownElements;

    /**
     *
     */
    (function()
    {
        try
        {
            var a = document.createElement('a');
                a.innerHTML = '<xyz></xyz>';

            /**
             * Se a propriedade hidden for implementada, podemos
             * assumir que o navegador suporta estilos HTML5
             * básicos.
             */
            supportsHtml5Styles = ('hidden' in a);
            supportsUnknownElements = a.childNodes.length == 1 || (function()
            {
                /**
                 * Atribua um falso positivo se não for possível.
                 */
                (document.createElement)('a');

                /**
                 *
                 */
                var frag = document.createDocumentFragment();

                /**
                 *
                 */
                return (
                    typeof frag.cloneNode == 'undefined' ||
                    typeof frag.createDocumentFragment == 'undefined' ||
                    typeof frag.createElement == 'undefined'
                );
            }());
        } catch(e)
        {
            /**
             * Atribua um falso positivo se a detecção falhar => incapaz
             * de shiv.
             */
            supportsHtml5Styles = true;
            supportsUnknownElements = true;
        }
    }());

    /**
     *
     */

    /**
     * Cria uma folha de estilo com o texto CSS fornecido e a
     * adiciona ao documento.
     * 
     * @private
     * @param {Document} ownerDocument O documento.
     * @param {String} cssText O texto CSS.
     * @returns {StyleSheet} O elemento estilo.
     */
    function addStyleSheet(ownerDocument, cssText)
    {
        var p = ownerDocument.createElement('p'),
            parent = ownerDocument.getElementsByTagName('head')[0] || ownerDocument.documentElement;

        p.innerHTML = 'x<style>' + cssText + '</style>';

        return parent.insertBefore(p.lastChild, parent.firstChild);
    }

    /**
     * Retorna o valor de `html5.elements` como um array.
     *
     * @private.
     * @returns {Array} Uma matriz de nomes de nós de elementos separados.
     */
    function getElements()
    {
        var elements = html5.elements;

        return typeof elements == 'string' ? elements.split(' ') : elements;
    }

    /**
     * Estende a lista interna de elementos html5.
     *
     * @memberOf html5.
     * @param {String|Array} newElements lista separada por espaços em branco ou array de novos nomes de elementos para shiv.
     * @param {Document} ownerDocument O documento de contexto.
     */
    function addElements(newElements, ownerDocument)
    {
        var elements = html5.elements;

        if (typeof elements != 'string')
        {
            elements = elements.join(' ');
        }

        if (typeof newElements != 'string')
        {
            newElements = newElements.join(' ');
        }

        html5.elements = elements +' '+ newElements;
        shivDocument(ownerDocument);
    }

    /**
     * Devolve os dados associados ao documento indicado.
     *
     * @private
     * @param {Document} ownerDocument O documento.
     * @returns {Object} Um objeto de dados.
     */
    function getExpandoData(ownerDocument)
    {
        var data = expandoData[ownerDocument[expando]];

        if (!data)
        {
            data = {};
            expanID++;
            ownerDocument[expando] = expanID;
            expandoData[expanID] = data;
        }

        return data;
    }

    /**
     * Retorna um elemento shived para o nodeName e o documento
     * fornecidos.
     *
     * @memberOf html5.
     * @param {String} nodeName nome do elemento.
     * @param {Document} ownerDocument O documento de contexto.
     * @returns {Object} O elemento shived.
     */
    function createElement(nodeName, ownerDocument, data)
    {
        if (!ownerDocument)
        {
            ownerDocument = document;
        }

        if (supportsUnknownElements)
        {
            return ownerDocument.createElement(nodeName);
        }

        if (!data)
        {
            data = getExpandoData(ownerDocument);
        }

        var node;

        if (data.cache[nodeName])
        {
            node = data.cache[nodeName].cloneNode();
        } else if (saveClones.test(nodeName))
        {
            node = (data.cache[nodeName] = data.createElem(nodeName)).cloneNode();
        } else
        {
            node = data.createElem(nodeName);
        }

        /**
         * Evite adicionar alguns elementos a fragmentos no IE < 9 porque.
         *     * Atributos como `name` ou `type` não podem ser
         *       definidos/alterados depois que um elemento é
         *       inserido em um documento/fragmento.
         * 
         *     * Elementos de link com atributos `src` que são inacessíveis,
         *       como com uma resposta 403, farão com que a guia/janela
         *       trave.
         * 
         *     * Elementos de script anexados a fragmentos serão executados
         *       quando suas propriedades `src` ou `text` forem definidas.
         */
        return node.canHaveChildren && !reSkip.test(nodeName) && !node.tagUrn ? data.frag.appendChild(node) : node;
    }

    /**
     * Retorna um DocumentFragment separado para o documento
     * fornecido.
     *
     * @memberOf html5.
     * @param {Document} ownerDocument O documento de contexto.
     * @returns {Object} O estremecido DocumentFragment.
     */
    function createDocumentFragment(ownerDocument, data)
    {
        if (!ownerDocument)
        {
            ownerDocument = document;
        }

        if (supportsUnknownElements)
        {
            return ownerDocument.createDocumentFragment();
        }

        data = data || getExpandoData(ownerDocument);

        var clone = data.frag.cloneNode(),
            i = 0,
            elems = getElements(),
            l = elems.length;

        for (; i < l; i++)
        {
            clone.createElement(elems[i]);
        }

        return clone;
    }

    /**
     * Shivs os métodos `createElement` e `createDocumentFragment`
     * do documento.
     *
     * @private
     * @param {Document|DocumentFragment} ownerDocument O manual.
     * @param {Object} dados do manual.
     */
    function shivMethods(ownerDocument, data)
    {
        if (!data.cache)
        {
            data.cache = {};
            data.createElem = ownerDocument.createElement;
            data.createFrag = ownerDocument.createDocumentFragment;
            data.frag = data.createFrag();
        }

        ownerDocument.createElement = function(nodeName)
        {
            /**
             * Abortar shiv.
             */
            if (!html5.shivMethods)
            {
                return data.createElem(nodeName);
            }

            return createElement(nodeName, ownerDocument, data);
        };

        ownerDocument.createDocumentFragment = Function('h,f', 'return function(){' +
            'var n=f.cloneNode(),c=n.createElement;' +
            'h.shivMethods&&(' +
            /**
             * Desenrole as chamadas do `createElement`.
             */
            getElements().join().replace(/[\w\-:]+/g, function(nodeName)
            {
                data.createElem(nodeName);
                data.frag.createElement(nodeName);

                return 'c("' + nodeName + '")';
            }) + ');return n}'
        )(html5, data.frag);
    }

    /**
     *
     */

    /**
     * Shivs o documento fornecido.
     *
     * @memberOf html5
     * @param {Document} ownerDocument O documento para shiv.
     * @returns {Document} O documento  shived.
     */
    function shivDocument(ownerDocument)
    {
        if (!ownerDocument)
        {
            ownerDocument = document;
        }

        /**
         *
         */
        var data = getExpandoData(ownerDocument);

        /**
         *
         */
        if (html5.shivCSS && !supportsHtml5Styles && !data.hasCSS)
        {
            data.hasCSS = !!addStyleSheet(ownerDocument,
                /**
                 * Corrige exibição de bloco não definido em IE6/7/8/9.
                 */
                'article,aside,dialog,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}' +
                /**
                 * Adiciona estilo não presente em IE6/7/8/9.
                 */
                'mark{background:#FF0;color:#000}' +
                /**
                 * Oculta elementos não renderizados.
                 */
                'template{display:none}'
            );
        }

        if (!supportsUnknownElements)
        {
            shivMethods(ownerDocument, data);
        }

        return ownerDocument;
    }

    /**
     *
     */

    /**
     * O objeto `html5` é exposto para que mais elementos possam
     * ser shived e o shiving existente possa ser detectado em
     * iframes.
     *
     * @type Object
     * @example
     *
     * //
     * // As opções podem ser alteradas antes que o script seja incluído.
     * //
     * html5 = {
     *     'elements': 'mark section',
     *     'shivCSS': false,
     *     'shivMethods': false
     * };
     */
    var html5 = {
        /**
         * Uma matriz ou string separada por espaços de nomes de nós
         * dos elementos a serem shiv.
         *
         * @memberOf html5.
         * @type Array|String.
         */
        'elements': options.elements || 'abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output picture progress section summary template time video',

        /**
         * Versão atual de html5shiv.
         */
        'version': version,

        /**
         * Um sinalizador para indicar que a folha de estilo HTML5
         * deve ser inserida.
         *
         * @memberOf html5.
         * @type Boolean.
         */
        'shivCSS': (options.shivCSS !== false),

        /**
         * Será igual a true se um navegador oferecer suporte à
         * criação de elementos desconhecidos/HTML5.
         *
         * @memberOf html5.
         * @type boolean.
         */
        'supportsUnknownElements': supportsUnknownElements,

        /**
         * Um sinalizador para indicar que os métodos `createElement`
         * e `createDocumentFragment` do documento devem ser
         * sobrescritos.
         * 
         * @memberOf html5.
         * @type Boolean.
         */
        'shivMethods': (options.shivMethods !== false),

        /**
         * Uma string para descrever o tipo de objeto `html5`
         * ("default" ou "default print").
         * 
         * @memberOf html5.
         * @type String.
         */
        'type': 'default',

        /**
         * shivs o documento de acordo com as opções de objeto
         * `html5` especificadas.
         */
        'shivDocument': shivDocument,

        /**
         * cria um elemento shived.
         */
        createElement: createElement,

        /**
         * Cria um documentFragment separado.
         */
        createDocumentFragment: createDocumentFragment,

        /**
         * estende a lista de elementos.
         */
        addElements: addElements
    };

    /**
     *
     */

    /**
     * Expor html5.
     */
    window.html5 = html5;

    /**
     * shiv o manual.
     */
    shivDocument(document);

    /**
     *
     */
    if (typeof module == 'object' && module.exports)
    {
        module.exports = html5;
    }
}(typeof window !== "undefined" ? window : this, document));
