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
 * bootstrap-dropdown.js v1.3.0.
 */
(function($)
{
    var d = 'a.menu, .dropdown-toggle';

    /**
     *
     */
    function clearMenus()
    {
        $(d).parent('li').removeClass('open');
    }

    /**
     *
     */
    $(function ()
    {
        $('html').bind("click", clearMenus);
        $('body').dropdown('[data-dropdown] a.menu, [data-dropdown] .dropdown-toggle');
    });

    /**
     * DROPDOWN PLUGIN DEFINITION.
     */
    $.fn.dropdown = function (selector)
    {
        return this.each(function ()
        {
            $(this).delegate(selector || d, 'click', function (e)
            {
                var li = $(this).parent('li'),
                    isActive = li.hasClass('open');

                clearMenus();
                !isActive && li.toggleClass('open');

                return false;
            });
        });
    }
})(window.jQuery || window.ender);
