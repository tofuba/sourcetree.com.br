QuadsKeepr.js
==============

Uma biblioteca de detecção de colisão baseada em régua derivada de
Super Mario. Ele mantém uma lista de 'quadrantes' (células de réguas)
e armazena quais coisas estão neles.

------------------------------------------------------------------------------------

Funções essenciais
------------------

<table>
    <tr>
        <th>
            Código
        </th>
        <th>
            Saída
        </th>
    </tr>
    <tr>
        <td>
            <code>
                window.MyQuadsKeeper = new QuadsKeepr({</code><br><code>
                    num_rows: 5,</code><br><code>
                    num_cols: 6
                });
            </code>
        </td>
        <td>
            <em>
                Cria uma nova instância do guardião dos quadrantes com 6 linhas e 7
                pilastras (cada uma tem 1 de cada lado para preenchimento).
            </em>
        </td>
    </tr>
    <tr>
        <td>
            <code>
                my_solids = [...];</code><br><code>
                my_characters = [...];</code><br><code>
                MyQuadsKeeper.determineAllQuadrants(my_solids, my_characters);
            </code>
        </td>
        <td>
            <em>
                Assumindo <code>my_solids</code> e <code>my_characters</code> são ambas matrizes
                de coisas, o guardião dos quadrantes determinará quais coisas vão em quais
                quadrantes.
            </em>
        </td>
    </tr>
    <tr>
        <td>
            <code>
                MyQuadsKeeper.updateQuadrants(1.17);
            </code>
        </td>
        <td>
            <em>
                Se os quadrantes foram deslocados por uma fonte externa, se a pilastra
                mais à esquerda estiver muito à esquerda, isso excluirá continuamente
                essa pilastra mais à esquerda e criará uma nova em seu lugar.
            </em>
            <br>
            <em>
                A validade da pilastra é determinada se a borda direita da pilastra
                passou de delx (que é <code>-1 * quad_width</code>).
            </em>
            <br>
            <em>
                <code>quad_width = (screen_width / (num_cols - 3))</code>.
            </em>
        </td>
    </tr>
</table>
