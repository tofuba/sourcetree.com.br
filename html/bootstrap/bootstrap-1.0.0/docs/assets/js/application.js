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
$(document).ready(function()
{
    /**
     * Lógica de espionagem de rolagem.
     */
    var activeTarget,
        $window = $(window),
        position = {},
        nav = $('body > .topbar li a'),

        targets = nav.map(function ()
        {
            return $(this).attr('href');
        }),

        offsets = $.map(targets, function (id)
        {
            return $(id).offset().top;
        });

    function setButton(id)
    {
        nav.parent("li").removeClass('active');

        $(nav[$.inArray(id, targets)]).parent("li").addClass('active');
    }

    function processScroll(e)
    {
        var scrollTop = $window.scrollTop() + 10, i;

        for (i = offsets.length; i--;)
        {
            if (activeTarget != targets[i] && scrollTop >= offsets[i] && (!offsets[i + 1] || scrollTop <= offsets[i + 1]))
            {
                activeTarget = targets[i];
                setButton(activeTarget);
            }
        }
    }

    nav.click(function ()
    {
        processScroll();
    });

    processScroll();
    $window.scroll(processScroll);

    /**
     * Exemplo de lista suspensa para navegação
     * na barra superior.
     */

    $("body").bind("click", function(e)
    {
        $("ul.menu-dropdown").hide();
        $('a.menu').parent("li").removeClass("open").children("ul.menu-dropdown").hide();
    });

    $("a.menu").click(function(e)
    {
        var $target = $(this);
        var $parent = $target.parent("li");
        var $siblings = $target.siblings("ul.menu-dropdown");
        var $parentSiblings = $parent.siblings("li");

        if ($parent.hasClass("open"))
        {
            $parent.removeClass("open");
            $siblings.hide();
        } else
        {
            $parent.addClass("open");
            $siblings.show();
        }

        $parentSiblings.children("ul.menu-dropdown").hide();
        $parentSiblings.removeClass("open");

        return false;
    });

    /**
     * Exemplo de classificação de tabela.
     */
    $("#sortTableExample").tablesorter({
        sortList: [[1,0]]
    });

    /**
     * Adicionar lógica.
     */
    $('.add-on :checkbox').click(function()
    {
        if ($(this).attr('checked'))
        {
            $(this).parents('.add-on').addClass('active');
        } else
        {
            $(this).parents('.add-on').removeClass('active');
        }
    });

    /**
     * Desativar determinados links em manual.
     */
    $('ul.tabs a, ul.pills a, .pagination a, .well .btn, .actions .btn, .alert-message .btn, a.close').click(function(e)
    {
        e.preventDefault();
    });

    /**
     * Copie blocos de código em docs.
     */
    $(".copy-code").focus(function()
    {
        $(this).select();
    });

    $(".copy-code").mouseup(function(e)
    {
        e.preventDefault();
    });

    /**
     * POSITION TWIPSIES
     */

    $('.twipsies.well a').each(function ()
    {
        var type = this.title,
            $anchor = $(this),
            $twipsy = $('.twipsy.' + type),

            twipsy = {
                width: $twipsy.width() + 10,
                height: $twipsy.height() + 10
            },

            anchor = {
                position: $anchor.position(),
                width: $anchor.width(),
                height: $anchor.height()
            },

            offset = {
                above: {
                    top: anchor.position.top - twipsy.height,
                    left: anchor.position.left + (anchor.width/2) - (twipsy.width/2)
                },

                below: {
                    top: anchor.position.top + anchor.height,
                    left: anchor.position.left + (anchor.width/2) - (twipsy.width/2)
                },

                left: {
                    top: anchor.position.top + (anchor.height/2) - (twipsy.height/2),
                    left: anchor.position.left - twipsy.width - 5
                },

                right: {
                    top: anchor.position.top + (anchor.height/2) - (twipsy.height/2),
                    left: anchor.position.left + anchor.width + 5
                }
            }

        $twipsy.css(offset[type]);
    });
});
