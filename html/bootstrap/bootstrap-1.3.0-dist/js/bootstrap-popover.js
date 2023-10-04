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
 * bootstrap-popover.js v1.3.0.
 */
(function($)
{
    var Popover = function (element, options)
    {
        this.$element = $(element);
        this.options = options;
        this.enabled = true;
        this.fixTitle();
    };

    /**
     * OBSERVAÇÃO: POPOVER EXTENDS BOOTSTRAP-TWIPSY.js.
     */
    Popover.prototype = $.extend({}, $.fn.twipsy.Twipsy.prototype, {
        /**
         *
         */
        setContent: function ()
        {
            var $tip = this.tip();

            $tip.find('.title')[this.options.html ? 'html' : 'text'](this.getTitle());
            $tip.find('.content p')[this.options.html ? 'html' : 'text'](this.getContent());
            $tip[0].className = 'popover';
        },

        /**
         *
         */
        getContent: function ()
        {
            var contentvar,
                $e = this.$element,
                o = this.options;

            if (typeof this.options.content == 'string')
            {
                content = $e.attr(o.content);
            } else if (typeof this.options.content == 'function')
            {
                content = this.options.content.call(this.$element[0]);
            }

            return content;
        },

        /**
         *
         */
        tip: function()
        {
            if (!this.$tip)
            {
                this.$tip = $('<div class="popover" />')
                    .html('<div class="arrow"></div><div class="inner"><h3 class="title"></h3><div class="content"><p></p></div></div>');
            }

            return this.$tip;
        }
    });

    /**
     * POPOVER PLUGIN DEFINITION.
     */
    $.fn.popover = function (options)
    {
        if (typeof options == 'object')
        {
            options = $.extend({}, $.fn.popover.defaults, options);
        }

        $.fn.twipsy.initWith.call(this, options, Popover, 'popover');

        return this;
    }

    /**
     *
     */
    $.fn.popover.defaults = $.extend({}, $.fn.twipsy.defaults, {
        content: 'data-content',
        placement: 'right'
    });
})(window.jQuery || window.ender);
