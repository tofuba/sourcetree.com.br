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
 * Load.js.
 * Os mapas são carregados via AJAX.
 */

/**
 * Mapas.
 */

/**
 *
 */
function startLoadingMaps()
{
    /**
     * Não tente ajax se estiver em um sistema local, ele simplesmente
     * travará.
     */
    if (window.location.protocol == "file:")
    {
        return;
    }

    /**
     * Carregamento ansioso ftw !
     */
    passivelyLoadMap([1,2], new XMLHttpRequest());
}

/**
 * Localiza um mapa, analisa-o e recursa no próximo mapa.
 */
function passivelyLoadMap(map, ajax)
{
    /**
     * Não tente carregar os mundos 9 e superiores.
     */
    if (!map || map[0] > 8 || map[1] <= 0)
    {
        return;
    }

    /**
     * Maps/WorldXY.js.
     */
    var url = "Maps/World" + map[0] + "" + map[1] + ".js"

    ajax.open("GET", url, true);
    mlog("Maps", "Requesting:", url);

    ajax.send();
    ajax.onreadystatechange = function()
    {
        if (ajax.readyState != 4)
        {
            return;
        }

        /**
         * Página de mapa encontrado, carregue-o!
         */
        if (ajax.status == 200)
        {
            /**
             * Isso é potencialmente inseguro, portanto, gostaria de usar um
             * arranjo JSON no estilo de editor.
             */
            mapfuncs[map[0]][map[1]] = Function(ajax.responseText);

            if (window.parentwindow && parentwindow.onMapLoad)
            {
                parentwindow.onMapLoad(map[0],map[1]);

                /**
                 * Apenas no caso de.
                 */
                setTimeout(function()
                {
                    parentwindow.onMapLoad(map[0], map[1]);
                }, 2100);
            }

            mlog("Maps", " Loaded: Maps/World" + map[0] + "" + map[1] + ".js");
        } else if(ajax.status != 404)
        {
            /**
             * Caso contrário, a menos que seja apenas um 404, retorne.
             */
            return;
        }

        setTimeout(function()
        {
            passivelyLoadMap(setNextLevelArr(map), ajax);
        }, 7);
    };
}

/**
 *
 */
function setNextLevelArr(arr)
{
    if (arr[1]++ == 4)
    {
        ++arr[0];
        arr[1] = 1;
    }

    return arr;
}
