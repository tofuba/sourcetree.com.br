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
 * bootstrap-scrollspy.js v1.3.0.
 */
!function ($)
{
    /**
     *
     */
    var $window = $(window);

    /**
     *
     */
    function ScrollSpy(topbar, selector)
    {
        var processScroll = $.proxy(this.processScroll, this);

        this.$topbar = $(topbar);
        this.selector = selector || 'li > a';
        this.refresh();
        this.$topbar.delegate(this.selector, 'click', processScroll);

        $window.scroll(processScroll);
        this.processScroll();
    }

    /**
     *
     */
    ScrollSpy.prototype = {
        /**
         *
         */
        refresh: function ()
        {
            this.targets = this.$topbar.find(this.selector).map(function ()
            {
                var href = $(this).attr('href');

                return /^#\w/.test(href) && $(href).length ? href : null;
            });

            this.offsets = $.map(this.targets, function (id)
            {
                return $(id).offset().top;
            });
        },

        /**
         *
         */
        processScroll: function ()
        {
            var scrollTop = $window.scrollTop() + 10,
                offsets = this.offsets,
                targets = this.targets,
                activeTarget = this.activeTarget,
                i;

            for (i = offsets.length; i--;)
            {
                activeTarget != targets[i]
                    && scrollTop >= offsets[i]
                    && (!offsets[i + 1] || scrollTop <= offsets[i + 1])
                    && this.activateButton(targets[i]);
            }
        },

        /**
         *
         */
        activateButton: function (target)
        {
            this.activeTarget = target
            this.$topbar
                .find(this.selector).parent('.active')
                .removeClass('active');

            this.$topbar
                .find(this.selector + '[href="' + target + '"]')
                .parent('li')
                .addClass('active');
        }
    }

    /**
     * SCROLLSPY PLUGIN DEFINITION.
     */
    $.fn.scrollSpy = function(options)
    {
        var scrollspy = this.data('scrollspy');

        if (!scrollspy)
        {
            return this.each(function ()
            {
                $(this).data('scrollspy', new ScrollSpy(this, options));
            });
        }

        if (options === true)
        {
            return scrollspy;
        }

        if (typeof options == 'string')
        {
            scrollspy[options]();
        }

        return this;
    }

    $(document).ready(function ()
    {
        $('body').scrollSpy('[data-scrollspy] li > a');
    });
}(window.jQuery || window.ender);
