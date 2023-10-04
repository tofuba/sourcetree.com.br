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
 *
 */
$(document).ready(function()
{
    /**
     * Exemplo de classificação de tabela.
     */
    $("#sortTableExample").tablesorter({
        sortList: [
            [
                1,
                0
            ]
        ]
    });

    /**
     * Adicione lógica.
     */
    $('.add-on :checkbox').click(function ()
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
     * Desative determinados links em documentos.
     * Por favor, não leve esses estilos para seus projetos,
     * eles estão aqui apenas para evitar que cliques em
     * botões o tirem de seu lugar na página.
     */
    $('ul.tabs a, ul.pills a, .pagination a, .well .btn, .actions .btn, .alert-message .btn, a.close').click(function (e)
    {
        e.preventDefault();
    });

    /**
     * Copie blocos de código em documentos.
     */
    $(".copy-code").focus(function ()
    {
        var el = this;

        /**
         * Pressione a seleção para o loop de eventos
         * para chrome :{o.
         */
        setTimeout(function ()
        {
            $(el).select();
        }, 1);
    });

    /**
     * POSITION STATIC TWIPSIES.
     */
    $(window).bind( 'load resize', function ()
    {
        $(".twipsies a").each(function ()
        {
            $(this).twipsy({
                live: false,
                placement: $(this).attr('title'),
                trigger: 'manual',
                offset: 2
            }).twipsy('show');
        });
    });
});
