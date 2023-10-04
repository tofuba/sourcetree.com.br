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
 * bootstrap-alerts.js v1.3.0.
 */
(function($)
{
    /**
     * CSS TRANSITION SUPPORT.
     */
    var transitionEnd

    /**
     *
     */
    $(document).ready(function ()
    {
        $.support.transition = (function ()
        {
            var thisBody = document.body || document.documentElement,
                thisStyle = thisBody.style,
                support = thisStyle.transition !== undefined ||
                          thisStyle.WebkitTransition !== undefined ||
                          thisStyle.MozTransition !== undefined ||
                          thisStyle.MsTransition !== undefined ||
                          thisStyle.OTransition !== undefined;

            return support;
        })();

        /**
         * Definir o tipo de evento de transição CSS.
         */
        if ($.support.transition)
        {
            transitionEnd = "TransitionEnd";

            if ($.browser.webkit)
            {
                transitionEnd = "webkitTransitionEnd";
            } else if ($.browser.mozilla)
            {
                transitionEnd = "transitionend"
            } else if ($.browser.opera)
            {
                transitionEnd = "oTransitionEnd"
            }
        }
    });

    /**
     * ALERT CLASS DEFINITION.
     */
    var Alert = function (content, selector)
    {
        this.$element = $(content).delegate(selector || '.close', 'click', this.close);
    }

    /**
     *
     */
    Alert.prototype = {
        /**
         *
         */
        close: function (e)
        {
            var $element = $(this).parent('.alert-message');

            e && e.preventDefault();
            $element.removeClass('in');

            /**
             *
             */
            function removeElement()
            {
                $element.remove();
            }

            $.support.transition && $element.hasClass('fade') ?
                $element.bind(transitionEnd, removeElement) :
                removeElement();
        }
    }

    /**
     * ALERT PLUGIN DEFINITION.
     */
    $.fn.alert = function (options)
    {
        if (options === true)
        {
            return this.data('alert');
        }

        return this.each(function ()
        {
            var $this = $(this);

            if (typeof options == 'string')
            {
                return $this.data('alert')[options]();
            }

            $(this).data('alert', new Alert(this));
        });
    }

    /**
     *
     */
    $(document).ready(function ()
    {
        new Alert($('body'), '.alert-message[data-alert] .close');
    });
})(window.jQuery || window.ender);
