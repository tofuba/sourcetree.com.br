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
 * bootstrap-modal.js v1.3.0.
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
                transitionEnd = "transitionend";
            } else if ($.browser.opera)
            {
                transitionEnd = "oTransitionEnd";
            }
        }
    });

    /**
     * MODAL PUBLIC CLASS DEFINITION.
     */
    var Modal = function (content, options)
    {
        this.settings = $.extend({}, $.fn.modal.defaults);
        this.$element = $(content).delegate('.close', 'click.modal', $.proxy(this.hide, this));

        if (options)
        {
            $.extend(this.settings, options);

            if (options.show)
            {
                this.show();
            }
        }

        return this;
    }

    /**
     *
     */
    Modal.prototype = {
        /**
         *
         */
        toggle: function ()
        {
            return this[!this.isShown ? 'show' : 'hide']();
        },

        /**
         *
         */
        show: function ()
        {
            var that = this;

            this.isShown = true;
            this.$element.trigger('show');

            escape.call(this);
            backdrop.call(this, function ()
            {
                that.$element
                    .appendTo(document.body)
                    .show();

                setTimeout(function ()
                {
                    that.$element
                        .addClass('in')
                        .trigger('shown');
                }, 1);
            });

            return this;
        },

        /**
         *
         */
        hide: function (e)
        {
            e && e.preventDefault();

            var that = this;

            this.isShown = false;
            escape.call(this);

            this.$element
                .trigger('hide')
                .removeClass('in');

            function removeElement()
            {
                that.$element
                    .hide()
                    .trigger('hidden');

                backdrop.call(that);
            }

            $.support.transition && this.$element.hasClass('fade') ?
                this.$element.one(transitionEnd, removeElement) :
                removeElement();

            return this;
        }
    }

    /**
     * MODAL PRIVATE METHODS.
     */
    function backdrop(callback)
    {
        var that = this,
            animate = this.$element.hasClass('fade') ? 'fade' : '';

        if (this.isShown && this.settings.backdrop)
        {
            this.$backdrop = $('<div class="modal-backdrop ' + animate + '" />')
                .click($.proxy(this.hide, this))
                .appendTo(document.body);

            setTimeout(function ()
            {
                that.$backdrop && that.$backdrop.addClass('in');

                $.support.transition && that.$backdrop.hasClass('fade') ?
                    that.$backdrop.one(transitionEnd, callback) :
                    callback();
            });
        } else if (!this.isShown && this.$backdrop)
        {
            this.$backdrop.removeClass('in');

            function removeElement()
            {
                that.$backdrop.remove();
                that.$backdrop = null;
            }

            $.support.transition && this.$element.hasClass('fade')?
                this.$backdrop.one(transitionEnd, removeElement) :
                removeElement();
        } else if (callback)
        {
            callback();
        }
    }

    /**
     *
     */
    function escape()
    {
        var that = this;

        if (this.isShown && this.settings.keyboard)
        {
            $('body').bind('keyup.modal', function (e)
            {
                if (e.which == 27)
                {
                    that.hide();
                }
            });
        } else if (!this.isShown)
        {
            $('body').unbind('keyup.modal');
        }
    }

    /**
     * MODAL PLUGIN DEFINITION.
     */
    $.fn.modal = function (options)
    {
        var modal = this.data('modal');

        if (!modal)
        {
            if (typeof options == 'string')
            {
                options = {
                    show: /show|toggle/.test(options)
                };
            }

            return this.each(function ()
            {
                $(this).data('modal', new Modal(this, options));
            });
        }

        if (options === true)
        {
            return modal;
        }

        if (typeof options == 'string')
        {
            modal[options]();
        } else if (modal)
        {
            modal.toggle();
        }

        return this;
    }

    $.fn.modal.Modal = Modal
    $.fn.modal.defaults = {
        backdrop: false,
        keyboard: false,
        show: true
    }

    /**
     * MODAL DATA- IMPLEMENTATION.
     */
    $(document).ready(function ()
    {
        $('body').delegate('[data-controls-modal]', 'click', function (e)
        {
            e.preventDefault();

            var $this = $(this).data('show', true);

            $('#' + $this.attr('data-controls-modal'))
                .modal($this.data());
        });
    });
})(window.jQuery || window.ender);
