Super Mario
===========

### ***Este código é mantido aqui apenas para fins históricos.***

Um remake em HTML5 do Super Mario Bros - expandido para navegação moderna.

--------------------------------------------------------------------------

## Como jogar

Você pode acessar o link: http://localhost/html-games/super-mario

### Seu computador (local)

Você pode fazer o procedimento do programa por meio da IU auxiliar via
index.html ou diretamente via mario.html. Isso vai fazer o procedimento
de uma cópia totalmente local do programa (observe que via index.html,
por motivos de segurança, o Chrome pode não permitem que você acesse o
programa através do shell Javascript).

### Seu computador (host virtual).

Baixe e instale o <a href='http://localhost/http'>*HTTP Apache2</a> adequado para o seu sistema.
Coloque os arquivos do Mario em tela cheia em um diretório em algum lugar sob htdocs e acesse-o via localhost em seu navegador.
+
 * Por exemplo, htdocs/html-games/super-mario/index.html será traduzido para http://localhost/html-games/super-mario/

Como seu navegador permitirá solicitações AJAX por meio de um fornecedor,
exclua a mensagem de registro "Esta é uma cópia offline..." de maps.js,
juntamente com todas as funções subseqüentes (elas serão carregadas com
muitas especificações pelo programa).

### Nuvem IDE

[![IDE](./dist/png/demo-in-ide.png)](http://localhost/html-games/super-mario)

* Selecione `Visualização > Índice do Projeto`.
* Selecione `Visualização > Nova guia do navegador`.
* Clique `Visualização` e depois clique dentro da área do programa.

### Seu Fornecedor

Siga as mesmas etapas do procedimento em seu computador (host virtual).

## Códigos de atari

Aqui está um conjunto rápido de códigos de atari que você pode usar durante
o programa. Se você estiver usando isso por meio da interface auxiliar da pessoa,
terá que fazer referência a tudo como um membro do 'programa' (que é um link
para o quadro que contém o Super Mario).

### Power-ups do programa

<html>
    <table>
        <tr>
            <th>
                Plug
            </th>
            <th>
                Resultado
            </th>
        </tr>
        <tr>
            <td>
                <code>playerShroom(player)</code>
            </td>
            <td>
                O equivalente a pessoa tocar em um item Mushroom ou FireFlower.
            </td>
        </tr>
        <tr>
            <td>
                <code>playerStar(player)</code>
            </td>
            <td>
                O equivalente a pessoa tocar em um item de estrela. Observe que, se você deseja que a pessoa seja invencível pelo resto do mapa atual, use <code>++player.star</code>.
            </td>
        </tr>
        <tr>
            <td>
                <code>scrollPlayer(X)</code>
            </td>
            <td>
                Rolagem da janela horizontalmente por X, mantendo a pessoa no mesmo lugar em relação à tela.
            </td>
        </tr>
        <tr>
            <td>
                <code>scrollTime(T)</code>
            </td>
            <td>
                Flutua a pessoa até o fim do programa (cuidado, isso é melhor usado nos mundos aleatórios!).
            </td>
        </tr>
        <tr>
            <td>
                <code>fastforward(T)</code>
            </td>
            <td>
                Define a velocidade do programa para <code>1+T</code>. T=1 resulta no dobro da velocidade e T=0 é a velocidade normal.
            </td>
        </tr>
    </table>
</html>

### Adicionando coisas.

<html>
    <table>
        <tr>
            <th>
                Plug
            </th>
            <th>
                Resultado
            </th>
        </tr>
        <tr>
            <td>
                <code>addThing(ThingFunction, xloc, yloc)</code>
                <br>ou</br>
                <code>addThing(new Thing(ThingFunction, arg1, arg2), xloc, yloc)</code>
            </td>
            <td>Cria uma nova instância de uma Coisa, como <code>Goomba</code> ou <code>Koopa</code>, no local especificado. As funções de coisa estão localizadas separadamente em things.js;
            </td>
        </tr>
        <tr>
            <td>
                <code>killNormal(MyThing)</code>
            </td>
            <td>Remoção de uma coisa especificada. Você pode encontrá-los listados em <code>window.characters</code>, <code>window.solids</code>, e <code>window.scenery</code>.
            </td>
        </tr>
    </table>
</html>

### Mudança de mapa

<html>
    <table>
        <tr>
            <th>
                Plug
            </th>
            <th>
                Resultado
            </th>
        </tr>
        <tr>
            <td>
                <code>setMap(A,B)</code>
                <br>ou</br>
                <code>setMap([A,B])</code>
            </td>
            <td>
                Inicia o mapa A-B imediatamente. Se não existir (como quando os
                mapas ainda não foram carregados via AJAX), ele registrará uma
                notificação normalmente.
            </td>
        </tr>
        <tr>
            <td>
                <code>setMapRandom()</code>
                <br>ou</br>
                <code>setMapRandom("Overworld")</code>
            </td>
            <td>
                Inicia o mapa aleatório correspondente imediatamente, semelhante a setMap. As opções nomeadas são (Overworld):
                <ul>
                    <li>Overworld</li>
                    <li>Underworld</li>
                    <li>Underwater</li>
                    <li>Sky</li>
                    <li>Castle</li>
                </ul>
            </td>
        </tr>
        <tr>
            <td>
                <code>shiftToLocation(N)</td>
            </td>
            <td>
                Muda para o Nth local no mapa atual. Por exemplo, <code>setMap(1,1); shiftToLocation(2);</code> traz a pessoa para a seção Underworld do World 1-1. Observe que os mapas são armazenados em Maps/WorldAB.js como bases da função.
            </td>
        </tr>
    </table>
</html>

## Editor de camadas

<html>
    <table>
        <tr>
            <td>
                <code>loadEditor()</code>
            </td>
            <td>
                Inicia o editor de camadas do programa.
            </td>
        </tr>
    </table>
</html>
