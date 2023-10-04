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
(function($)
{
    $.fn.easyTabs = function(option)
    {
        var param = jQuery.extend({fadeSpeed: "fast", defaultContent: 1, activeClass: 'active'}, option);

        $(this).each(
            function()
            {
                var thisId = "#" + this.id;

                if (param.defaultContent == '')
                {
                    param.defaultContent = 1;
                }

                if (typeof param.defaultContent == "number")
                {
                    var defaultTab = $(thisId + " .tabs li:eq(" + (param.defaultContent - 1) + ") a")
                        .attr('href')
                        .substr(1);
                } else
                {
                    var defaultTab = param.defaultContent;
                }

                $(thisId + " .tabs li a").each(
                    function()
                    {
                        var tabToHide = $(this).attr('href').substr(1);

                        $("#" + tabToHide).addClass('easytabs-tab-content');
                    }
                );

                hideAll();
                changeContent(defaultTab);

                /**
                 *
                 */
                function hideAll()
                {
                    $(thisId + " .easytabs-tab-content").hide();
                }

                /**
                 *
                 */
                function changeContent(tabId)
                {
                    hideAll();

                    $(thisId + " .tabs li").removeClass(param.activeClass);
                    $(thisId + " .tabs li a[href=#" + tabId + "]").closest('li').addClass(param.activeClass);

                    if (param.fadeSpeed != "none")
                    {
                        $(thisId + " #" + tabId).fadeIn(param.fadeSpeed);
                    } else
                    {
                        $(thisId + " #" + tabId).show();
                    }
                }

                $(thisId + " .tabs li").click(
                    function()
                    {
                        var tabId = $(this).find('a').attr('href').substr(1);

                        changeContent(tabId);

                        return false;
                    }
                );
            }
        );
    }
})(jQuery);
